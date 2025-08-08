import type { UserPost } from "~/composables/useApi";
import { serverSupabaseUser } from "#supabase/server";
import { validateMethod, validateContentLength } from "~/server/utils/validation";
import { addSecurityHeaders, logSecurityEvent } from "~/server/utils/authorization";

export default defineEventHandler(async event => {
    // Add security headers
    addSecurityHeaders(event);
    
    // Validate HTTP method
    validateMethod(event, ["POST"]);
    
    // Validate content length
    validateContentLength(event, 1024); // 1KB max
    
    const id = event.context.params?.id;

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Post ID is required"
        });
    }

    try {
        // Use service role key to bypass RLS for reject operations
        const config = useRuntimeConfig();
        const { createClient } = await import("@supabase/supabase-js");
        
        // Validate that service role key is available
        const serviceRoleKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!serviceRoleKey) {
            console.error("[API] Service role key not found in environment variables");
            throw createError({
                statusCode: 500,
                statusMessage: "Server configuration error"
            });
        }
        
        // Create Supabase client with service role key to bypass RLS
        const supabase = createClient(config.public.supabase.url, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Get authenticated user
        const user = await serverSupabaseUser(event);

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        // Check if user is admin using service role client
        const { data: userProfile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !userProfile || userProfile.role !== "admin") {
            console.error("[API] Non-admin user attempted to reject post:", { userId: user.id, role: userProfile?.role });
            
            // Log security event
            logSecurityEvent(event, "POST_REJECT_UNAUTHORIZED", {
                userId: user.id,
                postId: id,
                userRole: userProfile?.role
            });
            
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden: Only admins can reject posts"
            });
        }
        
        // Log security event for successful authorization
        logSecurityEvent(event, "POST_REJECT_AUTHORIZED", {
            userId: user.id,
            postId: id
        });

        // Get rejection reason from request body
        const body = await readBody(event);
        const rejectionReason = body?.rejectionReason || "";

        // Update post status to rejected with rejection reason
        const { data, error } = await supabase
            .from("posts")
            .update({ 
                status_approval: "rejected", 
                rejection_reason: rejectionReason,
                updated_at: new Date().toISOString() 
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error(`Supabase error rejecting post ${id}:`, error);
            throw createError({
                statusCode: 500,
                statusMessage: "Error rejecting post in database"
            });
        }

        // Format response to match UserPost interface
        const rejectedPost: UserPost = {
            id: data.id,
            title: data.title,
            titleEnglish: data.title_english,
            episodes: data.episodes,
            year: data.year,
            rating: data.rating,
            category: data.category_id, // Menggunakan category_id dari database
            status: data.status_approval || "rejected", // Menggunakan status_approval
            cover: data.cover,
            description: data.description,
            genres: data.genres,
            malId: data.mal_id,
            releaseFileName: data.release_file_name,
            downloadLinks: data.download_links || [], // Menggunakan download_links langsung
            subtitleType: data.subtitle_type, // Menggunakan subtitle_type langsung
            // Untuk kompatibilitas dengan kode lama
            downloadLink:
                Array.isArray(data.download_links) && data.download_links.length > 0
                    ? data.download_links[0].url
                    : typeof data.download_links === "object" && data.download_links !== null
                      ? JSON.stringify(data.download_links)
                      : "",
            softsubLink: data.subtitle_type, // Menggunakan subtitle_type sebagai softsubLink
            submitterId: data.submitter_id,
            submitterName: data.submitter_name,
            views: data.views,
            downloads: data.downloads,
            likes: data.likes,
            submittedAt: new Date(data.created_at), // Menggunakan created_at sebagai submittedAt
            createdAt: new Date(data.created_at),
            updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
            rejectionReason: data.rejection_reason // Menambahkan rejection_reason dari database
        };

        return rejectedPost;
    } catch (error) {
        console.error(`Error rejecting post ${id}:`, error);
        throw error;
    }
});
