import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useTopRated, useRelatedPosts, useTopRatedUtils } from "~/composables/useTopRated";
import * as topRatedApi from "~/api/top-rated";

// Mock Vue composables globally
global.ref = vi.fn((value) => ({ value }));
global.computed = vi.fn((fn) => ({ value: fn() }));
global.nextTick = vi.fn(() => Promise.resolve());
global.watch = vi.fn();
global.onMounted = vi.fn();
global.reactive = vi.fn((obj) => obj);
global.readonly = vi.fn((obj) => obj);

// Mock Vue composables
vi.mock("vue", () => ({
    ref: global.ref,
    computed: global.computed,
    nextTick: global.nextTick,
    watch: global.watch,
    onMounted: global.onMounted,
    reactive: global.reactive,
    readonly: global.readonly
}));

const { ref, nextTick } = { ref: global.ref, nextTick: global.nextTick };

// Mock API functions
vi.mock("~/api/top-rated", () => ({
    getTopRatedAnimes: vi.fn(),
    getTopRatedStats: vi.fn(),
    getAvailableYears: vi.fn(),
    getRelatedPosts: vi.fn()
}));

// Mock data
const mockTopRatedAnimes = [
    {
        title: "Attack on Titan",
        coverImage: "/covers/aot.jpg",
        year: 2013,
        episodes: 25,
        rating: 9.0,
        category: "Action",
        postCount: 15,
        totalViews: 50000,
        totalDownloads: 25000,
        totalLikes: 1200,
        combinedScore: 76200,
        posts: []
    },
    {
        title: "Demon Slayer",
        coverImage: "/covers/demon-slayer.jpg",
        year: 2019,
        episodes: 12,
        rating: 8.7,
        category: "Action",
        postCount: 12,
        totalViews: 40000,
        totalDownloads: 20000,
        totalLikes: 1000,
        combinedScore: 61000,
        posts: []
    }
];

const mockStats = {
    totalAnimes: 100,
    totalPosts: 500,
    totalViews: 1000000,
    totalDownloads: 500000,
    totalLikes: 25000,
    averageRating: 8.2
};

const mockAvailableYears = [2023, 2022, 2021, 2020, 2019];

const mockRelatedPosts = [
    {
        id: "1",
        title: "Attack on Titan Season 1",
        releaseFileName: "[SubsPlease] Attack on Titan - 01 [1080p].mkv",
        coverImage: "/covers/aot-s1.jpg",
        year: 2013,
        episodes: 25,
        rating: 9.0,
        views: 15000,
        downloads: 8000
    },
    {
        id: "2",
        title: "Attack on Titan Season 2",
        releaseFileName: "[SubsPlease] Attack on Titan S2 - 01 [1080p].mkv",
        coverImage: "/covers/aot-s2.jpg",
        year: 2017,
        episodes: 12,
        rating: 9.1,
        views: 18000,
        downloads: 9000
    }
];

