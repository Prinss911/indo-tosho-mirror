<template>
    <ClientOnly>
        <div class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <!-- Header -->
            <div class="bg-white dark:bg-gray-800 shadow">
                <div class="container-extra-wide">
                    <div class="flex justify-between items-center py-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Posts Management</h1>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage anime posts and user submissions
                            </p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <BackButton to="/admin" label="Back to Dashboard" />
                            <button
                                @click="showAddPostModal = true"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                aria-label="Add new post"
                            >
                                <PlusIcon class="w-4 h-4 mr-2" aria-hidden="true" />
                                Add Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="container-extra-wide py-8">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div
                        class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <FilmIcon class="h-6 w-6 text-blue-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Posts
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ posts.length }}
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
                                    <CheckCircleIcon class="h-6 w-6 text-green-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Published
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ publishedPosts }}
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
                                    <ClockIcon class="h-6 w-6 text-yellow-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Pending
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ pendingPosts }}
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
                                    <XCircleIcon class="h-6 w-6 text-red-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Rejected
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                                            {{ rejectedPosts }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Posts
                                </label>
                                <input
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Search by title or submitter..."
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-150"
                                    aria-label="Search posts by title or submitter"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filter by Status
                                </label>
                                <select
                                    v-model="selectedStatus"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-150"
                                    aria-label="Filter posts by status"
                                >
                                    <option value="">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filter by Category
                                </label>
                                <select
                                    v-model="selectedCategory"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-150"
                                    aria-label="Filter posts by category"
                                >
                                    <option value="">All Categories</option>
                                    <option
                                        v-for="category in hierarchicalCategories"
                                        :key="category.id"
                                        :value="category.name"
                                    >
                                        {{ category.displayName }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort by
                                </label>
                                <select
                                    v-model="sortBy"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-150"
                                    aria-label="Sort posts by criteria"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="title">Title A-Z</option>
                                    <option value="views">Most Views</option>
                                    <option value="downloads">Most Downloads</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Posts List -->
                <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Daftar Postingan ({{ filteredPosts.length }})
                        </h3>
                    </div>

                    <div v-if="filteredPosts.length === 0" class="text-center py-12">
                        <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
                        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada postingan</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {{
                                searchQuery || selectedStatus || selectedCategory.value
                                    ? "Tidak ada postingan yang sesuai dengan filter"
                                    : "Belum ada postingan yang disubmit"
                            }}
                        </p>
                    </div>

                    <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                        <li
                            v-for="post in filteredPosts"
                            :key="post.id"
                            class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4 flex-1 min-w-0">
                                    <!-- Cover Image -->
                                    <div class="flex-shrink-0">
                                        <img
                                            :src="post.cover ?? '/placeholder-anime.jpg'"
                                            :alt="post.title"
                                            class="h-16 w-12 object-cover rounded"
                                        />
                                    </div>

                                    <!-- Post Info -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center space-x-2">
                                            <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {{ post.releaseFileName || post.title }}
                                            </h4>
                                            <span
                                                class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                                                :class="{
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                                                        post.statusApproval === 'published',
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                                                        post.statusApproval === 'pending',
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                                                        post.statusApproval === 'rejected'
                                                }"
                                            >
                                                {{ formatStatus(post.statusApproval) }}
                                            </span>
                                        </div>
                                        <div
                                            class="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            <span class="flex items-center">
                                                <TagIcon class="h-3 w-3 mr-1" />
                                                {{ post.category }}
                                            </span>
                                            <span class="flex items-center">
                                                <FilmIcon class="h-3 w-3 mr-1" />
                                                {{ post.episodes }} episode
                                            </span>
                                            <span class="flex items-center">
                                                <CalendarIcon class="h-3 w-3 mr-1" />
                                                {{ post.year }}
                                            </span>
                                            <span class="flex items-center">
                                                <StarIcon class="h-3 w-3 mr-1" />
                                                {{ post.rating }}/10
                                            </span>
                                            <span class="flex items-center">
                                                <UserIcon class="h-3 w-3 mr-1" />
                                                {{ post.submitter }}
                                            </span>
                                        </div>
                                        <div
                                            class="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400"
                                        >
                                            <span class="flex items-center">
                                                <EyeIcon class="h-3 w-3 mr-1" />
                                                {{ post.views.toLocaleString() }} views
                                            </span>
                                            <span class="flex items-center">
                                                <HeartIcon class="h-3 w-3 mr-1" />
                                                {{ post.likes.toLocaleString() }} likes
                                            </span>
                                            <span class="flex items-center">
                                                <ArrowDownTrayIcon class="h-3 w-3 mr-1" />
                                                {{ post.downloads.toLocaleString() }} downloads
                                            </span>
                                            <span> Dibuat {{ formatDate(post.createdAt) }} </span>
                                            <span v-if="post.submittedAt">
                                                • Submit {{ formatDate(post.submittedAt) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="flex items-center space-x-2">
                                    <button
                                        @click="viewPost(post)"
                                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 action-btn"
                                        title="Lihat Detail"
                                    >
                                        <DocumentTextIcon class="h-4 w-4" />
                                    </button>
                                    
                                    <!-- Edit Dropdown Menu -->
                                    <Menu as="div" class="relative inline-block text-left">
                                        <MenuButton
                                            class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 action-btn"
                                            title="Edit Options"
                                        >
                                            <PencilIcon class="h-4 w-4" />
                                        </MenuButton>
                                        <transition
                                            enter-active-class="transition ease-out duration-100"
                                            enter-from-class="transform opacity-0 scale-95"
                                            enter-to-class="transform opacity-100 scale-100"
                                            leave-active-class="transition ease-in duration-75"
                                            leave-from-class="transform opacity-100 scale-100"
                                            leave-to-class="transform opacity-0 scale-95"
                                        >
                                            <MenuItems
                                                class="absolute right-0 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 mt-2 min-w-[200px]"
                                            >
                                                <div class="px-2 py-2">
                                                    <MenuItem v-slot="{ active }">
                                                        <button
                                                            @click="editPost(post)"
                                                            :class="[
                                                                active
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'text-gray-900 dark:text-gray-100',
                                                                'group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150'
                                                            ]"
                                                        >
                                                            <PencilIcon
                                                                class="mr-3 h-4 w-4 flex-shrink-0"
                                                                :class="
                                                                    active ? 'text-white' : 'text-green-500'
                                                                "
                                                            />
                                                            <span class="whitespace-nowrap">Edit Postingan</span>
                                                        </button>
                                                    </MenuItem>
                                                    <MenuItem v-slot="{ active }">
                                                        <button
                                                            @click="showRejectModal(post)"
                                                            :class="[
                                                                active
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'text-gray-900 dark:text-gray-100',
                                                                'group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150'
                                                            ]"
                                                        >
                                                            <XCircleIcon
                                                                class="mr-3 h-4 w-4 flex-shrink-0"
                                                                :class="
                                                                    active ? 'text-white' : 'text-red-500'
                                                                "
                                                            />
                                                            <span class="whitespace-nowrap">Reject dengan Alasan</span>
                                                        </button>
                                                    </MenuItem>
                                                </div>
                                            </MenuItems>
                                        </transition>
                                    </Menu>
 
                                    <Menu as="div" class="relative inline-block text-left" v-if="post.statusApproval === 'pending'">
                                        <MenuButton
                                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 action-btn"
                                            title="More Actions"
                                        >
                                            <EllipsisVerticalIcon class="h-4 w-4" />
                                        </MenuButton>
                                        <transition
                                            enter-active-class="transition ease-out duration-100"
                                            enter-from-class="transform opacity-0 scale-95"
                                            enter-to-class="transform opacity-100 scale-100"
                                            leave-active-class="transition ease-in duration-75"
                                            leave-from-class="transform opacity-100 scale-100"
                                            leave-to-class="transform opacity-0 scale-95"
                                        >
                                            <MenuItems
                                                class="absolute right-0 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 mt-2"
                                            >
                                                <div class="px-1 py-1">
                                                    <MenuItem v-slot="{ active }">
                                                        <button
                                                            @click="approvePost(post)"
                                                            :class="[
                                                                active
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'text-gray-900 dark:text-gray-100',
                                                                'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                                            ]"
                                                        >
                                                            <CheckCircleIcon
                                                                class="mr-2 h-5 w-5"
                                                                :class="
                                                                    active ? 'text-white' : 'text-emerald-500'
                                                                "
                                                            />
                                                            Approve Post
                                                        </button>
                                                    </MenuItem>
                                                    <MenuItem v-slot="{ active }">
                                                        <button
                                                            @click="rejectPost(post)"
                                                            :class="[
                                                                active
                                                                    ? 'bg-orange-500 text-white'
                                                                    : 'text-gray-900 dark:text-gray-100',
                                                                'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                                            ]"
                                                        >
                                                            <XCircleIcon
                                                                class="mr-2 h-5 w-5"
                                                                :class="
                                                                    active
                                                                        ? 'text-white'
                                                                        : 'text-orange-500'
                                                                "
                                                            />
                                                            Reject Post
                                                        </button>
                                                    </MenuItem>
                                                </div>
                                            </MenuItems>
                                        </transition>
                                    </Menu>
                                    <button
                                        @click="deletePost(post)"
                                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 action-btn"
                                        title="Hapus Postingan"
                                    >
                                        <TrashIcon class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <!-- Rejection Reason (if rejected) -->
                            <div
                                v-if="post.statusApproval === 'rejected'"
                                class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
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
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Add Post Modal -->
            <div
                v-if="showAddPostModal"
                class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            >
                <div
                    class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800"
                >
                    <div class="mt-3">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Post</h3>
                        <form @submit.prevent="addPost" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Title
                                    </label>
                                    <input
                                        v-model="newPost.title"
                                        type="text"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        v-model="newPost.category"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option
                                            v-for="category in hierarchicalCategories"
                                            :key="category.id"
                                            :value="category.name"
                                        >
                                            {{ category.displayName }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Episodes
                                    </label>
                                    <input
                                        v-model.number="newPost.episodes"
                                        type="number"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Year
                                    </label>
                                    <input
                                        v-model.number="newPost.year"
                                        type="number"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rating
                                    </label>
                                    <input
                                        v-model.number="newPost.rating"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cover Image URL
                                </label>
                                <input
                                    v-model="newPost.cover"
                                    type="url"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Release File Name
                                </label>
                                <input
                                    v-model="newPost.releaseFileName"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Nama file rilis (opsional)"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    v-model="newPost.description"
                                    rows="4"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                ></textarea>
                            </div>

                            <div class="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    @click="showAddPostModal = false"
                                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Add Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>



            <!-- Delete Confirmation Modal -->
            <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                    <div class="mt-3">
                        <div
                            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4"
                        >
                            <TrashIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center mb-4">Hapus Postingan</h3>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <p class="mb-3 text-center">
                                Anda akan menghapus postingan <strong>{{ postToDelete?.title }}</strong>
                            </p>
                            <div
                                class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4"
                            >
                                <p class="text-red-800 dark:text-red-200 text-xs">
                                    ⚠️ <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Postingan akan dihapus permanen.
                                </p>
                            </div>
                            <p class="mb-2 font-medium">
                                Ketik
                                <code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{{ postToDelete?.title }}</code>
                                untuk konfirmasi:
                            </p>
                            <input
                                v-model="deleteConfirmationText"
                                type="text"
                                placeholder="Ketik judul postingan untuk konfirmasi"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                        </div>
                        <div class="flex justify-center space-x-3">
                            <button
                                type="button"
                                @click="cancelDelete"
                                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                @click="confirmDelete"
                                :disabled="!isDeleteConfirmationValid || isDeleting"
                                :class="[
                                    'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors',
                                    isDeleteConfirmationValid && !isDeleting
                                        ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                ]"
                            >
                                <span v-if="isDeleting" class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menghapus...
                                </span>
                                <span v-else>Hapus Postingan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reject Post Modal -->
            <div v-if="showRejectPostModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                    <div class="mt-3">
                        <div
                            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4"
                        >
                            <XCircleIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center mb-4">Tolak Postingan</h3>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <p class="mb-3 text-center">
                                Anda akan menolak postingan <strong>{{ postToReject?.title }}</strong>
                            </p>
                            <div
                                class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3 mb-4"
                            >
                                <p class="text-orange-800 dark:text-orange-200 text-xs">
                                    ℹ️ <strong>Info:</strong> Postingan akan ditandai sebagai ditolak dan pengguna akan menerima notifikasi.
                                </p>
                            </div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Alasan Penolakan <span class="text-red-500">*</span>
                            </label>
                            <textarea
                                v-model="rejectionReason"
                                rows="4"
                                placeholder="Jelaskan alasan mengapa postingan ini ditolak..."
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                            ></textarea>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Minimal 10 karakter ({{ rejectionReason.length }}/10)
                            </p>
                        </div>
                        <div class="flex justify-center space-x-3">
                            <button
                                type="button"
                                @click="cancelReject"
                                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                @click="confirmReject"
                                :disabled="!isRejectReasonValid"
                                :class="[
                                    'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors',
                                    isRejectReasonValid
                                        ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                ]"
                            >
                                Tolak Postingan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSupabase } from "~/services/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useAnimeStore } from "~/stores/anime";
