<template>
    <ClientOnly>
        <div class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <!-- Header -->
            <div class="bg-white dark:bg-gray-800 shadow">
                <div class="container-extra-wide">
                    <div class="py-4">
                        <BackButton to="/posts" label="Kembali ke Postingan" />
                    </div>
                    <div class="flex justify-between items-center pb-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Buat Postingan Anime Baru</h1>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Tambahkan anime favorit Anda ke database
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notification Banner -->
            <NotificationBanner
                v-if="currentNotification"
                :notification="currentNotification"
                :dismissible="false"
                class="mx-4 sm:mx-6 lg:mx-8 mt-4"
            />

            <!-- Main Content -->
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Search Anime from Jikan API -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div class="px-4 py-5 sm:p-6">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Cari Anime dari MyAnimeList
                        </h3>

                        <!-- Search Tabs -->
                        <div class="flex space-x-2 mb-4">
                            <button
                                @click="switchTab('search')"
                                :class="[
                                    'flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm',
                                    searchMode === 'search'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                ]"
                            >
                                <MagnifyingGlassIcon v-if="searchMode === 'search'" class="h-4 w-4 inline-block mr-2" />
                                Cari Judul
                            </button>
                            <button
                                @click="switchTab('season')"
                                :class="[
                                    'flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm',
                                    searchMode === 'season'
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                ]"
                            >
                                <CalendarIcon v-if="searchMode === 'season'" class="h-4 w-4 inline-block mr-2" />
                                Musim Ini
                            </button>
                        </div>

                        <!-- Search Input (only show for search mode) -->
                        <div v-if="searchMode === 'search'" class="mb-4">
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    v-model="searchQuery"
                                    @keyup.enter="searchAnime"
                                    type="text"
                                    placeholder="Cari anime berdasarkan judul..."
                                    class="w-full pl-10 pr-16 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <div class="absolute inset-y-0 right-0 flex items-center">
                                    <button
                                        @click="searchAnime"
                                        :disabled="isSearching || !searchQuery.trim()"
                                        class="h-full px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        <MagnifyingGlassIcon v-if="!isSearching" class="w-4 h-4 mr-2" />
                                        <div
                                            v-else
                                            class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                        ></div>
                                        {{ isSearching ? "Mencari..." : "Cari" }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Season Button (only show for season mode) -->
                        <div v-if="searchMode === 'season' && !isSearching && !hasSearched" class="mb-4">
                            <button
                                @click="getCurrentSeasonAnime"
                                :disabled="isSearching"
                                class="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <CalendarIcon v-if="!isSearching" class="w-5 h-5 mr-2" />
                                <div
                                    v-else
                                    class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                ></div>
                                {{ isSearching ? "Memuat..." : "Muat Anime Musim Ini" }}
                            </button>
                        </div>

                        <!-- Loading indicator for other modes -->
                        <div
                            v-else-if="isSearching"
                            class="flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
                        >
                            <div class="w-16 h-16 mb-4">
                                <svg
                                    class="animate-spin w-full h-full text-blue-600 dark:text-blue-400"
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
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                                {{ searchMode === "season" ? "Mengambil anime musim ini..." : "Mencari anime..." }}
                            </h3>
                            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Mohon tunggu sebentar</p>
                            <div class="mt-4 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    class="bg-blue-600 dark:bg-blue-400 h-2 rounded-full animate-pulse"
                                    style="width: 60%"
                                ></div>
                            </div>
                        </div>

                        <!-- Search Results -->
                        <div
                            v-if="searchResults.length > 0 && !isSearching"
                            class="space-y-4 transition-all duration-300 ease-in-out"
                        >
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                                <span class="font-medium">{{ searchResults.length }} anime ditemukan</span>
                                <span v-if="searchMode === 'season'" class="ml-2">(dari 3 halaman pertama)</span>
                            </div>
                            <div
                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto p-2"
                            >
                                <div
                                    v-for="anime in searchResults"
                                    :key="anime.mal_id"
                                    @click="selectAnime(anime)"
                                    class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-1"
                                    :class="{
                                        'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md':
                                            selectedAnime?.mal_id === anime.mal_id
                                    }"
                                >
                                    <div class="relative">
                                        <img
                                            :src="anime.images.jpg.image_url || anime.images.jpg.small_image_url"
                                            :alt="anime.title"
                                            class="w-full h-40 object-cover"
                                            loading="lazy"
                                        />
                                        <div class="absolute top-0 right-0 m-2">
                                            <span
                                                :class="[
                                                    'text-xs px-2 py-1 rounded-full font-medium shadow-sm',
                                                    anime.status === 'Currently Airing'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : anime.status === 'Not yet aired'
                                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                ]"
                                            >
                                                {{ anime.status }}
                                            </span>
                                        </div>
                                        <div
                                            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2"
                                        >
                                            <div class="flex items-center text-white">
                                                <StarIcon class="h-4 w-4 text-yellow-400 mr-1" />
                                                <span class="text-sm font-medium">
                                                    {{ anime.score || "N/A" }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-4">
                                        <h5 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                                            {{ anime.title }}
                                        </h5>
                                        <div class="flex justify-between items-center mb-2">
                                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                                <span class="font-medium">{{ anime.episodes || "?" }}</span> episode •
                                                <span class="font-medium">{{
                                                    anime.year ||
                                                    (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : "?")
                                                }}</span>
                                            </p>
                                            <p
                                                v-if="anime.type"
                                                class="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                                            >
                                                {{ anime.type }}
                                            </p>
                                        </div>
                                        <div class="flex flex-wrap gap-1 mt-2">
                                            <span
                                                v-for="genre in anime.genres?.slice(0, 3) || []"
                                                :key="genre.mal_id"
                                                class="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                            >
                                                {{ genre?.name || "Unknown" }}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        v-if="selectedAnime?.mal_id === anime.mal_id"
                                        class="bg-blue-50 dark:bg-blue-900/20 p-2 text-center text-xs text-blue-700 dark:text-blue-300 font-medium border-t border-blue-100 dark:border-blue-800"
                                    >
                                        ✓ Terpilih
                                    </div>
                                </div>
                            </div>

                            <!-- Tombol Muat Lebih Banyak untuk Musim Ini -->
                            <div
                                v-if="searchMode === 'season' && searchResults.length > 0 && !isSearching"
                                class="text-center mt-6"
                            >
                                <button
                                    @click="loadMoreSeasonAnime"
                                    :disabled="isLoadingMore"
                                    class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center mx-auto transform hover:scale-105"
                                >
                                    <div
                                        v-if="isLoadingMore"
                                        class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                    ></div>
                                    <span v-if="isLoadingMore">Memuat...</span>
                                    <span v-else>Muat Lebih Banyak Anime</span>
                                </button>
                                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Menampilkan {{ searchResults.length }} anime dari musim ini
                                </p>
                            </div>
                        </div>

                        <!-- No Results -->
                        <div
                            v-else-if="hasSearched && !isSearching"
                            class="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            <ExclamationTriangleIcon class="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Tidak ada hasil ditemukan</h3>
                            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Coba gunakan kata kunci yang berbeda atau lebih umum. Pastikan ejaan sudah benar.
                            </p>
                            <div class="mt-6 flex justify-center space-x-4">
                                <button
                                    @click="
                                        searchQuery = '';
                                        hasSearched = false;
                                    "
                                    class="px-4 py-2 text-sm font-medium text-blue-600 bg-white dark:bg-gray-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Coba pencarian baru
                                </button>
                                <button
                                    v-if="searchMode === 'search'"
                                    @click="switchTab('season')"
                                    class="px-4 py-2 text-sm font-medium text-purple-600 bg-white dark:bg-gray-700 dark:text-purple-400 border border-purple-300 dark:border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <CalendarIcon class="inline-block h-4 w-4 mr-1" />
                                    Lihat musim ini
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Post Form -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Detail Postingan</h3>

                        <div class="space-y-6">
                            <!-- Read-only Info from API (Collapsible) -->
                            <div
                                class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
                            >
                                <div
                                    class="flex items-center justify-between cursor-pointer"
                                    @click="toggleReadOnlyForm"
                                >
                                    <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200">
                                        🔒 Data Otomatis dari MyAnimeList API (Read-only)
                                    </h4>
                                    <button type="button" class="text-blue-600 dark:text-blue-400 focus:outline-none">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-5 w-5 transition-transform"
                                            :class="{ 'rotate-180': !isReadOnlyFormCollapsed }"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div v-show="!isReadOnlyFormCollapsed" class="mt-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Judul Anime (Otomatis dari API)
                                            </label>
                                            <input
                                                v-model="postForm.title"
                                                type="text"
                                                readonly
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                                placeholder="Pilih anime dari pencarian di atas"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Judul Bahasa Inggris (Otomatis dari API)
                                            </label>
                                            <input
                                                v-model="postForm.titleEnglish"
                                                type="text"
                                                readonly
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                                placeholder="Diisi otomatis dari API"
                                            />
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Jumlah Episode (Otomatis dari API)
                                            </label>
                                            <input
                                                v-model.number="postForm.episodes"
                                                type="number"
                                                readonly
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Tahun Rilis (Otomatis dari API)
                                            </label>
                                            <input
                                                v-model.number="postForm.year"
                                                type="number"
                                                readonly
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Rating (Otomatis dari API)
                                            </label>
                                            <input
                                                v-model.number="postForm.rating"
                                                type="number"
                                                readonly
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div class="mt-4">
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status Anime (Otomatis dari API)
                                        </label>
                                        <select
                                            v-model="postForm.status"
                                            disabled
                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                        >
                                            <option value="Finished Airing">Finished Airing</option>
                                            <option value="Currently Airing">Currently Airing</option>
                                            <option value="Not yet aired">Not yet aired</option>
                                        </select>
                                    </div>

                                    <!-- Additional Read-only Fields (now part of the same collapsible section) -->
                                    <div class="mt-6">
                                        <h5 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-4">
                                            📋 Informasi Tambahan (Read-only)
                                        </h5>
                                        <div class="space-y-4">
                                            <div>
                                                <label
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                                >
                                                    URL Cover Image (Otomatis dari API)
                                                </label>
                                                <input
                                                    v-model="postForm.cover"
                                                    type="url"
                                                    readonly
                                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                                    placeholder="Cover image diambil otomatis dari MyAnimeList"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                                >
                                                    Sinopsis (Otomatis dari API)
                                                </label>
                                                <textarea
                                                    v-model="postForm.description"
                                                    rows="4"
                                                    readonly
                                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                                    placeholder="Sinopsis diambil otomatis dari MyAnimeList"
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                                >
                                                    Genre (Otomatis dari API)
                                                </label>
                                                <div class="flex flex-wrap gap-2">
                                                    <span
                                                        v-for="genre in postForm.genres"
                                                        :key="genre"
                                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                    >
                                                        {{ genre }}
                                                    </span>
                                                    <span
                                                        v-if="postForm.genres.length === 0"
                                                        class="text-sm text-gray-500 dark:text-gray-400"
                                                    >
                                                        Genre akan muncul setelah memilih anime dari pencarian
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Manual Input Fields -->
                            <div
                                class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
                            >
                                <h4 class="text-sm font-medium text-green-900 dark:text-green-200 mb-4">
                                    📝 Field yang Dapat Diisi Manual
                                </h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nama File Rilisan *
                                        </label>
                                        <input
                                            v-model="postForm.releaseFileName"
                                            type="text"
                                            required
                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Contoh: [SubsPlease] Attack on Titan - 01 [1080p].mkv"
                                        />
                                    </div>

                                    <div class="col-span-2">
                                        <div class="flex items-center justify-between mb-2">
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Link Download *
                                            </label>
                                            <button
                                                type="button"
                                                @click="addDownloadLink"
                                                class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            >
                                                <PlusIcon class="w-4 h-4 mr-1" />
                                                Tambah Link
                                            </button>
                                        </div>
                                        <div class="space-y-3">
                                            <div
                                                v-for="(download, index) in postForm.downloadLinks"
                                                :key="index"
                                                class="flex space-x-3 items-end"
                                            >
                                                <div class="flex-1">
                                                    <input
                                                        v-model="download.hosting"
                                                        type="text"
                                                        :required="index === 0"
                                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="Nama hosting"
                                                    />
                                                </div>
                                                <div class="flex-[2]">
                                                    <input
                                                        v-model="download.url"
                                                        type="url"
                                                        :required="index === 0"
                                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="https://example.com/download"
                                                    />
                                                </div>
                                                <button
                                                    v-if="postForm.downloadLinks.length > 1"
                                                    type="button"
                                                    @click="removeDownloadLink(index)"
                                                    class="inline-flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                >
                                                    <XMarkIcon class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Subtitle *
                                        </label>
                                        <select
                                            v-model="postForm.subtitleType"
                                            required
                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Pilih jenis subtitle</option>
                                            <option value="Softsubs">Softsubs</option>
                                            <option value="Hardsubs">Hardsubs</option>
                                            <option value="Raw">Raw</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kategori *
                                        </label>
                                        <select
                                            v-model="postForm.category"
                                            required
                                            :disabled="categoriesLoading"
                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {{ categoriesLoading ? "Memuat kategori..." : "Pilih kategori" }}
                                            </option>
                                            <!-- Tampilkan semua kategori jika categoryGroups kosong atau sebagai fallback -->
                                            <template v-if="Object.keys(animeStore.categoryGroups).length === 0">
                                                <option
                                                    v-for="category in animeStore.categories.filter(
                                                        cat => cat.id !== 'all'
                                                    )"
                                                    :key="category.id"
                                                    :value="category.id"
                                                >
                                                    {{ category.parent_id ? "　" : "" }}{{ category.name }}
                                                </option>
                                            </template>
                                            <!-- Tampilkan dengan struktur hierarki jika categoryGroups ada -->
                                            <template v-else>
                                                <optgroup
                                                    v-for="(subcategories, parent) in animeStore.categoryGroups"
                                                    :key="parent"
                                                    :label="parent"
                                                >
                                                    <!-- Subkategori -->
                                                    <option
                                                        v-for="subcategory in subcategories"
                                                        :key="subcategory"
                                                        :value="getCategoryId(parent, subcategory)"
                                                    >
                                                        {{ subcategory }}
                                                    </option>
                                                </optgroup>
                                            </template>
                                        </select>
                                    </div>
                                </div>

                                <!-- Deskripsi Postingan dengan Preview -->
                                <div class="col-span-2 mt-6">
                                    <div class="flex items-center justify-between mb-2">
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Deskripsi Postingan
                                        </label>
                                        <div class="flex space-x-2">
                                            <button
                                                type="button"
                                                @click="descriptionMode = 'write'"
                                                :class="[
                                                    'px-3 py-1 text-xs font-medium rounded transition-colors',
                                                    descriptionMode === 'write'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                ]"
                                            >
                                                ✏️ Tulis
                                            </button>
                                            <button
                                                type="button"
                                                @click="descriptionMode = 'preview'"
                                                :class="[
                                                    'px-3 py-1 text-xs font-medium rounded transition-colors',
                                                    descriptionMode === 'preview'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                ]"
                                            >
                                                👁️ Preview
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Mode Tulis -->
                                    <div v-if="descriptionMode === 'write'" class="space-y-3">
                                        <textarea
                                            ref="descriptionTextarea"
                                            v-model="postForm.postDescription"
                                            rows="8"
                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                                            placeholder="Tulis deskripsi postingan Anda di sini...&#10;&#10;Anda dapat menggunakan format berikut:&#10;**Bold text**&#10;*Italic text*&#10;[Link](https://example.com)&#10;- List item&#10;1. Numbered list&#10;&#10;> Quote&#10;&#10;```&#10;Code block&#10;```"
                                        ></textarea>

                                        <!-- Format Helper Buttons -->
                                        <div
                                            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                                        >
                                            <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                💡 Format Cepat:
                                            </h5>
                                            <div class="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    @click="insertFormat('**', '**', 'teks tebal')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Bold Text"
                                                >
                                                    <span class="font-bold">B</span>
                                                    <span class="text-gray-500">Bold</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('*', '*', 'teks miring')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Italic Text"
                                                >
                                                    <span class="italic">I</span>
                                                    <span class="text-gray-500">Italic</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('[', '](https://)', 'teks link')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Link"
                                                >
                                                    <span>🔗</span>
                                                    <span class="text-gray-500">Link</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('- ', '', 'item list')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Bullet List"
                                                >
                                                    <span>•</span>
                                                    <span class="text-gray-500">List</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('1. ', '', 'item bernomor')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Numbered List"
                                                >
                                                    <span>1.</span>
                                                    <span class="text-gray-500">Nomor</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('> ', '', 'kutipan')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Quote"
                                                >
                                                    <span>❝</span>
                                                    <span class="text-gray-500">Quote</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('`', '`', 'kode')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Inline Code"
                                                >
                                                    <span class="font-mono">&lt;/&gt;</span>
                                                    <span class="text-gray-500">Code</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('```\n', '\n```', 'blok kode')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Code Block"
                                                >
                                                    <span class="font-mono">{ }</span>
                                                    <span class="text-gray-500">Block</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    @click="insertFormat('\n---\n', '', '')"
                                                    class="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                                    title="Horizontal Rule"
                                                >
                                                    <span>―</span>
                                                    <span class="text-gray-500">Garis</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Mode Preview -->
                                    <div v-else class="space-y-3">
                                        <div
                                            class="min-h-[200px] max-h-[400px] overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-700"
                                        >
                                            <div
                                                v-if="postForm.postDescription.trim()"
                                                class="prose prose-sm dark:prose-invert max-w-none"
                                                v-html="formatDescription(postForm.postDescription)"
                                            ></div>
                                            <div v-else class="text-gray-500 dark:text-gray-400 italic text-sm">
                                                Preview akan muncul di sini setelah Anda menulis deskripsi...
                                            </div>
                                        </div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            💡 Klik tab "Tulis" untuk mengedit deskripsi
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Additional Read-only Fields section removed as it's now part of the collapsible form above -->

                            <!-- MAL Info (if selected from search) -->
                            <div
                                v-if="selectedAnime"
                                class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                            >
                                <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                                    Data dari MyAnimeList
                                </h4>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span class="text-blue-700 dark:text-blue-300 font-medium">MAL ID:</span>
                                        <span class="text-blue-900 dark:text-blue-100 ml-1">{{
                                            selectedAnime.mal_id
                                        }}</span>
                                    </div>
                                    <div>
                                        <span class="text-blue-700 dark:text-blue-300 font-medium">Rank:</span>
                                        <span class="text-blue-900 dark:text-blue-100 ml-1">{{
                                            selectedAnime.rank || "N/A"
                                        }}</span>
                                    </div>
                                    <div>
                                        <span class="text-blue-700 dark:text-blue-300 font-medium">Popularity:</span>
                                        <span class="text-blue-900 dark:text-blue-100 ml-1">{{
                                            selectedAnime.popularity || "N/A"
                                        }}</span>
                                    </div>
                                    <div>
                                        <span class="text-blue-700 dark:text-blue-300 font-medium">Members:</span>
                                        <span class="text-blue-900 dark:text-blue-100 ml-1">{{
                                            selectedAnime.members?.toLocaleString() || "N/A"
                                        }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div class="flex justify-end space-x-4">
                                <NuxtLink
                                    to="/posts"
                                    class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </NuxtLink>
                                <button
                                    type="button"
                                    @click="showConfirmModal = true"
                                    :disabled="isSubmitting"
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <div
                                        v-if="isSubmitting"
                                        class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                    ></div>
                                    {{ isSubmitting ? "Menyimpan..." : "Buat Postingan" }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Confirmation Modal -->
            <div
                v-if="showConfirmModal"
                class="fixed inset-0 z-50 overflow-y-auto"
                aria-labelledby="modal-title"
                role="dialog"
                aria-modal="true"
            >
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <!-- Background overlay -->
                    <div
                        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        aria-hidden="true"
                        @click="showConfirmModal = false"
                    ></div>

                    <!-- Modal panel -->
                    <div
                        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    >
                        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div
                                    class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10"
                                >
                                    <svg
                                        class="h-6 w-6 text-blue-600 dark:text-blue-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3
                                        class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                                        id="modal-title"
                                    >
                                        Konfirmasi Publikasi Postingan
                                    </h3>
                                    <div class="mt-2">
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            Apakah Anda yakin ingin mempublikasikan postingan anime "{{
                                                postForm.title
                                            }}"? Postingan akan langsung tersedia untuk umum.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                @click="confirmSubmit"
                                :disabled="isSubmitting"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div
                                    v-if="isSubmitting"
                                    class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                ></div>
                                {{ isSubmitting ? "Menyimpan..." : "Ya, Publikasikan" }}
                            </button>
                            <button
                                type="button"
                                @click="showConfirmModal = false"
                                :disabled="isSubmitting"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useAnimeStore } from "~/stores/anime";
