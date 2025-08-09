<template>
    <ClientOnly>
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600 dark:text-gray-400">Memuat data postingan...</p>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="container-extra-wide py-8">
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div class="flex">
                        <ExclamationTriangleIcon class="h-6 w-6 text-red-400 mr-3" />
                        <div>
                            <h3 class="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
                            <p class="text-red-700 dark:text-red-300 mt-1">
                                {{ error }}
                            </p>
                            <div class="mt-4">
                                <BackButton
                                    to="/posts"
                                    label="Kembali ke Postingan"
                                    class="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div v-else>
                <!-- Header -->
                <div class="bg-white dark:bg-gray-800 shadow">
                    <div class="container-extra-wide">
                        <div class="flex justify-between items-center py-6">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Edit Postingan</h1>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Perbarui informasi anime Anda
                                </p>
                            </div>
                            <div class="flex items-center space-x-4">
                                <BackButton to="/posts" label="Kembali ke Postingan" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <!-- Status Info -->
                    <div
                        v-if="post"
                        class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div class="px-4 py-5 sm:p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Status Postingan</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Informasi status review postingan Anda
                                    </p>
                                </div>
                                <span
                                    class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                                    :class="getStatusClass(post.statusApproval)"
                                >
                                    {{ getStatusText(post.statusApproval) }}
                                </span>
                            </div>

                            <!-- Rejection Reason -->
                            <div
                                v-if="post.statusApproval === 'rejected'"
                                class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                            >
                                <div class="flex">
                                    <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                                    <div>
                                        <h5 class="text-sm font-medium text-red-800 dark:text-red-200">
                                            Alasan Penolakan:
                                        </h5>
                                        <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                                            {{ post.rejectionReason || 'Tidak ada alasan penolakan yang diberikan.' }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Approval Info -->
                            <div
                                v-else-if="post.statusApproval === 'published'"
                                class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                            >
                                <div class="flex">
                                    <CheckCircleIcon class="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                                    <div>
                                        <h5 class="text-sm font-medium text-green-800 dark:text-green-200">
                                            Postingan Disetujui
                                        </h5>
                                        <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                                            Postingan Anda telah disetujui dan dapat dilihat oleh pengguna lain.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Pending Info -->
                            <div
                                v-else-if="post.statusApproval === 'pending'"
                                class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
                            >
                                <div class="flex">
                                    <ClockIcon class="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                                    <div>
                                        <h5 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                            Menunggu Review
                                        </h5>
                                        <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                            Postingan Anda sedang dalam proses review oleh admin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Search Anime from Jikan API -->
                    <div
                        class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div class="px-4 py-5 sm:p-6">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Cari Anime dari MyAnimeList
                            </h3>

                            <!-- Search Tabs -->
                            <div class="flex space-x-1 mb-4" role="tablist" aria-label="Search mode selection">
                                <button
                                    @click="switchTab('search')"
                                    :class="[
                                        'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                                        searchMode === 'search'
                                            ? 'bg-blue-600 text-white focus:ring-blue-500'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500'
                                    ]"
                                    role="tab"
                                    :aria-selected="searchMode === 'search'"
                                    aria-controls="search-panel"
                                >
                                    Cari Judul
                                </button>
                                <button
                                    @click="switchTab('season')"
                                    :class="[
                                        'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                                        searchMode === 'season'
                                            ? 'bg-purple-600 text-white focus:ring-purple-500'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500'
                                    ]"
                                    role="tab"
                                    :aria-selected="searchMode === 'season'"
                                    aria-controls="season-panel"
                                >
                                    Musim Ini
                                </button>
                            </div>

                            <!-- Search Input (only show for search mode) -->
                            <div v-if="searchMode === 'search'" class="flex space-x-4 mb-4">
                                <div class="flex-1">
                                    <input
                                        v-model="searchQuery"
                                        @keyup.enter="searchAnime"
                                        type="text"
                                        placeholder="Cari anime berdasarkan judul..."
                                        class="form-input"
                                        aria-label="Search anime by title"
                                    />
                                </div>
                                <button
                                    @click="searchAnime"
                                    :disabled="isSearching || !searchQuery.trim()"
                                    class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    :aria-label="isSearching ? 'Searching anime...' : 'Search anime'"
                                >
                                    <MagnifyingGlassIcon v-if="!isSearching" class="w-4 h-4 mr-2" aria-hidden="true" />
                                    <div
                                        v-else
                                        class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                        aria-hidden="true"
                                    ></div>
                                    {{ isSearching ? "Mencari..." : "Cari" }}
                                </button>
                            </div>

                            <!-- Loading indicator for other modes -->
                            <div
                                v-else-if="isSearching"
                                class="flex items-center justify-center py-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                            >
                                <div
                                    class="w-6 h-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
                                ></div>
                                <span class="ml-2 text-gray-600 dark:text-gray-400">
                                    {{ searchMode === "season" ? "Mengambil anime musim ini..." : "Memuat anime..." }}
                                </span>
                            </div>

                            <!-- Search Results -->
                            <div v-if="searchResults.length > 0 && !isSearching" class="space-y-4">
                                <h4 class="text-md font-medium text-gray-900 dark:text-white">
                                    Hasil Pencarian ({{ searchResults.length }} anime ditemukan)
                                </h4>
                                <div
                                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                                >
                                    <div
                                        v-for="anime in searchResults"
                                        :key="anime.mal_id"
                                        @click="selectAnime(anime)"
                                        @keydown.enter="selectAnime(anime)"
                                        @keydown.space.prevent="selectAnime(anime)"
                                        class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        tabindex="0"
                                        role="button"
                                        :aria-label="`Select anime: ${anime.title}`"
                                        :class="{
                                            'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20':
                                                selectedAnime?.mal_id === anime.mal_id
                                        }"
                                    >
                                        <div class="flex space-x-3">
                                            <img
                                                :src="anime.images.jpg.small_image_url"
                                                :alt="anime.title"
                                                class="w-16 h-20 object-cover rounded"
                                            />
                                            <div class="flex-1 min-w-0">
                                                <h5
                                                    class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2"
                                                >
                                                    {{ anime.title }}
                                                </h5>
                                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {{ anime.episodes || "TBA" }} episode • {{ anime.year || "TBA" }}
                                                </p>
                                                <div class="flex items-center mt-1">
                                                    <StarIcon class="h-3 w-3 text-yellow-400 mr-1" />
                                                    <span class="text-xs text-gray-600 dark:text-gray-400">
                                                        {{ anime.score || "N/A" }}
                                                    </span>
                                                </div>
                                                <div class="flex flex-wrap gap-1 mt-2">
                                                    <span
                                                        v-for="genre in anime.genres.slice(0, 2)"
                                                        :key="genre.mal_id"
                                                        class="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                    >
                                                        {{ genre.name }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Load More Button for Season Mode -->
                                <div v-if="searchMode === 'season'" class="flex justify-center mt-4">
                                    <LoadMoreButton
                                        @click="loadMoreSeasonAnime"
                                        :isLoading="isLoadingMore"
                                        :hasNextPage="hasNextPage"
                                        buttonText="Muat Lebih Banyak"
                                        noMoreText="Tidak ada anime lagi"
                                        class="w-full max-w-xs"
                                    />
                                </div>
                            </div>

                            <!-- No Results -->
                            <div v-else-if="hasSearched && !isSearching" class="text-center py-8">
                                <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-gray-400" />
                                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Tidak ada hasil ditemukan
                                </h3>
                                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Coba gunakan kata kunci yang berbeda
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Form -->
                    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Detail Postingan</h3>

                            <form @submit.prevent="showConfirmationModal" class="space-y-6">
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
                                        <button
                                            type="button"
                                            class="text-blue-600 dark:text-blue-400 focus:outline-none"
                                        >
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
                                                    placeholder="Masukkan judul anime"
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
                                                    placeholder="Judul dalam bahasa Inggris"
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
                                                    Rating (0-10) (Otomatis dari API)
                                                </label>
                                                <input
                                                    v-model.number="postForm.rating"
                                                    type="number"
                                                    readonly
                                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <label
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                                >
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
                                        </div>

                                        <!-- Additional Read-only Fields -->
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
                                                        placeholder="https://example.com/cover.jpg"
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
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
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
                                                <label
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
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
                                                    class="flex space-x-2"
                                                >
                                                    <div class="flex-1">
                                                        <input
                                                            v-model="download.hosting"
                                                            type="text"
                                                            :required="index === 0"
                                                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            placeholder="Nama hosting (contoh: Google Drive, Mega, etc.)"
                                                        />
                                                    </div>
                                                    <div class="flex-2">
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
                                                        class="inline-flex items-center px-2 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                    >
                                                        <XMarkIcon class="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
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
                                            <label
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
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
                                                        v-for="category in animeStore.categories"
                                                        :key="category.id"
                                                        :value="category.id"
                                                    >
                                                        {{ category.name }}
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
                                            <span class="text-blue-700 dark:text-blue-300 font-medium"
                                                >Popularity:</span
                                            >
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
                                        type="submit"
                                        :disabled="isSubmitting"
                                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <div
                                            v-if="isSubmitting"
                                            class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                        ></div>
                                        {{ isSubmitting ? "Menyimpan..." : "Perbarui Postingan" }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Konfirmasi Update -->
            <div
                v-if="showUpdateModal"
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
                        @click="cancelUpdate"
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
                                    <ExclamationTriangleIcon
                                        class="h-6 w-6 text-blue-600 dark:text-blue-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3
                                        class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                                        id="modal-title"
                                    >
                                        Konfirmasi Perbarui Postingan
                                    </h3>
                                    <div class="mt-2">
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            Apakah Anda yakin ingin memperbarui postingan "<strong>{{
                                                postForm.title
                                            }}</strong
                                            >"?
                                        </p>
                                        <!-- Pesan dinamis berdasarkan status saat ini -->
                                        <p v-if="post?.statusApproval === 'rejected'" class="text-sm text-amber-600 dark:text-amber-400 mt-2 font-medium">
                                            ⚠️ Postingan yang ditolak ini akan dikirim ulang untuk review setelah diperbarui.
                                        </p>
                                        <p v-else-if="post?.statusApproval === 'published'" class="text-sm text-green-600 dark:text-green-400 mt-2">
                                            ✅ Postingan yang sudah dipublikasikan ini akan tetap dipublikasikan setelah diperbarui.
                                        </p>
                                        <p v-else-if="post?.statusApproval === 'pending'" class="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                            ⏳ Postingan yang sedang menunggu review ini akan tetap dalam status pending setelah diperbarui.
                                        </p>
                                        <p v-else class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Postingan yang diperbarui akan disimpan dengan status yang sesuai.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                @click="confirmUpdate"
                                :disabled="isSubmitting"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div
                                    v-if="isSubmitting"
                                    class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                ></div>
                                {{ isSubmitting ? "Menyimpan..." : "Ya, Perbarui" }}
                            </button>
                            <button
                                type="button"
                                @click="cancelUpdate"
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
import { ref, reactive, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useAnimeStore } from "~/stores/anime";
import { jikanApi, type JikanAnime } from "~/services/jikanApi";
import { useToast } from "vue-toastification";
import { formatMarkdownDescription } from "~/utils/markdown-formatter";
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    StarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    XMarkIcon,
    PlusIcon
} from "@heroicons/vue/24/outline";
import LoadMoreButton from "~/components/LoadMoreButton.vue";

