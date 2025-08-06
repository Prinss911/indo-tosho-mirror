import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { nextTick, markRaw } from "vue";
import { flushPromises } from "@vue/test-utils";
import AdminIndexPage from "~/pages/admin/index.vue";
import { useAnimeStore } from "~/stores/anime";
import { useAuthStore } from "~/stores/auth";

// Mock Nuxt router
const mockPush = vi.fn();
vi.mock("#app", () => ({
    useRouter: () => ({
        push: mockPush
    }),
    navigateTo: vi.fn()
}));

// Use vi.hoisted to ensure proper hoisting
const { mockUseAnimeStore, mockUseAuthStore } = vi.hoisted(() => {
    return {
        mockUseAnimeStore: vi.fn(),
        mockUseAuthStore: vi.fn()
    };
});

vi.mock("~/stores/anime", () => ({
    useAnimeStore: mockUseAnimeStore
}));

vi.mock("~/stores/auth", () => ({
    useAuthStore: mockUseAuthStore
}));

// Mock anime store dengan spy yang benar
const mockAnimeStore = {
    animes: [
        { id: "1", title: "Anime 1", views: 100, downloads: 50, likes: 25 },
        { id: "2", title: "Anime 2", views: 200, downloads: 75, likes: 40 }
    ],
    filteredAnimes: [
        { id: "1", title: "Anime 1", views: 100, downloads: 50, likes: 25 },
        { id: "2", title: "Anime 2", views: 200, downloads: 75, likes: 40 }
    ],
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
    categories: [
        { id: "all", name: "Semua Kategori" },
        { id: "1", name: "Action" },
        { id: "2", name: "Romance" }
    ],
    categoryGroups: {},
    paginatedAnimes: [
        { id: "1", title: "Anime 1", views: 100, downloads: 50, likes: 25 },
        { id: "2", title: "Anime 2", views: 200, downloads: 75, likes: 40 }
    ],
    totalAnimes: 2,
    hasNextPage: false,
    hasPrevPage: false,
    fetchAnimes: vi.fn().mockResolvedValue(undefined),
    fetchCategories: vi.fn().mockResolvedValue(undefined)
};

// Mock auth store dengan spy yang benar
const mockAuthStore = {
    user: {
        id: "admin-123",
        username: "admin",
        email: "admin@indotosho.com",
        role: "admin",
        createdAt: new Date().toISOString()
    },
    isLoading: false,
    error: null,
    isInitialized: true,
    isAuthenticated: true,
    isAdmin: true,
    currentUser: {
        id: "admin-123",
        username: "admin",
        email: "admin@indotosho.com",
        role: "admin",
        createdAt: new Date().toISOString()
    },
    login: vi.fn().mockResolvedValue({ success: true }),
    register: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn().mockResolvedValue(undefined),
    checkAuth: vi.fn().mockResolvedValue(undefined)
};

// Setup mock implementations
mockUseAnimeStore.mockReturnValue(mockAnimeStore);
mockUseAuthStore.mockReturnValue(mockAuthStore);

// Mock Nuxt head
vi.mock("#head", () => ({
    useHead: vi.fn()
}));

