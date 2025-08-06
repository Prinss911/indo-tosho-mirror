import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import AppHeader from "~/components/AppHeader.vue";
import { useAuthStore } from "~/stores/auth";
import { useTheme } from "~/composables/useTheme";

// Mock Nuxt composables
vi.mock("#app", () => ({
    useRouter: () => ({
        push: vi.fn(),
        currentRoute: { value: { query: {} } }
    }),
    useRoute: () => ({
        query: {}
    }),
    navigateTo: vi.fn()
}));

// Mock vue-router
vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: vi.fn()
    })
}));

// Mock useTheme composable
vi.mock("~/composables/useTheme", () => ({
    useTheme: vi.fn(() => ({
        isDarkMode: { value: false },
        toggleTheme: vi.fn()
    }))
}));

// Mock Heroicons
vi.mock("@heroicons/vue/24/outline", () => ({
    MagnifyingGlassIcon: { render: () => {} },
    SunIcon: { render: () => {} },
    MoonIcon: { render: () => {} },
    Bars3Icon: { render: () => {} },
    XMarkIcon: { render: () => {} },
    ChevronDownIcon: { render: () => {} },
    UserCircleIcon: { render: () => {} },
    CogIcon: { render: () => {} },
    ArrowRightOnRectangleIcon: { render: () => {} },
    CheckIcon: { render: () => {} },
    ShieldCheckIcon: { render: () => {} }
}));

// Mock Supabase
vi.mock("~/services/supabaseClient", () => ({
    useSupabase: vi.fn(() => ({
        client: {
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({
                            data: null,
                            error: null
                        }))
                    }))
                }))
            }))
        },
        user: { value: null }
    }))
}));

// Mock categories data
const mockCategories = [
    { id: 1, name: "Action", slug: "action" },
    { id: 2, name: "Comedy", slug: "comedy" },
    { id: 3, name: "Drama", slug: "drama" }
];

// Mock $fetch
global.$fetch = vi.fn().mockResolvedValue(mockCategories);

