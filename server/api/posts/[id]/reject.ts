import type { UserPost } from "~/composables/useApi";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async event => {
    const id = event.context.params?.id;

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Post ID is required"
        });
    }

    try {
        const supabase = await serverSupabaseClient(event);

        // Get user role to ensure only admins can reject posts
        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        // Check if user is admin (you may need to adjust this based on your auth setup)
        const { data: userProfile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !userProfile || userProfile.role !== "admin") {
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden: Only admins can reject posts"
            });
        }

        // Update post status to rejected
        const { data, error } = await supabase
            .from("posts")
            .update({ status_approval: "rejected", updated_at: new Date().toISOString() })
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
            updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
        };

        return rejectedPost;
    } catch (error) {
        console.error(`Error rejecting post ${id}:`, error);
        throw error;
    }
});
