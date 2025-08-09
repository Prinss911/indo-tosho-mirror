import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Validasi metode HTTP
    if (event.node.req.method !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
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

    // Cek apakah post exists
    const { data: post, error: postError } = await adminSupabase
      .from('posts')
      .select('id, submitter_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    // Ambil user dari session (opsional untuk view status check)
    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    // Jika user adalah submitter, return bahwa view sudah terhitung
    if (user && post.submitter_id === user.id) {
      return {
        hasViewed: true,
        reason: 'submitter'
      }
    }

    let hasViewed = false
    
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
        hasViewed = true
      }
    } else {
      // Untuk anonymous user, gunakan IP-based checking
      const clientIP = getClientIP(event)
      if (clientIP) {
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
          hasViewed = true
        }
      }
    }

    return {
      hasViewed,
      reason: hasViewed ? 'recent_view' : null
    }

  } catch (error: any) {
    // Log error untuk debugging
    console.error('View status endpoint error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})