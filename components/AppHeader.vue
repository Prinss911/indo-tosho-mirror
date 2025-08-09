<template>
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-600 sticky top-0 z-50">
        <div class="container-extra-wide">
            <div class="flex items-center justify-between h-12 xs:h-14 sm:h-16 px-1 xs:px-2 sm:px-4 gap-2 sm:gap-4">
                <!-- Logo and Navigation -->
                <div class="flex items-center space-x-2 xs:space-x-3 sm:space-x-6 flex-shrink-0 min-w-0 max-w-[60%] lg:max-w-none">
                    <NuxtLink to="/" class="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 min-w-0">
                        <div
                            class="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                        >
                            <span class="text-white font-bold text-xs sm:text-sm">AD</span>
                        </div>
                        <span class="text-sm xs:text-base sm:text-lg font-bold text-gray-900 dark:text-white hidden xs:block truncate"
                            >Anime Database</span
                        >
                    </NuxtLink>

                    <!-- Desktop Navigation -->
                    <nav class="hidden md:flex space-x-6 lg:space-x-8 xl:space-x-10 2xl:space-x-12">
                        <NuxtLink
                            to="/"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            active-class="text-blue-600 dark:text-blue-400"
                        >
                            Home
                        </NuxtLink>
                        <NuxtLink
                            to="/browse"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            active-class="text-blue-600 dark:text-blue-400"
                        >
                            Browse
                        </NuxtLink>
                        <NuxtLink
                            to="/top-rated"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            active-class="text-blue-600 dark:text-blue-400"
                        >
                            Top Rated
                        </NuxtLink>
                        <NuxtLink
                            v-if="authStore?.isAuthenticated"
                            to="/posts"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            active-class="text-blue-600 dark:text-blue-400"
                        >
                            My Posts
                        </NuxtLink>
                        <a
                            href="https://discord.gg/za7XeBK8tS"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-2"
                            aria-label="Join Discord"
                            data-testid="discord-nav-link"
                            title="Join our Discord community"
                        >
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            <span class="hidden lg:inline">Discord</span>
                        </a>
                    </nav>
                </div>

                <!-- Search and Actions -->
                <div class="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0 min-w-0 max-w-[40%] lg:max-w-none">
                    <!-- Search Bar -->
                    <div v-if="!props.hideSearchAndFilter" class="hidden sm:flex items-center space-x-2 lg:space-x-3 min-w-0 mr-2 lg:mr-4 flex-1">
                        <!-- Category Dropdown -->
                        <div class="relative flex-shrink-0" ref="categoryDropdown">
                            <button
                                @click="toggleCategoryDropdown"
                                class="flex items-center gap-1 lg:gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-200 dark:border-gray-600 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 min-w-[80px] lg:min-w-[120px] max-w-[120px] lg:max-w-[160px] shadow-sm hover:shadow-md"
                                data-testid="category-select"
                            >
                                <div class="flex items-center gap-1 lg:gap-1.5 flex-1 min-w-0">
                                    <div class="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                    <span data-testid="selected-category" class="truncate font-medium text-xs lg:text-sm">{{
                                        displaySelectedCategory
                                    }}</span>
                                </div>
                                <ChevronDownIcon
                                    class="w-3 h-3 lg:w-4 lg:h-4 text-blue-500 dark:text-blue-400 transition-transform duration-200 flex-shrink-0"
                                    :class="{ 'rotate-180': isCategoryDropdownOpen }"
                                />
                            </button>

                            <div
                                v-if="isCategoryDropdownOpen"
                                class="absolute left-0 mt-2 w-48 sm:w-56 lg:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[9999] max-h-80 overflow-y-auto backdrop-blur-sm"
                                data-testid="category-dropdown"
                            >
                                <!-- All Categories Button -->
                                <button
                                    @click="selectCategory('all')"
                                    :class="[
                                        'w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 first:rounded-t-xl',
                                        selectedCategory === 'all'
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                                    ]"
                                    data-testid="main-category-all"
                                >
                                    <div
                                        :class="[
                                            'w-2 h-2 rounded-full flex-shrink-0',
                                            selectedCategory === 'all'
                                                ? 'bg-blue-500 dark:bg-blue-400'
                                                : 'bg-gray-400 dark:bg-gray-500'
                                        ]"
                                    ></div>
                                    <span>Semua Kategori</span>
                                </button>

                                <!-- Grouped Categories with Enhanced Hierarchy -->
                                <template v-for="parentCategory in parentCategories" :key="parentCategory.id">
                                    <!-- Parent Category Header -->
                                    <div
                                        class="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600"
                                    >
                                        <div class="flex items-center gap-2">
                                            <div class="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                            <span
                                                class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                                                >{{ parentCategory.name }}</span
                                            >
                                        </div>
                                    </div>

                                    <!-- "Semua [Parent Category]" Option -->
                                    <button
                                        @click="selectCategory(parentCategory.id)"
                                        :class="[
                                            'w-full text-left px-6 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-3',
                                            selectedCategory === parentCategory.id
                                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                                        ]"
                                        :data-testid="`parent-category-${parentCategory.id}`"
                                    >
                                        <div
                                            :class="[
                                                'w-2 h-2 rounded-full flex-shrink-0',
                                                selectedCategory === parentCategory.id
                                                    ? 'bg-blue-500 dark:bg-blue-400'
                                                    : 'bg-gray-400 dark:bg-gray-500'
                                            ]"
                                        ></div>
                                        <span>Semua {{ parentCategory.name }}</span>
                                        <span class="ml-auto text-xs text-gray-400 dark:text-gray-500"
                                            >({{ getChildCategoriesCount(parentCategory.id) }})</span
                                        >
                                    </button>

                                    <!-- Child Categories -->
                                    <template
                                        v-for="childCategory in getChildCategories(parentCategory.id)"
                                        :key="childCategory.id"
                                    >
                                        <button
                                            @click="selectCategory(childCategory.id)"
                                            :class="[
                                                'w-full text-left pl-10 pr-4 py-2 text-sm transition-all duration-200 flex items-center gap-3 relative',
                                                selectedCategory === childCategory.id
                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                                            ]"
                                            :data-testid="`child-category-${childCategory.id}`"
                                        >
                                            <div
                                                class="absolute left-8 top-1/2 transform -translate-y-1/2 w-3 h-px bg-gray-300 dark:bg-gray-600"
                                            ></div>
                                            <div
                                                :class="[
                                                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                                                    selectedCategory === childCategory.id
                                                        ? 'bg-blue-500 dark:bg-blue-400'
                                                        : 'bg-gray-400 dark:bg-gray-500'
                                                ]"
                                            ></div>
                                            <span class="text-sm">{{ childCategory.name }}</span>
                                        </button>
                                    </template>
                                </template>
                            </div>
                        </div>

                        <!-- Search Input -->
                        <div class="relative flex-1 min-w-0 max-w-[180px] lg:max-w-[250px]">
                            <div class="absolute inset-y-0 left-0 pl-2 lg:pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon class="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                v-model="searchQuery"
                                @input="updateSearch"
                                placeholder="Search anime..."
                                title="Advanced Search: Search across title, title_english, release_file_name, and submitter_name"
                                class="block w-full pl-7 lg:pl-10 pr-2 lg:pr-3 py-1.5 lg:py-2 border border-gray-200 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-xs lg:text-sm text-gray-900 dark:text-white"
                                data-testid="search-input"
                            />
                        </div>
                    </div>

                    <!-- Theme Toggle -->
                    <button
                        @click="toggleTheme"
                        class="p-1.5 xs:p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0 ml-1 sm:ml-2"
                        aria-label="Toggle theme"
                        data-testid="theme-toggle"
                    >
                        <SunIcon v-if="isDarkMode" class="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                        <MoonIcon v-else class="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                    </button>

                    <!-- User Menu (Desktop) -->
                    <div class="hidden sm:block relative flex-shrink-0 ml-1 lg:ml-2" ref="userMenuDropdown">
                        <button
                            v-if="authStore?.isAuthenticated"
                            @click="showUserMenu = !showUserMenu"
                            class="flex items-center space-x-2 p-1 sm:p-1.5 lg:p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                            data-testid="user-menu-button"
                        >
                            <UserCircleIcon class="h-5 w-5 lg:h-6 lg:w-6" />
                        </button>
                        <div v-if="!authStore?.isAuthenticated" class="flex items-center space-x-2">
                            <NuxtLink
                                to="/login"
                                class="inline-flex items-center px-2 lg:px-3 py-1.5 lg:py-2 border border-transparent text-xs lg:text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                data-testid="login-button"
                            >
                                Login
                            </NuxtLink>
                            <NuxtLink
                                to="/register"
                                class="inline-flex items-center px-2 lg:px-3 py-1.5 lg:py-2 border border-transparent text-xs lg:text-sm font-medium rounded-lg shadow-sm text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                data-testid="register-button"
                            >
                                Register
                            </NuxtLink>
                        </div>

                        <!-- User Dropdown Menu -->
                        <div
                            v-if="showUserMenu && authStore?.isAuthenticated"
                            class="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                            data-testid="user-menu"
                        >
                            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                                <div class="text-xs text-gray-500 dark:text-gray-400">Signed in as</div>
                                <div class="font-medium text-gray-900 dark:text-white text-sm truncate">
                                    {{ authStore.user?.email }}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Role:
                                    <span class="font-medium capitalize text-blue-600 dark:text-blue-400">{{
                                        isAdminUser ? "admin" : (authStore.user?.role ?? "user")
                                    }}</span>
                                </div>
                            </div>
                            <div class="py-1">
                                <NuxtLink
                                    v-if="isAdminUser"
                                    to="/admin"
                                    @click="showUserMenu = false"
                                    class="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    data-testid="admin-link"
                                >
                                    <ShieldCheckIcon class="mr-3 h-4 w-4 text-gray-400" />
                                    Admin Panel
                                </NuxtLink>
                                <button
                                    @click="handleLogout"
                                    class="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    data-testid="logout-button"
                                >
                                    <ArrowRightOnRectangleIcon class="mr-3 h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile menu button -->
                    <button
                        @click="showMobileMenu = !showMobileMenu"
                        class="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex-shrink-0 ml-1 sm:ml-2"
                        aria-label="Open menu"
                        data-testid="mobile-menu-button"
                    >
                        <Bars3Icon v-if="!showMobileMenu" class="h-5 w-5" />
                        <XMarkIcon v-else class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div v-if="showMobileMenu" class="md:hidden py-2 border-t border-gray-200 dark:border-gray-700">
                <div class="space-y-1 px-2">
                    <NuxtLink
                        to="/"
                        class="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        Home
                    </NuxtLink>
                    <NuxtLink
                        to="/browse"
                        class="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        Browse
                    </NuxtLink>
                    <NuxtLink
                        to="/top-rated"
                        class="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        Top Rated
                    </NuxtLink>

                    <NuxtLink
                        v-if="authStore?.isAuthenticated"
                        to="/posts"
                        class="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        My Posts
                    </NuxtLink>

                    <!-- Discord Link -->
                    <a
                        href="https://discord.gg/za7XeBK8tS"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        @click="showMobileMenu = false"
                        title="Join our Discord community"
                    >
                        <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        Discord
                    </a>
                </div>

                <!-- Mobile Search -->
                <div
                    v-if="!props.hideSearchAndFilter"
                    class="px-2 pt-3 pb-2 border-t border-gray-200 dark:border-gray-700"
                >
                    <!-- Mobile Category Dropdown -->
                    <div class="relative mb-2" ref="mobileCategoryDropdown">
                        <button
                            @click="toggleCategoryDropdown"
                            class="flex items-center justify-between w-full gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors shadow-sm"
                        >
                            <span class="truncate font-medium text-xs">{{ displaySelectedCategory }}</span>
                            <ChevronDownIcon
                                class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
                                :class="{ 'rotate-180': isCategoryDropdownOpen }"
                            />
                        </button>

                        <div
                            v-if="isCategoryDropdownOpen"
                            class="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] max-h-48 overflow-y-auto"
                        >
                            <!-- All Categories Button -->
                            <button
                                @click="selectCategory('all')"
                                :class="[
                                    'w-full text-left px-3 py-2 text-sm transition-colors',
                                    selectedCategory === 'all'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                ]"
                            >
                                Semua Kategori
                            </button>

                            <!-- Grouped Categories for Mobile -->
                            <template v-for="parentCategory in parentCategories" :key="parentCategory.id">
                                <!-- Parent Category Header -->
                                <div
                                    class="px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600"
                                >
                                    <span
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                                        >{{ parentCategory.name }}</span
                                    >
                                </div>

                                <!-- "Semua [Parent Category]" Option -->
                                <button
                                    @click="selectCategory(parentCategory.id)"
                                    :class="[
                                        'w-full text-left px-4 py-2 text-sm font-medium transition-colors',
                                        selectedCategory === parentCategory.id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    ]"
                                >
                                    Semua {{ parentCategory.name }}
                                </button>

                                <!-- Child Categories -->
                                <template
                                    v-for="childCategory in getChildCategories(parentCategory.id)"
                                    :key="childCategory.id"
                                >
                                    <button
                                        @click="selectCategory(childCategory.id)"
                                        :class="[
                                            'w-full text-left pl-6 pr-3 py-2 text-sm transition-colors',
                                            selectedCategory === childCategory.id
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        ]"
                                    >
                                        {{ childCategory.name }}
                                    </button>
                                </template>
                            </template>
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                v-model="searchQuery"
                                @input="updateSearch"
                                placeholder="Search anime..."
                                title="Advanced Search: Search across title, title_english, release_file_name, and submitter_name"
                                class="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm text-gray-900 dark:text-white shadow-sm"
                            />
                        </div>
                    </div>

                    <!-- Mobile User Actions -->
                    <div v-if="authStore?.isAuthenticated" class="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div class="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div class="text-xs text-gray-500 dark:text-gray-400">Signed in as</div>
                            <div class="font-medium text-gray-900 dark:text-white text-sm truncate">{{ authStore.user?.email }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Role:
                                <span class="font-medium capitalize text-blue-600 dark:text-blue-400">{{  
                                    isAdminUser ? "admin" : (authStore.user?.role ?? "user")
                                }}</span>
                            </div>
                        </div>
                        <NuxtLink
                            v-if="isAdminUser"
                            to="/admin"
                            @click="showMobileMenu = false"
                            class="flex items-center px-3 py-2.5 rounded-lg text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ShieldCheckIcon class="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            Admin Panel
                        </NuxtLink>
                        <button
                            @click="handleLogout"
                            class="flex items-center w-full text-left px-3 py-2.5 rounded-lg text-sm sm:text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <ArrowRightOnRectangleIcon class="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                            Sign out
                        </button>
                    </div>
                    <div v-else class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <NuxtLink
                            to="/login"
                            class="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                            @click="showMobileMenu = false"
                        >
                            Login
                        </NuxtLink>
                        <NuxtLink
                            to="/register"
                            class="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
                            @click="showMobileMenu = false"
                        >
                            Register
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useAnimeStore } from "~/stores/anime";
import { useAuthStore } from "~/stores/auth";
import { useTheme } from "~/composables/useTheme";
import { useRouter } from "vue-router";
import { useSupabase } from "~/services/supabaseClient";
import {
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    UserCircleIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    CheckIcon,
    ShieldCheckIcon
} from "@heroicons/vue/24/outline";

