import { serverSupabaseClient } from "#supabase/server";
import { createError, defineEventHandler, getQuery } from "h3";

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
 * API endpoint untuk mendapatkan anime top rated berdasarkan berbagai kriteria
 */
async function getTopRatedAnimes(event: any, params: TopRatedParams): Promise<TopRatedResponse> {
    try {
        const supabase = await serverSupabaseClient(event);
        
        // Build query untuk mengambil posts yang published
        let query = supabase
            .from('posts')
            .select('*')
            .eq('status_approval', 'published');

        // Apply category filter jika ada
        if (params.category && params.category !== 'all') {
            query = query.eq('category_id', params.category);
        }

        // Apply year filter jika ada
        if (params.year) {
            query = query.eq('year', params.year);
        }

        const { data: posts, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            return {
                success: false,
                error: 'Gagal mengambil data posts'
            };
        }

        if (!posts || posts.length === 0) {
            return {
                success: true,
                data: [],
                total: 0
            };
        }

        // Fetch category names untuk mapping
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name');

        const categoryMap = new Map();
        if (!categoriesError && categories) {
            categories.forEach(cat => {
                categoryMap.set(cat.id, cat.name);
            });
        }

        // Group posts by title dan hitung statistik
        const animeGroups = new Map<string, TopRatedAnime>();
        
        posts.forEach(post => {
            const title = post.title;
            
            if (!animeGroups.has(title)) {
                animeGroups.set(title, {
                    title,
                    coverImage: post.cover,
                    year: post.year,
                    episodes: post.episodes,
                    rating: post.rating,
                    category: categoryMap.get(post.category_id) || 'Unknown',
                    postCount: 0,
                    totalViews: 0,
                    totalDownloads: 0,
                    totalLikes: 0,
                    combinedScore: 0,
                    posts: []
                });
            }
            
            const group = animeGroups.get(title)!;
            group.posts.push(post);
            group.postCount++;
            group.totalViews += post.views || 0;
            group.totalDownloads += post.downloads || 0;
            group.totalLikes += post.likes || 0;
            
            // Update dengan data terbaru/terbaik
            if (!group.coverImage && post.cover) group.coverImage = post.cover;
            if (!group.year && post.year) group.year = post.year;
            if (!group.episodes && post.episodes) group.episodes = post.episodes;
            if (!group.rating && post.rating) group.rating = post.rating;
            if (!group.category && post.category_id) {
                group.category = categoryMap.get(post.category_id) || 'Unknown';
            }
        });

        // Convert Map to Array dan hitung combined score
        let groupedAnimes = Array.from(animeGroups.values());
        
        groupedAnimes.forEach(anime => {
            anime.combinedScore = anime.totalViews + anime.totalDownloads + anime.totalLikes;
        });

        // Sort berdasarkan kriteria yang dipilih
        groupedAnimes.sort((a, b) => {
            switch (params.criteria) {
                case 'post_count':
                    return b.postCount - a.postCount;
                case 'total_views':
                    return b.totalViews - a.totalViews;
                case 'total_downloads':
                    return b.totalDownloads - a.totalDownloads;
                case 'total_likes':
                    return b.totalLikes - a.totalLikes;
                case 'highest_rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'combined_score':
                    return b.combinedScore - a.combinedScore;
                default:
                    return b.postCount - a.postCount;
            }
        });

        // Apply limit
        const limit = params.limit || 25;
        const limitedResults = groupedAnimes.slice(0, limit);

        return {
            success: true,
            data: limitedResults,
            total: groupedAnimes.length
        };

    } catch (error) {
        console.error('Error in getTopRatedAnimes:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan internal server'
        };
    }
}

