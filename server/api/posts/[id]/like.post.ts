import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Validasi metode HTTP
    if (event.node.req.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
    }

    // Validasi Content-Length untuk mencegah payload yang terlalu besar
    const contentLength = parseInt(event.node.req.headers['content-length'] || '0')
    if (contentLength > 1024) { // 1KB limit
      throw createError({
        statusCode: 413,
        statusMessage: 'Payload too large'
      })
    }

    // Validasi header keamanan
    const userAgent = getHeader(event, 'user-agent')
    if (!userAgent || userAgent.length < 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request'
      })
    }

    // Ambil ID post dari parameter
    const postId = getRouterParam(event, 'id')
    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Post ID is required'
      })
    }

    // Validasi UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(postId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid post ID format'
      })
    }

    // Ambil user dari session
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Buat client dengan service role untuk operasi database
    const config = useRuntimeConfig()
    const adminSupabase = createClient(
      config.public.supabase.url,
      config.supabaseServiceKey
    )

    // Cek apakah post exists dan ambil submitter_id
    const { data: post, error: postError } = await adminSupabase
      .from('posts')
      .select('id, likes, submitter_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    // Cegah submitter like postingannya sendiri
    if (post.submitter_id === user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot like your own post'
      })
    }

    // Cek apakah user sudah like post ini
    const { data: existingLike, error: likeCheckError } = await adminSupabase
      .from('user_interactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .eq('interaction_type', 'like')
      .single()

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database error'
      })
    }

    let isLiked = false
    let newLikesCount = post.likes || 0

    if (existingLike) {
      // Unlike - hapus like
      const { error: deleteError } = await adminSupabase
        .from('user_interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .eq('interaction_type', 'like')

      if (deleteError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to unlike post'
        })
      }

      // Kurangi likes count
      newLikesCount = Math.max(0, newLikesCount - 1)
      isLiked = false
    } else {
      // Like - tambah like
      const { error: insertError } = await adminSupabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          post_id: postId,
          interaction_type: 'like'
        })

      if (insertError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to like post'
        })
      }

      // Tambah likes count
      newLikesCount = newLikesCount + 1
      isLiked = true
    }

    // Update likes count di posts table
    const { error: updateError } = await adminSupabase
      .from('posts')
      .update({ likes: newLikesCount })
      .eq('id', postId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update likes count'
      })
    }

    return {
      success: true,
      isLiked,
      likesCount: newLikesCount
    }

  } catch (error: any) {
    // Log error untuk debugging
    console.error('Like endpoint error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})