import { jikanApi, type JikanAnime } from "~/services/jikanApi";
import { useApi } from "~/composables/useApi";
import { useToast } from "vue-toastification";
import { sanitizeInput, sanitizeUrl, sanitizeTextarea } from "~/utils/sanitization";
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    StarIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    PlusIcon
} from "@heroicons/vue/24/outline";

// Meta
definePageMeta({
    middleware: "auth",
    title: "Buat Postingan Baru"
});

// Composables
const router = useRouter();
const authStore = useAuthStore();
const animeStore = useAnimeStore();
const toast = useToast();

// State
const searchQuery = ref("");
const searchResults = ref<JikanAnime[]>([]);
const selectedAnime = ref<JikanAnime | null>(null);
const isSearching = ref(false);
const hasSearched = ref(false);
const isSubmitting = ref(false);
const newGenre = ref("");
const searchMode = ref<"search" | "season">("search");
const isLoadingMore = ref(false);
const currentSeasonPage = ref(1);
const isReadOnlyFormCollapsed = ref(true); // Default diciutkan
const showConfirmModal = ref(false);
const isSelectingAnime = ref(false); // Flag untuk mencegah reset saat memilih anime

// Tab-specific search results storage
const tabSearchResults = ref<{
    search: JikanAnime[];
    season: JikanAnime[];
}>({
    search: [],
    season: []
});

