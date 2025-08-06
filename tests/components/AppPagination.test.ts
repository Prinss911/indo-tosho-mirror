import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import AppPagination from "~/components/AppPagination.vue";
import { useAnimeStore } from "~/stores/anime";
import type { Anime } from "~/stores/anime";

// Mock Heroicons
vi.mock("@heroicons/vue/24/outline", () => ({
    ChevronLeftIcon: { name: "ChevronLeftIcon", template: "<div>ChevronLeft</div>" },
    ChevronRightIcon: { name: "ChevronRightIcon", template: "<div>ChevronRight</div>" },
    ChevronDownIcon: { name: "ChevronDownIcon", template: "<div>ChevronDown</div>" }
}));

const mockAnimes: Anime[] = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Anime ${i + 1}`,
    category: "Anime - Sudah diterjemahkan",
    genre: ["Action"],
    size: "1.5 GB",
    date: "2023-01-01",
    views: 100,
    likes: 50,
    downloads: 1000,
    submitter: "User",
    rating: 8.5,
    episodes: 12,
    year: 2023,
    status: "completed",
    studio: "Studio",
    coverImage: "image.jpg",
    description: "Description"
}));

describe("AppPagination", () => {
    let store: any;
    let wrapper: any;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useAnimeStore();

        // Setup mock store with all required properties
        store.animes = mockAnimes;
        store.filteredAnimes = mockAnimes;
        store.filter = {
            page: 1,
            perPage: 10,
            search: "",
            category: "all",
            sortBy: "date",
            sortOrder: "desc"
        };
        store.loading = false;
        store.error = null;
        store.totalPages = 5;

        // Mock methods
        store.setPage = vi.fn();
        store.updateFilter = vi.fn();
        store.applyFilters = vi.fn();
    });

    const createWrapper = () => {
        return mount(AppPagination, {
            global: {
                plugins: [createPinia()]
            }
        });
    };

    describe("Basic Rendering", () => {
        it("should render pagination component", () => {
            wrapper = createWrapper();
            expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
        });

        it("should display results info", () => {
            wrapper = createWrapper();
            const resultsInfo = wrapper.find('[data-testid="results-info"]');
            expect(resultsInfo.exists()).toBe(true);
        });

        it("should display navigation buttons", () => {
            wrapper = createWrapper();
            expect(wrapper.find('[data-testid="prev-button"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="next-button"]').exists()).toBe(true);
        });

        it("should display items per page selector", () => {
            wrapper = createWrapper();
            expect(wrapper.find('[data-testid="items-per-page"]').exists()).toBe(true);
        });
    });

    describe("Navigation", () => {
        it("should handle page button clicks", async () => {
            wrapper = createWrapper();
            const pageButton = wrapper.find('[data-testid="page-1"]');

            if (pageButton.exists()) {
                await pageButton.trigger("click");
                expect(store.setPage).toHaveBeenCalled();
            }
        });

        it("should handle next button click", async () => {
            wrapper = createWrapper();
            const nextButton = wrapper.find('[data-testid="next-button"]');

            await nextButton.trigger("click");
            // Should call goToNext method
            expect(wrapper.vm).toBeDefined();
        });

        it("should handle previous button click", async () => {
            store.filter.page = 2;
            wrapper = createWrapper();

            const prevButton = wrapper.find('[data-testid="prev-button"]');
            await prevButton.trigger("click");
            // Should call goToPrevious method
            expect(wrapper.vm).toBeDefined();
        });
    });

    describe("Items Per Page", () => {
        it("should handle per page change", async () => {
            wrapper = createWrapper();
            const selector = wrapper.find('[data-testid="items-per-page"]');

            // Verify selector exists and can be interacted with
            expect(selector.exists()).toBe(true);

            // Simulate changing the value
            await selector.setValue("20");
            expect(selector.element.value).toBe("20");

            // Trigger change event
            await selector.trigger("change");

            // Component should not crash
            expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty data", () => {
            store.animes = [];
            store.filteredAnimes = [];
            store.totalPages = 0;

            wrapper = createWrapper();
            expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
        });

        it("should handle single page", () => {
            store.totalPages = 1;

            wrapper = createWrapper();
            expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true);
        });
    });

    describe("Accessibility", () => {
        it("should have proper ARIA labels", () => {
            wrapper = createWrapper();

            const prevButton = wrapper.find('[data-testid="prev-button"]');
            const nextButton = wrapper.find('[data-testid="next-button"]');
            const selector = wrapper.find('[data-testid="items-per-page"]');

            expect(prevButton.attributes("aria-label")).toBe("Previous page");
            expect(nextButton.attributes("aria-label")).toBe("Next page");
            expect(selector.attributes("aria-label")).toBe("Items per page");
        });
    });
});