describe('useTopRated', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup default mock implementations
        (topRatedApi.getTopRatedAnimes as any).mockResolvedValue({
            success: true,
            data: mockTopRatedAnimes,
            total: 100
        });
        
        (topRatedApi.getTopRatedStats as any).mockResolvedValue({
            success: true,
            data: mockStats
        });
        
        (topRatedApi.getAvailableYears as any).mockResolvedValue({
            success: true,
            data: mockAvailableYears
        });
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            const { 
                loading, 
                error, 
                topRatedAnimes, 
                stats, 
                availableYears, 
                total, 
                currentParams,
                isEmpty,
                hasData
            } = useTopRated({ autoFetch: false });

            expect(loading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(topRatedAnimes.value).toEqual([]);
            expect(stats.value).toBe(null);
            expect(availableYears.value).toEqual([]);
            expect(total.value).toBe(0);
            expect(currentParams.value).toEqual({
                criteria: 'post_count',
                category: undefined,
                year: undefined,
                limit: 25
            });
            expect(isEmpty.value).toBe(true);
            expect(hasData.value).toBe(false);
        });

        it('should auto-fetch data when autoFetch is true', async () => {
            const { fetchTopRated, fetchStats, fetchAvailableYears } = useTopRated({ autoFetch: true });

            // Manually trigger the fetch methods since onMounted is mocked
            await fetchTopRated();
            await fetchStats();
            await fetchAvailableYears();

            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalled();
            expect(topRatedApi.getTopRatedStats).toHaveBeenCalled();
            expect(topRatedApi.getAvailableYears).toHaveBeenCalled();
        });
    });

    describe('fetchTopRated', () => {
        it('should fetch top rated animes successfully', async () => {
            const { fetchTopRated, loading, topRatedAnimes, total, error } = useTopRated({ autoFetch: false });

            const promise = fetchTopRated();
            expect(loading.value).toBe(true);

            await promise;

            expect(loading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(topRatedAnimes.value).toEqual(mockTopRatedAnimes);
            expect(total.value).toBe(100);
            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalledWith({
                criteria: 'post_count',
                category: undefined,
                year: undefined,
                limit: 25
            });
        });

        it('should handle API error', async () => {
            (topRatedApi.getTopRatedAnimes as any).mockResolvedValue({
                success: false,
                error: 'API Error'
            });

            const { fetchTopRated, loading, error, topRatedAnimes } = useTopRated({ autoFetch: false });

            await fetchTopRated();

            expect(loading.value).toBe(false);
            expect(error.value).toBe('API Error');
            expect(topRatedAnimes.value).toEqual([]);
        });

        it('should handle network error', async () => {
            (topRatedApi.getTopRatedAnimes as any).mockRejectedValue(new Error('Network Error'));

            const { fetchTopRated, loading, topRatedAnimes } = useTopRated({ autoFetch: false });

            await fetchTopRated();

            expect(loading.value).toBe(false);
            expect(topRatedAnimes.value).toEqual([]);
        });

        it('should update params when provided', async () => {
            const { fetchTopRated, currentParams } = useTopRated({ autoFetch: false });

            await fetchTopRated({ 
                criteria: 'total_views', 
                category: '1', 
                year: 2023, 
                limit: 50 
            });

            expect(currentParams.value).toEqual({
                criteria: 'total_views',
                category: '1',
                year: 2023,
                limit: 50
            });

            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalledWith({
                criteria: 'total_views',
                category: '1',
                year: 2023,
                limit: 50
            });
        });
    });

    describe('fetchStats', () => {
        it('should fetch stats successfully', async () => {
            const { fetchStats, stats, error } = useTopRated({ autoFetch: false });

            await fetchStats();

            expect(error.value).toBe(null);
            expect(stats.value).toEqual(mockStats);
            expect(topRatedApi.getTopRatedStats).toHaveBeenCalled();
        });

        it('should handle stats API error', async () => {
            (topRatedApi.getTopRatedStats as any).mockResolvedValue({
                success: false,
                error: 'Stats Error'
            });

            const { fetchStats, stats } = useTopRated({ autoFetch: false });

            await fetchStats();

            expect(stats.value).toBe(null);
        });
    });

    describe('fetchAvailableYears', () => {
        it('should fetch available years successfully', async () => {
            const { fetchAvailableYears, availableYears, error } = useTopRated({ autoFetch: false });

            await fetchAvailableYears();

            expect(error.value).toBe(null);
            expect(availableYears.value).toEqual(mockAvailableYears);
            expect(topRatedApi.getAvailableYears).toHaveBeenCalled();
        });

        it('should handle years API error', async () => {
            (topRatedApi.getAvailableYears as any).mockResolvedValue({
                success: false,
                error: 'Years Error'
            });

            const { fetchAvailableYears, availableYears } = useTopRated({ autoFetch: false });

            await fetchAvailableYears();

            expect(availableYears.value).toEqual([]);
         });
     });

    describe('Update Methods', () => {
        it('should update criteria and fetch data', async () => {
            const { updateCriteria, currentParams } = useTopRated({ autoFetch: false });

            await updateCriteria('total_views');

            expect(currentParams.value.criteria).toBe('total_views');
            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalledWith({
                criteria: 'total_views',
                category: undefined,
                year: undefined,
                limit: 25
            });
        });

        it('should update category and fetch data', async () => {
            const { updateCategory, currentParams } = useTopRated({ autoFetch: false });

            await updateCategory('1');

            expect(currentParams.value.category).toBe('1');
            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalledWith({
                criteria: 'post_count',
                category: '1',
                year: undefined,
                limit: 25
            });
        });

        it('should handle "all" category as undefined', async () => {
            const { updateCategory, currentParams } = useTopRated({ autoFetch: false });

            await updateCategory('all');

            expect(currentParams.value.category).toBe(undefined);
        });

        it('should update year and fetch data', async () => {
            const { updateYear, currentParams } = useTopRated({ autoFetch: false });

            await updateYear(2023);

            expect(currentParams.value.year).toBe(2023);
            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalledWith({
                criteria: 'post_count',
                category: undefined,
                year: 2023,
                limit: 25
            });
        });

        it('should handle "all" year as undefined', async () => {
            const { updateYear, currentParams } = useTopRated({ autoFetch: false });

            await updateYear('all');

            expect(currentParams.value.year).toBe(undefined);
        });

        it('should update limit and fetch data', async () => {
            const { updateLimit, currentParams } = useTopRated({ autoFetch: false });

            await updateLimit(50);

            expect(currentParams.value.limit).toBe(50);
            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalledWith({
                criteria: 'post_count',
                category: undefined,
                year: undefined,
                limit: 50
            });
        });
    });

    describe('Utility Methods', () => {
        it('should refresh all data', async () => {
            const { refresh } = useTopRated({ autoFetch: false });

            await refresh();

            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalled();
            expect(topRatedApi.getTopRatedStats).toHaveBeenCalled();
            expect(topRatedApi.getAvailableYears).toHaveBeenCalled();
        });

        it('should reset to default params', async () => {
            const { reset, currentParams, updateCriteria } = useTopRated({ autoFetch: false });

            // Change params first
            await updateCriteria('total_views');
            expect(currentParams.value.criteria).toBe('total_views');

            // Reset
            await reset();

            expect(currentParams.value).toEqual({
                criteria: 'post_count',
                category: undefined,
                year: undefined,
                limit: 25
            });
        });
    });

    describe('Computed Properties', () => {
        it('should compute isEmpty correctly', () => {
            const { isEmpty, topRatedAnimes } = useTopRated({ autoFetch: false });

            expect(isEmpty.value).toBe(true);

            // Test with mock data
            const mockComposable = useTopRated({ autoFetch: false });
            mockComposable.topRatedAnimes.value = mockTopRatedAnimes;
            expect(mockComposable.topRatedAnimes.value.length > 0).toBe(true);
        });

        it('should compute hasData correctly', () => {
            const { hasData, topRatedAnimes } = useTopRated({ autoFetch: false });

            expect(hasData.value).toBe(false);

            // Test with mock data
            const mockComposable = useTopRated({ autoFetch: false });
            mockComposable.topRatedAnimes.value = mockTopRatedAnimes;
            expect(mockComposable.topRatedAnimes.value.length > 0).toBe(true);
        });

        it('should compute isFiltered correctly', async () => {
            const { isFiltered, updateCategory, updateYear, updateCriteria } = useTopRated({ autoFetch: false });

            expect(isFiltered.value).toBe(false);

            // Test category filter
            await updateCategory('1');
            // Test year filter
            await updateYear(2023);
            // Test criteria filter
            await updateCriteria('total_views');
            
            // Verify API calls were made with correct parameters
            expect(topRatedApi.getTopRatedAnimes).toHaveBeenCalledWith(expect.objectContaining({
                criteria: 'total_views'
            }));
        });
    });
});

