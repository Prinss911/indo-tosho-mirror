<template>
    <div
        class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
        <!-- Table Header with Sort Options -->
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Anime List</h2>
                <div class="flex items-center space-x-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                    <div class="flex items-center space-x-2">
                        <div class="relative">
                            <select
                                v-model="sortBy"
                                @change="updateSort(sortBy)"
                                @focus="isDropdownOpen = true"
                                @blur="isDropdownOpen = false"
                                class="appearance-none bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 border border-purple-200 dark:border-gray-500 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:shadow-md min-w-[120px]"
                            >
                                <option value="date" class="bg-white dark:bg-gray-800">📅 Date</option>
                                <option value="title" class="bg-white dark:bg-gray-800">📝 Title</option>
                                <option value="downloads" class="bg-white dark:bg-gray-800">📥 Downloads</option>
                            </select>
                            <!-- Sembunyikan ikon saat dropdown terbuka -->
                            <ChevronDownIcon
                                v-show="!isDropdownOpen"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                            />
                        </div>
                        <button
                            @click.stop="toggleSortOrder"
                            class="p-2 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 border border-indigo-200 dark:border-gray-500 rounded-lg text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all duration-200"
                            :title="sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
                            data-testid="sort-order-button"
                        >
                            <ChevronUpIcon v-if="sortOrder === 'asc'" class="w-4 h-4" />
                            <ChevronDownIcon v-else class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="animeStore.loading" class="flex items-center justify-center py-12" data-testid="loading-spinner">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600 dark:text-gray-400">Memuat data anime...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="animeStore.error" class="flex items-center justify-center py-12" data-testid="error-message">
            <div class="text-center">
                <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p class="text-red-600 dark:text-red-400">{{ animeStore.error }}</p>
                <button @click="animeStore.fetchAnimes()" class="mt-2 btn-primary" data-testid="retry-button">
                    Coba Lagi
                </button>
            </div>
        </div>

        <!-- Content Area -->
        <div v-else>
            <!-- Desktop Table -->
            <div class="hidden lg:block overflow-x-auto" data-testid="anime-table">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <caption class="sr-only">
                        List of anime with details including title, category, rating, and download statistics
                    </caption>
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th
                                scope="col"
                                class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                                data-testid="sortable-header"
                            >
                                Category
                            </th>
                            <th
                                scope="col"
                                class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 transition-colors duration-150"
                                data-testid="sort-title"
                                aria-label="Sort by title"
                                @click="updateSort('title')"
                                @keydown.enter="updateSort('title')"
                                @keydown.space.prevent="updateSort('title')"
                                tabindex="0"
                                role="button"
                            >
                                Title
                            </th>


                            <th
                                scope="col"
                                class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 transition-colors duration-150 w-28"
                                data-testid="sort-date"
                                aria-label="Sort by date"
                                @click="updateSort('date')"
                                @keydown.enter="updateSort('date')"
                                @keydown.space.prevent="updateSort('date')"
                                tabindex="0"
                                role="button"
                            >
                                Date
                            </th>
                            <th
                                scope="col"
                                class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
                            >
                                Stats
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr
                            v-for="anime in paginatedAnimes"
                            :key="anime.id"
                            class="table-row cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600"
                            @click="navigateToDetail(anime.id)"
                            @keydown.enter="navigateToDetail(anime.id)"
                            @keydown.space.prevent="navigateToDetail(anime.id)"
                            tabindex="0"
                            data-testid="anime-row"
                            :aria-label="`View details for ${anime.title}`"
                            role="button"
                        >
                            <td class="px-3 py-3 whitespace-nowrap">
                                <span
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="getCategoryColor(animeStore.getLegacyCategoryFromId(anime.category))"
                                >
                                    {{ animeStore.getLegacyCategoryFromId(anime.category) }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <div>
                                    <div>
                                        <div
                                            class="text-sm font-medium text-gray-900 dark:text-white"
                                            data-testid="anime-title"
                                            :title="anime.releaseFileName || anime.title"
                                        >
                                            {{ formatReleaseFileName(anime.releaseFileName || anime.title) }}
                                        </div>
                                        <div class="text-sm text-gray-500 dark:text-gray-400">
                                            {{ anime.studio }}
                                        </div>
                                    </div>
                                </div>
                            </td>


                            <td
                                class="px-3 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                                data-testid="anime-date"
                            >
                                <div>
                                    <div class="text-sm">{{ formatDate(anime.created_at || anime.date) }}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ formatTime(anime.created_at || anime.date) }}
                                    </div>
                                </div>
                            </td>
                            <td class="px-3 py-3 whitespace-nowrap text-xs">
                                <div class="space-y-1">
                                    <div
                                        class="flex items-center text-blue-600 dark:text-blue-400"
                                        data-testid="anime-views"
                                    >
                                        <EyeIcon class="w-3 h-3 mr-1" />
                                        <span>{{ formatNumber(anime.views) }}</span>
                                    </div>
                                    <div class="flex items-center text-red-500 dark:text-red-400">
                                        <HeartIcon class="w-3 h-3 mr-1" />
                                        <span>{{ formatNumber(anime.likes) }}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile/Tablet Cards -->
            <div class="lg:hidden" data-testid="anime-cards">
                <div
                    v-for="anime in paginatedAnimes"
                    :key="anime.id"
                    class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 rounded-lg"
                    @click="navigateToDetail(anime.id)"
                    @keydown.enter="navigateToDetail(anime.id)"
                    @keydown.space.prevent="navigateToDetail(anime.id)"
                    data-testid="anime-card"
                    tabindex="0"
                    :aria-label="`View details for ${anime.title}`"
                    role="button"
                >
                    <div class="flex space-x-3">
                        <img
                            :src="anime.coverImage"
                            :alt="anime.title"
                            class="w-16 h-20 sm:w-20 sm:h-28 object-cover rounded flex-shrink-0"
                            loading="lazy"
                        />
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h3
                                        class="text-sm sm:text-base font-medium text-gray-900 dark:text-white"
                                        :title="anime.releaseFileName || anime.title"
                                    >
                                        {{ formatReleaseFileName(anime.releaseFileName || anime.title) }}
                                    </h3>
                                    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {{ anime.studio ?? "Unknown" }} • {{ anime.year ?? "N/A" }}
                                    </p>
                                </div>
                                <span
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0"
                                    :class="getCategoryColor(animeStore.getLegacyCategoryFromId(anime.category))"
                                >
                                    {{ animeStore.getLegacyCategoryFromId(anime.category) }}
                                </span>
                            </div>

                            <div
                                class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                            >
                                <div>
                                    <span>{{ formatDate(anime.created_at || anime.date) }}</span>
                                    <span class="text-xs text-gray-400 ml-1">{{
                                        formatTime(anime.created_at || anime.date)
                                    }}</span>
                                </div>
                            </div>

                            <div class="mt-2 flex items-center space-x-4 text-xs">
                                <div class="flex items-center text-blue-600 dark:text-blue-400">
                                    <EyeIcon class="w-3 h-3 mr-1" />
                                    <span>{{ formatNumber(anime.views) }} Views</span>
                                </div>
                                <div class="flex items-center text-green-600 dark:text-green-400">
                                    <ArrowDownIcon class="w-3 h-3 mr-1" />
                                    <span>{{ formatNumber(anime.downloads) }} Downloads</span>
                                </div>
                                <div class="flex items-center text-red-500 dark:text-red-400">
                                    <HeartIcon class="w-3 h-3 mr-1" />
                                    <span>{{ anime.likes ?? 0 }} Likes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="paginatedAnimes.length === 0" class="text-center py-12" data-testid="empty-state">
                <FilmIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No anime found</h3>
                <p class="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAnimeStore } from "~/stores/anime";
