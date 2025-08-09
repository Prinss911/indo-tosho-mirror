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

    // Ambil user dari session
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        isLiked: false
      }
    }

    // Buat client dengan service role untuk operasi database
    const config = useRuntimeConfig()
    const adminSupabase = createClient(
      config.public.supabase.url,
      config.supabaseServiceKey
    )

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

    return {
      isLiked: !!existingLike
    }

  } catch (error: any) {
    // Log error untuk debugging
    console.error('Like status endpoint error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})