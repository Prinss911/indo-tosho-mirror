<template>
    <ClientOnly>
        <div class="transition-colors duration-200">
            <!-- Header -->
            <div class="bg-white dark:bg-gray-800 shadow">
                <div class="container-extra-wide">
                    <div class="py-4">
                        <BackButton to="/" label="Kembali ke Beranda" />
                    </div>
                    <div class="flex justify-between items-center pb-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Postingan Saya</h1>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Kelola semua postingan anime yang telah Anda buat
                            </p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <NuxtLink
                                to="/posts/create"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <PlusIcon class="w-4 h-4 mr-2" />
                                Buat Postingan Baru
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="container-extra-wide py-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div
                        class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <DocumentTextIcon class="h-6 w-6 text-gray-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Postingan
                                        </dt>
                                        <dd class="flex items-center">
                                            <span class="text-lg font-medium text-gray-900 dark:text-white">
                                                {{ isLoading ? "-" : stats.total }}
                                            </span>
                                            <div
                                                v-if="isLoading"
                                                class="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
                                            ></div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
                    >
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
                                        <dd class="flex items-center">
                                            <span class="text-lg font-medium text-gray-900 dark:text-white">
                                                {{ isLoading ? "-" : stats.published }}
                                            </span>
                                            <div
                                                v-if="isLoading"
                                                class="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"
                                            ></div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <ClockIcon class="h-6 w-6 text-yellow-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Menunggu Review
                                        </dt>
                                        <dd class="flex items-center">
                                            <span class="text-lg font-medium text-gray-900 dark:text-white">
                                                {{ isLoading ? "-" : stats.pending }}
                                            </span>
                                            <div
                                                v-if="isLoading"
                                                class="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"
                                            ></div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <EyeIcon class="h-6 w-6 text-blue-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Views
                                        </dt>
                                        <dd class="flex items-center">
                                            <span class="text-lg font-medium text-gray-900 dark:text-white">
                                                {{ isLoading ? "-" : stats.totalViews.toLocaleString() }}
                                            </span>
                                            <div
                                                v-if="isLoading"
                                                class="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
                                            ></div>
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
                                    Cari Postingan
                                </label>
                                <div class="relative">
                                    <input
                                        v-model="filters.search"
                                        type="text"
                                        placeholder="Cari berdasarkan judul..."
                                        class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <MagnifyingGlassIcon class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    v-model="filters.status"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pending">Menunggu Review</option>
                                    <option value="published">Published</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kategori
                                </label>
                                <select
                                    v-model="filters.category"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Semua Kategori</option>
                                    <option
                                        v-for="category in animeStore.categories.filter(cat => cat.id !== 'all')"
                                        :key="category.id"
                                        :value="category.id"
                                    >
                                        {{ category.parent ? "　" : "" }}{{ category.name }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Urutkan
                                </label>
                                <select
                                    v-model="filters.sortBy"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="createdAt">Tanggal Dibuat</option>
                                    <option value="title">Judul</option>
                                    <option value="views">Views</option>
                                    <option value="likes">Likes</option>
                                    <option value="rating">Rating</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Posts Table -->
                <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Daftar Postingan ({{ filteredPosts.length }})
                        </h3>
                    </div>

                    <div v-if="isLoading" class="text-center py-12">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <h3 class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Memuat postingan...</h3>
                    </div>

                    <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
                        <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
                        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada postingan</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {{
                                filters.search || filters.status || filters.category
                                    ? "Tidak ada postingan yang sesuai dengan filter"
                                    : "Mulai dengan membuat postingan pertama Anda"
                            }}
                        </p>
                        <div class="mt-6">
                            <NuxtLink
                                to="/posts/create"
                                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon class="w-4 h-4 mr-2" />
                                Buat Postingan Baru
                            </NuxtLink>
                        </div>
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
                                                :class="getStatusClass(post.statusApproval)"
                                            >
                                                {{ getStatusText(post.statusApproval) }}
                                            </span>
                                        </div>
                                        <div
                                            class="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            <span class="flex items-center">
                                                <TagIcon class="h-3 w-3 mr-1" />
                                                {{
                                                    animeStore.categories.find(c => c.id === post.category)?.name ||
                                                    "Kategori Tidak Ditemukan"
                                                }}
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
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="flex items-center space-x-2">
                                    <NuxtLink
                                        :to="`/anime/${post.id}`"
                                        class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        title="Lihat Detail"
                                    >
                                        <EyeIcon class="h-4 w-4" />
                                    </NuxtLink>
                                    <NuxtLink
                                        :to="`/posts/edit/${post.id}`"
                                        class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        title="Edit Postingan"
                                    >
                                        <PencilIcon class="h-4 w-4" />
                                    </NuxtLink>
                                    <button
                                        @click="confirmDeletePost(post.id)"
                                        class="inline-flex items-center p-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Hapus Postingan"
                                    >
                                        <TrashIcon class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <!-- Rejection Reason (if rejected) -->
                            <div
                                v-if="post.statusApproval === 'rejected' && post.rejectionReason"
                                class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                            >
                                <div class="flex">
                                    <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                                    <div>
                                        <h5 class="text-sm font-medium text-red-800 dark:text-red-200">
                                            Alasan Penolakan:
                                        </h5>
                                        <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                                            {{ post.rejectionReason }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div
                v-if="showDeleteModal"
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
                        @click="cancelDelete"
                    ></div>

                    <!-- Modal panel -->
                    <div
                        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    >
                        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div
                                    class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10"
                                >
                                    <ExclamationTriangleIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3
                                        class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                                        id="modal-title"
                                    >
                                        Hapus Postingan
                                    </h3>
                                    <div class="mt-2">
                                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            Tindakan ini akan menghapus postingan secara permanen dan tidak dapat
                                            dibatalkan.
                                        </p>

                                        <!-- Post Info -->
                                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                                            <div class="flex items-center space-x-3">
                                                <img
                                                    :src="postToDeleteData?.cover ?? '/placeholder-anime.jpg'"
                                                    :alt="postToDeleteData?.title"
                                                    class="h-12 w-8 object-cover rounded"
                                                />
                                                <div class="flex-1 min-w-0">
                                                    <p
                                                        class="text-sm font-medium text-gray-900 dark:text-white truncate"
                                                    >
                                                        {{ postToDeleteData?.title }}
                                                    </p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {{ postToDeleteData?.releaseFileName }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Confirmation Input -->
                                        <div class="space-y-3">
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Untuk mengkonfirmasi, ketik "<span
                                                    class="font-mono text-red-600 dark:text-red-400"
                                                    >{{ postToDeleteData?.releaseFileName }}</span
                                                >" di bawah ini:
                                            </label>
                                            <input
                                                v-model="deleteConfirmationText"
                                                type="text"
                                                placeholder="Ketik nama file rilisan untuk konfirmasi"
                                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                                                :class="{
                                                    'border-red-500 dark:border-red-400':
                                                        deleteConfirmationText && !isDeleteConfirmationValid,
                                                    'border-green-500 dark:border-green-400': isDeleteConfirmationValid
                                                }"
                                            />
                                            <p
                                                v-if="deleteConfirmationText && !isDeleteConfirmationValid"
                                                class="text-xs text-red-600 dark:text-red-400"
                                            >
                                                Nama file rilisan tidak sesuai
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                @click="deletePost"
                                :disabled="isDeleting || !isDeleteConfirmationValid"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div
                                    v-if="isDeleting"
                                    class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                                ></div>
                                {{ isDeleting ? "Menghapus..." : "Hapus Postingan" }}
                            </button>
                            <button
                                type="button"
                                @click="cancelDelete"
                                :disabled="isDeleting"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toast Notification -->
            <div
                v-if="showToast"
                class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ease-in-out"
                :class="{
                    'border-l-4 border-green-400': toastType === 'success',
                    'border-l-4 border-red-400': toastType === 'error'
                }"
            >
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <CheckCircleIcon v-if="toastType === 'success'" class="h-6 w-6 text-green-400" />
                            <ExclamationTriangleIcon v-else class="h-6 w-6 text-red-400" />
                        </div>
                        <div class="ml-3 w-0 flex-1 pt-0.5">
                            <p class="text-sm font-medium text-gray-900 dark:text-white">
                                {{ toastMessage }}
                            </p>
                        </div>
                        <div class="ml-4 flex-shrink-0 flex">
                            <button
                                @click="showToast = false"
                                class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <span class="sr-only">Close</span>
                                <svg
                                    class="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useAnimeStore } from "~/stores/anime";
import { useSupabase } from "~/services/supabaseClient";
import {
    PlusIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    TagIcon,
    FilmIcon,
    CalendarIcon,
    StarIcon,
    HeartIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from "@heroicons/vue/24/outline";

// Meta
definePageMeta({
    middleware: "auth",
    title: "Postingan Saya"
});

// Composables
const authStore = useAuthStore();
const animeStore = useAnimeStore();

// Realtime subscription
let realtimeChannel: any = null;

// Pastikan kategori dimuat
onMounted(() => {
    if (animeStore.categories.length === 0) {
        animeStore.fetchCategories();
    }
    loadPosts();
    setupRealtimeSubscription();
});

// Cleanup subscription on unmount
onUnmounted(() => {
    if (realtimeChannel) {
        realtimeChannel.unsubscribe();
    }
});

// Types
interface UserPost {
    id: string;
    title: string;
    titleEnglish?: string;
    releaseFileName?: string;
    episodes: number;
    year: number;
    rating: number;
    category: string;
    status: "Finished Airing" | "Currently Airing" | "Not yet aired" | "completed" | "ongoing" | "upcoming";
    statusApproval: "pending" | "published" | "rejected";
    cover: string;
    description: string;
    genres: string[];
    malId?: number;
    submitter: string;
    views: number;
    downloads: number;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
    rejectionReason?: string;
}

// State
const posts = ref<UserPost[]>([]);
const isLoading = ref(true);
const showDeleteModal = ref(false);
const postToDelete = ref<string | null>(null);
const isDeleting = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");
const deleteConfirmationText = ref("");

// Filters
const filters = reactive({
    search: "",
    status: "",
    category: "",
    sortBy: "createdAt"
});

// Computed
const stats = computed(() => {
    const total = posts.value.length;
    const published = posts.value.filter(p => p.statusApproval === "published").length;
    const pending = posts.value.filter(p => p.statusApproval === "pending").length;
    const rejected = posts.value.filter(p => p.statusApproval === "rejected").length;
    const totalViews = posts.value.reduce((sum, p) => sum + p.views, 0);

    return { total, published, pending, rejected, totalViews };
});

const postToDeleteData = computed(() => {
    if (!postToDelete.value) return null;
    return posts.value.find(p => p.id === postToDelete.value);
});

const isDeleteConfirmationValid = computed(() => {
    if (!postToDeleteData.value || !deleteConfirmationText.value) return false;
    return deleteConfirmationText.value.trim() === postToDeleteData.value.releaseFileName?.trim();
});

const filteredPosts = computed(() => {
    let filtered = posts.value;

    // Search filter
    if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
            post =>
                post.title.toLowerCase().includes(search) ||
                post.titleEnglish?.toLowerCase().includes(search) ||
                post.description.toLowerCase().includes(search)
        );
    }

    // Status filter
    if (filters.status) {
        filtered = filtered.filter(post => post.statusApproval === filters.status);
    }

    // Category filter
    if (filters.category) {
        filtered = filtered.filter(post => post.category === filters.category);
    }

    // Sort
    filtered.sort((a, b) => {
        switch (filters.sortBy) {
            case "title":
                return a.title.localeCompare(b.title);
            case "views":
                return b.views - a.views;
            case "likes":
                return b.likes - a.likes;
            case "rating":
                return b.rating - a.rating;
            case "createdAt":
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    return filtered;
});

// Methods
const getStatusClass = (status: string) => {
    switch (status) {
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

const getStatusText = (status: string) => {
    switch (status) {
        case "published":
            return "Published";
        case "pending":
            return "Menunggu Review";
        case "rejected":
            return "Ditolak";
        default:
            return "Unknown";
    }
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(new Date(date));
};

const confirmDeletePost = (postId: string) => {
    postToDelete.value = postId;
    showDeleteModal.value = true;
};

const cancelDelete = () => {
    showDeleteModal.value = false;
    postToDelete.value = null;
    deleteConfirmationText.value = "";
};

const deletePost = async () => {
    if (!postToDelete.value || !isDeleteConfirmationValid.value) return;

    isDeleting.value = true;

    try {
        const { client: supabase } = useSupabase();

        // Find the post to get its title before deletion
        const postToDeleteData = posts.value.find(p => p.id === postToDelete.value);
        const postTitle = postToDeleteData?.title || "Postingan";

        // Delete from Supabase
        const { error } = await supabase.from("posts").delete().eq("id", postToDelete.value);

        if (error) throw error;

        // Remove from local state
        const index = posts.value.findIndex(p => p.id === postToDelete.value);
        if (index > -1) {
            posts.value.splice(index, 1);
        }

        // Show success toast with post title
        showToastMessage(`Postingan "${postTitle}" berhasil dihapus!`, "success");

        // Close modal and reset state
        showDeleteModal.value = false;
        postToDelete.value = null;
        deleteConfirmationText.value = "";
    } catch (error) {
        console.error("Error deleting post:", error);
        showToastMessage("Gagal menghapus postingan. Silakan coba lagi.", "error");
    } finally {
        isDeleting.value = false;
    }
};

const showToastMessage = (message: string, type: "success" | "error") => {
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;

    // Auto hide toast after 3 seconds
    setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

const transformPostData = (post: any) => ({
    id: post.id,
    title: post.title,
    titleEnglish: post.title_english || "",
    releaseFileName: post.release_file_name || "",
    episodes: post.episodes || 0,
    year: post.year || new Date().getFullYear(),
    rating: post.rating || 0,
    category: post.category_id || "",
    status: post.status || "Finished Airing",
    statusApproval: post.status_approval || "pending",
    cover: post.cover || "https://via.placeholder.com/300x400/1f2937/ffffff?text=No+Image",
    description: post.description || "",
    genres: post.genres || [],
    malId: post.mal_id || null,
    submitter: post.submitter_name || authStore.user?.username || "user",
    views: post.views || 0,
    downloads: post.downloads || 0,
    likes: post.likes || 0,
    createdAt: post.created_at ? new Date(post.created_at) : new Date(),
    updatedAt: post.updated_at ? new Date(post.updated_at) : new Date(),
    rejectionReason: post.rejection_reason || ""
});

const setupRealtimeSubscription = () => {
    const { client: supabase } = useSupabase();
    const userId = authStore.user?.id;

    if (!userId) {
        console.error("User ID not found for realtime subscription");
        return;
    }

    // Subscribe to changes on posts table for current user
    realtimeChannel = supabase
        .channel("posts-changes")
        .on(
            "postgres_changes",
            {
                event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
                schema: "public",
                table: "posts",
                filter: `submitter_id=eq.${userId}`
            },
            payload => {
                console.log("Realtime change received:", payload);
                handleRealtimeChange(payload);
            }
        )
        .subscribe();
};

const handleRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
        case "INSERT":
            // Add new post to the beginning of the array
            const newPost = transformPostData(newRecord);
            posts.value.unshift(newPost);
            showToastMessage(`Postingan baru "${newPost.title}" telah ditambahkan!`, "success");
            break;

        case "UPDATE":
            // Update existing post
            const updatedPost = transformPostData(newRecord);
            const updateIndex = posts.value.findIndex(p => p.id === updatedPost.id);
            if (updateIndex > -1) {
                posts.value[updateIndex] = updatedPost;
                showToastMessage(`Postingan "${updatedPost.title}" telah diperbarui!`, "success");
            }
            break;

        case "DELETE":
            // Remove deleted post
            const deleteIndex = posts.value.findIndex(p => p.id === oldRecord.id);
            if (deleteIndex > -1) {
                const deletedPost = posts.value[deleteIndex];
                posts.value.splice(deleteIndex, 1);
                // Only show toast if deletion wasn't initiated by current user
                if (!isDeleting.value) {
                    showToastMessage(`Postingan "${deletedPost.title}" telah dihapus!`, "success");
                }
            }
            break;
    }
};

const loadPosts = async () => {
    isLoading.value = true;

    try {
        const { client: supabase } = useSupabase();
        const userId = authStore.user?.id;

        if (!userId) {
            console.error("User ID not found");
            return;
        }

        // Fetch user's posts from Supabase
        const { data, error } = await supabase.from("posts").select("*").eq("submitter_id", userId);

        if (error) throw error;

        if (data && data.length > 0) {
            // Transform data to match our UI requirements
            posts.value = data.map(transformPostData);
        } else {
            // Fallback to empty array if no data
            posts.value = [];
        }
    } catch (error) {
        console.error("Error loading posts:", error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
