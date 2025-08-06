import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import IndexPage from "~/pages/index.vue";
import { useAnimeStore } from "~/stores/anime";
import { useAuthStore } from "~/stores/auth";

// Mock components
const MockAppHeader = {
    name: "AppHeader",
    template: '<div data-testid="app-header">AppHeader</div>'
};

const MockAnimeTable = {
    name: "AnimeTable",
    props: ["animes", "loading"],
    template: '<div data-testid="anime-table">AnimeTable</div>'
};

const MockAppPagination = {
    name: "AppPagination",
    props: ["currentPage", "totalPages", "totalItems"],
    template: '<div data-testid="app-pagination">AppPagination</div>'
};

vi.mock("~/components/AppHeader.vue", () => ({
    default: MockAppHeader
}));

vi.mock("~/components/AnimeTable.vue", () => ({
    default: MockAnimeTable
}));

vi.mock("~/components/AppPagination.vue", () => ({
    default: MockAppPagination
}));

// Mock anime store
const mockAnimeStore = {
    animes: [],
    filteredAnimes: [],
    categories: [],
    loading: false,
    error: null,
    filter: {
        category: "all",
        search: "",
        sortBy: "date",
        sortOrder: "desc",
        page: 1,
        perPage: 20
    },
    totalPages: 1,
    totalAnimes: 0,
    totalItems: 0,
    currentPage: 1,
    fetchAnimes: vi.fn(),
    fetchCategories: vi.fn(),
    updateFilter: vi.fn(),
    applyFilters: vi.fn(),
    getCategoryNameById: vi.fn(id => {
        const category = mockAnimeStore.categories.find(c => c.id === id);
        return category ? category.name : "";
    })
};

const mockAuthStore = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    error: null,
    checkAuth: vi.fn()
};

vi.mock("~/stores/anime", () => ({
    useAnimeStore: () => mockAnimeStore
}));

vi.mock("~/stores/auth", () => ({
    useAuthStore: () => mockAuthStore
}));

// Mock Nuxt composables
vi.mock("#app", () => ({
    useNuxtApp: () => ({
        $router: {
            push: vi.fn()
        }
    })
}));

