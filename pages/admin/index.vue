<template>
    <ClientOnly>
        <div class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <!-- Header -->
            <div class="bg-white dark:bg-gray-800 shadow">
                <div class="container-extra-wide">
                    <div class="flex justify-between items-center py-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your anime database</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                                Welcome, {{ authStore.currentUser?.username }}
                            </span>
                            <BackButton to="/" label="Back to Site" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="container-extra-wide py-8">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <FilmIcon class="h-6 w-6 text-gray-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Anime
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ stats.totalAnime }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <EyeIcon class="h-6 w-6 text-gray-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Views
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ stats.totalViews.toLocaleString() }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <ArrowDownTrayIcon class="h-6 w-6 text-gray-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Downloads
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ stats.totalDownloads.toLocaleString() }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <HeartIcon class="h-6 w-6 text-gray-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Likes
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ stats.totalLikes.toLocaleString() }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Registration Settings -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                Registration Settings
                            </h3>
                            <UserPlusIcon class="h-6 w-6 text-indigo-500" />
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Control user registration availability
                        </p>
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-sm font-medium text-gray-900 dark:text-white">
                                    Registration Status
                                </span>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    {{
                                        registrationEnabled
                                            ? "Users can register new accounts"
                                            : "Registration is currently disabled"
                                    }}
                                </p>
                            </div>
                            <button
                                @click="toggleRegistration"
                                :disabled="isTogglingRegistration"
                                :class="[
                                    registrationEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                                ]"
                            >
                                <span class="sr-only">Toggle registration</span>
                                <span
                                    :class="[
                                        registrationEnabled ? 'translate-x-5' : 'translate-x-0',
                                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                    ]"
                                />
                            </button>
                        </div>
                        <div v-if="isTogglingRegistration" class="mt-2">
                            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                                Updating registration settings...
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notification Management -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                Notification Management
                            </h3>
                            <BellIcon class="h-6 w-6 text-yellow-500" />
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Kelola notifikasi yang ditampilkan kepada pengguna
                        </p>

                        <!-- Current Notifications Display -->
                        <div v-if="currentNotifications.length > 0" class="mb-4 space-y-3">
                            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notifikasi Aktif ({{ currentNotifications.length }})
                            </h3>
                            <div
                                v-for="notification in currentNotifications"
                                :key="notification.id"
                                class="p-4 rounded-lg border"
                                :class="{
                                    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800':
                                        notification.type === 'info',
                                    'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800':
                                        notification.type === 'warning',
                                    'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800':
                                        notification.type === 'success',
                                    'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800':
                                        notification.type === 'error'
                                }"
                            >
                                <div class="flex items-start justify-between">
                                    <div class="flex items-start">
                                        <div class="flex-shrink-0">
                                            <InformationCircleIcon
                                                v-if="notification.type === 'info'"
                                                class="h-5 w-5 text-blue-400"
                                            />
                                            <ExclamationTriangleIcon
                                                v-else-if="notification.type === 'warning'"
                                                class="h-5 w-5 text-yellow-400"
                                            />
                                            <CheckCircleIcon
                                                v-else-if="notification.type === 'success'"
                                                class="h-5 w-5 text-green-400"
                                            />
                                            <XCircleIcon
                                                v-else-if="notification.type === 'error'"
                                                class="h-5 w-5 text-red-400"
                                            />
                                        </div>
                                        <div class="ml-3">
                                            <p
                                                class="text-sm font-medium"
                                                :class="{
                                                    'text-blue-800 dark:text-blue-200': notification.type === 'info',
                                                    'text-yellow-800 dark:text-yellow-200':
                                                        notification.type === 'warning',
                                                    'text-green-800 dark:text-green-200':
                                                        notification.type === 'success',
                                                    'text-red-800 dark:text-red-200': notification.type === 'error'
                                                }"
                                            >
                                                {{ notification.message }}
                                            </p>
                                            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Lokasi: {{ getPageLocationLabel(notification.page_location) }} | Dibuat:
                                                {{ formatDate(notification.created_at) }}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        @click="confirmDeleteNotification(notification)"
                                        :disabled="isDeletingNotification"
                                        class="ml-3 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                    >
                                        <XMarkIcon class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            v-else
                            class="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        >
                            <p class="text-sm text-gray-600 dark:text-gray-400">Tidak ada notifikasi aktif saat ini</p>
                        </div>

                        <!-- Notification Form -->
                        <div class="space-y-4">
                            <div>
                                <label
                                    for="notification-message"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Pesan Notifikasi
                                </label>
                                <textarea
                                    id="notification-message"
                                    v-model="notificationForm.message"
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Masukkan pesan notifikasi..."
                                ></textarea>
                            </div>

                            <div>
                                <label
                                    for="notification-type"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Tipe Notifikasi
                                </label>
                                <select
                                    id="notification-type"
                                    v-model="notificationForm.type"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="info">Info (Biru)</option>
                                    <option value="warning">Peringatan (Kuning)</option>
                                    <option value="success">Sukses (Hijau)</option>
                                    <option value="error">Error (Merah)</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    for="notification-page"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Lokasi Halaman
                                </label>
                                <select
                                    id="notification-page"
                                    v-model="notificationForm.page_location"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="all">Semua Halaman</option>
                                    <option value="admin">Halaman Admin</option>
                                    <option value="posts/create">Halaman Buat Postingan</option>
                                    <option value="posts/index">Halaman Daftar Postingan</option>
                                    <option value="register">Halaman Registrasi</option>
                                    <option value="login">Halaman Login</option>
                                    <option value="index">Halaman Utama</option>
                                </select>
                            </div>

                            <div class="flex space-x-3">
                                <button
                                    @click="saveNotification"
                                    :disabled="!notificationForm.message.trim() || isSavingNotification"
                                    class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <div
                                        v-if="isSavingNotification"
                                        class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                    ></div>
                                    {{ isSavingNotification ? "Menyimpan..." : "Simpan Notifikasi" }}
                                </button>

                                <button
                                    @click="clearNotificationForm"
                                    type="button"
                                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Management Sections -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- User Management -->
                    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    User Management
                                </h3>
                                <UsersIcon class="h-6 w-6 text-blue-500" />
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Manage registered users, roles, and permissions
                            </p>
                            <div class="space-y-4">
                                <div v-if="!isDataReady" class="animate-pulse">
                                    <div class="flex justify-between text-sm mb-3">
                                        <span class="text-gray-600 dark:text-gray-400">Loading...</span>
                                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                    </div>
                                    <div class="flex justify-between text-sm mb-3">
                                        <span class="text-gray-600 dark:text-gray-400">Loading...</span>
                                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Loading...</span>
                                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Total Users:</span>
                                        <span class="font-medium text-gray-900 dark:text-white">{{
                                            userStats.total
                                        }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Active Users:</span>
                                        <span class="font-medium text-green-600 dark:text-green-400">{{
                                            userStats.active
                                        }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Admin Users:</span>
                                        <span class="font-medium text-purple-600 dark:text-purple-400">{{
                                            userStats.admins
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <NuxtLink
                                    to="/admin/users"
                                    class="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                    aria-label="Navigate to user management"
                                >
                                    <UsersIcon class="w-4 h-4 mr-2" aria-hidden="true" />
                                    Manage Users
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- Posts Management -->
                    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    Posts Management
                                </h3>
                                <FilmIcon class="h-6 w-6 text-green-500" />
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Manage anime posts and user submissions
                            </p>
                            <div class="space-y-3">
                                <div v-if="!isDataReady" class="animate-pulse">
                                    <div class="flex justify-between text-sm mb-3">
                                        <span class="text-gray-600 dark:text-gray-400">Loading...</span>
                                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                    </div>
                                    <div class="flex justify-between text-sm mb-3">
                                        <span class="text-gray-600 dark:text-gray-400">Loading...</span>
                                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Loading...</span>
                                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Total Posts:</span>
                                        <span class="font-medium text-gray-900 dark:text-white">{{
                                            postStats.total
                                        }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Published Posts:</span>
                                        <span class="font-medium text-green-600 dark:text-green-400">{{
                                            postStats.published || 0
                                        }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600 dark:text-gray-400">Pending Review:</span>
                                        <span class="font-medium text-orange-600 dark:text-orange-400">{{
                                            postStats.pending || 0
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <NuxtLink
                                    to="/admin/posts"
                                    class="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm"
                                    aria-label="Navigate to posts management"
                                >
                                    <FilmIcon class="w-4 h-4 mr-2" aria-hidden="true" />
                                    Manage Posts
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
                    <div class="px-4 py-5 sm:p-6">
                        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button
                                @click="refreshData"
                                :disabled="isLoading"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                                :aria-label="isLoading ? 'Refreshing data...' : 'Refresh data'"
                            >
                                <ArrowPathIcon
                                    class="w-4 h-4 mr-2"
                                    :class="{ 'animate-spin': isLoading }"
                                    aria-hidden="true"
                                />
                                {{ isLoading ? "Refreshing..." : "Refresh Data" }}
                            </button>

                            <button
                                @click="clearCache"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                aria-label="Clear application cache"
                            >
                                <TrashIcon class="w-4 h-4 mr-2" aria-hidden="true" />
                                Clear Cache
                            </button>

                            <button
                                @click="exportData"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                aria-label="Export application data"
                            >
                                <DocumentArrowDownIcon class="w-4 h-4 mr-2" aria-hidden="true" />
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                            <span class="text-sm text-gray-500 dark:text-gray-400"
                                >{{ recentActivity.length }} aktivitas</span
                            >
                        </div>
                        <div class="flow-root">
                            <ul role="list" class="-mb-8">
                                <!-- Always show first 3 activities -->
                                <li v-for="(activity, activityIdx) in visibleActivities" :key="activityIdx">
                                    <div class="relative pb-8">
                                        <span
                                            v-if="
                                                activityIdx !== visibleActivities.length - 1 ||
                                                (showAllActivities && activityIdx !== recentActivity.length - 1)
                                            "
                                            class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                                            aria-hidden="true"
                                        />
                                        <div class="relative flex space-x-3">
                                            <div>
                                                <span
                                                    :class="[
                                                        activity.iconBg,
                                                        'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800'
                                                    ]"
                                                >
                                                    <component
                                                        :is="activity.icon"
                                                        :class="[activity.iconColor, 'h-5 w-5']"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </div>
                                            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                                        {{ activity.content }}
                                                    </p>
                                                </div>
                                                <div
                                                    class="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
                                                >
                                                    <time>{{ activity.time }}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>

                            <!-- Show More/Less Button -->
                            <div v-if="recentActivity.length > 3" class="mt-4 text-center">
                                <button
                                    @click="toggleShowAllActivities"
                                    class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <ChevronDownIcon v-if="!showAllActivities" class="h-4 w-4 mr-1" />
                                    <ChevronUpIcon v-else class="h-4 w-4 mr-1" />
                                    {{
                                        showAllActivities
                                            ? `Tampilkan Lebih Sedikit`
                                            : `Tampilkan ${recentActivity.length - 3} Lainnya`
                                    }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>

    <!-- Delete Confirmation Modal -->
    <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click="cancelDelete"
    >
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
            <div class="mt-3 text-center">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20"
                >
                    <svg
                        class="h-6 w-6 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        ></path>
                    </svg>
                </div>
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-4">Konfirmasi Hapus</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus notifikasi ini?
                    </p>
                    <div v-if="notificationToDelete" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ notificationToDelete.message }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {{ getPageLocationLabel(notificationToDelete.page_location) }}
                        </p>
                    </div>
                    <p class="text-xs text-red-600 dark:text-red-400 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div class="flex gap-3 px-4 py-3">
                    <button
                        @click="cancelDelete"
                        class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        @click="confirmDelete"
                        :disabled="isDeletingNotification"
                        class="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span v-if="isDeletingNotification">Menghapus...</span>
                        <span v-else>Hapus</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useAnimeStore } from "~/stores/anime";
import { useSupabase } from "~/services/supabaseClient";
import {
    ArrowLeftIcon,
    FilmIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    HeartIcon,
    ArrowPathIcon,
    TrashIcon,
    DocumentArrowDownIcon,
    ChartBarIcon,
    ClockIcon,
    UserIcon,
    PlusIcon,
    PencilIcon,
    UsersIcon,
    UserPlusIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    BellIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon
} from "@heroicons/vue/24/outline";

// Middleware
definePageMeta({
    middleware: ["auth", "admin"]
});

const authStore = useAuthStore();
const animeStore = useAnimeStore();

// Reactive state
const isLoading = ref(true);
const isDataReady = ref(false);
const stats = ref({
    totalAnime: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalLikes: 0
});

// Registration settings state
const registrationEnabled = ref(true);
const isTogglingRegistration = ref(false);

// Notification state
const currentNotifications = ref([]);
const currentNotification = computed(() => {
    return currentNotifications.value.length > 0 ? currentNotifications.value[0] : null;
});
const notificationForm = ref({
    message: "",
    type: "info",
    page_location: "all"
});
const isSavingNotification = ref(false);
const isDeletingNotification = ref(false);

// Modal state
const showDeleteModal = ref(false);
const notificationToDelete = ref(null);

// Fetch stats directly from Supabase
const fetchStats = async () => {
    isLoading.value = true;
    try {
        const { client: supabase } = useSupabase();

        // Fetch posts from Supabase
        const { data, error } = await supabase.from("posts").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
            stats.value = {
                totalAnime: data.length,
                totalViews: data.reduce((sum, post) => sum + (post.views || 0), 0),
                totalDownloads: data.reduce((sum, post) => sum + (post.downloads || 0), 0),
                totalLikes: data.reduce((sum, post) => sum + (post.likes || 0), 0)
            };
        }
    } catch (error) {
        console.error("Error fetching stats:", error);
    } finally {
        isLoading.value = false;
    }
};

// Computed fallback to store data if direct fetch fails
const fallbackStats = computed(() => {
    const animes = animeStore.animes;
    return {
        totalAnime: animes.length,
        totalViews: animes.reduce((sum, anime) => sum + anime.views, 0),
        totalDownloads: animes.reduce((sum, anime) => sum + anime.downloads, 0),
        totalLikes: animes.reduce((sum, anime) => sum + anime.likes, 0)
    };
});

const userStats = ref({
    total: 0,
    active: 0,
    admins: 0
});

const postStats = ref({
    total: 0,
    published: 0,
    pending: 0
});

// Fetch all stats from API endpoint
const fetchAllStats = async () => {
    try {
        console.log("[fetchAllStats] Starting to fetch all stats from API...");

        const response = await $fetch("/api/admin/stats");

        console.log("[fetchAllStats] API response:", response);

        if (response && response.userStats) {
            console.log("[fetchAllStats] Previous userStats value:", userStats.value);
            userStats.value = response.userStats;
            console.log("[fetchAllStats] Updated userStats value:", userStats.value);
        } else {
            console.log("[fetchAllStats] No user stats in API response");
            userStats.value = { total: 0, active: 0, admins: 0 };
        }

        if (response && response.postStats) {
            console.log("[fetchAllStats] Previous postStats value:", postStats.value);
            postStats.value = response.postStats;
            console.log("[fetchAllStats] Updated postStats value:", postStats.value);
        } else {
            console.log("[fetchAllStats] No post stats in API response");
            postStats.value = { total: 0, published: 0, pending: 0 };
        }
    } catch (error) {
        console.error("[fetchAllStats] Error occurred:", error);
        // Set fallback values
        userStats.value = { total: 0, active: 0, admins: 0 };
        postStats.value = { total: 0, published: 0, pending: 0 };
        console.log("[fetchAllStats] Set fallback values for both stats");
    }
};

// Keep individual functions for backward compatibility
const fetchUserStats = () => fetchAllStats();
const fetchPostStats = () => fetchAllStats();

const recentActivity = ref([]);
const showAllActivities = ref(false);

// Computed property for visible activities
const visibleActivities = computed(() => {
    if (showAllActivities.value || recentActivity.value.length <= 3) {
        return recentActivity.value;
    }
    return recentActivity.value.slice(0, 3);
});

// Toggle function for showing all activities
const toggleShowAllActivities = () => {
    showAllActivities.value = !showAllActivities.value;
};

// Fetch recent activity from API endpoint (bypasses RLS)
const fetchRecentActivity = async () => {
    try {
        console.log("[fetchRecentActivity] Fetching recent activity from API...");

        const response = await $fetch("/api/admin/recent-activity");

        console.log("[fetchRecentActivity] API response:", response);

        if (response && response.success && response.data) {
            const activities = response.data.map(activity => {
                const icon = activity.type === "post" ? PlusIcon : UserIcon;
                const iconBg = activity.type === "post" ? "bg-green-500" : "bg-purple-500";

                return {
                    content: activity.content,
                    time: formatTimeAgo(new Date(activity.created_at)),
                    icon: icon,
                    iconBg: iconBg,
                    iconColor: "text-white",
                    timestamp: activity.timestamp
                };
            });

            recentActivity.value = activities;

            // If no activities found, add fallback
            if (recentActivity.value.length === 0) {
                recentActivity.value = [
                    {
                        content: "Welcome to Admin Dashboard",
                        time: "just now",
                        icon: PlusIcon,
                        iconBg: "bg-green-500",
                        iconColor: "text-white"
                    }
                ];
            }
        } else {
            console.log("[fetchRecentActivity] No data in API response, using fallback");
            throw new Error("No data received from API");
        }
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        // Fallback data if fetch fails
        recentActivity.value = [
            {
                content: 'New anime "Attack on Titan Final Season" added to database',
                time: "2 hours ago",
                icon: PlusIcon,
                iconBg: "bg-green-500",
                iconColor: "text-white"
            },
            {
                content: "Database cache cleared successfully",
                time: "4 hours ago",
                icon: TrashIcon,
                iconBg: "bg-blue-500",
                iconColor: "text-white"
            },
            {
                content: 'User "john_doe" registered',
                time: "6 hours ago",
                icon: UserIcon,
                iconBg: "bg-purple-500",
                iconColor: "text-white"
            }
        ];
    }
};

// Helper function to format time ago
const formatTimeAgo = date => {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
        return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
    } else if (diffHour > 0) {
        return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
    } else if (diffMin > 0) {
        return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
    } else {
        return "just now";
    }
};

// Methods
const refreshData = async () => {
    console.log("[refreshData] Starting refresh...");
    console.log("[refreshData] userStats before refresh:", userStats.value);

    isLoading.value = true;
    isDataReady.value = false;
    try {
        await Promise.all([
            animeStore.fetchAnimes(),
            fetchStats(),
            fetchUserStats(),
            fetchPostStats(),
            fetchRecentActivity()
        ]);

        console.log("[refreshData] All data refreshed successfully");
        console.log("[refreshData] userStats after refresh:", userStats.value);

        isDataReady.value = true;
        // Add success notification here if you have a notification system
    } catch (error) {
        console.error("[refreshData] Failed to refresh data:", error);
        // Add error notification here
    } finally {
        isLoading.value = false;
        console.log("[refreshData] Refresh completed");
    }
};

const clearCache = () => {
    // Simulate cache clearing
    localStorage.removeItem("anime-cache");
    // Add success notification
    console.log("Cache cleared successfully");
};

const exportData = () => {
    // Simulate data export
    const data = {
        animes: animeStore.animes,
        stats: stats.value,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anime-database-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Registration settings functions
const fetchRegistrationStatus = async () => {
    try {
        const response = await $fetch("/api/settings/registration");
        if (response.success) {
            registrationEnabled.value = response.enabled;
        }
    } catch (error) {
        console.error("Error fetching registration status:", error);
        // Default to enabled on error
        registrationEnabled.value = true;
    }
};

const toggleRegistration = async () => {
    isTogglingRegistration.value = true;
    try {
        const newStatus = !registrationEnabled.value;
        const response = await $fetch("/api/settings/registration", {
            method: "POST",
            body: {
                enabled: newStatus
            }
        });

        if (response.success) {
            registrationEnabled.value = newStatus;
            console.log(response.message);
            // You can add a toast notification here if you have one
        } else {
            throw new Error("Failed to update registration status");
        }
    } catch (error) {
        console.error("Error toggling registration:", error);
        // You can add an error notification here
    } finally {
        isTogglingRegistration.value = false;
    }
};

// Notification management functions
const fetchCurrentNotifications = async () => {
    try {
        // Fetch all notifications for admin management
        const response = await $fetch("/api/admin/notifications", {
            query: { showAll: "true" }
        });
        if (response.success && response.data) {
            currentNotifications.value = response.data;
        } else {
            currentNotifications.value = [];
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
        currentNotifications.value = [];
    }
};

const saveNotification = async () => {
    if (!notificationForm.value.message.trim()) {
        showToast("Pesan notifikasi tidak boleh kosong", "error");
        return;
    }

    isSavingNotification.value = true;
    try {
        const response = await $fetch("/api/admin/notifications", {
            method: "POST",
            body: {
                message: notificationForm.value.message.trim(),
                type: notificationForm.value.type,
                page_location: notificationForm.value.page_location
            }
        });

        if (response.success) {
            // Refresh current notifications
            await fetchCurrentNotifications();
            // Clear form
            clearNotificationForm();
            showToast("Notifikasi berhasil disimpan", "success");
        } else {
            throw new Error(response.error || "Failed to save notification");
        }
    } catch (error) {
        console.error("Error saving notification:", error);
        showToast("Gagal menyimpan notifikasi", "error");
    } finally {
        isSavingNotification.value = false;
    }
};

// Toast function
const showToast = (message, type = "info") => {
    const { $toast } = useNuxtApp();
    if ($toast) {
        $toast.show({
            message,
            type,
            duration: 3000
        });
    }
};

// Modal functions
const confirmDeleteNotification = notification => {
    notificationToDelete.value = notification;
    showDeleteModal.value = true;
};

const cancelDelete = () => {
    showDeleteModal.value = false;
    notificationToDelete.value = null;
};

const confirmDelete = async () => {
    if (notificationToDelete.value) {
        await deleteNotification(notificationToDelete.value.id);
        showDeleteModal.value = false;
        notificationToDelete.value = null;
    }
};

const deleteNotification = async notificationId => {
    if (!notificationId) return;

    isDeletingNotification.value = true;
    try {
        const response = await $fetch(`/api/admin/notifications?id=${encodeURIComponent(notificationId)}`, {
            method: "DELETE"
        });

        if (response.success) {
            // Remove the deleted notification from the list
            currentNotifications.value = currentNotifications.value.filter(n => n.id !== notificationId);
            showToast("Notifikasi berhasil dihapus", "success");
        } else {
            throw new Error(response.error || "Failed to delete notification");
        }
    } catch (error) {
        console.error("Error deleting notification:", error);
        showToast("Gagal menghapus notifikasi", "error");
    } finally {
        isDeletingNotification.value = false;
    }
};

const clearNotificationForm = () => {
    notificationForm.value = {
        message: "",
        type: "info",
        page_location: "all"
    };
};

// Helper function to format date
const formatDate = dateString => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

// Helper function to get page location label
const getPageLocationLabel = pageLocation => {
    const labels = {
        all: "Semua Halaman",
        admin: "Halaman Admin",
        "posts/create": "Halaman Buat Postingan",
        "posts/index": "Halaman Daftar Postingan",
        register: "Halaman Registrasi",
        login: "Halaman Login",
        index: "Halaman Utama"
    };
    return labels[pageLocation] || pageLocation;
};

// Initialize
onMounted(async () => {
    try {
        // Fetch anime data if not already loaded
        if (animeStore.animes.length === 0) {
            await animeStore.fetchAnimes();
        }

        // Fetch notifications first
        await fetchCurrentNotifications();

        // Fetch all data from Supabase in parallel
        await Promise.all([
            fetchStats(),
            fetchUserStats(),
            fetchPostStats(),
            fetchRecentActivity(),
            fetchRegistrationStatus()
        ]);

        isDataReady.value = true;
    } catch (error) {
        console.error("[onMounted] Error during data initialization:", error);
    } finally {
        isLoading.value = false;
        console.log("[onMounted] isLoading set to false");
    }
});
</script>
