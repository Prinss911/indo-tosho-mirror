<template>
    <ClientOnly>
        <div class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <AppHeader />

            <main class="container-extra-wide py-8">
                <!-- Loading State -->
                <div v-if="loading" class="flex items-center justify-center py-12" data-testid="loading">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span class="ml-3 text-gray-600 dark:text-gray-400">Loading anime details...</span>
                </div>

                <!-- Error State -->
                <div v-else-if="!anime" class="text-center py-12" data-testid="error-message">
                    <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Anime not found</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                        The anime you're looking for doesn't exist or has been removed.
                    </p>
                    <BackButton to="/" label="Back to Home" class="btn-primary" />
                </div>

                <!-- Anime Details -->
                <div v-else class="space-y-8" data-testid="anime-details">
                    <!-- Breadcrumb -->
                    <nav class="flex" aria-label="Breadcrumb">
                        <ol class="flex items-center space-x-2 text-sm">
                            <li>
                                <NuxtLink
                                    to="/"
                                    class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Home
                                </NuxtLink>
                            </li>
                            <ChevronRightIcon class="w-4 h-4 text-gray-400" />
                            <li>
                                <span class="text-gray-900 dark:text-white font-medium">{{
                                    anime.releaseFileName ?? anime.title
                                }}</span>
                            </li>
                        </ol>
                    </nav>

                    <!-- Main Content -->
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- Left Column - Cover and Basic Info -->
                        <div class="lg:col-span-1">
                            <div class="card p-6 sticky top-24">
                                <!-- Cover Image -->
                                <div class="aspect-[3/4] mb-6">
                                    <img
                                        :src="anime?.coverImage ?? ''"
                                        :alt="anime?.title ?? 'Anime Cover'"
                                        class="w-full h-full object-cover rounded-lg shadow-lg"
                                        loading="lazy"
                                    />
                                </div>

                                <!-- Quick Stats -->
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                                        <div class="flex items-center">
                                            <StarIcon class="w-5 h-5 text-yellow-400 mr-1" />
                                            <span class="font-semibold text-gray-900 dark:text-white"
                                                >{{ anime?.rating ?? 0 }}/10</span
                                            >
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">Episodes</span>
                                        <span class="font-semibold text-gray-900 dark:text-white">
                                            {{ anime?.episodes ?? "N/A" }}
                                        </span>
                                    </div>

                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            :class="anime?.status ? getStatusColor(anime.status) : ''"
                                        >
                                            {{ anime?.status ? formatStatus(anime.status) : "Unknown" }}
                                        </span>
                                    </div>

                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">Year</span>
                                        <span class="font-semibold text-gray-900 dark:text-white">{{
                                            anime?.year ?? "N/A"
                                        }}</span>
                                    </div>

                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">Studio</span>
                                        <span class="font-semibold text-gray-900 dark:text-white">{{
                                            anime?.studio ?? "N/A"
                                        }}</span>
                                    </div>


                                </div>

                                <!-- Engagement Stats -->
                                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                        Engagement Stats
                                    </h3>
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between text-sm">
                                            <div class="flex items-center text-blue-600 dark:text-blue-400">
                                                <EyeIcon class="w-4 h-4 mr-1" />
                                                <span>Total Views</span>
                                            </div>
                                            <span class="font-medium">{{ formatNumber(anime?.views) }}</span>
                                        </div>
                                        <div class="flex items-center justify-between text-sm">
                                            <div class="flex items-center text-green-600 dark:text-green-400">
                                                <ArrowDownTrayIcon class="w-4 h-4 mr-1" />
                                                <span>Total Downloads</span>
                                            </div>
                                            <span class="font-medium">{{ formatNumber(anime?.downloads) }}</span>
                                        </div>
                                        <div class="flex items-center justify-between text-sm">
                                            <div class="flex items-center text-red-500 dark:text-red-400">
                                                <HeartIcon class="w-4 h-4 mr-1" />
                                                <span>Likes</span>
                                            </div>
                                            <span class="font-medium">{{ anime?.likes ?? 0 }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <div class="mt-6 space-y-3">
                                    <button class="w-full btn-primary flex items-center justify-center">
                                        <PlayIcon class="w-5 h-5 mr-2" />
                                        Watch Now
                                    </button>
                                    <button class="w-full btn-secondary flex items-center justify-center">
                                        <BookmarkIcon class="w-5 h-5 mr-2" />
                                        Add to Watchlist
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Detailed Info -->
                        <div class="lg:col-span-3 space-y-6">
                            <!-- Title and Basic Info -->
                            <div class="card p-6">
                                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {{ anime?.releaseFileName ?? anime?.title ?? "Anime Title" }}
                                </h1>

                                <!-- Genres -->
                                <div class="flex flex-wrap gap-2 mb-4">
                                    <span
                                        v-for="genre in anime?.genre ?? []"
                                        :key="genre"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                        :class="getCategoryColor(genre)"
                                        data-testid="genre-tag"
                                    >
                                        {{ genre }}
                                    </span>
                                </div>

                                <!-- Submitter and Date -->
                                <div
                                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 dark:text-gray-400 mb-6"
                                >
                                    <div class="flex items-center mb-2 sm:mb-0">
                                        <UserIcon class="w-4 h-4 mr-1" />
                                        <span
                                            >Submitted by
                                            <strong class="text-gray-900 dark:text-white">{{
                                                anime?.submitter ?? "Unknown"
                                            }}</strong></span
                                        >
                                    </div>
                                    <div class="flex items-center">
                                        <CalendarIcon class="w-4 h-4 mr-1" />
                                        <span>{{ formatDate(anime?.date) }}</span>
                                    </div>
                                </div>

                                <!-- Description -->
                                <div>
                                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Description
                                    </h2>
                                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {{ anime?.description ?? "No description available for this anime." }}
                                    </p>
                                </div>
                            </div>

                            <!-- Additional Information -->
                            <div class="card p-6">
                                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Additional Information
                                </h2>
                                <div>
                                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Anime Info
                                    </h3>
                                    <dl class="space-y-2 text-sm">
                                        <div class="flex justify-between">
                                            <dt class="text-gray-600 dark:text-gray-400">Type:</dt>
                                            <dd class="text-gray-900 dark:text-white font-medium">TV Series</dd>
                                        </div>
                                        <div class="flex justify-between">
                                            <dt class="text-gray-600 dark:text-gray-400">Duration:</dt>
                                            <dd class="text-gray-900 dark:text-white font-medium">24 min/ep</dd>
                                        </div>
                                        <div class="flex justify-between">
                                            <dt class="text-gray-600 dark:text-gray-400">Source:</dt>
                                            <dd class="text-gray-900 dark:text-white font-medium">Manga</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <!-- Post Description Section -->
                            <div v-if="anime?.postDescription" class="card p-6">
                                <div class="flex items-center mb-4">
                                    <svg
                                        class="w-6 h-6 text-green-600 dark:text-green-400 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                                        Deskripsi Postingan
                                    </h2>
                                </div>
                                <div
                                    class="prose prose-sm max-w-none dark:prose-invert"
                                    v-html="formatDescription(anime.postDescription)"
                                ></div>
                            </div>

                            <!-- Download Links Section -->
                            <div class="card p-6">
                                <div class="flex items-center mb-4">
                                    <ArrowDownTrayIcon class="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Download Links</h2>
                                </div>

                                <!-- Download Options -->
                                <div class="space-y-4">
                                    <!-- Primary Download Links -->
                                    <div class="space-y-3">
                                        <!-- Dynamic Download Links -->
                                        <div v-if="anime?.downloadLinks?.length > 0">
                                            <div
                                                v-for="(link, index) in anime.downloadLinks"
                                                :key="index"
                                                class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors mb-3"
                                            >
                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center">
                                                        <div
                                                            class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3"
                                                        >
                                                            <ArrowDownTrayIcon
                                                                class="w-5 h-5 text-blue-600 dark:text-blue-400"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 class="font-medium text-gray-900 dark:text-white">
                                                                Download Link {{ index + 1 }}
                                                            </h3>
                                                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                                                {{ link?.hosting ?? "Server" }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        :href="link?.url ?? '#'"
                                                        target="_blank"
                                                        class="btn-primary px-4 py-2 text-sm"
                                                        data-testid="download-link"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Fallback when no download links -->
                                        <div
                                            v-else
                                            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                        >
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center">
                                                    <div
                                                        class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3"
                                                    >
                                                        <ArrowDownTrayIcon
                                                            class="w-5 h-5 text-blue-600 dark:text-blue-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 class="font-medium text-gray-900 dark:text-white">
                                                            Download Link 1
                                                        </h3>
                                                        <p class="text-sm text-gray-600 dark:text-gray-400">
                                                            Primary server • High speed
                                                        </p>
                                                    </div>
                                                </div>
                                                <button class="btn-primary px-4 py-2 text-sm">Download</button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Download Instructions -->
                                    <div
                                        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                                    >
                                        <div class="flex items-start">
                                            <svg
                                                class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                    clip-rule="evenodd"
                                                />
                                            </svg>
                                            <div>
                                                <h4 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                                                    Petunjuk Download
                                                </h4>
                                                <p class="text-sm text-blue-800 dark:text-blue-300">
                                                    Pilih salah satu link download utama untuk kecepatan optimal.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Comments Section -->
                            <div class="card p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
                                    <span class="text-sm text-gray-500 dark:text-gray-400"
                                        >{{ comments.length }} comment{{ comments.length !== 1 ? "s" : "" }}</span
                                    >
                                </div>

                                <!-- Add Comment Form -->
                                <div class="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div class="flex items-start space-x-3">
                                        <div
                                            class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                        >
                                            U
                                        </div>
                                        <div class="flex-1">
                                            <div class="mb-3">
                                                <input
                                                    v-model="newComment.author"
                                                    type="text"
                                                    placeholder="Your name"
                                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div class="mb-3">
                                                <!-- Formatting Toolbar -->
                                                <div
                                                    class="border border-gray-300 dark:border-gray-600 rounded-t-md bg-gray-50 dark:bg-gray-700 px-3 py-2 flex items-center space-x-1 flex-wrap gap-1"
                                                >
                                                    <!-- Text Formatting -->
                                                    <div
                                                        class="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2"
                                                    >
                                                        <button
                                                            @click="insertMarkdown('**', '**', 'bold text')"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Bold"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    d="M5 3a1 1 0 000 2h1v10H5a1 1 0 100 2h5a4 4 0 001.996-7.464A3.5 3.5 0 0010.5 3H5zm2.5 2h3a1.5 1.5 0 010 3h-3V5zm0 5h3.5a2 2 0 010 4H7.5v-4z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            @click="insertMarkdown('*', '*', 'italic text')"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Italic"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    d="M8 3a1 1 0 000 2h1.5l-3 10H5a1 1 0 100 2h5a1 1 0 100-2H8.5l3-10H13a1 1 0 100-2H8z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            @click="insertMarkdown('`', '`', 'code')"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Inline Code"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fill-rule="evenodd"
                                                                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                                                                    clip-rule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <!-- Links & Media -->
                                                    <div
                                                        class="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2"
                                                    >
                                                        <button
                                                            @click="insertLink()"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Insert Link"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fill-rule="evenodd"
                                                                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                                                    clip-rule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <!-- Lists -->
                                                    <div
                                                        class="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2"
                                                    >
                                                        <button
                                                            @click="insertList('unordered')"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Bullet List"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fill-rule="evenodd"
                                                                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                                                    clip-rule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            @click="insertList('ordered')"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Numbered List"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fill-rule="evenodd"
                                                                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                    clip-rule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <!-- Quote & Code Block -->
                                                    <div class="flex items-center space-x-1">
                                                        <button
                                                            @click="insertBlockquote()"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Quote"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fill-rule="evenodd"
                                                                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                                                    clip-rule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            @click="insertCodeBlock()"
                                                            type="button"
                                                            class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                                            title="Code Block"
                                                        >
                                                            <svg
                                                                class="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fill-rule="evenodd"
                                                                    d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3.707 5.293a1 1 0 00-1.414 1.414L8.586 11l-2.293 2.293a1 1 0 101.414 1.414L10 12.414a1 1 0 000-1.414L7.707 7.293zm4 1.414a1 1 0 011.414-1.414L15.414 9.5a1 1 0 010 1.414L13.121 13.207a1 1 0 01-1.414-1.414L13 10.5l-1.293-1.293z"
                                                                    clip-rule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <textarea
                                                    ref="commentTextarea"
                                                    v-model="newComment.content"
                                                    rows="4"
                                                    placeholder="Write your comment..."
                                                    class="w-full px-3 py-2 border-t-0 border border-gray-300 dark:border-gray-600 rounded-b-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                ></textarea>
                                            </div>

                                            <!-- Markdown Preview -->
                                            <div
                                                v-if="showPreview && newComment.content"
                                                class="mb-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                                            >
                                                <div class="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                                                    Preview:
                                                </div>
                                                <div
                                                    class="prose prose-sm dark:prose-invert max-w-none"
                                                    v-html="parseMarkdown(newComment.content)"
                                                ></div>
                                            </div>

                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center space-x-2">
                                                    <button
                                                        @click="showPreview = !showPreview"
                                                        type="button"
                                                        class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                    >
                                                        {{ showPreview ? "Hide Preview" : "Show Preview" }}
                                                    </button>
                                                    <span class="text-xs text-gray-400">•</span>
                                                    <span class="text-xs text-gray-500 dark:text-gray-400"
                                                        >Markdown supported</span
                                                    >
                                                </div>
                                                <div class="flex items-center space-x-2">
                                                    <button
                                                        @click="clearComment"
                                                        type="button"
                                                        class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        @click="addComment"
                                                        :disabled="
                                                            !newComment.author.trim() || !newComment.content.trim()
                                                        "
                                                        class="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Post Comment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Comments List -->
                                <div v-if="comments.length > 0" class="space-y-6">
                                    <div
                                        v-for="comment in comments"
                                        :key="comment.id"
                                        class="flex space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div
                                            class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                        >
                                            {{ comment.author.charAt(0).toUpperCase() }}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center space-x-2 mb-2">
                                                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                                                    {{ comment.author }}
                                                </h4>
                                                <span class="text-xs text-gray-500 dark:text-gray-400">{{
                                                    formatCommentDate(comment.date)
                                                }}</span>
                                            </div>
                                            <div
                                                class="prose prose-sm dark:prose-invert max-w-none"
                                                v-html="parseMarkdown(comment.content)"
                                            ></div>

                                            <!-- Comment Actions -->
                                            <div class="flex items-center space-x-4 mt-3">
                                                <button
                                                    class="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
                                                >
                                                    <HeartIcon class="w-3 h-3" />
                                                    <span>Like</span>
                                                </button>
                                                <button
                                                    class="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Empty State -->
                                <div v-else class="text-center py-8">
                                    <ChatBubbleLeftEllipsisIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p class="text-gray-500 dark:text-gray-400">
                                        No comments yet. Be the first to comment!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAnimeStore } from "~/stores/anime";
import { sanitizeTextarea, sanitizeInput } from "~/utils/input-sanitizer";
import {
    StarIcon,
    EyeIcon,
    HeartIcon,
    ArrowDownTrayIcon,
    PlayIcon,
    BookmarkIcon,
    UserIcon,
    CalendarIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftEllipsisIcon
} from "@heroicons/vue/24/outline";
import { nextTick } from "vue";

const route = useRoute();
const animeStore = useAnimeStore();

// Reactive state
const loading = ref(true);
const animeData = ref(null);

// Comments state
const comments = ref([]);
const newComment = ref({
    author: "",
    content: ""
});
const showPreview = ref(false);

// Markdown parser instance
let marked: any = null;

// Load marked.js from CDN
if (process.client) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js";
    script.onload = () => {
        marked = (window as any).marked;
        // Configure marked options
        marked.setOptions({
            breaks: true,
            gfm: true,
            sanitize: false,
            smartLists: true,
            smartypants: true
        });
    };
    document.head.appendChild(script);
}