// Meta
definePageMeta({
    middleware: "auth",
    title: "Edit Postingan"
});

// Composables
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const animeStore = useAnimeStore();
const { getPostById, updatePost: apiUpdatePost } = useApi();
const toast = useToast();

// Types
interface UserPost {
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
    postDescription?: string;
    genres: string[];
    malId?: number;
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
    rejectionReason?: string;
}

// State
const post = ref<UserPost | null>(null);
const isLoading = ref(true);
const error = ref("");
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
const hasNextPage = ref(true);
const isReadOnlyFormCollapsed = ref(true); // Default diciutkan
const descriptionMode = ref("write");
const descriptionTextarea = ref(null);
const showUpdateModal = ref(false);

// State untuk loading kategori
const categoriesLoading = ref(true);

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

// Methods
const getCategoryId = (parent: string, subcategory: string): string => {
    // Cari kategori utama berdasarkan nama
    const parentCategory = animeStore.categories.find(
        cat => !cat.parent_id && cat.name.toLowerCase() === parent.toLowerCase()
    );

    if (!parentCategory) return "";

    // Cari subkategori berdasarkan nama dan parent_id
    const subCategory = animeStore.categories.find(
        cat => cat.parent_id === parentCategory.id && cat.name.toLowerCase() === subcategory.toLowerCase()
    );

    return subCategory ? subCategory.id : "";
};

