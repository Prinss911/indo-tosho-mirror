<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader :hideSearchAndFilter="true" />

        <!-- Main Content -->
        <div class="container-extra-wide py-8">
            <!-- Search and Filter Section -->
            <div
                class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
            >
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- Search Input -->
                    <div class="flex-1">
                        <div class="relative">
                            <MagnifyingGlassIcon
                                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari anime berdasarkan judul..."
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                @input="handleSearch"
                            />
                        </div>
                    </div>

                    <!-- Category Filter -->
                    <div class="lg:w-64">
                        <select
                            v-model="selectedCategory"
                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @change="handleCategoryChange"
                        >
                            <option value="all">Semua Kategori</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Sort Options -->
                    <div class="lg:w-48">
                        <select
                            v-model="sortBy"
                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @change="handleSortChange"
                        >
                            <option value="date">Terbaru</option>
                            <option value="title">Judul A-Z</option>
                            <option value="rating">Rating Tertinggi</option>
                            <option value="downloads">Paling Banyak Diunduh</option>
                        </select>
                    </div>
                </div>

                <!-- Results Info -->
                <div class="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span> Menampilkan {{ filteredAnimes.length }} Judul Anime </span>
                    <span v-if="searchQuery"> Hasil pencarian untuk: "{{ searchQuery }}" </span>
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
                    @click="loadAnimes"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Coba Lagi
                </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredAnimes.length === 0" class="text-center py-12">
                <FilmIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {{ searchQuery ? "Tidak Ada Hasil" : "Belum Ada Anime" }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    {{
                        searchQuery
                            ? "Coba ubah kata kunci pencarian Anda"
                            : "Belum ada anime yang ditambahkan ke database"
                    }}
                </p>
            </div>

            <!-- Anime Grid -->
            <div
                v-else
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3"
            >
                <div
                    v-for="anime in paginatedAnimes"
                    :key="anime.id"
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer"
                    @click="showAnimeDetails(anime.title)"
                >
                    <!-- Cover Image -->
                    <div class="relative aspect-[3/4] overflow-hidden">
                        <img
                            :src="anime.coverImage || '/placeholder-anime.svg'"
                            :alt="anime.title"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            @error="handleImageError"
                        />

                        <!-- Rating Badge -->
                        <div v-if="anime.rating" class="absolute top-1 right-1">
                            <div
                                class="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium"
                            >
                                <StarIcon class="w-2.5 h-2.5 text-yellow-400 fill-current" />
                                {{ anime.rating.toFixed(1) }}
                            </div>
                        </div>

                        <!-- Hover Overlay -->
                        <div
                            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
                        >
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded px-2 py-1">
                                    <span class="text-xs font-medium text-gray-900 dark:text-white">Lihat Post</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-2">
                        <!-- Title -->
                        <h3
                            class="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        >
                            {{ anime.title }}
                        </h3>

                        <!-- Meta Info -->
                        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>{{ anime.year }}</span>
                            <span v-if="anime.episodes">{{ anime.episodes }} Ep</span>
                        </div>

                        <!-- Post Count -->
                        <div class="text-center">
                            <div class="bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
                                <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {{ getPostCount(anime.title) }} Post{{ getPostCount(anime.title) > 1 ? "s" : "" }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-8">
                <AppPagination
                    :current-page="currentPage"
                    :total-pages="totalPages"
                    :total-items="filteredAnimes.length"
                    :items-per-page="itemsPerPage"
                    @page-changed="handlePageChange"
                />
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAnimeStore } from "~/stores/anime";
import { sanitizeSearchQuery } from "~/utils/input-sanitizer";
import {
    MagnifyingGlassIcon,
    FilmIcon,
    ExclamationTriangleIcon,
    StarIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    HeartIcon
} from "@heroicons/vue/24/outline";
import AppPagination from "~/components/AppPagination.vue";

// Meta
definePageMeta({
    title: "Browse Anime"
});

// Composables
const router = useRouter();
const animeStore = useAnimeStore();

// Reactive state
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");
const selectedCategory = ref("all");
const sortBy = ref("date");
const currentPage = ref(1);
const itemsPerPage = ref(20);

// Modal state
const showModal = ref(false);
const selectedAnimeTitle = ref("");
const relatedPosts = ref<any[]>([]);
const loadingPosts = ref(false);

// Computed properties
const categories = computed(() => animeStore.categories.filter(cat => cat.id !== "all"));
const totalAnimes = computed(() => filteredAnimes.value.length);

const filteredAnimes = computed(() => {
    let animes = animeStore.animes.filter(anime => anime.statusApproval === "published");

    // Remove duplicates by title (keep the latest one)
    const uniqueAnimes = new Map();
    animes.forEach(anime => {
        const existingAnime = uniqueAnimes.get(anime.title);
        if (!existingAnime || new Date(anime.date) > new Date(existingAnime.date)) {
            uniqueAnimes.set(anime.title, anime);
        }
    });
    animes = Array.from(uniqueAnimes.values());

    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        animes = animes.filter(
            anime =>
                anime.title.toLowerCase().includes(query) ||
                (anime.titleEnglish && anime.titleEnglish.toLowerCase().includes(query))
        );
    }

    // Apply category filter
    if (selectedCategory.value !== "all") {
        animes = animes.filter(anime => anime.category === selectedCategory.value);
    }

    // Apply sorting
    animes.sort((a, b) => {
        switch (sortBy.value) {
            case "title":
                return a.title.localeCompare(b.title);
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "downloads":
                return (b.downloads || 0) - (a.downloads || 0);
            case "date":
            default:
                return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });

    return animes;
});

const totalPages = computed(() => Math.ceil(filteredAnimes.value.length / itemsPerPage.value));

const paginatedAnimes = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredAnimes.value.slice(start, end);
});