// Fetch anime data
async function fetchAnimeData() {
    // Safely access route params
    const id = route?.params?.id as string;
    if (!id) {
        console.error("No anime ID provided in route params");
        loading.value = false;
        return false;
    }

    try {
        const result = await animeStore.getAnimeById(id);
        const found = result !== undefined && result !== null;
        animeData.value = result as Anime | null;

        // If no result found, return false to indicate we need to fetch again
        return found;
    } catch (error) {
        console.error("Error fetching anime:", error);
        return false;
    } finally {
        loading.value = false;
    }
}

// Computed
const anime = computed(() => animeData.value);

// Meta tags
useHead(() => ({
    title: anime.value
        ? `${(anime.value as any).releaseFileName ?? (anime.value as any).title} - Anime Database`
        : "Anime Details - Anime Database",
    meta: [
        {
            name: "description",
            content: anime.value
                ? ((anime.value as any).description ??
                  `Watch ${(anime.value as any).releaseFileName ?? (anime.value as any).title} - ${(anime.value as any).genre?.length ? (anime.value as any).genre.join(", ") : ""}${(anime.value as any).studio ? ` anime from ${(anime.value as any).studio}` : ""}`)
                : "Anime details page"
        },
        {
            property: "og:title",
            content: anime.value
                ? `${(anime.value as any).releaseFileName ?? (anime.value as any).title} - Anime Database`
                : "Anime Details"
        },
        {
            property: "og:description",
            content: anime.value
                ? (anime.value.description ??
                  `Watch ${anime.value.releaseFileName ?? anime.value.title} - ${anime.value.genre?.length ? anime.value.genre.join(", ") : ""}${anime.value.studio ? ` anime from ${anime.value.studio}` : ""}`)
                : "Anime details page"
        },
        {
            property: "og:image",
            content: anime.value?.coverImage ?? ""
        }
    ]
}));

