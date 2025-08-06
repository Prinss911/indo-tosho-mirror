<template>
    <ClientOnly>
        <div class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200 flex flex-col">
            <AppHeader data-testid="app-header" />

            <!-- Notification Banner -->
            <div v-if="currentNotification" class="container-extra-wide mt-4 px-4 sm:px-6 lg:px-8">
                <NotificationBanner :notification="currentNotification" :dismissible="false" />
            </div>

            <main class="w-full py-8 flex-1">
                <!-- Data Status & Refresh -->
                <div class="mb-6 px-4 sm:px-6 lg:px-8">
                    <div class="card p-4">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex flex-wrap items-center gap-2">
                                <!-- Cache Status with improved loading state -->
                                <span
                                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                                    :class="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                                            dataLoaded && !loading,
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                                            !dataLoaded || loading,
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': loading
                                    }"
                                >
                                    <div
                                        class="w-2 h-2 rounded-full transition-all duration-200"
                                        :class="{
                                            'bg-green-600 dark:bg-green-400': dataLoaded && !loading,
                                            'bg-yellow-600 dark:bg-yellow-400': !dataLoaded && !loading,
                                            'bg-blue-600 dark:bg-blue-400 animate-pulse': loading
                                        }"
                                    ></div>
                                    {{ loading ? "Refreshing..." : dataLoaded ? "Data Cached" : "Loading..." }}
                                </span>

                                <!-- Active Filters -->
                                <span v-if="hasActiveFilters" class="text-sm text-gray-600 dark:text-gray-400"
                                    >Active filters:</span
                                >

                                <span
                                    v-if="activeCategory !== 'all'"
                                    data-testid="filter-tag-category"
                                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm"
                                >
                                    <div class="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                    <span class="font-semibold">{{ displaySelectedCategory }}</span>
                                </span>

                                <span
                                    v-if="searchQuery"
                                    data-testid="filter-tag-search"
                                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                >
                                    Search: "{{ searchQuery }}"
                                </span>
                            </div>

                            <!-- Refresh Button -->
                            <button
                                @click="refreshData"
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

                <!-- Main Content -->
                <div class="px-4 sm:px-6 lg:px-8">
                    <!-- Anime Table -->
                    <AnimeTable data-testid="anime-table" />

                    <!-- Pagination -->
                    <AppPagination v-if="totalAnimes > 0" data-testid="app-pagination" />
                </div>

                <!-- Loading State -->
                <div v-if="loading && totalAnimes === 0" class="text-center py-12">
                    <div class="w-16 h-16 mx-auto mb-4 animate-spin">
                        <svg
                            class="w-full h-full text-blue-600 dark:text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            ></circle>
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">Memuat data anime...</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-4">Mohon tunggu sebentar</p>
                </div>

                <!-- No Results State -->
                <div v-else-if="!loading && totalAnimes === 0" class="text-center py-12">
                    <FilmIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">Belum ada data anime</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-4">
                        {{
                            hasActiveFilters
                                ? "Coba sesuaikan pencarian atau filter Anda."
                                : "Belum ada data anime yang tersedia saat ini."
                        }}
                    </p>
                </div>
            </main>

            <!-- Footer -->
            <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 mt-12">
                <div class="container-extra-wide py-8">
                    <div class="text-center text-gray-600 dark:text-gray-400">
                        <p class="mb-2">&copy; 2025 Anime Database. Built with ❤️ using Nuxt 3 and Tailwind CSS.</p>
                        <p class="text-sm">
                            Modern, responsive, and fast anime database for all your anime discovery needs.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAnimeStore } from "~/stores/anime";
import { FilmIcon } from "@heroicons/vue/24/outline";

// Meta tags
useHead({
    title: "Anime Database",
    meta: [
        {
            name: "description",
            content: "Anime database application"
        },
        {
            property: "og:title",
            content: "Anime Database"
        },
        {
            property: "og:description",
            content: "Anime database application"
        },
        {
            property: "og:type",
            content: "website"
        }
    ]
});

const animeStore = useAnimeStore();

// Notification state
const currentNotification = ref(null);

// Fetch current notification
const fetchCurrentNotification = async () => {
    try {
        const response = await $fetch("/api/admin/notifications");
        if (response && 'data' in response && response.success) {
            currentNotification.value = response.data as null;
        } else {
            currentNotification.value = null;
        }
    } catch (error) {
        console.error("Error fetching notification:", error);
        currentNotification.value = null;
    }
};

// Computed properties
const totalAnimes = computed(() => animeStore.totalAnimes);
const totalPages = computed(() => animeStore.totalPages);
const currentPage = computed(() => animeStore.filter.page);
const categories = computed(() => animeStore.categories);
const activeCategory = computed(() => animeStore.filter.category);
const searchQuery = computed(() => animeStore.filter.search);
const loading = computed(() => animeStore.loading);
const dataLoaded = computed(() => animeStore.dataLoaded && animeStore.categoriesLoaded);

// Computed property untuk menampilkan nama kategori yang dipilih
const displaySelectedCategory = computed(() => {
    // Jika kategori adalah "all", gunakan kategori dari database
    if (animeStore.filter.category === "all") {
        // Cari kategori dengan id "all" di database
        const allCategory = animeStore.categories.find(cat => cat.id === "all");
        return allCategory?.name ?? "Semua Kategori";
    }

    // Cari kategori yang dipilih berdasarkan ID
    const category = animeStore.categories.find(cat => cat.id === animeStore.filter.category);

    if (!category) {
        // Jika kategori tidak ditemukan, gunakan kategori "all" dari database
        const allCategory = animeStore.categories.find(cat => cat.id === "all");
        return allCategory?.name ?? "Semua Kategori";
    }

    // Jika ini adalah subkategori, tampilkan dengan format "Parent > Subcategory"
    if (category.parent) {
        const parentCategory = animeStore.categories.find(cat => cat.id === category.parent);
        if (parentCategory) {
            return `${parentCategory.name} > ${category.name}`;
        }
    }

    // Jika kategori utama atau tidak ditemukan parent-nya
    return category.name;
});

const hasActiveFilters = computed(() => {
    return activeCategory.value !== "all" || searchQuery.value !== "";
});

// Methods
const refreshData = async () => {
    await animeStore.refreshData();
};

// Lifecycle
onMounted(async () => {
    // Hanya fetch jika data belum dimuat
    await animeStore.fetchCategories();
    await animeStore.fetchAnimes();
    // Fetch current notification
    await fetchCurrentNotification();
});
</script>