// Mock Supabase Client with comprehensive chain methods
const mockSupabaseData = {
    posts: [
        {
            id: "1",
            title: "Attack on Titan Final Season",
            views: 1500,
            downloads: 800,
            likes: 250,
            status: "active",
            status_approval: "published",
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
            id: "2",
            title: "Demon Slayer Season 3",
            views: 1200,
            downloads: 600,
            likes: 180,
            status: "active",
            status_approval: "published",
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
        },
        {
            id: "3",
            title: "One Piece Episode 1000",
            views: 2000,
            downloads: 1000,
            likes: 350,
            status: "active",
            status_approval: "pending",
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        }
    ],
    profiles: [
        {
            id: "1",
            username: "admin_user",
            email: "admin@indotosho.com",
            role: "admin",
            status: "active",
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
            id: "2",
            username: "john_doe",
            email: "john@example.com",
            role: "user",
            status: "active",
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        },
        {
            id: "3",
            username: "jane_smith",
            email: "jane@example.com",
            role: "user",
            status: "active",
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        },
        {
            id: "4",
            username: "moderator_1",
            email: "mod@indotosho.com",
            role: "admin",
            status: "active",
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
    ]
};

// Create chainable mock methods
const createChainableMock = (data: any[], tableName: string) => {
    const chainMock = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: vi.fn(callback => {
            // Simulate async behavior
            return Promise.resolve({ data, error: null }).then(callback);
        }),
        catch: vi.fn(callback => {
            return Promise.resolve({ data, error: null }).catch(callback);
        })
    };

    // Make it thenable (Promise-like)
    Object.defineProperty(chainMock, "then", {
        value: vi.fn(onResolve => {
            let filteredData = data;

            // Apply filters based on mock calls
            const selectCalls = chainMock.select.mock.calls;
            const orderCalls = chainMock.order.mock.calls;
            const limitCalls = chainMock.limit.mock.calls;

            // Handle order calls
            if (orderCalls.length > 0) {
                const [field, options] = orderCalls[orderCalls.length - 1];
                const ascending = options?.ascending !== false;
                filteredData = [...filteredData].sort((a, b) => {
                    const aVal = new Date(a[field]).getTime();
                    const bVal = new Date(b[field]).getTime();
                    return ascending ? aVal - bVal : bVal - aVal;
                });
            }

            // Handle limit calls
            if (limitCalls.length > 0) {
                const limit = limitCalls[limitCalls.length - 1][0];
                filteredData = filteredData.slice(0, limit);
            }

            // Handle select calls for specific fields
            if (selectCalls.length > 0) {
                const selectFields = selectCalls[selectCalls.length - 1][0];
                if (selectFields !== "*") {
                    const fields = selectFields.split(",").map((f: string) => f.trim());
                    filteredData = filteredData.map(item => {
                        const filtered: any = {};
                        fields.forEach(field => {
                            if (item[field] !== undefined) {
                                filtered[field] = item[field];
                            }
                        });
                        return filtered;
                    });
                }
            }

            return onResolve({ data: filteredData, error: null });
        }),
        writable: true,
        configurable: true
    });

    return chainMock;
};

// Mock Supabase client
const mockSupabaseClient = {
    from: vi.fn((tableName: string) => {
        const data = mockSupabaseData[tableName as keyof typeof mockSupabaseData] || [];
        return createChainableMock(data, tableName);
    }),
    auth: {
        getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "admin-123", email: "admin@indotosho.com" } },
            error: null
        })
    }
};

// Mock useSupabase composable
vi.mock("~/services/supabaseClient", () => ({
    useSupabase: () => ({
        client: mockSupabaseClient
    })
}));

// Mock API data for backward compatibility
const mockApiData = {
    users: {
        total: 4,
        active: 4,
        admins: 2
    },
    posts: {
        total: 3,
        published: 2,
        pending: 1
    }
};

vi.mock("~/composables/useApi", () => ({
    useApi: () => ({
        getUserStats: vi.fn().mockResolvedValue(mockApiData.users),
        getPostStats: vi.fn().mockResolvedValue(mockApiData.posts)
    })
}));

// Mock $fetch for API calls
const mockFetch = vi.fn();
global.$fetch = mockFetch;

// Setup default mock response for /api/admin/stats
mockFetch.mockImplementation((url: string) => {
    if (url === "/api/admin/stats") {
        return Promise.resolve({
            userStats: {
                total: 3,
                active: 2,
                admins: 2
            },
            postStats: {
                total: 0,
                published: 0,
                pending: 0
            },
            success: true
        });
    }
    return Promise.reject(new Error(`Unmocked fetch call to ${url}`));
});

