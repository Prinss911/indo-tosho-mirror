export interface PostData {
    title: string;
    titleEnglish?: string;
    episodes: number;
    year: number;
    rating: number;
    category: string; // Ini akan digunakan sebagai category_id di database
    status: string; // Status anime dari MyAnimeList (Finished Airing, Currently Airing, etc.)
    cover: string;
    description: string;
    genres: string[];
    malId: number | null;
    releaseFileName?: string;

    downloadLinks?: { hosting: string; url: string }[]; // Menggunakan array objek untuk download_links
    subtitleType?: string; // Menggunakan subtitle_type di database
    downloadLink?: string; // Untuk kompatibilitas dengan kode lama
    softsubLink?: string; // Untuk kompatibilitas dengan kode lama
    postDescription?: string; // Deskripsi postingan yang dibuat user
}

export interface UserPost {
    id: string;
    title: string;
    titleEnglish?: string;
    episodes: number;
    year: number;
    rating: number;
    category: string;
    status: "Finished Airing" | "Currently Airing" | "Not yet aired" | "completed" | "ongoing" | "upcoming"; // Status anime
    statusApproval: "pending" | "published" | "rejected"; // Status persetujuan
    cover: string;
    description: string;
    postDescription?: string; // Deskripsi postingan yang dibuat user
    genres: string[];
    malId: number | null;
    releaseFileName?: string;

    downloadLinks?: { hosting: string; url: string }[];
    subtitleType?: string;
    downloadLink?: string;
    softsubLink?: string;
    submitterId: string;
    submitterName: string;
    views: number;
    downloads: number;
    likes: number;
    submittedAt: Date;
    createdAt: Date;
    updatedAt?: Date;
    rejectionReason?: string; // Alasan penolakan postingan
}

export interface UpdatePostResponse extends UserPost {
    statusChanged?: boolean; // Apakah status berubah menjadi pending
    statusChangeMessage?: string; // Pesan notifikasi perubahan status
}

export const useApi = () => {
    // Menggunakan URL relatif tanpa port spesifik
    const baseUrl = "/api"; // Ini akan menggunakan port yang sama dengan aplikasi

    // Interface untuk error response dari API
    interface ApiError {
        statusCode: number;
        statusMessage: string;
        message?: string;
    }

    const createPost = async (postData: PostData): Promise<UserPost> => {
        try {
            const response = await $fetch<UserPost>(`${baseUrl}/posts`, {
                method: "POST",
                body: postData
            });
            return response;
        } catch (error: any) {
            console.error("Error creating post:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error creating post";
            }

            throw error;
        }
    };

    const updatePost = async (id: string, postData: Partial<PostData>): Promise<UpdatePostResponse> => {
        try {
            const response = await $fetch<UpdatePostResponse>(`${baseUrl}/posts/${id}`, {
                method: "PUT",
                body: postData
            });
            return response;
        } catch (error: any) {
            console.error("Error updating post:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error updating post";
            }

            throw error;
        }
    };

    const getPostById = async (id: string): Promise<UserPost | null> => {
        try {
            const response = await $fetch<UserPost>(`${baseUrl}/posts/${id}`);
            return response;
        } catch (error: any) {
            console.error("Error fetching post:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error fetching post";
            }

            // Untuk getPostById, kita tetap mengembalikan null daripada melempar error
            return null;
        }
    };

    const getUserPosts = async (): Promise<UserPost[]> => {
        try {
            const response = await $fetch<UserPost[]>(`${baseUrl}/posts/user`);
            return response;
        } catch (error: any) {
            console.error("Error fetching user posts:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error fetching user posts";
            }

            // Untuk getUserPosts, kita tetap mengembalikan array kosong daripada melempar error
            return [];
        }
    };

    const deletePost = async (id: string): Promise<boolean> => {
        try {
            await $fetch(`${baseUrl}/posts/${id}`, {
                method: "DELETE"
            });
            return true;
        } catch (error: any) {
            console.error("Error deleting post:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error deleting post";
            }

            // Melempar error agar bisa ditangani oleh caller
            throw error;
        }
    };

    const getAllPosts = async (): Promise<UserPost[]> => {
        try {
            const response = await $fetch<UserPost[]>(`${baseUrl}/posts`);
            return response;
        } catch (error: any) {
            console.error("Error fetching all posts:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error fetching all posts";
            }

            // Untuk getAllPosts, kita tetap mengembalikan array kosong daripada melempar error
            return [];
        }
    };

    const approvePost = async (id: string): Promise<UserPost> => {
        try {
            const response = await $fetch<UserPost>(`${baseUrl}/posts/${id}/approve`, {
                method: "POST"
            });
            return response;
        } catch (error: any) {
            console.error("Error approving post:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error approving post";
            }

            throw error;
        }
    };

    const rejectPost = async (id: string, rejectionReason?: string): Promise<UserPost> => {
        try {
            const response = await $fetch<UserPost>(`${baseUrl}/posts/${id}/reject`, {
                method: "POST",
                body: {
                    rejectionReason
                }
            });
            return response;
        } catch (error: any) {
            console.error("Error rejecting post:", error);

            // Tambahkan informasi error yang lebih detail
            if (error.response && error.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = error.response._data;
                error.message = apiError.message ?? apiError.statusMessage ?? "Error rejecting post";
            }

            throw error;
        }
    };

    return {
        createPost,
        updatePost,
        getPostById,
        getUserPosts,
        deletePost,
        getAllPosts,
        approvePost,
        rejectPost
    };
};
