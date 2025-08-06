<template>
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-600 sticky top-0 z-50">
        <div class="container-extra-wide">
            <div class="flex items-center justify-between h-14 sm:h-16 px-2 sm:px-4">
                <!-- Logo and Navigation -->
                <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <NuxtLink to="/" class="flex items-center space-x-1 sm:space-x-2">
                        <div
                            class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md"
                        >
                            <span class="text-white font-bold text-xs sm:text-sm">AD</span>
                        </div>
                        <span class="text-base sm:text-lg font-bold text-gray-900 dark:text-white hidden sm:block"
                            >Anime Database</span
                        >
                    </NuxtLink>

                    <!-- Desktop Navigation -->
                    <nav class="hidden lg:flex space-x-3 xl:space-x-4">
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
                            to="/latest"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            active-class="text-blue-600 dark:text-blue-400"
                        >
                            Latest
                        </NuxtLink>
                        <NuxtLink
                            v-if="authStore?.isAuthenticated"
                            to="/posts"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            active-class="text-blue-600 dark:text-blue-400"
                        >
                            My Posts
                        </NuxtLink>
                    </nav>
                </div>

                <!-- Search and Actions -->
                <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <!-- Search Bar -->
                    <div v-if="!props.hideSearchAndFilter" class="hidden md:flex items-center space-x-2">
                        <!-- Category Dropdown -->
                        <div class="relative" ref="categoryDropdown">
                            <button
                                @click="toggleCategoryDropdown"
                                class="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-200 dark:border-gray-600 rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 min-w-[100px] sm:min-w-[140px] shadow-sm hover:shadow-md"
                                data-testid="category-select"
                            >
                                <div class="flex items-center gap-1 sm:gap-2 flex-1">
                                    <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                                    <span data-testid="selected-category" class="truncate font-medium">{{
                                        displaySelectedCategory
                                    }}</span>
                                </div>
                                <ChevronDownIcon
                                    class="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400 transition-transform duration-200 flex-shrink-0"
                                    :class="{ 'rotate-180': isCategoryDropdownOpen }"
                                />
                            </button>

                            <div
                                v-if="isCategoryDropdownOpen"
                                class="absolute left-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto backdrop-blur-sm"
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
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                v-model="searchQuery"
                                @input="updateSearch"
                                placeholder="Search anime..."
                                title="Advanced Search: Search across title, title_english, release_file_name, and submitter_name"
                                class="block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-xs sm:text-sm text-gray-900 dark:text-white min-w-[150px] sm:min-w-[200px]"
                                data-testid="search-input"
                            />
                        </div>
                    </div>

                    <!-- Theme Toggle -->
                    <button
                        @click="toggleTheme"
                        class="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        aria-label="Toggle theme"
                        data-testid="theme-toggle"
                    >
                        <SunIcon v-if="isDarkMode" class="h-4 w-4 sm:h-5 sm:w-5" />
                        <MoonIcon v-else class="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    <!-- User Menu (Desktop) -->
                    <div class="hidden md:block relative" ref="userMenuDropdown">
                        <button
                            v-if="authStore?.isAuthenticated"
                            @click="showUserMenu = !showUserMenu"
                            class="flex items-center space-x-2 p-1.5 sm:p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                            data-testid="user-menu-button"
                        >
                            <UserCircleIcon class="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <NuxtLink
                            v-else
                            to="/login"
                            class="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mr-1 sm:mr-2"
                            data-testid="login-button"
                        >
                            Login
                        </NuxtLink>
                        <NuxtLink
                            v-if="!authStore?.isAuthenticated"
                            to="/register"
                            class="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            data-testid="register-button"
                        >
                            Register
                        </NuxtLink>

                        <!-- User Dropdown Menu -->
                        <div
                            v-if="showUserMenu && authStore?.isAuthenticated"
                            class="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20"
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
                        class="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                        aria-label="Open menu"
                        data-testid="mobile-menu-button"
                    >
                        <Bars3Icon v-if="!showMobileMenu" class="h-5 w-5 sm:h-6 sm:w-6" />
                        <XMarkIcon v-else class="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div v-if="showMobileMenu" class="lg:hidden py-3 border-t border-gray-200 dark:border-gray-700">
                <div class="space-y-1 px-3 sm:px-4">
                    <NuxtLink
                        to="/"
                        class="block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        Home
                    </NuxtLink>
                    <NuxtLink
                        to="/browse"
                        class="block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        Browse
                    </NuxtLink>
                    <NuxtLink
                        to="/top-rated"
                        class="block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        Top Rated
                    </NuxtLink>
                    <NuxtLink
                        to="/latest"
                        class="block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        Latest
                    </NuxtLink>
                    <NuxtLink
                        v-if="authStore?.isAuthenticated"
                        to="/posts"
                        class="block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        active-class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        @click="showMobileMenu = false"
                    >
                        My Posts
                    </NuxtLink>
                </div>

                <!-- Mobile Search -->
                <div
                    v-if="!props.hideSearchAndFilter"
                    class="px-3 sm:px-4 pt-4 pb-3 border-t border-gray-200 dark:border-gray-700"
                >
                    <!-- Mobile Category Dropdown -->
                    <div class="relative mb-3" ref="mobileCategoryDropdown">
                        <button
                            @click="toggleCategoryDropdown"
                            class="flex items-center justify-between w-full gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors shadow-sm"
                        >
                            <span class="truncate font-medium">{{ displaySelectedCategory }}</span>
                            <ChevronDownIcon
                                class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
                                :class="{ 'rotate-180': isCategoryDropdownOpen }"
                            />
                        </button>

                        <div
                            v-if="isCategoryDropdownOpen"
                            class="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto"
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

                    <div class="mb-4">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                v-model="searchQuery"
                                @input="updateSearch"
                                placeholder="Search anime..."
                                title="Advanced Search: Search across title, title_english, release_file_name, and submitter_name"
                                class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm text-gray-900 dark:text-white shadow-sm"
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

            if (data && data.role === "admin") {
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

                if (data && data.role === "admin") {
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