const tabHasSearched = ref<{
    search: boolean;
    season: boolean;
}>({
    search: false,
    season: false
});

// Notification state
const currentNotification = ref(null);

// Form data
const postForm = reactive({
    title: "",
    titleEnglish: "",
    episodes: 12,
    year: new Date().getFullYear(),
    rating: 8.0,
    category: "",
    status: "Finished Airing",
    cover: "",
    description: "",
    genres: [] as string[],
    malId: null as number | null,
    releaseFileName: "",
    downloadLinks: [{ hosting: "", url: "" }] as { hosting: string; url: string }[],
    subtitleType: "",
    postDescription: ""
});

// State untuk mode deskripsi
const descriptionMode = ref<"write" | "preview">("write");
const descriptionTextarea = ref<HTMLTextAreaElement | null>(null);

// State untuk loading kategori
const categoriesLoading = ref(true);

// Methods
// Fungsi untuk memasukkan format ke textarea dengan toggle
const insertFormat = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = descriptionTextarea.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let insertText = "";
    let newCursorStart = start;
    let newCursorEnd = start;

    if (selectedText) {
        // Cek apakah teks yang dipilih sudah memiliki format ini
        const beforeSelection = textarea.value.substring(Math.max(0, start - prefix.length), start);
        const afterSelection = textarea.value.substring(end, Math.min(textarea.value.length, end + suffix.length));

        // Jika format sudah ada, hapus format (toggle off)
        if (beforeSelection === prefix && afterSelection === suffix) {
            // Hapus prefix dan suffix
            const newValue =
                textarea.value.substring(0, start - prefix.length) +
                selectedText +
                textarea.value.substring(end + suffix.length);
            postForm.postDescription = newValue;

            // Posisi cursor setelah menghapus format
            newCursorStart = start - prefix.length;
            newCursorEnd = end - prefix.length;
        } else {
            // Tambahkan format (toggle on)
            insertText = prefix + selectedText + suffix;
            const newValue = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
            postForm.postDescription = newValue;

            // Posisi cursor setelah menambah format
            newCursorStart = start + prefix.length;
            newCursorEnd = end + prefix.length;
        }
    } else {
        // Jika tidak ada teks yang dipilih, masukkan placeholder
        insertText = prefix + placeholder + suffix;
        const newValue = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
        postForm.postDescription = newValue;

        // Pilih placeholder untuk memudahkan penggantian
        newCursorStart = start + prefix.length;
        newCursorEnd = start + prefix.length + placeholder.length;
    }

    // Set focus kembali ke textarea dan posisikan cursor
    nextTick(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorStart, newCursorEnd);
    });
};

