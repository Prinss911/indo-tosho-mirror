import type { UserPost } from "~/composables/useApi";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async event => {
    // Validate HTTP method
    if (event.node.req.method !== "POST") {
        throw createError({
            statusCode: 405,
            statusMessage: "Method Not Allowed"
        });
    }

    // Validate content length
    const contentLength = event.node.req.headers["content-length"];
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
        throw createError({
            statusCode: 413,
            statusMessage: "Request Entity Too Large"
        });
    }

    // Security headers
    setHeader(event, "X-Content-Type-Options", "nosniff");
    setHeader(event, "X-Frame-Options", "DENY");
    setHeader(event, "X-XSS-Protection", "1; mode=block");

    const id = event.context.params?.id;

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Post ID is required"
        });
    }

    try {
        // Get authenticated user for authorization
        const user = await serverSupabaseUser(event);
        
        if (!user) {
            console.warn(`[SECURITY] Unauthorized approve attempt for post ${id}`);
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        // Check if user is admin using regular client
        const userSupabase = await serverSupabaseClient(event);
        const { data: userProfile, error: profileError } = await userSupabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !userProfile || userProfile.role !== "admin") {
            console.warn(`[SECURITY] Unauthorized approve attempt by user ${user.id} for post ${id}`);
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden: Only admins can approve posts"
            });
        }

        console.log(`[SECURITY] Admin ${user.id} authorized to approve post ${id}`);

        // Get Supabase service role key for bypassing RLS
        const config = useRuntimeConfig();
        const serviceRoleKey = config.supabaseServiceKey;
        
        if (!serviceRoleKey) {
            console.error("[CONFIG] Supabase service role key not found in runtime config");
            throw createError({
                statusCode: 500,
                statusMessage: "Server configuration error"
            });
        }

        // Create Supabase client with service role key to bypass RLS
        const adminSupabase = createClient(
            config.public.supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Update post status to published using admin client
        const { data, error } = await adminSupabase
            .from("posts")
            .update({ status_approval: "published", updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error(`[DATABASE] Supabase error approving post ${id}:`, error);
            throw createError({
                statusCode: 500,
                statusMessage: "Error approving post in database"
            });
        }

        console.log(`[SUCCESS] Post ${id} approved successfully by admin ${user.id}`);

        // Format response to match UserPost interface
        const publishedPost: UserPost = {
            id: data.id,
            title: data.title,
            titleEnglish: data.title_english,
            episodes: data.episodes,
            year: data.year,
            rating: data.rating,
            category: data.category_id, // Menggunakan category_id dari database
            status: data.status_approval || "published", // Menggunakan status_approval
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

        return publishedPost;
    } catch (error) {
        console.error(`[ERROR] Error approving post ${id}:`, error);
        throw error;
    }
});