import { useApi } from "~/composables/useApi";
import { useToast } from "vue-toastification";
import {
    ArrowLeftIcon,
    PlusIcon,
    FilmIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    HeartIcon,
    StarIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    TrashIcon,
    DocumentTextIcon,
    TagIcon,
    CalendarIcon,
    UserIcon,
    ExclamationTriangleIcon,
    EllipsisVerticalIcon
} from "@heroicons/vue/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

// Middleware
definePageMeta({
    middleware: ["auth", "admin"]
});

const router = useRouter();
const toast = useToast();

// Reactive state
const searchQuery = ref("");
const selectedStatus = ref("");
const selectedCategory = ref("");
const sortBy = ref("newest");
const showAddPostModal = ref(false);

const currentPage = ref(1);
const itemsPerPage = ref(10);
const newPost = ref({
    title: "",
    category: "",
    episodes: 12,
    year: new Date().getFullYear(),
    rating: 8.0,
    cover: "",
    description: "",
    releaseFileName: ""
});


// Posts data from API
const posts = ref([]);
// Categories data from API
const categories = ref([]);

// Delete confirmation modal
const showDeleteModal = ref(false);
const postToDelete = ref(null);
const deleteConfirmationText = ref("");

// Reject post modal
const showRejectPostModal = ref(false);
const postToReject = ref(null);
const rejectionReason = ref("");