const formatDescription = (text: string): string => {
    if (!text) return "";

    let formatted = text
        // Escape HTML
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

        // Bold **text**
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        // Italic *text*
        .replace(/\*(.*?)\*/g, "<em>$1</em>")

        // Links [text](url)
        .replace(
            /\[([^\]]+)\]\(([^\)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'
        )

        // Code blocks ```code```
        .replace(
            /```([\s\S]*?)```/g,
            '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto"><code>$1</code></pre>'
        )

        // Inline code `code`
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">$1</code>')

        // Horizontal rule ---
        .replace(/^---$/gm, '<hr class="border-gray-300 dark:border-gray-600 my-4">')

        // Line breaks
        .replace(/\n/g, "<br>");

    // Handle lists and quotes (more complex parsing)
    const lines = formatted.split("<br>");
    let result = [];
    let inList = false;
    let inOrderedList = false;
    let inQuote = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Unordered list
        if (line.startsWith("- ")) {
            if (!inList) {
                result.push('<ul class="list-disc list-inside space-y-1 my-2">');
                inList = true;
            }
            result.push(`<li class="ml-4">${line.substring(2)}</li>`);
        }
        // Ordered list
        else if (/^\d+\. /.test(line)) {
            if (!inOrderedList) {
                result.push('<ol class="list-decimal list-inside space-y-1 my-2">');
                inOrderedList = true;
            }
            result.push(`<li class="ml-4">${line.replace(/^\d+\. /, "")}</li>`);
        }
        // Quote
        else if (line.startsWith("> ")) {
            if (!inQuote) {
                result.push(
                    '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2">'
                );
                inQuote = true;
            }
            result.push(line.substring(2));
        }
        // Regular line
        else {
            // Close any open lists or quotes
            if (inList) {
                result.push("</ul>");
                inList = false;
            }
            if (inOrderedList) {
                result.push("</ol>");
                inOrderedList = false;
            }
            if (inQuote) {
                result.push("</blockquote>");
                inQuote = false;
            }

            if (line) {
                result.push(`<p class="mb-2">${line}</p>`);
            }
        }
    }

    // Close any remaining open tags
    if (inList) result.push("</ul>");
    if (inOrderedList) result.push("</ol>");
    if (inQuote) result.push("</blockquote>");

    return result.join("");
};

