<template>
    <div
        data-testid="pagination"
        class="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6"
    >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <!-- Results Info -->
            <div data-testid="results-info" class="text-sm text-gray-700 dark:text-gray-300">
                Showing
                <span class="font-medium">{{ startItem }}</span>
                to
                <span class="font-medium">{{ endItem }}</span>
                of
                <span class="font-medium">{{ totalItems }}</span>
                results
            </div>

            <!-- Pagination Controls -->
            <div class="flex items-center space-x-2">
                <!-- Previous Button -->
                <button
                    data-testid="prev-button"
                    aria-label="Previous page"
                    @click="goToPrevious"
                    :disabled="!hasPrevPage"
                    class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :class="[
                        hasPrevPage
                            ? 'text-gray-600 dark:text-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-200 dark:border-gray-500 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 hover:shadow-md transform hover:scale-105'
                            : 'text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    ]"
                >
                    <ChevronLeftIcon class="w-4 h-4" />
                    <span class="sr-only">Previous</span>
                </button>

                <!-- Page Numbers -->
                <div class="hidden sm:flex space-x-1">
                    <!-- First Page -->
                    <button
                        v-if="showFirstPage"
                        :data-testid="`page-1`"
                        :aria-label="`Go to page 1`"
                        :aria-current="currentPage === 1 ? 'page' : undefined"
                        @click="goToPage(1)"
                        class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                        :class="[
                            currentPage === 1
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                                : 'text-gray-600 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-500 hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-600 dark:hover:to-gray-500 hover:shadow-md transform hover:scale-105'
                        ]"
                    >
                        1
                    </button>

                    <!-- First Ellipsis -->
                    <span
                        v-if="showFirstEllipsis"
                        class="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg"
                    >
                        ...
                    </span>

                    <!-- Visible Page Numbers -->
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        :data-testid="`page-${page}`"
                        :aria-label="`Go to page ${page}`"
                        :aria-current="currentPage === page ? 'page' : undefined"
                        @click="goToPage(page)"
                        @keydown.enter="goToPage(page)"
                        class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        :class="[
                            currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                                : 'text-gray-600 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-500 hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-600 dark:hover:to-gray-500 hover:shadow-md transform hover:scale-105'
                        ]"
                    >
                        {{ page }}
                    </button>

                    <!-- Last Ellipsis -->
                    <span
                        v-if="showLastEllipsis"
                        class="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg"
                    >
                        ...
                    </span>

                    <!-- Last Page -->
                    <button
                        v-if="showLastPage"
                        :data-testid="`page-${totalPages}`"
                        :aria-label="`Go to page ${totalPages}`"
                        :aria-current="currentPage === totalPages ? 'page' : undefined"
                        @click="goToPage(totalPages)"
                        class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                        :class="[
                            currentPage === totalPages
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                                : 'text-gray-600 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-500 hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-600 dark:hover:to-gray-500 hover:shadow-md transform hover:scale-105'
                        ]"
                    >
                        {{ totalPages }}
                    </button>
                </div>

                <!-- Mobile Page Info -->
                <div class="sm:hidden flex items-center space-x-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>
                </div>

                <!-- Next Button -->
                <button
                    data-testid="next-button"
                    aria-label="Next page"
                    @click="goToNext"
                    :disabled="!hasNextPage"
                    class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :class="[
                        hasNextPage
                            ? 'text-gray-600 dark:text-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-200 dark:border-gray-500 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 hover:shadow-md transform hover:scale-105'
                            : 'text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    ]"
                >
                    <ChevronRightIcon class="w-4 h-4" />
                    <span class="sr-only">Next</span>
                </button>
            </div>

            <!-- Per Page Selector -->
            <div class="flex items-center space-x-3">
                <label for="perPage" class="text-sm font-medium text-gray-700 dark:text-gray-300"> 📄 Per page: </label>
                <div class="relative">
                    <select
                        id="perPage"
                        data-testid="items-per-page"
                        aria-label="Items per page"
                        v-model="perPageLocal"
                        @change="updatePerPage"
                        class="appearance-none bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 border border-green-200 dark:border-gray-500 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md min-w-[80px]"
                    >
                        <option value="10" class="bg-white dark:bg-gray-800">10</option>
                        <option value="20" class="bg-white dark:bg-gray-800">20</option>
                        <option value="50" class="bg-white dark:bg-gray-800">50</option>
                        <option value="100" class="bg-white dark:bg-gray-800">100</option>
                    </select>
                    <ChevronDownIcon
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAnimeStore } from "~/stores/anime";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";

const animeStore = useAnimeStore();

// Reactive state
const perPageLocal = ref(animeStore.filter.perPage);

// Computed properties
const currentPage = computed(() => animeStore.filter.page);
const totalPages = computed(() => animeStore.totalPages);
const totalItems = computed(() => animeStore.totalAnimes);
const perPage = computed(() => animeStore.filter.perPage);
const hasNextPage = computed(() => animeStore.hasNextPage);
const hasPrevPage = computed(() => animeStore.hasPrevPage);

const startItem = computed(() => {
    if (totalItems.value === 0) return 0;
    return (currentPage.value - 1) * perPage.value + 1;
});

const endItem = computed(() => {
    const end = currentPage.value * perPage.value;
    return Math.min(end, totalItems.value);
});

// Pagination logic
const visiblePages = computed(() => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
        let i = Math.max(2, currentPage.value - delta);
        i <= Math.min(totalPages.value - 1, currentPage.value + delta);
        i++
    ) {
        range.push(i);
    }

    if (currentPage.value - delta > 2) {
        rangeWithDots.push(2, "...");
    } else {
        rangeWithDots.push(2);
    }

    rangeWithDots.push(...range);

    if (currentPage.value + delta < totalPages.value - 1) {
        rangeWithDots.push("...", totalPages.value - 1);
    } else if (totalPages.value > 2) {
        rangeWithDots.push(totalPages.value - 1);
    }

    return range;
});

const showFirstPage = computed(() => totalPages.value >= 1);
const showLastPage = computed(() => totalPages.value > 1);
const showFirstEllipsis = computed(() => currentPage.value > 4);
const showLastEllipsis = computed(() => currentPage.value < totalPages.value - 3);

// Methods
const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        animeStore.setPage(page);
    }
};

const goToNext = () => {
    if (hasNextPage.value) {
        goToPage(currentPage.value + 1);
    }
};

const goToPrevious = () => {
    if (hasPrevPage.value) {
        goToPage(currentPage.value - 1);
    }
};

const updatePerPage = () => {
    animeStore.updateFilter({
        perPage: parseInt(perPageLocal.value.toString()),
        page: 1 // Reset to first page when changing per page
    });
};

// Watch for changes in store perPage to sync local state
watch(
    () => animeStore.filter.perPage,
    newValue => {
        perPageLocal.value = newValue;
    }
);
</script>