import { useRouter } from "vue-router";
import {
    ChevronUpIcon,
    ChevronDownIcon,
    EyeIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
    FilmIcon,
    HeartIcon
} from "@heroicons/vue/24/outline";

const animeStore = useAnimeStore();
const router = useRouter();

// Reactive state
const sortBy = ref(animeStore.filter.sortBy);
const sortOrder = ref(animeStore.filter.sortOrder);
const isDropdownOpen = ref(false);

// Computed
const paginatedAnimes = computed(() => animeStore.paginatedAnimes);

// Watch untuk memastikan nilai sortBy dan sortOrder selalu disinkronkan dengan store
watch(
    () => animeStore.filter.sortBy,
    newSortBy => {
        if (sortBy.value !== newSortBy) {
            console.log("Updating sortBy from store:", newSortBy);
            sortBy.value = newSortBy;
        }
    }
);

watch(
    () => animeStore.filter.sortOrder,
    newSortOrder => {
        if (sortOrder.value !== newSortOrder) {
            console.log("Updating sortOrder from store:", newSortOrder);
            sortOrder.value = newSortOrder;
        }
    }
);

// Methods
const updateSort = (field?: string) => {
    // Jika field diberikan dan berbeda dari sortBy saat ini, atur sortBy dan reset sortOrder
    if (field) {
        // Jika field sama dengan sortBy saat ini, toggle sortOrder
        if (sortBy.value === field) {
            sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
        } else {
            // Jika field berbeda, atur sortBy baru dan reset sortOrder ke asc
            sortBy.value = field as "date" | "title" | "rating" | "downloads";
            sortOrder.value = "asc";
        }
    }

    // Selalu perbarui kedua nilai ke store
    animeStore.updateFilter({ sortBy: sortBy.value, sortOrder: sortOrder.value });

    // Reset dropdown state
    isDropdownOpen.value = false;
};