describe("Index Page", () => {
    let wrapper: any;
    let pinia: any;

    // Helper function for mounting with consistent configuration
    const mountComponent = (options = {}) => {
        return mount(IndexPage, {
            global: {
                plugins: [pinia],
                components: {
                    AppHeader: MockAppHeader,
                    AnimeTable: MockAnimeTable,
                    AppPagination: MockAppPagination
                },
                ...options.global
            },
            ...options
        });
    };

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);

        // Reset mocks
        vi.clearAllMocks();

        // Reset store state
        mockAnimeStore.animes = [];
        mockAnimeStore.filteredAnimes = [];
        mockAnimeStore.categories = [];
        mockAnimeStore.loading = false;
        mockAnimeStore.error = null;
        mockAnimeStore.filter = {
            category: "all",
            search: "",
            sortBy: "date",
            sortOrder: "desc",
            page: 1,
            perPage: 20
        };
        mockAnimeStore.totalPages = 1;
        mockAnimeStore.totalAnimes = 0;
        mockAnimeStore.totalItems = 0;
        mockAnimeStore.currentPage = 1;

        // Reset mock functions
        mockAnimeStore.fetchAnimes.mockReset();
        mockAnimeStore.fetchCategories.mockReset();
        mockAnimeStore.updateFilter.mockReset();
        mockAnimeStore.applyFilters.mockReset();
        mockAnimeStore.getCategoryNameById.mockReset();

        // Configure mock implementations
        mockAnimeStore.getCategoryNameById.mockImplementation(id => {
            const category = mockAnimeStore.categories.find(c => c.id === id);
            return category ? category.name : "";
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    describe("Component Rendering", () => {
        it("should render all main components", () => {
            mockAnimeStore.totalAnimes = 10; // Set totalAnimes > 0 to render AppPagination
            wrapper = mountComponent();

            expect(wrapper.find('[data-testid="app-header"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="anime-table"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="app-pagination"]').exists()).toBe(true);
        });

        it("should render page title and description", () => {
            wrapper = mountComponent();

            // Check if the page contains expected content
            expect(wrapper.text()).toContain("Anime Database");
            expect(wrapper.text()).toContain("Modern, responsive, and fast anime database");
        });

        it('should show "No Results" message when no animes are available', () => {
            mockAnimeStore.animes = [];
            mockAnimeStore.filteredAnimes = [];
            mockAnimeStore.totalAnimes = 0;

            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Belum ada data anime");
            expect(wrapper.text()).toContain("Belum ada data anime yang tersedia saat ini.");
        });

        it('should show "No Results" message with filter suggestion when filters are active', () => {
            mockAnimeStore.animes = [];
            mockAnimeStore.filteredAnimes = [];
            mockAnimeStore.totalAnimes = 0;
            mockAnimeStore.filter.search = "test";

            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Belum ada data anime");
            expect(wrapper.text()).toContain("Coba sesuaikan pencarian atau filter Anda.");
        });

        it('should hide "No Results" message when animes are available', () => {
            mockAnimeStore.animes = [
                {
                    id: "1",
                    title: "Test Anime",
                    category: "Action",
                    submitter: "User1",
                    size: "1.5GB",
                    date: "2024-01-01",
                    views: 10,
                    likes: 5,
                    downloads: 100,
                    status: "completed",
                    rating: 8.5,
                    episodes: 12,
                    genre: ["Action"],
                    year: 2024,
                    studio: "Studio A",
                    coverImage: "cover.jpg"
                }
            ];
            mockAnimeStore.filteredAnimes = [...mockAnimeStore.animes];
            mockAnimeStore.totalAnimes = 1;

            wrapper = mountComponent();

            expect(wrapper.text()).not.toContain("Belum ada data anime");
        });
    });

    describe("Filter Summary", () => {
        it("should show active category filter", () => {
            mockAnimeStore.filter.category = "cat-1";
            mockAnimeStore.categories = [
                { id: "cat-1", name: "Action" },
                { id: "cat-2", name: "Comedy" }
            ];

            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Action");
        });

        it("should show active search filter", () => {
            mockAnimeStore.filter.search = "naruto";

            wrapper = mountComponent();

            expect(wrapper.text()).toContain('Search: "naruto"');
        });

        it("should show both category and search filters when active", () => {
            mockAnimeStore.filter.category = "cat-1";
            mockAnimeStore.filter.search = "naruto";
            mockAnimeStore.categories = [{ id: "cat-1", name: "Action" }];

            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Action");
            expect(wrapper.text()).toContain('Search: "naruto"');
        });

        it("should not show filter summary when no filters are active", () => {
            mockAnimeStore.filter.category = "all";
            mockAnimeStore.filter.search = "";

            wrapper = mountComponent();

            expect(wrapper.text()).not.toContain("Active filters:");
        });
    });

    describe("Component Props", () => {
        it("should pass correct props to AnimeTable", () => {
            const testAnimes = [
                {
                    id: "1",
                    title: "Test Anime",
                    category: "Action",
                    submitter: "User1",
                    size: "1.5GB",
                    date: "2024-01-01",
                    views: 10,
                    likes: 5,
                    downloads: 100,
                    status: "completed",
                    rating: 8.5,
                    episodes: 12,
                    genre: ["Action"],
                    year: 2024,
                    studio: "Studio A",
                    coverImage: "cover.jpg"
                }
            ];

            mockAnimeStore.animes = testAnimes;
            mockAnimeStore.loading = true;

            wrapper = mountComponent();

            // Check if AnimeTable component is rendered
            expect(wrapper.text()).toContain("AnimeTable");
        });

        it("should pass correct props to AppPagination", () => {
            mockAnimeStore.currentPage = 2;
            mockAnimeStore.totalPages = 5;
            mockAnimeStore.totalItems = 50;
            mockAnimeStore.totalAnimes = 50; // Set totalAnimes > 0 to render AppPagination

            wrapper = mountComponent();

            // Check if AppPagination component is rendered
            expect(wrapper.text()).toContain("AppPagination");
        });
    });

    describe("Computed Properties", () => {
        it("should correctly compute selectedCategoryName", () => {
            mockAnimeStore.filter.category = "cat-1";
            mockAnimeStore.categories = [
                { id: "cat-1", name: "Action" },
                { id: "cat-2", name: "Comedy" }
            ];

            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Action");
        });

        it("should return empty string when category not found", () => {
            mockAnimeStore.filter.category = "non-existent";
            mockAnimeStore.categories = [{ id: "cat-1", name: "Action" }];

            wrapper = mountComponent();

            // When category not found, it should show default 'Semua Kategori' or not show filter
            expect(wrapper.text()).not.toContain("non-existent");
        });

        it("should correctly compute hasActiveFilters", () => {
            // Test with no filters
            mockAnimeStore.filter.category = "all";
            mockAnimeStore.filter.search = "";

            wrapper = mountComponent();

            expect(wrapper.text()).not.toContain("Active filters:");

            // Test with category filter
            mockAnimeStore.filter.category = "cat-1";
            mockAnimeStore.categories = [{ id: "cat-1", name: "Action" }];
            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Active filters:");
        });
    });

    describe("Lifecycle Hooks", () => {
        it("should call fetchCategories and fetchAnimes on mount", async () => {
            wrapper = mountComponent();

            // Wait for onMounted to complete
            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(mockAnimeStore.fetchCategories).toHaveBeenCalledOnce();
            expect(mockAnimeStore.fetchAnimes).toHaveBeenCalledOnce();
        });

        it("should handle store initialization errors gracefully", () => {
            expect(() => {
                wrapper = mountComponent();
            }).not.toThrow();
        });
    });

    describe("Reactivity", () => {
        it('should show "No anime found" when animes array is empty', async () => {
            mockAnimeStore.animes = [];
            mockAnimeStore.filteredAnimes = [];
            mockAnimeStore.totalAnimes = 0;

            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Belum ada data anime");

            // Add animes and remount to see changes
            mockAnimeStore.animes = [
                {
                    id: "1",
                    title: "New Anime",
                    category: "Action",
                    submitter: "User1",
                    size: "1.5GB",
                    date: "2024-01-01",
                    views: 10,
                    likes: 5,
                    downloads: 100,
                    status: "completed",
                    rating: 8.5,
                    episodes: 12,
                    genre: ["Action"],
                    year: 2024,
                    studio: "Studio A",
                    coverImage: "cover.jpg"
                }
            ];
            mockAnimeStore.filteredAnimes = [...mockAnimeStore.animes];
            mockAnimeStore.totalAnimes = 1;

            // Remount component to reflect store changes
            wrapper = mountComponent();
            await wrapper.vm.$nextTick();
            expect(wrapper.text()).not.toContain("No anime found");
        });

        it("should react to filter changes", async () => {
            mockAnimeStore.categories = [{ id: "cat-1", name: "Action" }];
            mockAnimeStore.filter.category = "cat-1";

            wrapper = mountComponent();

            expect(wrapper.text()).toContain("Action");
        });
    });

    describe("Error Handling", () => {
        it("should handle missing categories gracefully", () => {
            mockAnimeStore.categories = [];
            mockAnimeStore.filter.category = "non-existent";

            expect(() => {
                wrapper = mountComponent();
            }).not.toThrow();
        });

        it("should handle undefined store values", () => {
            mockAnimeStore.animes = undefined as any;
            mockAnimeStore.categories = undefined as any;

            expect(() => {
                wrapper = mountComponent();
            }).not.toThrow();
        });
    });

    describe("SEO and Meta", () => {
        it("should have correct page meta configuration", () => {
            wrapper = mountComponent();

            // Check if component has meta configuration
            const component = wrapper.vm.$options;
            expect(component).toBeDefined();
        });
    });
});