// Nuxt API handler
export default defineEventHandler(async (event) => {
    const method = event.node.req.method;
    const query = getQuery(event);

    try {
        if (method === 'GET') {
            const action = query.action as string;

            switch (action) {
                case 'stats':
                    return await getTopRatedStats(event);
                
                case 'years':
                    return await getAvailableYears(event);
                
                case 'related':
                    const title = query.title as string;
                    if (!title) {
                        throw createError({
                            statusCode: 400,
                            statusMessage: 'Parameter title diperlukan untuk action related'
                        });
                    }
                    return await getRelatedPosts(event, title);
                
                default:
                    // Default action: get top rated animes
                    const params: TopRatedParams = {
                        criteria: (query.criteria as TopRatedParams['criteria']) || 'post_count',
                        category: query.category as string,
                        year: query.year ? parseInt(query.year as string) : undefined,
                        limit: query.limit ? parseInt(query.limit as string) : 25
                    };
                    return await getTopRatedAnimes(event, params);
            }
        } else {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method tidak diizinkan'
            });
        }
    } catch (error) {
        console.error('Error in top-rated API:', error);
        throw createError({
            statusCode: 500,
            statusMessage: `Server error: ${error.message}`
        });
    }
});

/**
 * API endpoint untuk mendapatkan statistik ranking
 */
async function getTopRatedStats(event: any): Promise<{
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
        const supabase = await serverSupabaseClient(event);
        
        const { data: posts, error } = await supabase
            .from('posts')
            .select('title, views, downloads, likes, rating')
            .eq('status_approval', 'published');

        if (error) {
            return {
                success: false,
                error: 'Gagal mengambil statistik'
            };
        }

        if (!posts || posts.length === 0) {
            return {
                success: true,
                data: {
                    totalAnimes: 0,
                    totalPosts: 0,
                    totalViews: 0,
                    totalDownloads: 0,
                    totalLikes: 0,
                    averageRating: 0
                }
            };
        }

        // Hitung unique anime titles
        const uniqueTitles = new Set(posts.map(post => post.title));
        
        // Hitung total statistik
        const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalDownloads = posts.reduce((sum, post) => sum + (post.downloads || 0), 0);
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        
        // Hitung average rating dari posts yang memiliki rating
        const postsWithRating = posts.filter(post => post.rating && post.rating > 0);
        const averageRating = postsWithRating.length > 0 
            ? postsWithRating.reduce((sum, post) => sum + post.rating, 0) / postsWithRating.length
            : 0;

        return {
            success: true,
            data: {
                totalAnimes: uniqueTitles.size,
                totalPosts: posts.length,
                totalViews,
                totalDownloads,
                totalLikes,
                averageRating: Math.round(averageRating * 100) / 100 // Round to 2 decimal places
            }
        };

    } catch (error) {
        console.error('Error in getTopRatedStats:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan internal server'
        };
    }
}

/**
 * API endpoint untuk mendapatkan daftar tahun yang tersedia
 */
async function getAvailableYears(event: any): Promise<{
    success: boolean;
    data?: number[];
    error?: string;
}> {
    try {
        const supabase = await serverSupabaseClient(event);
        
        const { data: posts, error } = await supabase
            .from('posts')
            .select('year')
            .eq('status_approval', 'published')
            .not('year', 'is', null)
            .gt('year', 0);

        if (error) {
            return {
                success: false,
                error: 'Gagal mengambil daftar tahun'
            };
        }

        if (!posts || posts.length === 0) {
            return {
                success: true,
                data: []
            };
        }

        // Get unique years dan sort descending
        const uniqueYears = [...new Set(posts.map(post => post.year))]
            .filter(year => year && year > 0)
            .sort((a, b) => b - a);

        return {
            success: true,
            data: uniqueYears
        };

    } catch (error) {
        console.error('Error in getAvailableYears:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan internal server'
        };
    }
}

/**
 * API endpoint untuk mendapatkan posts terkait dengan anime tertentu
 */
async function getRelatedPosts(event: any, title: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> {
    try {
        const supabase = await serverSupabaseClient(event);
        
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .ilike('title', title)
            .eq('status_approval', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            return {
                success: false,
                error: 'Gagal mengambil posts terkait'
            };
        }

        return {
            success: true,
            data: posts || []
        };

    } catch (error) {
        console.error('Error in getRelatedPosts:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan internal server'
        };
    }
}