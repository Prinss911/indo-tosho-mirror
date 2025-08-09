// Client-side API functions untuk top-rated anime
// File ini berisi fungsi-fungsi yang dapat diimpor oleh composables

export interface TopRatedAnime {
    title: string;
    coverImage?: string;
    year?: number;
    episodes?: number;
    rating?: number;
    category?: string;
    postCount: number;
    totalViews: number;
    totalDownloads: number;
    totalLikes: number;
    combinedScore: number;
    posts: any[];
}

export interface TopRatedParams {
    criteria: 'post_count' | 'total_views' | 'total_downloads' | 'total_likes' | 'highest_rating' | 'combined_score';
    category?: string;
    year?: number;
    limit?: number;
}

export interface TopRatedResponse {
    success: boolean;
    data?: TopRatedAnime[];
    error?: string;
    total?: number;
}

/**
 * Fungsi untuk mendapatkan anime top rated berdasarkan berbagai kriteria
 */
export async function getTopRatedAnimes(params: TopRatedParams): Promise<TopRatedResponse> {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.criteria) queryParams.append('criteria', params.criteria);
        if (params.category && params.category !== 'all') queryParams.append('category', params.category);
        if (params.year) queryParams.append('year', params.year.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await $fetch(`/api/top-rated?${queryParams.toString()}`);
        return response as TopRatedResponse;
    } catch (error) {
        console.error('Error fetching top rated animes:', error);
        return {
            success: false,
            error: 'Gagal mengambil data anime top rated'
        };
    }
}

/**
 * Fungsi untuk mendapatkan statistik ranking
 */
export async function getTopRatedStats(): Promise<{
    success: boolean;
    data?: {
        totalAnimes: number;
        totalPosts: number;
        totalViews: number;
        totalDownloads: number;
        totalLikes: number;
        averageRating: number;
    };
    error?: string;
}> {
    try {
        const response = await $fetch('/api/top-rated?action=stats');
        return response;
    } catch (error) {
        console.error('Error fetching top rated stats:', error);
        return {
            success: false,
            error: 'Gagal mengambil statistik ranking'
        };
    }
}

/**
 * Fungsi untuk mendapatkan daftar tahun yang tersedia
 */
export async function getAvailableYears(): Promise<{
    success: boolean;
    data?: number[];
    error?: string;
}> {
    try {
        const response = await $fetch('/api/top-rated?action=years');
        return response;
    } catch (error) {
        console.error('Error fetching available years:', error);
        return {
            success: false,
            error: 'Gagal mengambil daftar tahun'
        };
    }
}

/**
 * Fungsi untuk mendapatkan posts terkait dengan anime tertentu
 */
export async function getRelatedPosts(title: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('action', 'related');
        queryParams.append('title', title);

        const response = await $fetch(`/api/top-rated?${queryParams.toString()}`);
        return response;
    } catch (error) {
        console.error('Error fetching related posts:', error);
        return {
            success: false,
            error: 'Gagal mengambil posts terkait'
        };
    }
}