// Methods
const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        Action: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        Adventure: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        Comedy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        Drama: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        Fantasy: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
        Romance: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
        "Sci-Fi": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        "Slice of Life": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        Thriller: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category] ?? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        "Finished Airing": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        "Currently Airing": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        "Not yet aired": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        // Fallback untuk status lama
        completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        ongoing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        upcoming: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    };
    return colors[status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        "Finished Airing": "Selesai Tayang",
        "Currently Airing": "Sedang Tayang",
        "Not yet aired": "Belum Tayang",
        // Fallback untuk status lama
        completed: "Selesai",
        ongoing: "Sedang Berlangsung",
        upcoming: "Akan Datang"
    };
    return statusMap[status] ?? status;
};

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
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

// Format description function for post description
const formatDescription = (text: string) => {
    if (!text) return "";

    // Split text into lines for better processing
    const lines = text.split("\n");
    const processedLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let inCodeBlock = false;
    let codeBlockContent = "";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Handle code blocks
        if (line.trim().startsWith("```")) {
            if (inCodeBlock) {
                // End code block
                processedLines.push(
                    `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto my-4"><code>${codeBlockContent}</code></pre>`
                );
                codeBlockContent = "";
                inCodeBlock = false;
            } else {
                // Start code block
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += (codeBlockContent ? "\n" : "") + line;
            continue;
        }

        // Handle unordered lists
        if (line.trim().match(/^\* (.+)$/)) {
            if (!inUnorderedList) {
                if (inOrderedList) {
                    processedLines.push("</ol>");
                    inOrderedList = false;
                }
                processedLines.push('<ul class="list-disc list-inside space-y-1 my-4">');
                inUnorderedList = true;
            }
            const content = line.trim().replace(/^\* (.+)$/, "$1");
            processedLines.push(`<li class="ml-4">${formatInlineElements(content)}</li>`);
            continue;
        }

        // Handle ordered lists
        if (line.trim().match(/^\d+\. (.+)$/)) {
            if (!inOrderedList) {
                if (inUnorderedList) {
                    processedLines.push("</ul>");
                    inUnorderedList = false;
                }
                processedLines.push('<ol class="list-decimal list-inside space-y-1 my-4">');
                inOrderedList = true;
            }
            const content = line.trim().replace(/^\d+\. (.+)$/, "$1");
            processedLines.push(`<li class="ml-4">${formatInlineElements(content)}</li>`);
            continue;
        }

        // Close lists if we're not in a list item
        if (inUnorderedList) {
            processedLines.push("</ul>");
            inUnorderedList = false;
        }
        if (inOrderedList) {
            processedLines.push("</ol>");
            inOrderedList = false;
        }

        // Handle horizontal rules
        if (line.trim() === "---") {
            processedLines.push('<hr class="my-4 border-gray-300 dark:border-gray-600">');
            continue;
        }

        // Handle blockquotes
        if (line.trim().match(/^> (.+)$/)) {
            const content = line.trim().replace(/^> (.+)$/, "$1");
            processedLines.push(
                `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">${formatInlineElements(content)}</blockquote>`
            );
            continue;
        }

        // Handle regular paragraphs
        if (line.trim()) {
            processedLines.push(`<p class="mb-4">${formatInlineElements(line)}</p>`);
        } else {
            // Empty line - add spacing
            processedLines.push("<br>");
        }
    }

    // Close any remaining lists
    if (inUnorderedList) {
        processedLines.push("</ul>");
    }
    if (inOrderedList) {
        processedLines.push("</ol>");
    }

    return processedLines.join("");
};

