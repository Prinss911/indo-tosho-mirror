import { v4 as uuidv4 } from "uuid";
import type { PostData, UserPost } from "~/composables/useApi";
import { serverSupabaseClient } from "#supabase/server";
import { endpointRateLimiters } from "~/server/utils/rate-limiter";
import { validateAndSanitizePostData, validateMethod, validateContentLength } from "~/server/utils/validation";
import {
    canCreatePost,
    addSecurityHeaders,
    logSecurityEvent,
    validateStatusApprovalPermission
} from "~/server/utils/authorization";

export default defineEventHandler(async event => {
    // Add security headers - Updated 2025-01-28 after database migration
    addSecurityHeaders(event);

    // Validate content length
    validateContentLength(event, 2 * 1024 * 1024); // 2MB max

    // Validate HTTP method
    const method = validateMethod(event, ["GET", "POST"]);

    // Handle POST request to create a new post
    if (method === "POST") {
        try {
            // Apply rate limiting for post creation
            endpointRateLimiters.postsCreate(event);

            // Check authentication and authorization
            const user = await canCreatePost(event);

            // Log security event
            logSecurityEvent(event, "POST_CREATE_ATTEMPT", { userId: user.id });

            const body = await readBody(event);

            // Validate and sanitize input data
            const validatedData = validateAndSanitizePostData(body);

            // Validate status approval permission
            await validateStatusApprovalPermission(event, validatedData.statusApproval);

            const supabase = await serverSupabaseClient(event);

            // Generate a unique ID for the new post
            const postId = uuidv4();
            const now = new Date().toISOString();

            // Prepare data for Supabase using validated data
            const newPostData = {
                id: postId,
                title: validatedData.title,
                title_english: validatedData.titleEnglish,
                episodes: validatedData.episodes,
                year: validatedData.year,
                rating: validatedData.rating,
                category_id: validatedData.category,
                status: validatedData.status || "Finished Airing",
                cover: validatedData.cover,
                description: validatedData.description,
                deskripsi_post: validatedData.postDescription,
                genres: validatedData.genres,
                mal_id: validatedData.malId,
                release_file_name: validatedData.releaseFileName,

                download_links: validatedData.downloadLinks || [],
                subtitle_type: validatedData.subtitleType,
                submitter_id: user.id, // Always use authenticated user ID
                submitter_name: validatedData.submitterName || user.email?.split("@")[0] || "User",
                views: 0,
                downloads: 0,
                likes: 0,
                status_approval: validatedData.statusApproval || "pending", // Use validated status or default to pending
                created_at: now,
                updated_at: now
            };

            // Insert into Supabase posts table
            const { data, error } = await supabase
                .from("posts")
                .insert(newPostData)
                .select("*, categories(name)")
                .single();

            if (error) {
                console.error("Supabase error creating post:", error);

                // Log security event for failed creation
                logSecurityEvent(event, "POST_CREATE_FAILED", {
                    userId: user.id,
                    error: error.message
                });

                // Cek jika error terkait dengan foreign key constraint
                if (error.message && error.message.includes("foreign key constraint")) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: "Invalid reference data",
                        data: {
                            message: "Kategori tidak valid atau tidak ditemukan",
                            code: "INVALID_CATEGORY"
                        }
                    });
                }

                // Error umum lainnya
                throw createError({
                    statusCode: 500,
                    statusMessage: "Error creating post in database",
                    data: {
                        message: "Terjadi kesalahan saat menyimpan data ke database",
                        code: "DATABASE_ERROR"
                    }
                });
            }

            // Log successful creation
            logSecurityEvent(event, "POST_CREATE_SUCCESS", {
                userId: user.id,
                postId: data.id
            });

            // Format response to match UserPost interface
            const newPost: UserPost = {
                id: data.id,
                title: data.title,
                titleEnglish: data.title_english,
                episodes: data.episodes,
                year: data.year,
                rating: data.rating,
                category: data.categories?.name || data.category_id, // Menggunakan nama kategori dari relasi, fallback ke category_id
                status: data.status || "Finished Airing",
                statusApproval: data.status_approval || "pending", // Menggunakan status anime dari MyAnimeList
                cover: data.cover,
                description: data.description,
                postDescription: data.deskripsi_post, // Deskripsi postingan yang dibuat user
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
                submittedAt: new Date(), // Tidak ada submitted_at di database
                createdAt: new Date(data.created_at),
                updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
                rejectionReason: data.rejection_reason // Menambahkan rejection_reason dari database
            };

            return newPost;
        } catch (error: any) {
            console.error("Error creating post:", error);

            // Log security event for error
            logSecurityEvent(event, "POST_CREATE_ERROR", {
                error: error.message,
                statusCode: error.statusCode
            });

            // Jika error sudah dalam format H3Error (dari createError), gunakan langsung
            if (error.statusCode) {
                throw error;
            }

            // Error lainnya
            throw createError({
                statusCode: 500,
                statusMessage: "Error creating post",
                data: {
                    message: "Terjadi kesalahan saat membuat postingan",
                    code: "INTERNAL_ERROR"
                }
            });
        }
    }

    // Handle GET request to fetch all posts
    if (method === "GET") {
        try {
            // Apply rate limiting for read operations
            endpointRateLimiters.postsRead(event);

            const supabase = await serverSupabaseClient(event);
            const { data, error } = await supabase
                .from("posts")
                .select("*, categories(name)")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase error fetching posts:", error);
                throw createError({
                    statusCode: 500,
                    statusMessage: "Error fetching posts from database",
                    data: {
                        message: "Terjadi kesalahan saat mengambil data postingan",
                        code: "DATABASE_ERROR"
                    }
                });
            }

            // Format response to match UserPost interface
            const posts = data.map(post => ({
                id: post.id,
                title: post.title,
                titleEnglish: post.title_english,
                episodes: post.episodes,
                year: post.year,
                rating: post.rating,
                category: post.categories?.name || post.category_id, // Menggunakan nama kategori dari relasi, fallback ke category_id
                status: post.status, // Menggunakan status anime dari database
                statusApproval: post.status_approval, // Menggunakan status approval dari database
                cover: post.cover, // Menggunakan cover dari database
                description: post.description,
                postDescription: post.deskripsi_post, // Deskripsi postingan yang dibuat user
                genres: post.genres,
                malId: post.mal_id,
                releaseFileName: post.release_file_name,

                // Menambahkan properti baru
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

            return posts;
        } catch (error: any) {
            console.error("Error fetching posts:", error);

            // Jika error sudah dalam format H3Error, gunakan langsung
            if (error.statusCode) {
                throw error;
            }

            throw createError({
                statusCode: 500,
                statusMessage: "Error fetching posts",
                data: {
                    message: "Terjadi kesalahan saat mengambil data postingan",
                    code: "INTERNAL_ERROR"
                }
            });
        }
    }

    // This should never be reached due to validateMethod, but just in case
    throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed",
        data: {
            message: "Metode HTTP tidak didukung",
            allowedMethods: ["GET", "POST"],
            code: "METHOD_NOT_ALLOWED"
        }
    });
});