const getCategoryId = (parent: string, subcategory: string): string => {
    // Pastikan categories sudah dimuat
    if (!animeStore.categories || animeStore.categories.length === 0) {
        console.warn("Categories not loaded yet");
        return "";
    }

    // Cari kategori utama berdasarkan nama (gunakan parent_id untuk konsistensi)
    const parentCategory = animeStore.categories.find(
        cat => !cat.parent_id && cat.name.toLowerCase() === parent.toLowerCase()
    );

    if (!parentCategory) {
        console.warn(`Parent category not found: ${parent}`);
        return "";
    }

    // Cari subkategori berdasarkan nama dan parent_id
    const subCategory = animeStore.categories.find(
        cat => cat.parent_id === parentCategory.id && cat.name.toLowerCase() === subcategory.toLowerCase()
    );

    if (!subCategory) {
        console.warn(`Subcategory not found: ${subcategory} under ${parent}`);
        return "";
    }

    return subCategory.id;
};

const toggleReadOnlyForm = () => {
    isReadOnlyFormCollapsed.value = !isReadOnlyFormCollapsed.value;
};

// Lifecycle
onMounted(async () => {
    // Fetch categories to populate the category dropdown
    await animeStore.fetchCategories();
});

const switchTab = (newMode: "search" | "season") => {
    // Ganti ke tab baru
    searchMode.value = newMode;

    // Reset hasil pencarian dan status
    searchResults.value = [];
    hasSearched.value = false;
    searchQuery.value = "";

    // Reset storage untuk kedua tab
    tabSearchResults.value.search = [];
    tabSearchResults.value.season = [];
    tabHasSearched.value.search = false;
    tabHasSearched.value.season = false;

    // Jika tab season, otomatis cari anime musim ini
    if (newMode === "season") {
        getCurrentSeasonAnime();
    }
};