// Computed property for delete confirmation validation
const isDeleteConfirmationValid = computed(() => {
    return deleteConfirmationText.value === postToDelete.value?.title;
});

// Computed property for reject reason validation
const isRejectReasonValid = computed(() => {
    return rejectionReason.value.trim().length >= 10;
});

// Computed property untuk hirarki kategori
const hierarchicalCategories = computed(() => {
    const categoryMap = new Map();
    const rootCategories = [];

    // Buat map dari semua kategori
    categories.value.forEach(category => {
        categoryMap.set(category.id, {
            ...category,
            children: []
        });
    });

    // Organisir hirarki
    categories.value.forEach(category => {
        if (category.parent_id) {
            const parent = categoryMap.get(category.parent_id);
            if (parent) {
                parent.children.push(categoryMap.get(category.id));
            }
        } else {
            rootCategories.push(categoryMap.get(category.id));
        }
    });

    // Urutkan berdasarkan display_order
    const sortCategories = cats => {
        cats.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        cats.forEach(cat => {
            if (cat.children.length > 0) {
                sortCategories(cat.children);
            }
        });
    };

    sortCategories(rootCategories);

    // Flatten untuk dropdown dengan indentasi
    const flattenWithIndent = (cats, level = 0) => {
        const result = [];
        cats.forEach(cat => {
            result.push({
                ...cat,
                displayName: "\u00A0".repeat(level * 4) + cat.name,
                level
            });
            if (cat.children.length > 0) {
                result.push(...flattenWithIndent(cat.children, level + 1));
            }
        });
        return result;
    };

    return flattenWithIndent(rootCategories);
});