// Helper function to format inline elements
const formatInlineElements = (text: string) => {
    return (
        text
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            // Italic text
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            // Links
            .replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'
            )
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
    );
};

// Comment functions
const parseMarkdown = (content: string) => {
    if (!marked || !content) return content;

    try {
        // Enhanced sanitization using utility function
        const sanitized = sanitizeTextarea(content);
        return marked.parse(sanitized);
    } catch (error) {
        console.error("Error parsing markdown:", error);
        return sanitizeTextarea(content);
    }
};

const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "just now";
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }
};

const addComment = () => {
    if (!newComment.value.author.trim() || !newComment.value.content.trim()) {
        return;
    }

    // Sanitize comment data before adding
    const comment = {
        id: Date.now().toString(),
        author: sanitizeInput(newComment.value.author.trim()),
        content: sanitizeTextarea(newComment.value.content.trim()),
        date: new Date().toISOString(),
        likes: 0
    };

    comments.value.unshift(comment);

    // Save to localStorage for persistence
    const animeId = route?.params?.id as string;
    if (animeId) {
        const storageKey = `comments_${animeId}`;
        localStorage.setItem(storageKey, JSON.stringify(comments.value));
    }

    // Clear form
    clearComment();
};

const clearComment = () => {
    newComment.value.author = "";
    newComment.value.content = "";
    showPreview.value = false;
};