const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";

    // Pastikan untuk memperbarui kedua nilai sortBy dan sortOrder
    animeStore.updateFilter({ sortBy: sortBy.value, sortOrder: sortOrder.value });
};

const navigateToDetail = (id: string) => {
    router.push(`/anime/${id}`);
};

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        // Main categories with gradients and modern colors
        Anime: "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg border border-pink-200",
        Audio: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg border border-purple-200",
        Literature: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg border border-emerald-200",
        "Live Action": "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border border-blue-200",
        Pictures: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg border border-orange-200",
        Software: "bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-lg border border-gray-200",

        // Legacy categories for backward compatibility
        Action: "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg border border-red-200",
        Adventure: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border border-green-200",
        Comedy: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border border-yellow-200",
        Drama: "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg border border-purple-200",
        Fantasy: "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg border border-pink-200",
        Romance: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg border border-rose-200",
        "Sci-Fi": "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg border border-blue-200",
        "Slice of Life": "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg border border-indigo-200",
        Thriller: "bg-gradient-to-r from-gray-500 to-zinc-500 text-white shadow-lg border border-gray-200"
    };
    return colors[category] ?? "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg border border-gray-200";
};

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

const formatNumber = (num: number | null | undefined) => {
    if (num === undefined || num === null) {
        return "0";
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
};

const formatReleaseFileName = (fileName: string) => {
    if (!fileName) return "";

    let formatted = fileName
        .replace(/\.(mkv|mp4|avi|mov|wmv|flv|webm)$/i, "") // Hapus ekstensi video
        .replace(/_/g, " ") // Ganti underscore dengan spasi
        .replace(/\s+/g, " ") // Ganti multiple spasi dengan single spasi
        .trim();

    // Jika nama file terlalu panjang (lebih dari 60 karakter), potong dengan elegan
    if (formatted.length > 60) {
        // Coba ambil bagian utama tanpa menghilangkan info penting
        const match = formatted.match(/^(\[.*?\])?\s*([^\(\[]+)/);
        if (match) {
            const group = match[1] || "";
            const title = match[2].trim();
            formatted = `${group} ${title}`.trim();
        }
        
        // Jika masih terlalu panjang, potong dengan "..."
        if (formatted.length > 60) {
            formatted = formatted.substring(0, 57) + "...";
        }
    }

    return formatted || fileName;
};
</script>

<style scoped>
</style>
