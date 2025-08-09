import type { TopRatedAnime, TopRatedParams, TopRatedResponse } from '~/api/top-rated';
import { getTopRatedAnimes, getTopRatedStats, getAvailableYears, getRelatedPosts } from '~/api/top-rated';
import { debounce } from 'lodash-es';

// Cache untuk optimasi
interface CacheEntry {
    data: TopRatedAnime[];
    timestamp: number;
    params: TopRatedParams;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 menit
const _topRatedCache = new Map<string, CacheEntry>();
const _statsCache = ref<{ data: TopRatedStats; timestamp: number } | null>(null);
const _yearsCache = ref<{ data: number[]; timestamp: number } | null>(null);

export interface UseTopRatedOptions {
    criteria?: TopRatedParams['criteria'];
    category?: string;
    year?: number;
    limit?: number;
    autoFetch?: boolean;
}

export interface TopRatedStats {
    totalAnimes: number;
    totalPosts: number;
    totalViews: number;
    totalDownloads: number;
    totalLikes: number;
    averageRating: number;
}

/**
 * Composable untuk mengelola data top rated anime
 */
export const useTopRated = (options: UseTopRatedOptions = {}) => {
    const {
        criteria = 'post_count',
        category = 'all',
        year,
        limit = 25,
        autoFetch = true
    } = options;

    // Reactive state
    const loading = ref(false);
    const error = ref<string | null>(null);
    const topRatedAnimes = ref<TopRatedAnime[]>([]);
    const stats = ref<TopRatedStats | null>(null);
    const availableYears = ref<number[]>([]);
    const total = ref(0);

    // Current parameters
    const currentParams = ref<TopRatedParams>({
        criteria,
        category: category !== 'all' ? category : undefined,
        year,
        limit
    });

    /**
     * Fetch top rated animes berdasarkan parameter
     */
    const fetchTopRated = async (params?: Partial<TopRatedParams>) => {
        // Update current params jika ada parameter baru
        if (params) {
            currentParams.value = {
                ...currentParams.value,
                ...params
            };
        }

        const cacheKey = JSON.stringify(currentParams.value);
        const now = Date.now();
        
        // Check cache first
        const cached = _topRatedCache.get(cacheKey);
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            topRatedAnimes.value = cached.data;
            return;
        }

        loading.value = true;
        error.value = null;

        try {
            const response = await getTopRatedAnimes(currentParams.value);

            if (response.success && response.data) {
                // Cache the result
                _topRatedCache.set(cacheKey, {
                    data: response.data,
                    timestamp: now,
                    params: { ...currentParams.value }
                });
                
                topRatedAnimes.value = response.data;
                total.value = response.total || 0;
            } else {
                error.value = response.error || 'Gagal memuat data top rated';
                topRatedAnimes.value = [];
                total.value = 0;
            }
        } catch (err) {
            console.error('Error fetching top rated:', err);
            error.value = 'Terjadi kesalahan saat memuat data';
            topRatedAnimes.value = [];
            total.value = 0;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Fetch statistik top rated
     */
    const fetchStats = async () => {
        const now = Date.now();
        
        // Check cache first
        if (_statsCache.value && (now - _statsCache.value.timestamp) < CACHE_DURATION) {
            stats.value = _statsCache.value.data;
            return;
        }

        try {
            const response = await getTopRatedStats();

            if (response.success && response.data) {
                // Cache the result
                _statsCache.value = {
                    data: response.data,
                    timestamp: now
                };
                
                stats.value = response.data;
            } else {
                console.error('Error fetching stats:', response.error);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    /**
     * Fetch daftar tahun yang tersedia
     */
    const fetchAvailableYears = async () => {
        const now = Date.now();
        
        // Check cache first
        if (_yearsCache.value && (now - _yearsCache.value.timestamp) < CACHE_DURATION) {
            availableYears.value = _yearsCache.value.data;
            return;
        }

        try {
            const response = await getAvailableYears();

            if (response.success && response.data) {
                // Cache the result
                _yearsCache.value = {
                    data: response.data,
                    timestamp: now
                };
                
                availableYears.value = response.data;
            } else {
                console.error('Error fetching available years:', response.error);
                availableYears.value = [];
            }
        } catch (err) {
            console.error('Error fetching available years:', err);
            availableYears.value = [];
        }
    };

    // Debounced versions untuk optimasi
    const debouncedFetchTopRated = debounce(fetchTopRated, 300);

    /**
     * Update kriteria ranking
     */
    const updateCriteria = async (newCriteria: TopRatedParams['criteria']) => {
        await debouncedFetchTopRated({ criteria: newCriteria });
    };

    /**
     * Update filter kategori
     */
    const updateCategory = async (newCategory: string) => {
        const categoryParam = newCategory === 'all' ? undefined : newCategory;
        await debouncedFetchTopRated({ category: categoryParam });
    };

    /**
     * Update filter tahun
     */
    const updateYear = async (newYear: number | string) => {
        const yearParam = newYear === 'all' ? undefined : Number(newYear);
        await debouncedFetchTopRated({ year: yearParam });
    };

    /**
     * Update limit hasil
     */
    const updateLimit = async (newLimit: number) => {
        await debouncedFetchTopRated({ limit: newLimit });
    };

    /**
     * Clear cache function
     */
    const clearCache = () => {
        _topRatedCache.clear();
        _statsCache.value = null;
        _yearsCache.value = null;
    };

    /**
     * Refresh semua data
     */
    const refresh = async () => {
        clearCache();
        await Promise.all([
            fetchTopRated(),
            fetchStats(),
            fetchAvailableYears()
        ]);
    };

    /**
     * Reset ke parameter default
     */
    const reset = async () => {
        currentParams.value = {
            criteria: 'post_count',
            category: undefined,
            year: undefined,
            limit: 25
        };
        await fetchTopRated();
    };

    // Computed properties
    const isEmpty = computed(() => topRatedAnimes.value.length === 0);
    const hasData = computed(() => topRatedAnimes.value.length > 0);
    const isFiltered = computed(() => {
        return currentParams.value.category || 
               currentParams.value.year || 
               currentParams.value.criteria !== 'post_count';
    });

    // Auto fetch on mount jika autoFetch enabled
    if (autoFetch) {
        onMounted(() => {
            refresh();
        });
    }

    return {
        // State
        loading: readonly(loading),
        error: readonly(error),
        topRatedAnimes: readonly(topRatedAnimes),
        stats: readonly(stats),
        availableYears: readonly(availableYears),
        total: readonly(total),
        currentParams: readonly(currentParams),

        // Computed
        isEmpty,
        hasData,
        isFiltered,

        // Methods
        fetchTopRated,
        fetchStats,
        fetchAvailableYears,
        updateCriteria,
        updateCategory,
        updateYear,
        updateLimit,
        refresh,
        reset,
        clearCache
    };
};

/**
 * Composable untuk mengelola posts terkait anime tertentu
 */
export const useRelatedPosts = () => {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const posts = ref<any[]>([]);

    const fetchRelatedPosts = async (title: string) => {
        loading.value = true;
        error.value = null;
        posts.value = [];

        try {
            const response = await getRelatedPosts(title);

            if (response.success && response.data) {
                posts.value = response.data;
            } else {
                error.value = response.error || 'Gagal memuat posts terkait';
            }
        } catch (err) {
            console.error('Error fetching related posts:', err);
            error.value = 'Terjadi kesalahan saat memuat posts terkait';
        } finally {
            loading.value = false;
        }
    };

    const clear = () => {
        posts.value = [];
        error.value = null;
    };

    return {
        loading: readonly(loading),
        error: readonly(error),
        posts: readonly(posts),
        fetchRelatedPosts,
        clear
    };
};

/**
 * Utility functions untuk formatting
 */
export const useTopRatedUtils = () => {
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getCriteriaLabel = (criteria: TopRatedParams['criteria']): string => {
        switch (criteria) {
            case 'post_count':
                return 'Jumlah Post Terbanyak';
            case 'total_views':
                return 'Total Views Terbanyak';
            case 'total_downloads':
                return 'Total Downloads Terbanyak';
            case 'total_likes':
                return 'Total Likes Terbanyak';
            case 'highest_rating':
                return 'Rating MyAnimeList Tertinggi';
            case 'combined_score':
                return 'Kombinasi Score (Views + Downloads + Likes)';
            default:
                return 'Jumlah Post Terbanyak';
        }
    };

    const getRankingBadgeClass = (rank: number): string => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
        if (rank <= 10) return 'bg-gradient-to-r from-blue-500 to-blue-600';
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    };

    const getScoreColor = (score: number, maxScore: number): string => {
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
        if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
        if (percentage >= 20) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    return {
        formatNumber,
        getCriteriaLabel,
        getRankingBadgeClass,
        getScoreColor
    };
};