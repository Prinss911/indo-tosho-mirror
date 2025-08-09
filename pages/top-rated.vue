<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader :hideSearchAndFilter="true" />

        <!-- Main Content -->
        <div class="container-extra-wide py-8">
            <!-- Header Section -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Top Rated Anime</h1>
                <p class="text-gray-600 dark:text-gray-400">
                    Anime terpopuler berdasarkan berbagai kriteria ranking
                </p>
            </div>

            <!-- Data Status & Refresh -->
            <div class="mb-6">
                <div class="card p-4">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex flex-wrap items-center gap-2">
                            <!-- Cache Status with improved loading state -->
                            <span
                                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                                :class="{
                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                                        !loading,
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': loading
                                }"
                            >
                                <div
                                    class="w-2 h-2 rounded-full transition-all duration-200"
                                    :class="{
                                        'bg-green-600 dark:bg-green-400': !loading,
                                        'bg-blue-600 dark:bg-blue-400 animate-pulse': loading
                                    }"
                                ></div>
                                {{ loading ? "Loading..." : "Data Loaded" }}
                            </span>

                            <!-- Active Filters -->
                            <span v-if="hasActiveFilters" class="text-sm text-gray-600 dark:text-gray-400"
                                >Active filters:</span
                            >

                            <span
                                v-if="selectedCategory !== 'all'"
                                data-testid="filter-tag-category"
                                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm"
                            >
                                <div class="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                <span class="font-semibold">{{ displaySelectedCategory }}</span>
                            </span>

                            <span
                                v-if="selectedYear !== 'all'"
                                data-testid="filter-tag-year"
                                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-200 border border-green-200 dark:border-green-700 shadow-sm"
                            >
                                <div class="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full flex-shrink-0"></div>
                                <span class="font-semibold">{{ selectedYear }}</span>
                            </span>

                            <span
                                v-if="rankingCriteria !== 'post_count'"
                                data-testid="filter-tag-criteria"
                                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 dark:from-purple-900/50 dark:to-violet-900/50 dark:text-purple-200 border border-purple-200 dark:border-purple-700 shadow-sm"
                            >
                                <div class="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full flex-shrink-0"></div>
                                <span class="font-semibold">{{ getCriteriaLabel(rankingCriteria) }}</span>
                            </span>
                        </div>

                        <!-- Refresh Button -->
                        <button
                            @click="refresh"
                            :disabled="loading"
                            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                            data-testid="refresh-button"
                        >
                            <svg
                                class="w-4 h-4"
                                :class="{ 'animate-spin': loading }"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            {{ loading ? "Refreshing..." : "Refresh Data" }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filter and Sort Section -->
            <div
                class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
            >
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- Ranking Criteria -->
                    <div class="lg:w-64">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kriteria Ranking
                        </label>
                        <select
                            v-model="rankingCriteria"
                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @change="handleCriteriaChange"
                        >
                            <option value="post_count">Jumlah Post Terbanyak</option>
                            <option value="total_views">Total Views Terbanyak</option>

                            <option value="total_likes">Total Likes Terbanyak</option>
                            <option value="highest_rating">Rating MyAnimeList Tertinggi</option>
                            <option value="combined_score">Kombinasi Score</option>
                        </select>
                    </div>

                    <!-- Category Filter -->
                    <div class="lg:w-64">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kategori
                        </label>
                        <select
                            v-model="selectedCategory"
                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @change="handleCategoryChange"
                        >
                            <option value="all">Semua Kategori</option>
                            
                            <!-- Tampilkan semua kategori jika tidak ada struktur hierarkis -->
                            <template v-if="parentCategories.length === 0">
                                <option v-for="category in categories.filter(cat => cat.id !== 'all')" :key="category.id" :value="category.id">
                                    {{ category.parent_id ? '　' : '' }}{{ category.name }}
                                </option>
                            </template>
                            
                            <!-- Tampilkan dengan struktur hierarkis -->
                            <template v-else>
                                <optgroup v-for="parentCategory in parentCategories" :key="parentCategory.id" :label="parentCategory.name">
                                    <!-- Option untuk "Semua [Parent Category]" -->
                                    <option :value="parentCategory.id">
                                        Semua {{ parentCategory.name }}
                                    </option>
                                    <!-- Subkategori -->
                                    <option v-for="childCategory in getChildCategories(parentCategory.id)" :key="childCategory.id" :value="childCategory.id">
                                        {{ childCategory.name }}
                                    </option>
                                </optgroup>
                            </template>
                        </select>
                    </div>

                    <!-- Year Filter -->
                    <div class="lg:w-48">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tahun
                        </label>
                        <select
                            v-model="selectedYear"
                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @change="handleYearChange"
                        >
                            <option value="all">Semua Tahun</option>
                            <option v-for="year in availableYears" :key="year" :value="year">
                                {{ year }}
                            </option>
                        </select>
                    </div>

                    <!-- Limit Results -->
                    <div class="lg:w-32">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tampilkan
                        </label>
                        <select
                            v-model="limitResults"
                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @change="handleLimitChange"
                        >
                            <option value="10">Top 10</option>
                            <option value="25">Top 25</option>
                            <option value="50">Top 50</option>
                            <option value="100">Top 100</option>
                        </select>
                    </div>
                </div>

                <!-- Results Info -->
                <div class="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Menampilkan {{ topRatedAnimes?.length || 0 }} Anime Teratas</span>
                    <span>Kriteria: {{ getCriteriaLabel(rankingCriteria) }}</span>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-12">
                <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Terjadi Kesalahan</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
                <button
                    @click="refresh"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Coba Lagi
                </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="isEmpty" class="text-center py-12">
                <TrophyIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum Ada Data</h3>
                <p class="text-gray-600 dark:text-gray-400">
                    Belum ada anime yang memenuhi kriteria yang dipilih
                </p>
            </div>

            <!-- Top Rated List -->
            <div v-else-if="hasData" class="space-y-4">
                <div
                    v-for="(anime, index) in topRatedAnimes"
                    :key="anime.title"
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                    <div class="p-6">
                        <div class="flex items-start gap-6">
                            <!-- Ranking Number -->
                            <div class="flex-shrink-0">
                                <div
                                    class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                    :class="getRankingBadgeClass(index + 1)"
                                >
                                    {{ index + 1 }}
                                </div>
                            </div>

                            <!-- Cover Image -->
                            <div class="flex-shrink-0">
                                <img
                                    :src="anime.coverImage || '/placeholder-anime.svg'"
                                    :alt="anime.title"
                                    class="w-20 h-28 object-cover rounded-lg shadow-sm"
                                    loading="lazy"
                                    @error="handleImageError"
                                />
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <!-- Title and Basic Info -->
                                <div class="mb-4">
                                    <h3
                                        class="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                                        @click="showAnimeDetails(anime.title)"
                                    >
                                        {{ anime.title }}
                                    </h3>
                                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span v-if="anime.year">{{ anime.year }}</span>
                                        <span v-if="anime.episodes">{{ anime.episodes }} Episode</span>
                                        <span v-if="anime.rating" class="flex items-center gap-1">
                                            <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                                            {{ anime.rating.toFixed(1) }}
                                        </span>
                                        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm">
                                            <div class="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                            <span class="font-semibold">{{ anime.category }}</span>
                                        </span>
                                    </div>
                                </div>

                                <!-- Statistics -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div class="flex items-center justify-center gap-2 mb-2">
                                            <FilmIcon class="w-5 h-5 text-blue-500" />
                                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Posts</span>
                                        </div>
                                        <div class="text-xl font-bold text-gray-900 dark:text-white">
                                            {{ formatNumber(anime.postCount) }}
                                        </div>
                                    </div>

                                    <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div class="flex items-center justify-center gap-2 mb-2">
                                            <EyeIcon class="w-5 h-5 text-green-500" />
                                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Views</span>
                                        </div>
                                        <div class="text-xl font-bold text-gray-900 dark:text-white">
                                            {{ formatNumber(anime.totalViews) }}
                                        </div>
                                    </div>

                                    <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div class="flex items-center justify-center gap-2 mb-2">
                                            <HeartIcon class="w-5 h-5 text-red-500" />
                                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Likes</span>
                                        </div>
                                        <div class="text-xl font-bold text-gray-900 dark:text-white">
                                            {{ formatNumber(anime.totalLikes) }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Combined Score (if applicable) -->
                                <div v-if="rankingCriteria === 'combined_score'" class="mt-4">
                                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Combined Score</span>
                                            <span class="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {{ formatNumber(anime.combinedScore) }}
                                            </span>
                                        </div>
                                        <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Berdasarkan views + likes
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal untuk menampilkan daftar post -->
        <div
            v-if="showModal"
            class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            @click="closeModal"
        >
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[85vh] overflow-hidden"
                @click.stop
            >
                <!-- Modal Header -->
                <div class="border-b border-gray-200 dark:border-gray-700 p-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedAnimeTitle }}</h2>
                        <button
                            @click="closeModal"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                ></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Modal Content -->
                <div class="p-4 overflow-y-auto max-h-[70vh]">
                    <div v-if="loadingPosts" class="flex justify-center items-center py-8">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>

                    <div v-else-if="relatedPosts.length === 0" class="text-center py-8">
                        <FilmIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p class="text-gray-600 dark:text-gray-400">Tidak ditemukan post untuk anime ini.</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div
                            v-for="post in relatedPosts"
                            :key="post.id"
                            class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            @click="navigateToAnime(post.id)"
                        >
                            <div class="flex items-start gap-3">
                                <!-- Thumbnail -->
                                <div class="flex-shrink-0">
                                    <img
                                        :src="post.coverImage || '/placeholder-anime.svg'"
                                        :alt="post.title"
                                        class="w-12 h-16 object-cover rounded"
                                        @error="handleImageError"
                                    />
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                                        {{ post.title }}
                                    </h3>
                                    <p
                                        v-if="post.releaseFileName"
                                        class="text-sm text-blue-600 dark:text-blue-400 mb-2"
                                    >
                                        {{ post.releaseFileName }}
                                    </p>
                                    <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{{ post.year }}</span>
                                        <span v-if="post.episodes">{{ post.episodes }} Ep</span>
                                        <span v-if="post.rating" class="flex items-center gap-1">
                                            <StarIcon class="w-3 h-3 text-yellow-400 fill-current" />
                                            {{ post.rating.toFixed(1) }}
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <EyeIcon class="w-3 h-3" />
                                            {{ formatNumber(post.views || 0) }}
                                        </span>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAnimeStore } from "~/stores/anime";
import { useTopRated, useRelatedPosts, useTopRatedUtils } from "~/composables/useTopRated";
import {
    TrophyIcon,
    FilmIcon,
    ExclamationTriangleIcon,
    StarIcon,
    EyeIcon,
    HeartIcon
} from "@heroicons/vue/24/outline";

// Meta
definePageMeta({
    title: "Top Rated Anime"
});

// Composables
const router = useRouter();
const animeStore = useAnimeStore();
const {
    loading,
    error,
    topRatedAnimes,
    stats,
    availableYears,
    total,
    currentParams,
    isEmpty,
    hasData,
    updateCriteria,
    updateCategory,
    updateYear,
    updateLimit,
    refresh
} = useTopRated({ autoFetch: true });

const {
    loading: loadingPosts,
    posts: relatedPosts,
    fetchRelatedPosts,
    clear: clearRelatedPosts
} = useRelatedPosts();

const { formatNumber, getCriteriaLabel, getRankingBadgeClass } = useTopRatedUtils();

// Reactive state untuk UI
const rankingCriteria = ref("post_count");
const selectedCategory = ref("all");
const selectedYear = ref("all");
const limitResults = ref("25");

// Modal state
const showModal = ref(false);
const selectedAnimeTitle = ref("");

// Computed properties
const categories = computed(() => animeStore.categories.filter(cat => cat.id !== "all"));

// Enhanced computed properties for hierarchical categories
const parentCategories = computed(() => {
    return animeStore.categories.filter(cat => !cat.parent_id && cat.id !== "all");
});

const getChildCategories = (parentId: string) => {
    return animeStore.categories.filter(cat => cat.parent_id === parentId);
};

// Computed property untuk menampilkan nama kategori yang dipilih
const displaySelectedCategory = computed(() => {
    // Jika kategori adalah "all", gunakan kategori dari database
    if (selectedCategory.value === "all") {
        // Cari kategori dengan id "all" di database
        const allCategory = animeStore.categories.find(cat => cat.id === "all");
        return allCategory?.name ?? "Semua Kategori";
    }

    // Cari kategori yang dipilih berdasarkan ID
    const category = animeStore.categories.find(cat => cat.id === selectedCategory.value);

    if (!category) {
        // Jika kategori tidak ditemukan, gunakan kategori "all" dari database
        const allCategory = animeStore.categories.find(cat => cat.id === "all");
        return allCategory?.name ?? "Semua Kategori";
    }

    // Jika ini adalah subkategori, tampilkan dengan format "Parent > Subcategory"
    if (category.parent_id) {
        const parentCategory = animeStore.categories.find(cat => cat.id === category.parent_id);
        if (parentCategory) {
            return `${parentCategory.name} > ${category.name}`;
        }
    }

    // Jika kategori utama atau tidak ditemukan parent-nya
    return category.name;
});

const hasActiveFilters = computed(() => {
    return selectedCategory.value !== "all" || selectedYear.value !== "all" || rankingCriteria.value !== "post_count";
});

// Methods
const loadTopRatedAnimes = async () => {
    try {
        await animeStore.fetchCategories();
        await refresh();
    } catch (err) {
        console.error("Error loading top rated animes:", err);
    }
};

const handleCriteriaChange = async () => {
    await updateCriteria(rankingCriteria.value as any);
};

const handleCategoryChange = async () => {
    await updateCategory(selectedCategory.value);
};

const handleYearChange = async () => {
    await updateYear(selectedYear.value);
};

const handleLimitChange = async () => {
    await updateLimit(parseInt(limitResults.value));
};

const navigateToAnime = (id: string) => {
    router.push(`/anime/${id}`);
};

const showAnimeDetails = async (title: string) => {
    selectedAnimeTitle.value = title;
    showModal.value = true;
    
    try {
        await fetchRelatedPosts(title);
    } catch (err) {
        console.error("Error loading related posts:", err);
    }
};

const closeModal = () => {
    showModal.value = false;
    selectedAnimeTitle.value = "";
    clearRelatedPosts();
};

const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.src = "/placeholder-anime.svg";
};

// Event listener untuk menutup modal dengan tombol Escape
const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && showModal.value) {
        closeModal();
    }
};

// Lifecycle
onMounted(() => {
    loadTopRatedAnimes();
    document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
});

// SEO
useHead({
    title: "Top Rated Anime - Anime Database",
    meta: [
        {
            name: "description",
            content:
                "Temukan anime terpopuler dan top rated berdasarkan berbagai kriteria seperti jumlah post, views, likes, dan rating MyAnimeList."
        },
        {
            property: "og:title",
            content: "Top Rated Anime - Anime Database"
        },
        {
            property: "og:description",
            content: "Temukan anime terpopuler dan top rated berdasarkan berbagai kriteria ranking."
        }
    ]
});
</script>

<style scoped>
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>