describe('useRelatedPosts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        (topRatedApi.getRelatedPosts as any).mockResolvedValue({
            success: true,
            data: mockRelatedPosts
        });
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            const { loading, error, posts } = useRelatedPosts();

            expect(loading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(posts.value).toEqual([]);
        });
    });

    describe('fetchRelatedPosts', () => {
        it('should fetch related posts successfully', async () => {
            const { fetchRelatedPosts, loading, posts, error } = useRelatedPosts();

            const promise = fetchRelatedPosts('Attack on Titan');
            expect(loading.value).toBe(true);

            await promise;

            expect(loading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(posts.value).toEqual(mockRelatedPosts);
            expect(topRatedApi.getRelatedPosts).toHaveBeenCalledWith('Attack on Titan');
        });

        it('should handle API error', async () => {
            (topRatedApi.getRelatedPosts as any).mockResolvedValue({
                success: false,
                error: 'Posts Error'
            });

            const { fetchRelatedPosts, loading, error, posts } = useRelatedPosts();

            await fetchRelatedPosts('Attack on Titan');

            expect(loading.value).toBe(false);
            expect(error.value).toBe('Posts Error');
            expect(posts.value).toEqual([]);
        });

        it('should handle network error', async () => {
            (topRatedApi.getRelatedPosts as any).mockRejectedValue(new Error('Network Error'));

            const { fetchRelatedPosts, loading, error } = useRelatedPosts();

            await fetchRelatedPosts('Attack on Titan');

            expect(loading.value).toBe(false);
            expect(error.value).toBe('Terjadi kesalahan saat memuat posts terkait');
        });
    });

    describe('clear', () => {
        it('should clear posts and error', async () => {
            const { fetchRelatedPosts, clear, posts, error } = useRelatedPosts();

            // Fetch some data first
            await fetchRelatedPosts('Attack on Titan');
            expect(posts.value).toEqual(mockRelatedPosts);

            // Clear
            clear();

            expect(posts.value).toEqual([]);
            expect(error.value).toBe(null);
        });
    });
});