const searchAnime = async () => {
    if (!searchQuery.value.trim()) return;

    isSearching.value = true;
    hasSearched.value = true;

    try {
        const response = await jikanApi.searchAnime(searchQuery.value.trim());
        searchResults.value = response.data;
        // Simpan hasil ke storage tab
        tabSearchResults.value.search = [...response.data];
        tabHasSearched.value.search = true;
    } catch (error) {
        console.error("Error searching anime:", error);
        searchResults.value = [];
        tabSearchResults.value.search = [];
    } finally {
        isSearching.value = false;
    }
};

const getCurrentSeasonAnime = async (page = 1) => {
    isSearching.value = true;
    hasSearched.value = true;
    currentSeasonPage.value = 1;

    try {
        // Ambil beberapa halaman untuk mendapatkan lebih banyak data
        const promises = [];
        for (let i = 1; i <= 3; i++) {
            promises.push(jikanApi.getCurrentSeasonAnime(i));
        }

        const responses = await Promise.all(promises);
        const allAnime = responses.flatMap(response => response.data);

        // Hilangkan duplikasi berdasarkan mal_id
        const uniqueAnime = allAnime.filter(
            (anime, index, self) => index === self.findIndex(a => a.mal_id === anime.mal_id)
        );

        searchResults.value = uniqueAnime;
        currentSeasonPage.value = 3; // We loaded 3 pages

        // Simpan hasil ke storage tab
        tabSearchResults.value.season = [...uniqueAnime];
        tabHasSearched.value.season = true;
    } catch (error) {
        console.error("Error getting current season anime:", error);
        searchResults.value = [];
        tabSearchResults.value.season = [];
    } finally {
        isSearching.value = false;
    }
};