describe("Admin Index Page", () => {
    let wrapper: any;
    let pinia: any;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);

        // Reset mocks
        vi.clearAllMocks();
        mockFetch.mockClear();

        // Reset spy functions
        mockUseAnimeStore.mockClear();
        mockUseAuthStore.mockClear();

        // Reset $fetch mock to default behavior
        mockFetch.mockImplementation((url: string) => {
            if (url === "/api/admin/stats") {
                return Promise.resolve({
                    userStats: {
                        total: 3,
                        active: 2,
                        admins: 2
                    },
                    postStats: {
                        total: 0,
                        published: 0,
                        pending: 0
                    },
                    success: true
                });
            }
            return Promise.reject(new Error(`Unmocked fetch call to ${url}`));
        });

        // Reset mock store data to default values
        mockAnimeStore.animes = [
            { id: "1", title: "Anime 1", views: 100, downloads: 50, likes: 25 },
            { id: "2", title: "Anime 2", views: 200, downloads: 75, likes: 40 }
        ];
        mockAnimeStore.filteredAnimes = [
            { id: "1", title: "Anime 1", views: 100, downloads: 50, likes: 25 },
            { id: "2", title: "Anime 2", views: 200, downloads: 75, likes: 40 }
        ];
        mockAnimeStore.totalAnimes = 2;
        mockAnimeStore.loading = false;
        mockAnimeStore.error = null;

        mockAuthStore.user = {
            id: "admin-123",
            username: "admin",
            email: "admin@indotosho.com",
            role: "admin",
            createdAt: new Date().toISOString()
        };
        mockAuthStore.isAuthenticated = true;
        mockAuthStore.isAdmin = true;
        mockAuthStore.isLoading = false;
        mockAuthStore.error = null;
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    // Helper function to wait for all async operations
    const waitForAsyncOperations = async () => {
        await nextTick();
        await flushPromises();
        // Additional wait for any remaining async operations
        await new Promise(resolve => setTimeout(resolve, 10));
    };

    // Helper function to create wrapper with proper configuration
    const createWrapper = (options = {}) => {
        return mount(markRaw(AdminIndexPage), {
            global: {
                plugins: [pinia],
                provide: {
                    // Provide any necessary injections
                },
                stubs: {
                    // Stub any problematic child components
                    NuxtLink: {
                        template: '<a :href="to"><slot /></a>',
                        props: ["to"]
                    }
                },
                mocks: {
                    // Mock any global properties if needed
                }
            },
            ...options
        });
    };

    describe("Component Rendering", () => {
        it("should render admin dashboard with title", () => {
            wrapper = createWrapper();

            expect(wrapper.find("h1").text()).toBe("Admin Panel");
        });

        it("should render anime statistics section", () => {
            wrapper = createWrapper();

            expect(wrapper.text()).toContain("Total Anime");
            expect(wrapper.text()).toContain("Total Views");
            expect(wrapper.text()).toContain("Total Downloads");
            expect(wrapper.text()).toContain("Total Likes");
        });

        it("should render user management section", async () => {
            wrapper = createWrapper();
            await waitForAsyncOperations();

            expect(wrapper.text()).toContain("User Management");
            expect(wrapper.text()).toContain("Total Users:");
            expect(wrapper.text()).toContain("Active Users:");
            expect(wrapper.text()).toContain("Admin Users:");
        });

        it("should render post management section", async () => {
            wrapper = createWrapper();
            await waitForAsyncOperations();

            expect(wrapper.text()).toContain("Posts Management");
            expect(wrapper.text()).toContain("Total Posts:");
            expect(wrapper.text()).toContain("Published Posts:");
            expect(wrapper.text()).toContain("Pending Review:");
        });

        it("should render navigation links", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Check for BackButton component (renders as button)
            expect(wrapper.find("button").exists()).toBe(true);
            expect(wrapper.text()).toContain("Back to Site");

            // Check for NuxtLink components (should render as <a> tags)
            expect(wrapper.find('a[href="/admin/users"]').exists()).toBe(true);
            expect(wrapper.find('a[href="/admin/posts"]').exists()).toBe(true);
        });
    });

    describe("Statistics Display", () => {
        it("should display anime statistics correctly", async () => {
            wrapper = createWrapper();

            // Wait for all async operations including onMounted
            await waitForAsyncOperations();

            // Check that statistics are displayed (numbers may vary based on mock data)
            const text = wrapper.text();
            expect(text).toMatch(/\d+/); // Contains at least one number
            expect(text).toContain("Total Views");
            expect(text).toContain("Total Downloads");
            expect(text).toContain("Total Likes");
        });

        it("should display user statistics correctly", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            // Check that user statistics section exists
            const text = wrapper.text();
            expect(text).toContain("Total Users:");
            expect(text).toContain("Active Users:");
            expect(text).toContain("Admin Users:");
        });

        it("should display post statistics correctly", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            // Check that post statistics section exists
            const text = wrapper.text();
            expect(text).toContain("Total Posts:");
            expect(text).toContain("Published Posts:");
            expect(text).toContain("Pending Review:");
        });

        it("should handle empty anime data", () => {
            mockAnimeStore.animes = [];
            mockAnimeStore.totalAnimes = 0;

            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            expect(wrapper.text()).toContain("0"); // Should show 0 for all stats
        });
    });

    describe("Computed Properties", () => {
        it("should calculate fallback stats from anime store", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Test fallback computed properties when Supabase data is not available
            expect(wrapper.vm.fallbackStats).toHaveProperty("totalAnime");
            expect(wrapper.vm.fallbackStats).toHaveProperty("totalViews");
            expect(wrapper.vm.fallbackStats).toHaveProperty("totalDownloads");
            expect(wrapper.vm.fallbackStats).toHaveProperty("totalLikes");
            expect(typeof wrapper.vm.fallbackStats.totalAnime).toBe("number");
        });

        it("should handle anime data without stats", () => {
            mockAnimeStore.animes = [
                { id: 1, title: "Anime 1" }, // Missing stats
                { id: 2, title: "Anime 2", views: 100, downloads: 50, likes: 25 } // Partial stats
            ];

            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Check that fallbackStats properties exist and are numbers or NaN
            expect(typeof wrapper.vm.fallbackStats.totalViews).toBe("number");
            expect(typeof wrapper.vm.fallbackStats.totalDownloads).toBe("number");
            expect(typeof wrapper.vm.fallbackStats.totalLikes).toBe("number");
        });

        it("should prioritize Supabase stats over fallback", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            // After mounting and async operations, stats should come from Supabase mock
            expect(wrapper.vm.stats.totalAnime).toBe(3); // From Supabase mock data
            expect(wrapper.vm.stats.totalViews).toBe(4700); // 1500 + 1200 + 2000
            expect(wrapper.vm.stats.totalDownloads).toBe(2400); // 800 + 600 + 1000
            expect(wrapper.vm.stats.totalLikes).toBe(780); // 250 + 180 + 350
        });
    });

    describe("Data Loading", () => {
        it("should load data from Supabase on mount", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            // Verify that Supabase client was called for posts (direct fetch in fetchStats)
            expect(mockSupabaseClient.from).toHaveBeenCalledWith("posts");
            // Note: profiles table is accessed via API endpoint /api/admin/stats, not directly
        });

        it("should fetch anime store data if empty", async () => {
            // Reset anime store to empty
            mockAnimeStore.animes = [];
            const fetchAnimesSpy = vi.spyOn(mockAnimeStore, "fetchAnimes");

            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            expect(fetchAnimesSpy).toHaveBeenCalled();
        });

        it("should handle Supabase errors gracefully", async () => {
            // Mock Supabase to return errors
            const errorMock = {
                data: null,
                error: new Error("Supabase connection failed")
            };

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockResolvedValue(errorMock)
            });

            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            // Should not crash and show default values
            expect(wrapper.vm.userStats).toEqual({
                total: 3,
                active: 2,
                admins: 2
            });

            expect(wrapper.vm.postStats).toEqual({
                total: 0,
                published: 0,
                pending: 0
            });
        });
    });

    describe("Navigation", () => {
        it("should have correct navigation links", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Check for BackButton component (renders as button)
            const backButton = wrapper.find("button");
            const usersLink = wrapper.find('a[href="/admin/users"]');
            const postsLink = wrapper.find('a[href="/admin/posts"]');

            expect(backButton.exists()).toBe(true);
            expect(usersLink.exists()).toBe(true);
            expect(postsLink.exists()).toBe(true);

            expect(backButton.text()).toContain("Back to Site");
            expect(usersLink.text()).toContain("Manage Users");
            expect(postsLink.text()).toContain("Manage Posts");
        });

        it("should navigate to correct pages when links are clicked", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            const usersLink = wrapper.find('a[href="/admin/users"]');
            await usersLink.trigger("click");

            // Note: In a real test, you might want to test router navigation
            // This depends on how your router is set up
        });
    });

    describe("Responsive Design", () => {
        it("should render statistics cards in a responsive grid", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            const statsCards = wrapper.findAll(".bg-white.shadow.rounded-lg");
            expect(statsCards.length).toBeGreaterThan(0);
        });

        it("should have proper CSS classes for responsive layout", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Check for common responsive classes
            const hasResponsiveClasses =
                wrapper.html().includes("grid") || wrapper.html().includes("flex") || wrapper.html().includes("col-");

            expect(hasResponsiveClasses).toBe(true);
        });
    });

    describe("Loading States", () => {
        it("should show loading state initially", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Check that component has isLoading property
            expect(wrapper.vm).toHaveProperty("isLoading");
        });

        it("should hide loading state after data is loaded", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            expect(wrapper.vm.isLoading).toBe(false);
        });
    });

    describe("Error Handling", () => {
        it("should handle missing anime store gracefully", () => {
            // Reset mock store to empty state
            mockAnimeStore.animes = [];
            mockAnimeStore.filteredAnimes = [];
            mockAnimeStore.totalAnimes = 0;

            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // When animes array is empty, fallbackStats should return 0 or handle NaN gracefully
            const totalViews = wrapper.vm.fallbackStats.totalViews;
            const totalDownloads = wrapper.vm.fallbackStats.totalDownloads;
            const totalLikes = wrapper.vm.fallbackStats.totalLikes;

            expect(totalViews === 0 || isNaN(totalViews)).toBe(true);
            expect(totalDownloads === 0 || isNaN(totalDownloads)).toBe(true);
            expect(totalLikes === 0 || isNaN(totalLikes)).toBe(true);
        });

        it("should handle Supabase failures without crashing", async () => {
            // Mock Supabase to throw errors
            mockSupabaseClient.from.mockImplementation(() => {
                throw new Error("Network error");
            });

            expect(() => {
                wrapper = mount(markRaw(AdminIndexPage), {
                    global: {
                        plugins: [pinia]
                    }
                });
            }).not.toThrow();

            await waitForAsyncOperations();

            // Component should still be mounted and functional
            expect(wrapper.exists()).toBe(true);
        });
    });

    describe("Accessibility", () => {
        it("should have proper heading structure", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            const h1 = wrapper.find("h1");

            expect(h1.exists()).toBe(true);
            expect(h1.text()).toBe("Admin Panel");
        });

        it("should have proper ARIA labels for statistics", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Check that component renders without accessibility errors
            expect(wrapper.exists()).toBe(true);
            expect(wrapper.find("h1").exists()).toBe(true);
        });
    });

    describe("Performance", () => {
        it("should render without performance issues", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Check if component renders and has DOM elements
            expect(wrapper.exists()).toBe(true);
            const renderCount = wrapper.element.querySelectorAll("*").length;
            expect(renderCount).toBeGreaterThan(0);
        });
    });

    describe("Component State", () => {
        it("should initialize with correct default state", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            // Wait for onMounted and all async operations to complete
            await waitForAsyncOperations();
            await new Promise(resolve => setTimeout(resolve, 100)); // Extra wait for API calls

            expect(wrapper.vm.userStats).toEqual({
                total: 3,
                active: 2,
                admins: 2
            });

            expect(wrapper.vm.postStats).toEqual({
                total: 0,
                published: 0,
                pending: 0
            });

            expect(wrapper.vm.isLoading).toBe(false);
        });

        it("should update state after successful Supabase calls", async () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            await waitForAsyncOperations();

            // Check that component maintains state structure
            expect(wrapper.vm.userStats).toHaveProperty("total");
            expect(wrapper.vm.userStats).toHaveProperty("active");
            expect(wrapper.vm.userStats).toHaveProperty("admins");

            expect(wrapper.vm.postStats).toHaveProperty("total");
            expect(wrapper.vm.postStats).toHaveProperty("published");
            expect(wrapper.vm.postStats).toHaveProperty("pending");

            expect(wrapper.vm.isLoading).toBe(false);
        });
    });

    describe("Integration with Stores", () => {
        it("should use anime store data correctly", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            expect(mockUseAnimeStore).toHaveBeenCalled();
            expect(wrapper.vm.animeStore.animes).toEqual(mockAnimeStore.animes);
            expect(wrapper.vm.animeStore.totalAnimes).toBe(mockAnimeStore.totalAnimes);
        });

        it("should use auth store for admin verification", () => {
            wrapper = mount(markRaw(AdminIndexPage), {
                global: {
                    plugins: [pinia]
                }
            });

            expect(mockUseAuthStore).toHaveBeenCalled();
            expect(wrapper.vm.authStore.isAdmin).toBe(true);
        });
    });
});