// Methods
const loadAnimes = async () => {
    loading.value = true;
    error.value = null;

    try {
        await animeStore.fetchAnimes();
        await animeStore.fetchCategories();
    } catch (err) {
        error.value = "Gagal memuat data anime. Silakan coba lagi.";
        console.error("Error loading animes:", err);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    searchQuery.value = sanitizeSearchQuery(searchQuery.value);
    currentPage.value = 1;
};

const handleCategoryChange = () => {
    currentPage.value = 1;
};

const handleSortChange = () => {
    currentPage.value = 1;
};

const handlePageChange = (page: number) => {
    currentPage.value = page;
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const navigateToAnime = (id: string) => {
    router.push(`/anime/${id}`);
};

const showAnimeDetails = async (title: string) => {
    selectedAnimeTitle.value = title;
    showModal.value = true;
    loadingPosts.value = true;
    relatedPosts.value = [];

    try {
        // Cari semua post dengan judul yang sama (case insensitive)
        const posts = animeStore.animes.filter(
            anime => anime.title.toLowerCase() === title.toLowerCase() && anime.statusApproval === "published"
        );

        relatedPosts.value = posts;
    } catch (err) {
        console.error("Error loading related posts:", err);
    } finally {
        loadingPosts.value = false;
    }
};

const closeModal = () => {
    showModal.value = false;
    selectedAnimeTitle.value = "";
    relatedPosts.value = [];
};

const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.src = "/placeholder-anime.svg";
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case "Finished Airing":
        case "completed":
            return "bg-green-500/80 text-white";
        case "Currently Airing":
        case "ongoing":
            return "bg-blue-500/80 text-white";
        case "Not yet aired":
        case "upcoming":
            return "bg-yellow-500/80 text-white";
        default:
            return "bg-gray-500/80 text-white";
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case "Finished Airing":
        case "completed":
            return "Selesai";
        case "Currently Airing":
        case "ongoing":
            return "Ongoing";
        case "Not yet aired":
        case "upcoming":
            return "Akan Tayang";
        default:
            return status;
    }
};

const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
};

const getPostCount = (title: string) => {
    return animeStore.animes.filter(
        anime => anime.title.toLowerCase() === title.toLowerCase() && anime.statusApproval === "published"
    ).length;
};

// Watchers
watch([searchQuery, selectedCategory, sortBy], () => {
    currentPage.value = 1;
});

// Event listener untuk menutup modal dengan tombol Escape
const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && showModal.value) {
        closeModal();
    }
};

// Lifecycle
onMounted(() => {
    loadAnimes();
    document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
});

// SEO
useHead({
    title: "Browse Anime - Anime Database",
    meta: [
        {
            name: "description",
            content:
                "Jelajahi koleksi anime lengkap di database kami. Temukan anime favorit Anda dengan mudah menggunakan fitur pencarian dan filter yang tersedia."
        },
        {
            property: "og:title",
            content: "Browse Anime - Anime Database"
        },
        {
            property: "og:description",
            content: "Jelajahi koleksi anime lengkap di database kami. Temukan anime favorit Anda dengan mudah."
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