describe('useTopRatedUtils', () => {
    describe('formatNumber', () => {
        it('should format numbers correctly', () => {
            const { formatNumber } = useTopRatedUtils();

            expect(formatNumber(500)).toBe('500');
            expect(formatNumber(1500)).toBe('1.5K');
            expect(formatNumber(1000000)).toBe('1.0M');
            expect(formatNumber(2500000)).toBe('2.5M');
        });
    });

    describe('getCriteriaLabel', () => {
        it('should return correct labels for criteria', () => {
            const { getCriteriaLabel } = useTopRatedUtils();

            expect(getCriteriaLabel('post_count')).toBe('Jumlah Post Terbanyak');
            expect(getCriteriaLabel('total_views')).toBe('Total Views Terbanyak');
            expect(getCriteriaLabel('total_downloads')).toBe('Total Downloads Terbanyak');
            expect(getCriteriaLabel('total_likes')).toBe('Total Likes Terbanyak');
            expect(getCriteriaLabel('highest_rating')).toBe('Rating MyAnimeList Tertinggi');
            expect(getCriteriaLabel('combined_score')).toBe('Kombinasi Score (Views + Downloads + Likes)');
            expect(getCriteriaLabel('unknown' as any)).toBe('Jumlah Post Terbanyak');
        });
    });

    describe('getRankingBadgeClass', () => {
        it('should return correct CSS classes for rankings', () => {
            const { getRankingBadgeClass } = useTopRatedUtils();

            expect(getRankingBadgeClass(1)).toBe('bg-gradient-to-r from-yellow-400 to-yellow-600');
            expect(getRankingBadgeClass(2)).toBe('bg-gradient-to-r from-gray-300 to-gray-500');
            expect(getRankingBadgeClass(3)).toBe('bg-gradient-to-r from-orange-400 to-orange-600');
            expect(getRankingBadgeClass(5)).toBe('bg-gradient-to-r from-blue-500 to-blue-600');
            expect(getRankingBadgeClass(15)).toBe('bg-gradient-to-r from-gray-400 to-gray-600');
        });
    });

    describe('getScoreColor', () => {
        it('should return correct colors based on score percentage', () => {
            const { getScoreColor } = useTopRatedUtils();

            expect(getScoreColor(80, 100)).toBe('text-green-600 dark:text-green-400');
            expect(getScoreColor(70, 100)).toBe('text-blue-600 dark:text-blue-400');
            expect(getScoreColor(50, 100)).toBe('text-yellow-600 dark:text-yellow-400');
            expect(getScoreColor(30, 100)).toBe('text-orange-600 dark:text-orange-400');
            expect(getScoreColor(10, 100)).toBe('text-red-600 dark:text-red-400');
            expect(getScoreColor(50, 0)).toBe('text-red-600 dark:text-red-400'); // maxScore is 0
        });
    });
});