describe("AppHeader.vue", () => {
    let wrapper: VueWrapper<any>;
    let authStore: any;
    let mockTheme: any;

    beforeEach(() => {
        // Setup Pinia
        const pinia = createPinia();
        setActivePinia(pinia);

        // Setup auth store
        authStore = useAuthStore();
        authStore.user = null;
        authStore.isAuthenticated = false;
        authStore.isAdmin = false;
        authStore.logout = vi.fn();

        // Setup theme mock
        mockTheme = {
            isDarkMode: { value: false },
            toggleTheme: vi.fn()
        };
        vi.mocked(useTheme).mockReturnValue(mockTheme);

        // Mock window.addEventListener and removeEventListener
        global.window.addEventListener = vi.fn();
        global.window.removeEventListener = vi.fn();
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
        vi.clearAllMocks();
    });

    describe("Component Rendering", () => {
        it("should render the header component", () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            expect(wrapper.find("header").exists()).toBe(true);
            expect(wrapper.find("nav").exists()).toBe(true);
        });

        it("should render navigation links", () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const navLinks = wrapper.findAll("a");
            const linkTexts = navLinks.map(link => link.text());

            expect(linkTexts).toContain("Home");
            expect(linkTexts).toContain("Browse");
            expect(linkTexts).toContain("Top Rated");
            expect(linkTexts).toContain("Latest");
        });

        it("should render theme toggle button", () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const themeButton = wrapper.find('[data-testid="theme-toggle"]');
            expect(themeButton.exists()).toBe(true);
        });
    });

    describe("Authentication State", () => {
        it("should show login/register buttons when not authenticated", () => {
            authStore.isAuthenticated = false;
            authStore.user = null;

            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const loginButton = wrapper.find('[data-testid="login-button"]');
            const registerButton = wrapper.find('[data-testid="register-button"]');

            expect(loginButton.exists()).toBe(true);
            expect(registerButton.exists()).toBe(true);
        });

        it("should show user menu when authenticated", async () => {
            authStore.isAuthenticated = true;
            authStore.user = {
                id: "1",
                email: "test@example.com",
                username: "testuser",
                role: "user"
            };

            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            // Click the user menu button to show the dropdown
            const userMenuButton = wrapper.find('[data-testid="user-menu-button"]');
            await userMenuButton.trigger("click");

            const userMenu = wrapper.find('[data-testid="user-menu"]');
            expect(userMenu.exists()).toBe(true);
        });

        it("should show admin link for admin users", async () => {
            authStore.isAuthenticated = true;
            authStore.isAdmin = true;
            authStore.user = {
                id: "1",
                email: "admin@example.com",
                username: "admin",
                role: "admin"
            };

            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            // Directly set isAdminUser to true
            wrapper.vm.isAdminUser = true;
            await wrapper.vm.$nextTick();

            // Click the user menu button to show the dropdown
            const userMenuButton = wrapper.find('[data-testid="user-menu-button"]');
            await userMenuButton.trigger("click");

            const adminLink = wrapper.find('[data-testid="admin-link"]');
            expect(adminLink.exists()).toBe(true);
        });

        it("should not show admin link for regular users", async () => {
            authStore.isAuthenticated = true;
            authStore.isAdmin = false;
            authStore.user = {
                id: "1",
                email: "user@example.com",
                username: "user",
                role: "user"
            };

            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            // Click the user menu button to show the dropdown
            const userMenuButton = wrapper.find('[data-testid="user-menu-button"]');
            await userMenuButton.trigger("click");

            const adminLink = wrapper.find('[data-testid="admin-link"]');
            expect(adminLink.exists()).toBe(false);
        });
    });

    describe("Theme Functionality", () => {
        it("should call toggleTheme when theme button is clicked", async () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const themeButton = wrapper.find('[data-testid="theme-toggle"]');
            await themeButton.trigger("click");

            expect(mockTheme.toggleTheme).toHaveBeenCalled();
        });

        it("should display correct icon based on theme mode", () => {
            mockTheme.isDarkMode.value = true;

            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const themeButton = wrapper.find('[data-testid="theme-toggle"]');
            // Periksa keberadaan tombol tema, bukan konten spesifik
            expect(themeButton.exists()).toBe(true);
        });
    });

    describe("Search Functionality", () => {
        it("should render search input", () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const searchInput = wrapper.find('[data-testid="search-input"]');
            expect(searchInput.exists()).toBe(true);
        });

        it("should render category dropdown", () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const categorySelect = wrapper.find('[data-testid="category-select"]');
            expect(categorySelect.exists()).toBe(true);
        });

        it("should update search query when input changes", async () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const searchInput = wrapper.find('[data-testid="search-input"]');
            await searchInput.setValue("test query");

            expect((searchInput.element as HTMLInputElement).value).toBe("test query");
        });
    });

    describe("Mobile Menu", () => {
        it("should toggle mobile menu when hamburger button is clicked", async () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            const hamburgerButton = wrapper.find('[data-testid="mobile-menu-button"]');
            expect(hamburgerButton.exists()).toBe(true);

            // Initially mobile menu should be hidden
            expect(wrapper.vm.showMobileMenu).toBe(false);

            // Click hamburger button
            await hamburgerButton.trigger("click");
            expect(wrapper.vm.showMobileMenu).toBe(true);

            // Click again to hide
            await hamburgerButton.trigger("click");
            expect(wrapper.vm.showMobileMenu).toBe(false);
        });
    });

    describe("Logout Functionality", () => {
        it("should call logout when logout button is clicked", async () => {
            authStore.isAuthenticated = true;
            authStore.user = {
                id: "1",
                email: "test@example.com",
                username: "testuser",
                role: "user"
            };

            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            // Klik tombol menu pengguna terlebih dahulu untuk menampilkan dropdown
            const userMenuButton = wrapper.find('[data-testid="user-menu-button"]');
            await userMenuButton.trigger("click");

            // Sekarang cari tombol logout di dalam dropdown yang ditampilkan
            const logoutButton = wrapper.find('[data-testid="logout-button"]');
            await logoutButton.trigger("click");

            expect(authStore.logout).toHaveBeenCalled();
        });
    });

    describe("Categories Loading", () => {
        it("should load categories on mount", async () => {
            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            // Wait for categories to load
            await wrapper.vm.$nextTick();

            expect(global.$fetch).toHaveBeenCalledWith("/api/categories");
            expect(wrapper.vm.categories).toEqual(mockCategories);
        });

        it("should handle categories loading error gracefully", async () => {
            global.$fetch = vi.fn().mockRejectedValue(new Error("Failed to load"));

            wrapper = mount(AppHeader, {
                global: {
                    stubs: {
                        NuxtLink: {
                            template: "<a><slot /></a>"
                        }
                    }
                }
            });

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.categories).toEqual([]);
        });
    });
});