const toggleReadOnlyForm = () => {
    isReadOnlyFormCollapsed.value = !isReadOnlyFormCollapsed.value;
};

const getStatusClass = (statusApproval: string) => {
    switch (statusApproval) {
        case "published":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "pending":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "rejected":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
};

const getStatusText = (statusApproval: string) => {
    switch (statusApproval) {
        case "published":
            return "Dipublikasikan";
        case "pending":
            return "Menunggu Review";
        case "rejected":
            return "Ditolak";
        default:
            return "Unknown";
    }
};

// Methods
const switchTab = (newMode: "search" | "season") => {
    // Simpan hasil pencarian tab saat ini
    tabSearchResults.value[searchMode.value] = [...searchResults.value];
    tabHasSearched.value[searchMode.value] = hasSearched.value;

    // Ganti ke tab baru
    searchMode.value = newMode;

    // Pulihkan hasil pencarian tab baru
    searchResults.value = [...tabSearchResults.value[newMode]];
    hasSearched.value = tabHasSearched.value[newMode];

    // Jika tab season dan belum pernah dicari, otomatis cari
    if (newMode === "season" && !tabHasSearched.value.season) {
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

        // Periksa apakah halaman terakhir memiliki halaman berikutnya
        const lastResponse = responses[responses.length - 1];
        hasNextPage.value = lastResponse.pagination?.has_next_page || false;

        searchResults.value = uniqueAnime;
        currentSeasonPage.value = 3; // We loaded 3 pages

        // Simpan hasil ke storage tab
        tabSearchResults.value.season = [...uniqueAnime];
        tabHasSearched.value.season = true;
    } catch (error) {
        console.error("Error getting current season anime:", error);
        searchResults.value = [];
        tabSearchResults.value.season = [];
        hasNextPage.value = false;
    } finally {
        isSearching.value = false;
    }
};

const loadMoreSeasonAnime = async () => {
    if (!hasNextPage.value) return;

    isLoadingMore.value = true;

    try {
        const nextPage = currentSeasonPage.value + 1;
        const response = await jikanApi.getCurrentSeasonAnime(nextPage);

        // Perbarui status hasNextPage berdasarkan respons
        hasNextPage.value = response.pagination?.has_next_page ?? false;

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
        } else {
            // Jika tidak ada data lagi, set hasNextPage ke false
            hasNextPage.value = false;
        }
    } catch (error) {
        console.error("Error loading more season anime:", error);
    } finally {
        isLoadingMore.value = false;
    }
};