const loadMoreSeasonAnime = async () => {
    isLoadingMore.value = true;

    try {
        const nextPage = currentSeasonPage.value + 1;
        const response = await jikanApi.getCurrentSeasonAnime(nextPage);

        if (response.data.length > 0) {
            const combinedResults = [...searchResults.value, ...response.data];

            // Hilangkan duplikasi berdasarkan mal_id
            const uniqueResults = combinedResults.filter(
                (anime, index, self) => index === self.findIndex(a => a.mal_id === anime.mal_id)
            );

            searchResults.value = uniqueResults;
            currentSeasonPage.value = nextPage;

            // Simpan hasil yang diperbarui ke storage tab
            tabSearchResults.value.season = [...uniqueResults];
        }
    } catch (error) {
        console.error("Error loading more season anime:", error);
    } finally {
        isLoadingMore.value = false;
    }
};

const selectAnime = (anime: JikanAnime) => {
    isSelectingAnime.value = true; // Set flag untuk mencegah interferensi localStorage

    selectedAnime.value = anime;

    // Simpan kategori yang sudah dipilih user sebelum reset
    const currentCategory = postForm.category;
    const currentSubtitleType = postForm.subtitleType;
    const currentReleaseFileName = postForm.releaseFileName;
    const currentDownloadLinks = [...postForm.downloadLinks];
    const currentPostDescription = postForm.postDescription;

    // Auto-fill form with anime data (read-only fields)
    postForm.title = anime.title ?? "";
    postForm.titleEnglish = anime.title_english ?? "";
    postForm.episodes = anime.episodes ?? 12;
    postForm.year =
        anime.year ?? (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : new Date().getFullYear());
    postForm.rating = anime.score ?? 8.0;
    postForm.cover = anime.images?.jpg?.large_image_url ?? "";
    postForm.description = anime.synopsis ?? "";
    postForm.genres = anime.genres?.map(g => g.name) ?? [];
    postForm.malId = anime.mal_id;
    postForm.status = anime.status ?? "Finished Airing";

    // Pertahankan field manual yang sudah diisi user
    postForm.category = currentCategory;
    postForm.subtitleType = currentSubtitleType;
    postForm.releaseFileName = currentReleaseFileName;
    postForm.downloadLinks =
        currentDownloadLinks.length > 0 && (currentDownloadLinks[0].hosting || currentDownloadLinks[0].url)
            ? currentDownloadLinks
            : [{ hosting: "", url: "" }];
    postForm.postDescription = currentPostDescription;

    // Reset flag setelah selesai
    nextTick(() => {
        isSelectingAnime.value = false;
    });
};

const addGenre = () => {
    if (newGenre.value.trim() && !postForm.genres.includes(newGenre.value.trim())) {
        postForm.genres.push(newGenre.value.trim());
        newGenre.value = "";
    }
};

const removeGenre = (genre: string) => {
    const index = postForm.genres.indexOf(genre);
    if (index > -1) {
        postForm.genres.splice(index, 1);
    }
};

const addDownloadLink = () => {
    postForm.downloadLinks.push({ hosting: "", url: "" });
};

// Sanitize download link input
const sanitizeDownloadLink = (index: number, field: "hosting" | "url") => {
    if (field === "hosting") {
        postForm.downloadLinks[index].hosting = sanitizeInput(postForm.downloadLinks[index].hosting);
    } else {
        postForm.downloadLinks[index].url = sanitizeUrl(postForm.downloadLinks[index].url);
    }
};

const removeDownloadLink = (index: number) => {
    if (postForm.downloadLinks.length > 1) {
        postForm.downloadLinks.splice(index, 1);
    }
};