// Props
interface Props {
    hideSearchAndFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    hideSearchAndFilter: false
});

const animeStore = useAnimeStore();
const authStore = useAuthStore();
const router = useRouter();
const { isDarkMode, toggleTheme } = useTheme();

// Reactive state
const showMobileMenu = ref(false);
const showMobileSearch = ref(false);
const showUserMenu = ref(false);
const isCategoryDropdownOpen = ref(false);
const categoryDropdown = ref<HTMLElement | null>(null);
const mobileCategoryDropdown = ref<HTMLElement | null>(null);
const userMenuDropdown = ref<HTMLElement | null>(null);
const searchQuery = ref(animeStore.filter.search);
const isAdminUser = ref(false);

// Computed
const categories = computed(() => animeStore.categories);
const selectedCategory = computed(() => animeStore.filter.category);

// Enhanced computed properties for hierarchical categories
const parentCategories = computed(() => {
    return animeStore.categories.filter(cat => !cat.parent_id && cat.id !== "all");
});

const getChildCategories = (parentId: string) => {
    return animeStore.categories.filter(cat => cat.parent_id === parentId);
};

const getChildCategoriesCount = (parentId: string) => {
    return animeStore.categories.filter(cat => cat.parent_id === parentId).length;
};

const displaySelectedCategory = computed(() => {
    // Jika kategori adalah "all", tampilkan kategori dari database
    if (animeStore.filter.category === "all") {
        return "Semua Kategori";
    }

    // Cari kategori yang dipilih berdasarkan ID
    const category = animeStore.categories.find(cat => cat.id === animeStore.filter.category);

    if (!category) {
        return "Semua Kategori";
    }

    // Jika ini adalah subkategori, tampilkan dengan format "Parent > Subcategory"
    if (category.parent_id) {
        const parentCategory = animeStore.categories.find(cat => cat.id === category.parent_id);
        if (parentCategory) {
            return `${parentCategory.name} > ${category.name}`;
        }
    }

    // Jika kategori utama, tampilkan dengan prefix "Semua"
    if (!category.parent_id) {
        return `Semua ${category.name}`;
    }

    // Fallback
    return category.name;
});

