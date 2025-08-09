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

    // Buat client dengan service role untuk operasi database
    const config = useRuntimeConfig()
    const adminSupabase = createClient(
      config.public.supabase.url,
      config.supabaseServiceKey
    )

    // Cek apakah post exists dan ambil submitter_id
    const { data: post, error: postError } = await adminSupabase
      .from('posts')
      .select('id, views, submitter_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    // Ambil user dari session (opsional untuk view)
    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    // Cegah submitter menambah views pada postingannya sendiri
    if (user && post.submitter_id === user.id) {
      return {
        success: true,
        viewsCount: post.views || 0,
        message: 'Cannot count views on your own post'
      }
    }

    // Cek spam prevention
    let canAddView = true
    
    if (user) {
      // Untuk user yang login, cek apakah sudah pernah view dalam 24 jam terakhir
      const { data: recentView, error: viewCheckError } = await adminSupabase
        .from('user_interactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .eq('interaction_type', 'view')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (viewCheckError && viewCheckError.code !== 'PGRST116') {
        throw createError({
          statusCode: 500,
          statusMessage: 'Database error'
        })
      }

      if (recentView) {
        canAddView = false
      }
    } else {
      // Untuk anonymous user, gunakan IP-based rate limiting
      const clientIP = getClientIP(event)
      if (clientIP) {
        // Simpan view dengan IP sebagai identifier (untuk anonymous users)
        // Cek apakah IP ini sudah view dalam 1 jam terakhir
        const { data: recentIPView, error: ipViewError } = await adminSupabase
          .from('user_interactions')
          .select('created_at')
          .eq('post_id', postId)
          .eq('interaction_type', 'view')
          .eq('user_id', clientIP) // Gunakan IP sebagai user_id untuk anonymous
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .single()

        if (ipViewError && ipViewError.code !== 'PGRST116') {
          // Ignore error untuk anonymous users
        }

        if (recentIPView) {
          canAddView = false
        }
      }
    }

    if (!canAddView) {
      return {
        success: true,
        viewsCount: post.views || 0,
        message: 'View already counted recently'
      }
    }

    // Tambah view count
    const newViewsCount = (post.views || 0) + 1

    // Update views count di posts table
    const { error: updateError } = await adminSupabase
      .from('posts')
      .update({ views: newViewsCount })
      .eq('id', postId)

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update views count'
      })
    }

    // Simpan interaction record untuk spam prevention
    if (user) {
      await adminSupabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          post_id: postId,
          interaction_type: 'view'
        })
    } else {
      const clientIP = getClientIP(event)
      if (clientIP) {
        await adminSupabase
          .from('user_interactions')
          .insert({
            user_id: clientIP, // Gunakan IP untuk anonymous users
            post_id: postId,
            interaction_type: 'view'
          })
      }
    }

    return {
      success: true,
      viewsCount: newViewsCount
    }

  } catch (error: any) {
    // Log error untuk debugging
    console.error('View endpoint error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})