// Formatting functions
const commentTextarea = ref(null);

const insertMarkdown = (startTag: string, endTag: string, placeholder: string) => {
    const textarea = commentTextarea.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.value.content.substring(start, end);

    const before = newComment.value.content.substring(0, start);
    const after = newComment.value.content.substring(end);

    // Check if the selected text already has the format (toggle functionality)
    const prefixStart = start - startTag.length;
    const suffixEnd = end + endTag.length;

    if (prefixStart >= 0 && suffixEnd <= newComment.value.content.length) {
        const prefix = newComment.value.content.substring(prefixStart, start);
        const suffix = newComment.value.content.substring(end, suffixEnd);

        if (prefix === startTag && suffix === endTag) {
            // Remove the format
            const beforePrefix = newComment.value.content.substring(0, prefixStart);
            const afterSuffix = newComment.value.content.substring(suffixEnd);

            newComment.value.content = beforePrefix + selectedText + afterSuffix;

            nextTick(() => {
                const newStart = prefixStart;
                const newEnd = prefixStart + selectedText.length;
                textarea.focus();
                textarea.setSelectionRange(newStart, newEnd);
            });
            return;
        }
    }

    // Add the format
    const textToInsert = selectedText || placeholder;
    newComment.value.content = before + startTag + textToInsert + endTag + after;

    // Set cursor position
    nextTick(() => {
        if (selectedText) {
            // If text was selected, select the formatted text
            const newStart = start;
            const newEnd = start + startTag.length + textToInsert.length + endTag.length;
            textarea.focus();
            textarea.setSelectionRange(newStart, newEnd);
        } else {
            // If no text was selected, position cursor after the placeholder
            const newCursorPos = start + startTag.length + textToInsert.length;
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
    });
};

const insertLink = () => {
    const textarea = commentTextarea.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.value.content.substring(start, end);

    const before = newComment.value.content.substring(0, start);
    const after = newComment.value.content.substring(end);

    // Check if the selected text is already a link (toggle functionality)
    const linkPattern = /^\[(.*)\]\((.*)\)$/;
    const match = selectedText.match(linkPattern);

    if (match) {
        // Remove the link format, keep only the link text
        const linkText = match[1];
        newComment.value.content = before + linkText + after;

        nextTick(() => {
            const newStart = start;
            const newEnd = start + linkText.length;
            textarea.focus();
            textarea.setSelectionRange(newStart, newEnd);
        });
        return;
    }

    // Add the link format
    const linkText = selectedText || "link text";
    const linkMarkdown = `[${linkText}](url)`;

    newComment.value.content = before + linkMarkdown + after;

    nextTick(() => {
        const urlStart = start + linkText.length + 3; // position of 'url'
        const urlEnd = urlStart + 3;
        textarea.focus();
        textarea.setSelectionRange(urlStart, urlEnd);
    });
};

const insertList = (type: "ordered" | "unordered") => {
    const textarea = commentTextarea.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const prefix = type === "ordered" ? "1. " : "- ";
    const listItem = prefix + "List item";

    const before = newComment.value.content.substring(0, start);
    const after = newComment.value.content.substring(start);

    // Add newline before if not at start and previous char isn't newline
    const needsNewlineBefore = start > 0 && before.charAt(before.length - 1) !== "\n";
    const insertion = (needsNewlineBefore ? "\n" : "") + listItem;

    newComment.value.content = before + insertion + after;

    nextTick(() => {
        const newCursorPos = start + insertion.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
};

const insertBlockquote = () => {
    const textarea = commentTextarea.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.value.content.substring(start, end);

    const before = newComment.value.content.substring(0, start);
    const after = newComment.value.content.substring(end);

    // Check if the selected text is already a blockquote (toggle functionality)
    const quotePattern = /^> (.*)$/;
    const match = selectedText.match(quotePattern);

    if (match) {
        // Remove the blockquote format
        const quoteText = match[1];
        newComment.value.content = before + quoteText + after;

        nextTick(() => {
            const newStart = start;
            const newEnd = start + quoteText.length;
            textarea.focus();
            textarea.setSelectionRange(newStart, newEnd);
        });
        return;
    }

    // Add the blockquote format
    const quoteText = selectedText || "Quote text";
    const quote = `> ${quoteText}`;

    // Add newline before if not at start and previous char isn't newline
    const needsNewlineBefore = start > 0 && before.charAt(before.length - 1) !== "\n";
    const insertion = (needsNewlineBefore ? "\n" : "") + quote;

    newComment.value.content = before + insertion + after;

    nextTick(() => {
        const newCursorPos = start + insertion.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
};

const insertCodeBlock = () => {
    const textarea = commentTextarea.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.value.content.substring(start, end);

    const codeText = selectedText || "code here";
    const codeBlock = `\`\`\`\n${codeText}\n\`\`\``;

    const before = newComment.value.content.substring(0, start);
    const after = newComment.value.content.substring(end);

    // Add newline before if not at start and previous char isn't newline
    const needsNewlineBefore = start > 0 && before.charAt(before.length - 1) !== "\n";
    const insertion = (needsNewlineBefore ? "\n" : "") + codeBlock;

    newComment.value.content = before + insertion + after;

    nextTick(() => {
        const codeStart = start + (needsNewlineBefore ? 1 : 0) + 4; // position after ```\n
        const codeEnd = codeStart + codeText.length;
        textarea.focus();
        textarea.setSelectionRange(codeStart, codeEnd);
    });
};

const loadComments = () => {
    const animeId = route?.params?.id as string;
    if (animeId) {
        const storageKey = `comments_${animeId}`;
        const savedComments = localStorage.getItem(storageKey);
        if (savedComments) {
            try {
                comments.value = JSON.parse(savedComments);
            } catch (error) {
                console.error("Error loading comments:", error);
                comments.value = [];
            }
        }
    }
};

// Lifecycle
onMounted(async () => {
    // Debugging: Log the ID from route and available anime IDs
    if (route?.params?.id) {
        console.log("Route ID:", route.params.id);
    }

    console.log(
        "Available anime IDs:",
        animeStore.animes.map(a => a.id)
    );

    // Ensure anime data is loaded
    if (animeStore.animes.length === 0) {
        await animeStore.fetchAnimes();
    }

    // Fetch anime data
    const fetchSuccess = await fetchAnimeData();

    // If anime doesn't exist, try to fetch data again
    if (!fetchSuccess || !animeData.value) {
        console.log("Trying to fetch anime data again...");
        // Force fetchAnimes to be called again
        await animeStore.fetchAnimes();
        // Try to fetch anime data again
        await fetchAnimeData();
    }

    // Load comments for this anime
    if (process.client) {
        loadComments();
    }
});
</script>

<style scoped>
/* Custom styles for markdown content */
.prose {
    color: #374151;
}

.dark .prose {
    color: #d1d5db;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
    color: #111827;
    margin-top: 1em;
    margin-bottom: 0.5em;
}

.dark .prose h1,
.dark .prose h2,
.dark .prose h3,
.dark .prose h4,
.dark .prose h5,
.dark .prose h6 {
    color: #f9fafb;
}

.prose p {
    margin-bottom: 0.75em;
    color: #374151;
}

.dark .prose p {
    color: #d1d5db;
}

.prose strong {
    color: #111827;
    font-weight: 600;
}

.dark .prose strong {
    color: #f9fafb;
}

.prose em {
    color: #374151;
    font-style: italic;
}

.dark .prose em {
    color: #d1d5db;
}

.prose code {
    background-color: rgba(156, 163, 175, 0.1);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
    color: #dc2626;
}

.dark .prose code {
    background-color: rgba(75, 85, 99, 0.3);
    color: #fca5a5;
}

.prose pre {
    background-color: rgba(156, 163, 175, 0.1);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1em 0;
    color: #374151;
}

.dark .prose pre {
    background-color: rgba(75, 85, 99, 0.3);
    color: #d1d5db;
}

.prose pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
}

.prose blockquote {
    border-left: 4px solid rgba(156, 163, 175, 0.3);
    padding-left: 1rem;
    margin: 1em 0;
    font-style: italic;
    color: #6b7280;
}

.dark .prose blockquote {
    border-left-color: rgba(156, 163, 175, 0.5);
    color: #9ca3af;
}

.prose ul,
.prose ol {
    margin: 0.75em 0;
    padding-left: 1.5rem;
    color: #374151;
}

.dark .prose ul,
.dark .prose ol {
    color: #d1d5db;
}

.prose li {
    margin: 0.25em 0;
    color: #374151;
}

.dark .prose li {
    color: #d1d5db;
}

.prose a {
    color: #3b82f6;
    text-decoration: underline;
}

.prose a:hover {
    color: #1d4ed8;
}

.dark .prose a {
    color: #60a5fa;
}

.dark .prose a:hover {
    color: #93c5fd;
}

.prose img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1em 0;
}

.prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
}

.prose th,
.prose td {
    border: 1px solid rgba(156, 163, 175, 0.3);
    padding: 0.5rem;
    text-align: left;
}

.prose th {
    background-color: rgba(156, 163, 175, 0.1);
    font-weight: 600;
}
</style>
