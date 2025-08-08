import type { UserPost } from "~/composables/useApi";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async event => {
    try {
        const supabase = await serverSupabaseClient(event);

        // Get user ID from session
        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized"
            });
        }

        // Fetch posts by the current user
        const { data, error } = await supabase.from("posts").select("*").eq("submitter_id", user.id);

        if (error) {
            console.error("Supabase error fetching user posts:", error);
            throw createError({
                statusCode: 500,
                statusMessage: "Error fetching posts from database"
            });
        }

        // Format response to match UserPost interface
        const userPosts: UserPost[] = data.map(post => ({
            id: post.id,
            title: post.title,
            titleEnglish: post.title_english,
            episodes: post.episodes,
            year: post.year,
            rating: post.rating,
            category: post.category_id, // Menggunakan category_id dari database
            status: post.status_approval || "pending", // Menggunakan status_approval
            cover: post.cover,
            description: post.description,
            genres: post.genres,
            malId: post.mal_id,
            releaseFileName: post.release_file_name,
            downloadLinks: post.download_links || [], // Menggunakan download_links langsung
            subtitleType: post.subtitle_type, // Menggunakan subtitle_type langsung
            // Untuk kompatibilitas dengan kode lama
            downloadLink:
                Array.isArray(post.download_links) && post.download_links.length > 0
                    ? post.download_links[0].url
                    : typeof post.download_links === "object" && post.download_links !== null
                      ? JSON.stringify(post.download_links)
                      : "",
            softsubLink: post.subtitle_type, // Menggunakan subtitle_type sebagai softsubLink
            submitterId: post.submitter_id,
            submitterName: post.submitter_name,
            views: post.views,
            downloads: post.downloads,
            likes: post.likes,
            submittedAt: new Date(post.created_at), // Menggunakan created_at sebagai submittedAt
            createdAt: new Date(post.created_at),
            updatedAt: post.updated_at ? new Date(post.updated_at) : undefined,
            rejectionReason: post.rejection_reason // Menambahkan rejection_reason dari database
        }));

        return userPosts;
    } catch (error) {
        console.error("Error fetching user posts:", error);
        throw error;
    }
});