// Methods
const updateSearch = () => {
    animeStore.updateFilter({ search: searchQuery.value });
};

// Watch untuk sinkronisasi searchQuery dengan store
watch(
    () => animeStore.filter.search,
    newSearch => {
        searchQuery.value = newSearch;
    }
);

const toggleCategoryDropdown = () => {
    isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
};

const selectCategory = (categoryId: string) => {
    // Enhanced category selection with hierarchical logic
    animeStore.updateFilter({ category: categoryId });
    isCategoryDropdownOpen.value = false;

    // Optional: Add analytics or logging for category selection
    console.log("Category selected:", categoryId);

    // Optional: Emit event for parent components
    // emit('category-changed', categoryId);
};

const handleClickOutside = (event: MouseEvent) => {
    if (categoryDropdown.value && !categoryDropdown.value.contains(event.target as Node)) {
        isCategoryDropdownOpen.value = false;
    }
    if (mobileCategoryDropdown.value && !mobileCategoryDropdown.value.contains(event.target as Node)) {
        isCategoryDropdownOpen.value = false;
    }
    if (userMenuDropdown.value && !userMenuDropdown.value.contains(event.target as Node)) {
        showUserMenu.value = false;
    }
};

const handleLogout = async () => {
    await authStore.logout();
    showUserMenu.value = false;
    showMobileMenu.value = false;
    router.push("/");
};