const confirmSubmit = async () => {
    if (!selectedAnime.value) {
        toast.error("Silakan pilih anime terlebih dahulu");
        showConfirmModal.value = false;
        return;
    }

    // Validate only manual fields
    const hasValidDownloadLink = postForm.downloadLinks.some(link => link.hosting.trim() && link.url.trim());
    if (!postForm.releaseFileName || !hasValidDownloadLink || !postForm.category || !postForm.subtitleType) {
        toast.error(
            "Silakan lengkapi field yang wajib: Nama File Rilisan, minimal satu Link Download dengan hosting, Kategori, dan Subtitle"
        );
        showConfirmModal.value = false;
        return;
    }

    try {
        isSubmitting.value = true;
        const { createPost } = useApi();

        // Pastikan kategori dipilih
        if (!postForm.category) {
            toast.error("Silakan pilih kategori dari daftar yang tersedia.");
            isSubmitting.value = false;
            showConfirmModal.value = false;
            return;
        }

        // Sanitize form data before submission
        const sanitizedPostForm = {
            ...postForm,
            title: sanitizeInput(postForm.title),
            titleEnglish: sanitizeInput(postForm.titleEnglish),
            cover: sanitizeUrl(postForm.cover),
            description: sanitizeTextarea(postForm.description),
            releaseFileName: sanitizeInput(postForm.releaseFileName),
            downloadLinks: postForm.downloadLinks.map(link => ({
                hosting: sanitizeInput(link.hosting),
                url: sanitizeUrl(link.url)
            })),
            subtitleType: sanitizeInput(postForm.subtitleType),
            postDescription: sanitizeTextarea(postForm.postDescription)
        };

        const postData = {
            ...sanitizedPostForm,
            submitterId: authStore.currentUser?.id ?? "00000000-0000-0000-0000-000000000000",
            submitterName: authStore.currentUser?.username ?? "user",
            statusApproval: "published" as const, // Status approval untuk moderasi
            views: 0,
            downloads: 0,
            likes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await createPost(postData);

        // Show success toast
        toast.success(`Postingan "${postForm.title}" berhasil dipublikasikan!`);

        // Close modal
        showConfirmModal.value = false;

        // Reset form hanya setelah berhasil submit
        Object.keys(postForm).forEach(key => {
            if (key === "downloadLinks") {
                postForm.downloadLinks = [{ hosting: "", url: "" }];
            } else if (typeof postForm[key as keyof typeof postForm] === "string") {
                (postForm as any)[key] = "";
            } else if (typeof postForm[key as keyof typeof postForm] === "number") {
                (postForm as any)[key] = 0;
            } else if (Array.isArray(postForm[key as keyof typeof postForm])) {
                (postForm as any)[key] = [];
            }
        });
        selectedAnime.value = null;
        searchQuery.value = "";
        searchResults.value = [];
        hasSearched.value = false;

        // Clear localStorage
        localStorage.removeItem("postFormData");
        localStorage.removeItem("selectedAnime");

        // Redirect to posts page after a short delay to show the toast
        setTimeout(async () => {
            await router.push("/posts");
        }, 1500);
    } catch (error: any) {
        console.error("Error creating post:", error);

        // Show error toast
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            toast.error(
                `Error: ${errorData.message || errorData.statusMessage || "Terjadi kesalahan saat membuat post!"}`
            );
        } else {
            toast.error(`Terjadi kesalahan: ${error.message || "Tidak dapat membuat post"}`);
        }

        showConfirmModal.value = false;
        // JANGAN reset form saat error - biarkan user memperbaiki data yang sudah diisi
    } finally {
        isSubmitting.value = false;
    }
};

// Fetch current notification for this page
const fetchCurrentNotification = async () => {
    try {
        const response = await $fetch("/api/admin/notifications", {
            method: "GET",
            query: { page: "posts/create" }
        });

        if (response.success && response.data) {
            currentNotification.value = response.data;
        }
    } catch (error) {
        console.error("Error fetching notification:", error);
    }
};

// Fetch categories when component is mounted
onMounted(async () => {
    try {
        categoriesLoading.value = true;

        // Fetch notification for this page
        await fetchCurrentNotification();

        // Pastikan categories dimuat terlebih dahulu
        await animeStore.fetchCategories();

        categoriesLoading.value = false;

        // Restore form data from localStorage if exists and not selecting anime
        if (!isSelectingAnime.value) {
            const savedFormData = localStorage.getItem("postFormData");
            if (savedFormData) {
                try {
                    const parsedData = JSON.parse(savedFormData);
                    Object.keys(parsedData).forEach(key => {
                        if (key in postForm) {
                            // Validasi khusus untuk kategori - pastikan kategori masih valid
                            if (key === "category" && parsedData[key]) {
                                // Cek apakah kategori ID masih valid
                                const categoryExists = animeStore.categories.some(cat => cat.id === parsedData[key]);
                                if (categoryExists) {
                                    postForm[key as keyof typeof postForm] = parsedData[key];
                                } else {
                                    console.warn(
                                        `Saved category ID ${parsedData[key]} no longer exists, skipping restore`
                                    );
                                }
                            } else {
                                postForm[key as keyof typeof postForm] = parsedData[key];
                            }
                        }
                    });
                } catch (error) {
                    console.error("Error parsing saved form data:", error);
                }
            }

            // Restore selected anime if exists
            const savedSelectedAnime = localStorage.getItem("selectedAnime");
            if (savedSelectedAnime) {
                try {
                    selectedAnime.value = JSON.parse(savedSelectedAnime);
                } catch (error) {
                    console.error("Error parsing saved selected anime:", error);
                }
            }
        }
    } catch (error) {
        console.error("Error during component initialization:", error);
        categoriesLoading.value = false;
    }
});

// Watch for changes in the form and save to localStorage
// Menggunakan debounce untuk menghindari race condition
let saveTimeout: NodeJS.Timeout | null = null;
watch(
    () => ({ ...postForm }),
    newValue => {
        // Jangan simpan ke localStorage saat sedang memilih anime
        if (isSelectingAnime.value) return;

        // Validasi kategori sebelum menyimpan
        if (newValue.category) {
            const categoryExists = animeStore.categories.some(cat => cat.id === newValue.category);
            if (!categoryExists) {
                console.warn("Invalid category detected, not saving to localStorage");
                return;
            }
        }

        // Bersihkan timeout sebelumnya
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        // Simpan dengan debounce
        saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem("postFormData", JSON.stringify(newValue));
            } catch (error) {
                console.error("Error saving form data to localStorage:", error);
            }
        }, 500); // Debounce 500ms
    },
    { deep: true }
);

// Watch for changes in selected anime and save to localStorage
watch(
    selectedAnime,
    newValue => {
        if (newValue) {
            localStorage.setItem("selectedAnime", JSON.stringify(newValue));
        } else {
            localStorage.removeItem("selectedAnime");
        }
    },
    { deep: true }
);
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