const selectAnime = (anime: JikanAnime) => {
    selectedAnime.value = anime;

    // Simpan state field manual sebelum mengisi otomatis
    const manualCategory = postForm.category;
    const manualSubtitleType = postForm.subtitleType;
    const manualReleaseFileName = postForm.releaseFileName;
    const manualDownloadLinks = [...postForm.downloadLinks];
    const manualPostDescription = postForm.postDescription;

    // Auto-fill form with anime data
    postForm.title = anime.title;
    postForm.titleEnglish = anime.title_english ?? "";
    postForm.episodes = anime.episodes ?? 12;
    postForm.year = anime.year ?? new Date(anime.aired.from).getFullYear();
    postForm.rating = anime.score ?? 8.0;
    postForm.cover = anime.images.jpg.large_image_url;
    postForm.description = anime.synopsis ?? "";
    postForm.genres = anime.genres.map(g => g.name);
    postForm.malId = anime.mal_id;

    // Kembalikan kategori manual jika ada
    if (manualCategory) {
        postForm.category = manualCategory;
    }
    // Tidak ada auto-select category - user harus memilih sendiri dari dropdown

    // Kembalikan field manual lainnya
    if (manualSubtitleType) postForm.subtitleType = manualSubtitleType;
    if (manualReleaseFileName) postForm.releaseFileName = manualReleaseFileName;
    if (manualDownloadLinks.some(link => link.hosting || link.url)) {
        postForm.downloadLinks = manualDownloadLinks;
    }
    if (manualPostDescription) postForm.postDescription = manualPostDescription;
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

const removeDownloadLink = (index: number) => {
    if (postForm.downloadLinks.length > 1) {
        postForm.downloadLinks.splice(index, 1);
    }
};

const loadPost = async () => {
    isLoading.value = true;
    error.value = "";

    const postId = route.params.id as string;

    if (!postId) {
        error.value = "ID postingan tidak valid";
        isLoading.value = false;
        return;
    }

    try {
        // Menggunakan API untuk mengambil data dari Supabase
        const fetchedPost = await getPostById(postId);

        if (!fetchedPost) {
            error.value = "Postingan tidak ditemukan";
            isLoading.value = false;
            return;
        }

        // Check if user owns this post
        if (fetchedPost.submitterId !== authStore.currentUser?.id) {
            error.value = "Anda tidak memiliki akses untuk mengedit postingan ini";
            isLoading.value = false;
            return;
        }

        post.value = fetchedPost;

        // Fill form with existing data
        postForm.title = fetchedPost.title || "";
        postForm.titleEnglish = fetchedPost.titleEnglish || "";
        postForm.episodes = fetchedPost.episodes || 0;
        postForm.year = fetchedPost.year || new Date().getFullYear();
        postForm.rating = fetchedPost.rating || 0;

        // Pastikan kategori sudah dimuat sebelum mencari berdasarkan nama
        if (animeStore.categories.length === 0) {
            categoriesLoading.value = true;
            await animeStore.fetchCategories();
            categoriesLoading.value = false;
        }

        // Cari ID kategori berdasarkan category_id yang diterima dari API
        const categoryId = fetchedPost.category || "";

        // Periksa apakah nilai yang diterima sudah berupa ID yang valid
        let categoryObj = animeStore.categories.find(cat => cat.id === categoryId);

        // Jika tidak ditemukan berdasarkan ID, coba cari berdasarkan nama (fallback)
        if (!categoryObj) {
            categoryObj = animeStore.categories.find(cat => cat.name === categoryId);
        }

        // Gunakan ID kategori jika ditemukan, atau kosongkan jika tidak valid
        postForm.category = categoryObj?.id || "";

        postForm.status = "Finished Airing"; // Default anime status
        postForm.cover = fetchedPost.cover || "";
        postForm.description = fetchedPost.description || "";
        postForm.genres = [...(fetchedPost.genres || [])];
        postForm.malId = fetchedPost.malId || null;
        postForm.releaseFileName = fetchedPost.releaseFileName || "";
        postForm.downloadLinks =
            fetchedPost.downloadLinks && fetchedPost.downloadLinks.length > 0
                ? [...fetchedPost.downloadLinks]
                : [{ hosting: "", url: "" }];
        postForm.subtitleType = fetchedPost.subtitleType || "";
        postForm.postDescription = fetchedPost.postDescription || "";
    } catch (err) {
        console.error("Error loading post:", err);
        error.value = "Gagal memuat data postingan";
    } finally {
        isLoading.value = false;
    }
};

const insertFormat = (before: string, after: string, placeholder: string) => {
    const textarea = descriptionTextarea.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;

    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    postForm.postDescription = beforeText + newText + afterText;

    // Set cursor position
    nextTick(() => {
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
};

// Alias untuk kompatibilitas dengan template yang sudah ada
const formatDescription = formatMarkdownDescription;

const showConfirmationModal = () => {
    // Validate only manual fields before showing modal
    const hasValidDownloadLink = postForm.downloadLinks.some(link => link.hosting.trim() && link.url.trim());
    if (!postForm.releaseFileName || !hasValidDownloadLink || !postForm.category || !postForm.subtitleType) {
        toast.error(
            "Silakan lengkapi field yang wajib: Nama File Rilisan, minimal satu Link Download dengan hosting, Kategori, dan Subtitle"
        );
        return;
    }

    showUpdateModal.value = true;
};

const confirmUpdate = async () => {
    await updatePost();
    showUpdateModal.value = false;
};

const cancelUpdate = () => {
    showUpdateModal.value = false;
};

const updatePost = async () => {
    if (!post.value) {
        toast.error("Data postingan tidak ditemukan");
        return;
    }

    isSubmitting.value = true;

    try {
        const postId = route.params.id as string;

        // Tentukan status approval berdasarkan status saat ini
        let newStatusApproval = post.value.statusApproval;
        let successMessage = `Postingan "${postForm.title}" berhasil diperbarui!`;

        // Logika status berdasarkan permintaan:
        // - Jika status saat ini 'rejected', ubah menjadi 'pending' untuk review ulang
        // - Jika status saat ini 'published', tetap 'published'
        // - Jika status saat ini 'pending', tetap 'pending'
        if (post.value.statusApproval === 'rejected') {
            newStatusApproval = 'pending';
            successMessage = `Postingan "${postForm.title}" berhasil diperbarui dan dikirim untuk review ulang!`;
        } else if (post.value.statusApproval === 'published') {
            newStatusApproval = 'published';
            successMessage = `Postingan "${postForm.title}" berhasil diperbarui dan tetap dipublikasikan!`;
        }

        // Menyiapkan data yang akan diperbarui
        const updatedData = {
            title: postForm.title,
            titleEnglish: postForm.titleEnglish,
            episodes: postForm.episodes,
            year: postForm.year,
            rating: postForm.rating,
            category: postForm.category,
            description: postForm.description,
            genres: postForm.genres,
            malId: postForm.malId,
            releaseFileName: postForm.releaseFileName,
            downloadLinks: postForm.downloadLinks.filter(link => link.hosting.trim() && link.url.trim()),
            subtitleType: postForm.subtitleType,
            postDescription: postForm.postDescription,
            statusApproval: newStatusApproval // Menambahkan status approval yang baru
        };

        // Memanggil API untuk memperbarui data di Supabase
        const updateResponse = await apiUpdatePost(postId, updatedData);

        // Check if status was automatically changed to pending due to content modification
        if (updateResponse.statusChanged && updateResponse.statusChangeMessage) {
            toast.warning(updateResponse.statusChangeMessage);
        } else {
            toast.success(successMessage);
        }

        // Redirect based on query parameter - if came from admin, go back to admin
        if (route.query.from === 'admin') {
            await router.push("/admin/posts");
        } else {
            await router.push("/posts");
        }
    } catch (error: any) {
        console.error("Error updating post:", error);
        toast.error(error.message || "Terjadi kesalahan saat memperbarui postingan");
    } finally {
        isSubmitting.value = false;
    }
};

// Lifecycle
onMounted(async () => {
    try {
        // Pastikan kategori dimuat terlebih dahulu
        categoriesLoading.value = true;
        await animeStore.fetchCategories();
        categoriesLoading.value = false;

        await loadPost();
    } catch (error) {
        console.error("Error during component initialization:", error);
        categoriesLoading.value = false;
    }
});
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
