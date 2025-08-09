import { ref } from 'vue'
import { debounce } from 'lodash-es'

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

// Cache untuk optimasi
interface ApiCacheEntry {
    data: any
    timestamp: number
    etag?: string
}

const CACHE_DURATION = 2 * 60 * 1000 // 2 menit
const _apiCache = new Map<string, ApiCacheEntry>()

// Request deduplication
const _pendingRequests = new Map<string, Promise<any>>()

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
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    // Menggunakan URL relatif tanpa port spesifik
    const baseUrl = "/api"; // Ini akan menggunakan port yang sama dengan aplikasi

    // Interface untuk error response dari API
    interface ApiError {
        statusCode: number;
        statusMessage: string;
        message?: string;
    }

    const createPost = async (postData: PostData): Promise<UserPost> => {
        loading.value = true
        error.value = null
        
        try {
            const response = await $fetch<UserPost>(`${baseUrl}/posts`, {
                method: "POST",
                body: postData,
                retry: 2,
                timeout: 10000
            });
            
            // Clear related cache entries
            clearCacheByPattern('posts')
            return response;
        } catch (err: any) {
            console.error("Error creating post:", err);

            // Tambahkan informasi error yang lebih detail
            if (err.response && err.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = err.response._data;
                err.message = apiError.message ?? apiError.statusMessage ?? "Error creating post";
            }
            
            error.value = err instanceof Error ? err.message : 'Failed to create post'
            throw err;
        } finally {
            loading.value = false
        }
    };

    const updatePost = async (id: string, postData: Partial<PostData>): Promise<UpdatePostResponse> => {
        loading.value = true
        error.value = null
        
        try {
            const response = await $fetch<UpdatePostResponse>(`${baseUrl}/posts/${id}`, {
                method: "PUT",
                body: postData,
                retry: 2,
                timeout: 10000
            });
            
            // Clear related cache entries
            clearCacheByPattern('posts')
            clearCacheByPattern(`post-${id}`)
            return response;
        } catch (err: any) {
            console.error("Error updating post:", err);

            // Tambahkan informasi error yang lebih detail
            if (err.response && err.response._data) {
                // Format error dari Nuxt/H3
                const apiError: ApiError = err.response._data;
                err.message = apiError.message ?? apiError.statusMessage ?? "Error updating post";
            }
            
            error.value = err instanceof Error ? err.message : 'Failed to update post'
            throw err;
        } finally {
            loading.value = false
        }
    };

    // Generic fetch function dengan caching dan deduplication
    const fetchWithCache = async <T>(
        url: string, 
        options: any = {}, 
        cacheKey?: string
    ): Promise<T | null> => {
        const key = cacheKey || `${options.method || 'GET'}-${url}`
        const now = Date.now()
        
        // Check cache first (only for GET requests)
        if ((!options.method || options.method === 'GET')) {
            const cached = _apiCache.get(key)
            if (cached && (now - cached.timestamp) < CACHE_DURATION) {
                return cached.data
            }
        }
        
        // Check for pending request (deduplication)
        if (_pendingRequests.has(key)) {
            return await _pendingRequests.get(key)
        }
        
        // Create new request
        const requestPromise = $fetch<T>(url, {
            ...options,
            retry: options.retry || 1,
            timeout: options.timeout || 8000
        })
        
        _pendingRequests.set(key, requestPromise)
        
        try {
            const result = await requestPromise
            
            // Cache successful GET requests
            if ((!options.method || options.method === 'GET') && result) {
                _apiCache.set(key, {
                    data: result,
                    timestamp: now
                })
            }
            
            return result
        } catch (err) {
            throw err
        } finally {
            _pendingRequests.delete(key)
        }
    }
    
    // Helper function untuk clear cache berdasarkan pattern
    const clearCacheByPattern = (pattern: string) => {
        for (const [key] of _apiCache) {
            if (key.includes(pattern)) {
                _apiCache.delete(key)
            }
        }
    }
    
    // Debounced version untuk search atau filter
    const debouncedFetch = debounce(fetchWithCache, 300)
    
    // Clear all cache
    const clearCache = () => {
        _apiCache.clear()
        _pendingRequests.clear()
    }
    
    // Get cached data
    const getCachedData = (key: string) => {
        const cached = _apiCache.get(key)
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return cached.data
        }
        return null
    }

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
        loading,
        error,
        createPost,
        updatePost,
        getPostById,
        getUserPosts,
        deletePost,
        getAllPosts,
        approvePost,
        rejectPost,
        fetchWithCache,
        debouncedFetch,
        clearCache,
        clearCacheByPattern,
        getCachedData
    };
};