// Function to fetch posts from API
const fetchPosts = async () => {
    try {
        const { getAllPosts } = useApi();

        // Fetch posts from API
        const fetchedPosts = await getAllPosts();

        if (fetchedPosts) {
            // Transform data for UI if needed
            posts.value = fetchedPosts.map(post => ({
                id: post.id,
                title: post.title,
                category: post.category,
                submitter: post.submitterName || "Unknown",
                status: post.status || "pending",
                statusApproval: post.statusApproval || "pending",
                episodes: post.episodes || 0,
                year: post.year || new Date().getFullYear(),
                rating: post.rating || 0,
                cover: post.cover || "",
                description: post.description || "",
                views: post.views || 0,
                downloads: post.downloads || 0,
                likes: post.likes || 0,
                submittedAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                // Add new properties
                downloadLinks: post.downloadLinks || [],
                subtitleType: post.subtitleType || "",
                releaseFileName: post.releaseFileName || ""
            }));

            console.log("Posts fetched successfully");
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        alert(`Failed to fetch posts: ${error.message || "Unknown error"}`);
    }
};

// Function to fetch categories from API
const fetchCategories = async () => {
    try {
        const response = await $fetch("/api/categories");

        if (response) {
            categories.value = response;

            console.log("Categories fetched successfully:", categories.value);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        alert(`Failed to fetch categories: ${error.message || "Unknown error"}`);
    }
};

// Initialize
onMounted(async () => {
    // Fetch categories and posts from API
    await fetchCategories();
    await fetchPosts();
});

// Helper function to check if a category is child of selected parent
const isChildCategory = (postCategory, selectedCategory) => {
    if (!selectedCategory || !postCategory) return false;

    // Find the selected category object
    const selectedCat = categories.value.find(cat => cat.name === selectedCategory);
    if (!selectedCat) return false;

    // Find the post category object
    const postCat = categories.value.find(cat => cat.name === postCategory);
    if (!postCat) return false;

    // Check if post category is a child of selected category
    return postCat.parent_id === selectedCat.id;
};

// Computed
const filteredPosts = computed(() => {
    let filtered = posts.value.filter(post => {
        const matchesSearch =
            !searchQuery.value ||
            post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            post.submitter.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchesStatus = !selectedStatus.value || post.statusApproval === selectedStatus.value;

        // Enhanced category filtering with hierarchy support
        const matchesCategory =
            !selectedCategory.value ||
            post.category === selectedCategory.value ||
            isChildCategory(post.category, selectedCategory.value);

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort
    switch (sortBy.value) {
        case "oldest":
            filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            break;
        case "title":
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "views":
            filtered.sort((a, b) => b.views - a.views);
            break;
        case "downloads":
            filtered.sort((a, b) => b.downloads - a.downloads);
            break;
        default: // newest
            filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtered;
});

const publishedPosts = computed(() => {
    return posts.value.filter(post => post.statusApproval === "published").length;
});

const pendingPosts = computed(() => {
    return posts.value.filter(post => post.statusApproval === "pending").length;
});

const rejectedPosts = computed(() => {
    return posts.value.filter(post => post.statusApproval === "rejected").length;
});

const totalPages = computed(() => {
    return Math.ceil(filteredPosts.value.length / itemsPerPage.value);
});

const paginatedPosts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredPosts.value.slice(start, end);
});

// Methods
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
};

const formatStatus = (status: string) => {
    switch (status) {
        case "published":
            return "Published";
        case "pending":
            return "Pending";
        case "rejected":
            return "Rejected";
        default:
            return status;
    }
};

const addPost = async () => {
    try {
        const { createPost } = useApi();
        const { getCurrentUser } = useSupabase();
        const currentUser = await getCurrentUser();

        // Prepare new post data
        const newPostData = {
            title: newPost.value.title,
            category: newPost.value.category,
            submitterId: currentUser?.id || "admin",
            submitterName: currentUser?.username || "Admin",
            status: "published", // Using "published" status to publish immediately
            episodes: newPost.value.episodes,
            year: newPost.value.year,
            rating: newPost.value.rating,
            cover: newPost.value.cover,
            description: newPost.value.description,
            genres: [],
            malId: 0,
            releaseFileName: newPost.value.releaseFileName,
            downloadLinks: [], // Empty array for downloadLinks
            subtitleType: "", // Empty string for subtitleType
            views: 0,
            downloads: 0,
            likes: 0
        };

        // Create post using API
        const createdPost = await createPost(newPostData);

        if (createdPost) {
            // Refresh posts list
            await fetchPosts();

            // Reset form
            newPost.value = {
                title: "",
                category: "Anime - Sudah diterjemahkan",
                episodes: 12,
                year: new Date().getFullYear(),
                rating: 8.0,
                cover: "",
                description: "",
                releaseFileName: ""
            };

            showAddPostModal.value = false;

            console.log("Post added successfully:", createdPost);
        }
    } catch (error) {
        console.error("Error adding post:", error);
        alert(`Failed to add post: ${error.message || "Unknown error"}`);
    }
};

const viewPost = (post: any) => {
    router.push(`/anime/${post.id}`);
};



const editPost = (post: any) => {
    // Navigate to edit page with admin flag
    navigateTo(`/posts/edit/${post.id}?from=admin`);
};

const approvePost = async (post: any) => {
    try {
        const { approvePost } = useApi();

        // Update post status using API
        const updatedPost = await approvePost(post.id);

        if (updatedPost) {
            // Update local post status
            const index = posts.value.findIndex(p => p.id === post.id);
            if (index !== -1) {
                posts.value[index].statusApproval = "published";
            }

            console.log("Post published successfully");
            toast.success("Postingan berhasil disetujui");
        }
    } catch (error) {
        console.error("Error approving post:", error);
        toast.error(`Gagal menyetujui postingan: ${error.message || "Terjadi kesalahan tidak dikenal"}`);
    }
};

const rejectPost = (post: any) => {
    // Show reject modal instead of directly rejecting
    showRejectModal(post);
};

const deletePost = (post: any) => {
    postToDelete.value = post;
    deleteConfirmationText.value = "";
    showDeleteModal.value = true;
};

const isDeleting = ref(false);

const confirmDelete = async () => {
    if (!postToDelete.value || !isDeleteConfirmationValid.value || isDeleting.value) return;

    try {
        isDeleting.value = true;
        const { deletePost } = useApi();

        // Store post info before deletion for toast message
        const deletedPostInfo = {
            title: postToDelete.value.title,
            releaseFileName: postToDelete.value.releaseFileName
        };

        // Delete post using API
        await deletePost(postToDelete.value.id);

        // Remove post from local state immediately for better UX
        const postIndex = posts.value.findIndex(p => p.id === postToDelete.value.id);
        if (postIndex !== -1) {
            posts.value.splice(postIndex, 1);
        }

        // Also refresh posts list to ensure consistency
        await fetchPosts();

        console.log("Post deleted successfully");
        
        // Close modal and reset state
        showDeleteModal.value = false;
        postToDelete.value = null;
        deleteConfirmationText.value = "";
        
        // Show success toast with release file name
        const displayName = deletedPostInfo.releaseFileName || deletedPostInfo.title;
        toast.success(`Postingan "${displayName}" berhasil dihapus`);
    } catch (error) {
        console.error("Error deleting post:", error);
        toast.error(`Gagal menghapus postingan: ${error.message || "Terjadi kesalahan tidak dikenal"}`);
    } finally {
        isDeleting.value = false;
    }
};

const cancelDelete = () => {
    showDeleteModal.value = false;
    postToDelete.value = null;
    deleteConfirmationText.value = "";
};

// Reject post modal functions
const showRejectModal = (post: any) => {
    postToReject.value = post;
    rejectionReason.value = "";
    showRejectPostModal.value = true;
};

const confirmReject = async () => {
    if (!postToReject.value || !isRejectReasonValid.value) return;

    try {
        const { rejectPost } = useApi();

        // Update post status using API with rejection reason
        const updatedPost = await rejectPost(postToReject.value.id, rejectionReason.value);

        if (updatedPost) {
            // Update local post status and rejection reason
            const index = posts.value.findIndex(p => p.id === postToReject.value.id);
            if (index !== -1) {
                posts.value[index].statusApproval = "rejected";
                posts.value[index].rejectionReason = rejectionReason.value;
            }

            console.log("Post rejected successfully with reason");
            toast.success("Postingan berhasil ditolak dengan alasan");
        }

        // Close modal and reset state
        showRejectPostModal.value = false;
        postToReject.value = null;
        rejectionReason.value = "";
    } catch (error) {
        console.error("Error rejecting post:", error);
        toast.error(`Gagal menolak postingan: ${error.message || "Terjadi kesalahan tidak dikenal"}`);
    }
};

const cancelReject = () => {
    showRejectPostModal.value = false;
    postToReject.value = null;
    rejectionReason.value = "";
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const previousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.action-btn {
    @apply inline-flex items-center p-2 rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700;
}
</style>
