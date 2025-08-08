import type { PostData, UserPost } from "~/composables/useApi";
import { serverSupabaseClient } from "#supabase/server";
import { endpointRateLimiters } from "~/server/utils/rate-limiter";
import {
    validateAndSanitizePostData,
    validateUUID,
    validateMethod,
    validateContentLength
} from "~/server/utils/validation";
import { canUpdatePost, canDeletePost, addSecurityHeaders, logSecurityEvent } from "~/server/utils/authorization";

export default defineEventHandler(async event => {
    // Add security headers
    addSecurityHeaders(event);

    // Validate content length for write operations
    const method = event.node.req.method;
    if (method === "PUT") {
        validateContentLength(event, 2 * 1024 * 1024); // 2MB max
    }

    // Validate HTTP method
    validateMethod(event, ["GET", "PUT", "DELETE"]);

    const id = event.context.params?.id;

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Post ID is required",
            data: {
                message: "ID postingan diperlukan",
                code: "MISSING_POST_ID"
            }
        });
    }

    // Validate UUID format
    validateUUID(id, "Post ID");

    // Handle GET request to fetch a specific post
    if (method === "GET") {
        try {
            // Apply rate limiting for read operations
            endpointRateLimiters.postsRead(event);

            const supabase = await serverSupabaseClient(event);
            const { data, error } = await supabase.from("posts").select("*, categories(name)").eq("id", id).single();

            if (error) {
                console.error(`Supabase error fetching post ${id}:`, error);
                if (error.code === "PGRST116") {
                    throw createError({
                        statusCode: 404,
                        statusMessage: "Post not found",
                        data: {
                            message: "Postingan tidak ditemukan",
                            code: "POST_NOT_FOUND"
                        }
                    });
                }
                throw createError({
                    statusCode: 500,
                    statusMessage: "Error fetching post from database",
                    data: {
                        message: "Terjadi kesalahan saat mengambil data postingan",
                        code: "DATABASE_ERROR"
                    }
                });
            }

            // Format response to match UserPost interface
            const post: UserPost = {
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
                postDescription: data.deskripsi_post || "", // Menambahkan postDescription dari kolom deskripsi_post
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

            return post;
        } catch (error: any) {
            console.error(`Error fetching post ${id}:`, error);

            // Jika error sudah dalam format H3Error, gunakan langsung
            if (error.statusCode) {
                throw error;
            }

            throw createError({
                statusCode: 500,
                statusMessage: "Error fetching post",
                data: {
                    message: "Terjadi kesalahan saat mengambil data postingan",
                    code: "INTERNAL_ERROR"
                }
            });
        }
    }

    // Handle PUT request to update a post
    if (method === "PUT") {
        try {
            // Apply rate limiting for update operations
            endpointRateLimiters.postsUpdate(event);

            // Check ownership and authorization
            const ownershipResult = await canUpdatePost(event, id);

            // Log security event
            logSecurityEvent(event, "POST_UPDATE_ATTEMPT", {
                userId: ownershipResult.user?.id,
                postId: id,
                isOwner: ownershipResult.isOwner,
                isAdmin: ownershipResult.isAdmin
            });

            const body = await readBody(event);

            // Validate and sanitize input data for update
            const validatedData = validateAndSanitizePostData(body, true); // true for update

            const supabase = await serverSupabaseClient(event);

            // Get current post status to check if it needs to be reset to pending
            const { data: currentPost, error: fetchError } = await supabase
                .from("posts")
                .select("status_approval")
                .eq("id", id)
                .single();

            if (fetchError) {
                throw createError({
                    statusCode: 404,
                    statusMessage: "Post not found",
                    data: {
                        message: "Postingan tidak ditemukan",
                        code: "POST_NOT_FOUND"
                    }
                });
            }

            // Prepare data for Supabase using validated data
            const updateData: any = {
                updated_at: new Date().toISOString()
            };

            // Check if post content is being modified and needs re-review
            const isContentModified = validatedData.title !== undefined ||
                validatedData.titleEnglish !== undefined ||
                validatedData.episodes !== undefined ||
                validatedData.year !== undefined ||
                validatedData.rating !== undefined ||
                validatedData.category !== undefined ||
                validatedData.cover !== undefined ||
                validatedData.description !== undefined ||
                validatedData.postDescription !== undefined ||
                validatedData.genres !== undefined ||
                validatedData.malId !== undefined ||
                validatedData.releaseFileName !== undefined ||
                validatedData.downloadLinks !== undefined ||
                validatedData.subtitleType !== undefined;

            // If content is modified and current status is rejected, reset to pending for re-review
            // Only apply this logic for non-admin users
            // Published posts remain published when edited
            if (isContentModified && !ownershipResult.isAdmin && 
                currentPost.status_approval === 'rejected') {
                updateData.status_approval = 'pending';
                // Clear rejection reason when resetting to pending
                updateData.rejection_reason = null;
            }

            // Only include fields that are provided and validated
            if (validatedData.title !== undefined) updateData.title = validatedData.title;
            if (validatedData.titleEnglish !== undefined) updateData.title_english = validatedData.titleEnglish;
            if (validatedData.episodes !== undefined) updateData.episodes = validatedData.episodes;
            if (validatedData.year !== undefined) updateData.year = validatedData.year;
            if (validatedData.rating !== undefined) updateData.rating = validatedData.rating;
            if (validatedData.category !== undefined) updateData.category_id = validatedData.category;
            if (validatedData.status !== undefined) updateData.status = validatedData.status;
            if (validatedData.cover !== undefined) updateData.cover = validatedData.cover;
            if (validatedData.description !== undefined) updateData.description = validatedData.description;
            if (validatedData.postDescription !== undefined) updateData.deskripsi_post = validatedData.postDescription;
            if (validatedData.genres !== undefined) updateData.genres = validatedData.genres;
            if (validatedData.malId !== undefined) updateData.mal_id = validatedData.malId;
            if (validatedData.releaseFileName !== undefined)
                updateData.release_file_name = validatedData.releaseFileName;

            if (validatedData.downloadLinks !== undefined) updateData.download_links = validatedData.downloadLinks;
            if (validatedData.subtitleType !== undefined) updateData.subtitle_type = validatedData.subtitleType;
            if (validatedData.submitterName !== undefined) updateData.submitter_name = validatedData.submitterName;

            // Allow owners and admins to change status_approval
            // Owners can change their own post status (e.g., from rejected to pending for re-review)
            // Admins can change any post status
            if (validatedData.statusApproval !== undefined && (ownershipResult.isOwner || ownershipResult.isAdmin)) {
                updateData.status_approval = validatedData.statusApproval;
            }

            // Update in Supabase
            const { data, error } = await supabase
                .from("posts")
                .update(updateData)
                .eq("id", id)
                .select("*, categories(name)")
                .single();

            if (error) {
                console.error(`Supabase error updating post ${id}:`, error);

                // Log security event for failed update
                logSecurityEvent(event, "POST_UPDATE_FAILED", {
                    userId: ownershipResult.user?.id,
                    postId: id,
                    error: error.message
                });

                if (error.code === "PGRST116") {
                    throw createError({
                        statusCode: 404,
                        statusMessage: "Post not found",
                        data: {
                            message: "Postingan tidak ditemukan",
                            code: "POST_NOT_FOUND"
                        }
                    });
                }
                throw createError({
                    statusCode: 500,
                    statusMessage: "Error updating post in database",
                    data: {
                        message: "Terjadi kesalahan saat memperbarui postingan",
                        code: "DATABASE_ERROR"
                    }
                });
            }

            // Log successful update
            logSecurityEvent(event, "POST_UPDATE_SUCCESS", {
                userId: ownershipResult.user?.id,
                postId: id
            });

            // Check if status was changed to pending for re-review
            const statusChangedToPending = isContentModified && !ownershipResult.isAdmin && 
                currentPost.status_approval === 'rejected' &&
                updateData.status_approval === 'pending';

            // Format response to match UserPost interface
            const updatedPost: UserPost = {
                id: data.id,
                title: data.title,
                titleEnglish: data.title_english,
                episodes: data.episodes,
                year: data.year,
                rating: data.rating,
                category: data.categories?.name || data.category_id, // Menggunakan nama kategori dari relasi, fallback ke category_id
                status: data.status || "Finished Airing", // Menggunakan status anime dari MyAnimeList
                cover: data.cover,
                description: data.description,
                postDescription: data.deskripsi_post || "", // Menambahkan postDescription dari kolom deskripsi_post
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

            // Return response with status change information
            return {
                ...updatedPost,
                statusChanged: statusChangedToPending,
                statusChangeMessage: statusChangedToPending ? 
                    "Postingan yang sebelumnya ditolak telah diperbarui dan status berubah menjadi 'Menunggu Review' untuk peninjauan ulang." : 
                    undefined
            };
        } catch (error: any) {
            console.error(`Error updating post ${id}:`, error);

            // Log security event for error
            logSecurityEvent(event, "POST_UPDATE_ERROR", {
                postId: id,
                error: error.message,
                statusCode: error.statusCode
            });

            // Jika error sudah dalam format H3Error, gunakan langsung
            if (error.statusCode) {
                throw error;
            }

            throw createError({
                statusCode: 500,
                statusMessage: "Error updating post",
                data: {
                    message: "Terjadi kesalahan saat memperbarui postingan",
                    code: "INTERNAL_ERROR"
                }
            });
        }
    }

    // Handle DELETE request to delete a post
    if (method === "DELETE") {
        try {
            // Apply rate limiting for delete operations
            endpointRateLimiters.postsDelete(event);

            // Check ownership and authorization
            const ownershipResult = await canDeletePost(event, id);

            // Log security event
            logSecurityEvent(event, "POST_DELETE_ATTEMPT", {
                userId: ownershipResult.user?.id,
                postId: id,
                isOwner: ownershipResult.isOwner,
                isAdmin: ownershipResult.isAdmin
            });

            // Use service role key to bypass RLS for delete operations
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

            // Delete from Supabase
            console.log(`Attempting to delete post ${id} from Supabase...`);
            const { data: deletedData, error } = await supabase.from("posts").delete().eq("id", id).select();

            if (error) {
                console.error(`Supabase error deleting post ${id}:`, error);

                // Log security event for failed deletion
                logSecurityEvent(event, "POST_DELETE_FAILED", {
                    userId: ownershipResult.user?.id,
                    postId: id,
                    error: error.message
                });

                throw createError({
                    statusCode: 500,
                    statusMessage: "Error deleting post from database",
                    data: {
                        message: "Terjadi kesalahan saat menghapus postingan",
                        code: "DATABASE_ERROR"
                    }
                });
            }

            console.log(`Post ${id} deletion result:`, { deletedData, affectedRows: deletedData?.length || 0 });
            
            // Check if any rows were actually deleted
            if (!deletedData || deletedData.length === 0) {
                console.warn(`No rows were deleted for post ${id}. Post may not exist.`);
                
                // Log security event for no rows affected
                logSecurityEvent(event, "POST_DELETE_NO_ROWS", {
                    userId: ownershipResult.user?.id,
                    postId: id
                });
            }

            // Log successful deletion
            logSecurityEvent(event, "POST_DELETE_SUCCESS", {
                userId: ownershipResult.user?.id,
                postId: id
            });

            return {
                success: true,
                message: "Post deleted successfully",
                data: {
                    message: "Postingan berhasil dihapus",
                    code: "DELETE_SUCCESS"
                }
            };
        } catch (error: any) {
            console.error(`Error deleting post ${id}:`, error);

            // Log security event for error
            logSecurityEvent(event, "POST_DELETE_ERROR", {
                postId: id,
                error: error.message,
                statusCode: error.statusCode
            });

            // Jika error sudah dalam format H3Error, gunakan langsung
            if (error.statusCode) {
                throw error;
            }

            throw createError({
                statusCode: 500,
                statusMessage: "Error deleting post",
                data: {
                    message: "Terjadi kesalahan saat menghapus postingan",
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
            allowedMethods: ["GET", "PUT", "DELETE"],
            code: "METHOD_NOT_ALLOWED"
        }
    });
});