onMounted(async () => {
    document.addEventListener("click", handleClickOutside);

    // Fetch categories
    try {
        const categoriesData = await $fetch("/api/categories");
        animeStore.categories = categoriesData;
    } catch (error) {
        console.error("Error fetching categories:", error);
        animeStore.categories = [];
    }

    // Check authentication status
    await authStore.checkAuth();

    // Check if user is admin
    if (authStore.isAuthenticated) {
        // Force refresh user profile to get the latest role
        await authStore.checkAuth();

        // Directly check the database for the user's role
        const { client: supabase, user: supabaseUser } = useSupabase();
        if (supabaseUser.value) {
            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", supabaseUser.value.id)
                .single();

            console.log("Direct DB check - user ID:", supabaseUser.value.id);
            console.log("Direct DB check - profile data:", data);
            console.log("Direct DB check - profile error:", error);

            if (data && typeof data === 'object' && data !== null && 'role' in data && (data as { role: string }).role === "admin") {
                isAdminUser.value = true;
                // Force update the authStore user role
                if (authStore.user) {
                    authStore.user.role = "admin";
                }
            } else {
                isAdminUser.value = authStore.isAdmin;
            }
        }
        console.log("User role:", authStore.user?.role);
        console.log("isAdminUser value:", isAdminUser.value);
    }
});

// Watch for authentication changes
watch(
    () => authStore.isAuthenticated,
    async isAuthenticated => {
        if (isAuthenticated) {
            // Force refresh user profile to get the latest role
            await authStore.checkAuth();

            // Directly check the database for the user's role
            const { client: supabase, user: supabaseUser } = useSupabase();
            if (supabaseUser.value) {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", supabaseUser.value.id)
                    .single();

                console.log("Direct DB check (watch) - user ID:", supabaseUser.value.id);
                console.log("Direct DB check (watch) - profile data:", data);
                console.log("Direct DB check (watch) - profile error:", error);

                if (data && typeof data === 'object' && data && 'role' in (data as {role?: string}) && (data as {role: string}).role === "admin") {
                    isAdminUser.value = true;
                    // Force update the authStore user role
                    if (authStore.user) {
                        authStore.user.role = "admin";
                    }
                } else {
                    isAdminUser.value = authStore.isAdmin;
                }
            }
            console.log("User role after auth change:", authStore.user?.role);
            console.log("isAdminUser value after auth change:", isAdminUser.value);
        } else {
            isAdminUser.value = false;
        }
    }
);

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>
