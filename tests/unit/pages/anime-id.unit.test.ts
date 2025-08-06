import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { useAnimeStore } from "~/stores/anime";
import { useRoute, useRouter } from "vue-router";
import AnimeIdPage from "~/pages/anime/[id].vue";

// Mock the components and composables
vi.mock("#imports", async () => {
    const actual = await vi.importActual("#imports");
    return {
        ...(actual as any),
        navigateTo: vi.fn(),
        useHead: vi.fn()
    };
});

// Mock Vue Router
vi.mock("vue-router", () => ({
    useRoute: vi.fn(),
    useRouter: vi.fn()
}));

// Mock Supabase Client
const mockSupabaseClient = {
    from: vi.fn().mockImplementation((table: string) => {
        if (table === "posts") {
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: {
                                id: "d8fba84f-c74c-4cfa-9279-9e3b4bbd19be",
                                title: "Attack on Titan",
                                release_file_name: "Attack on Titan S01 BD 1080p",
                                category_id: "anime-category-id",
                                submitter_id: "user-id-123",

                                date: "2023-01-15",
                                views: 150,
                                likes: 25,
                                downloads: 5000,
                                status_approval: "completed",
                                rating: 9.2,
                                episodes: 24,
                                genres: ["Action", "Drama", "Fantasy"],
                                year: 2023,
                                studio: "Studio Pierrot",
                                cover: "https://example.com/aot.jpg",
                                description: "Epic anime about titans and humanity",
                                download_links: [
                                    { hosting: "Google Drive", url: "https://drive.google.com/file1" },
                                    { hosting: "Mega", url: "https://mega.nz/file1" }
                                ],
                                status: "completed",
                                cover_image: "https://example.com/aot.jpg",
                                genre: ["Action", "Drama", "Fantasy"]
                            },
                            error: null
                        })
                    })
                })
            };
        } else if (table === "profiles") {
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: {
                                username: "AnimeFan123"
                            },
                            error: null
                        })
                    })
                })
            };
        }
        // Default fallback
        return {
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
                })
            })
        };
    })
};

vi.mock("~/services/supabaseClient", () => ({
    useSupabase: () => ({ client: mockSupabaseClient })
}));

// Mock anime data
const mockAnime = {
    id: "d8fba84f-c74c-4cfa-9279-9e3b4bbd19be",
    title: "Attack on Titan",
    releaseFileName: "Attack on Titan S01 BD 1080p",
    category: "anime-category-id",
    submitter: "AnimeFan123",
    submitter_id: "user-id-123",

    date: "2023-01-15",
    views: 150,
    likes: 25,
    downloads: 5000,
    status: "completed",
    rating: 9.2,
    episodes: 24,
    genre: ["Action", "Drama", "Fantasy"],
    year: 2023,
    studio: "Studio Pierrot",
    coverImage: "https://example.com/aot.jpg",
    description: "Epic anime about titans and humanity",
    downloadLinks: [
        { hosting: "Google Drive", url: "https://drive.google.com/file1" },
        { hosting: "Mega", url: "https://mega.nz/file1" }
    ]
};

// Import the component
let AnimeIdPage;

describe("Anime ID Page", () => {
    let wrapper;
    let animeStore: ReturnType<typeof useAnimeStore>;
    let routeMock;
    let getByIdMock: ReturnType<typeof vi.spyOn>;
    let fetchAnimesMock: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
        // Set up Pinia
        const pinia = createPinia();
        setActivePinia(pinia);
        animeStore = useAnimeStore();
        // Reset the store state before each test
        animeStore.$reset();
        // Ensure animes array is empty for tests that rely on initial fetch
        animeStore.animes = [];

        // Mock route
        routeMock = {
            params: { id: mockAnime.id },
            query: {},
            path: `/anime/${mockAnime.id}`,
            name: "anime-id"
        };
        (useRoute as any).mockReturnValue(routeMock);

        // Mock router
        (useRouter as any).mockReturnValue({
            push: vi.fn(),
            replace: vi.fn(),
            go: vi.fn(),
            back: vi.fn(),
            forward: vi.fn()
        });

        // Mock console.error and console.log to avoid cluttering test output
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "log").mockImplementation(() => {});

        // Create spies after store is initialized
        getByIdMock = vi.spyOn(animeStore, "getAnimeById");
        fetchAnimesMock = vi.spyOn(animeStore, "fetchAnimes");

        // Mock getAnimeById to return our mock data
        getByIdMock.mockResolvedValue(mockAnime);
        fetchAnimesMock.mockResolvedValue(undefined);

        // Mount the component with the same pinia instance
        wrapper = await mount(AnimeIdPage, {
            global: {
                plugins: [pinia],
                stubs: {
                    AppHeader: true,
                    NuxtLink: true,
                    ClientOnly: {
                        template: "<div><slot /></div>"
                    },
                    StarIcon: true,
                    EyeIcon: true,
                    HeartIcon: true,
                    ArrowDownTrayIcon: true,
                    PlayIcon: true,
                    BookmarkIcon: true,
                    UserIcon: true,
                    CalendarIcon: true,
                    ChevronRightIcon: true,
                    ExclamationTriangleIcon: true,
                    ChatBubbleLeftEllipsisIcon: true
                },
                provide: {
                    useRoute: routeMock,
                    useRouter: vi.fn()
                }
            }
        });

        // Wait for promises to resolve
        await flushPromises();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch anime data on mount", async () => {
        expect(animeStore.getAnimeById).toHaveBeenCalledWith(mockAnime.id);
    });

    it("should display loading state initially", async () => {
        // Create a new wrapper to test initial loading state
        const newWrapper = await mount(AnimeIdPage, {
            global: {
                plugins: [createPinia()],
                stubs: {
                    AppHeader: true,
                    NuxtLink: true,
                    ClientOnly: {
                        template: "<div><slot /></div>"
                    }
                },
                provide: {
                    useRoute: routeMock,
                    useRouter: vi.fn()
                }
            }
        });

        // Before promises resolve, it should show loading
        expect(newWrapper.find("[data-testid='loading']").exists()).toBe(true);
    });

    it("should display anime details after loading", async () => {
        // After promises resolve, it should show anime details
        expect(wrapper.find("[data-testid='loading']").exists()).toBe(false);
        expect(wrapper.find("[data-testid='anime-details']").exists()).toBe(true);
        expect(wrapper.text()).toContain(mockAnime.title);
        expect(wrapper.text()).toContain(mockAnime.studio);
    });

    it("should display anime metadata correctly", async () => {
        // Check if metadata is displayed correctly
        expect(wrapper.text()).toContain(mockAnime.episodes.toString());
        expect(wrapper.text()).toContain(mockAnime.year.toString());
    });

    it("should display genre tags", async () => {
        // Check if genre tags are displayed
        const genreTags = wrapper.findAll("[data-testid='genre-tag']");
        expect(genreTags.length).toBe(mockAnime.genre.length);

        mockAnime.genre.forEach((genre, index) => {
            expect(genreTags[index].text()).toContain(genre);
        });
    });

    it("should display download links", async () => {
        await flushPromises();

        const downloadLinks = wrapper.findAll("[data-testid='download-link']");
        expect(downloadLinks).toHaveLength(2);

        // Check that download links have correct URLs
        mockAnime.downloadLinks.forEach((link, index) => {
            expect(downloadLinks[index].attributes("href")).toBe(link.url);
            expect(downloadLinks[index].text()).toContain("Download");
        });

        // Check that hosting info is displayed in the component text
        const componentText = wrapper.text();
        expect(componentText).toContain("Google Drive");
        expect(componentText).toContain("Mega");
    });

    it("should handle anime not found", async () => {
        // Create new spies for this test
        const localPinia = createPinia();
        setActivePinia(localPinia);
        const localAnimeStore = useAnimeStore();
        const localGetByIdMock = vi.spyOn(localAnimeStore, "getAnimeById");
        const localFetchAnimesMock = vi.spyOn(localAnimeStore, "fetchAnimes");

        // Mock getAnimeById to return undefined (anime not found)
        localGetByIdMock.mockResolvedValue(undefined);
        localFetchAnimesMock.mockResolvedValue(undefined);

        // Create a new wrapper
        const newWrapper = await mount(AnimeIdPage, {
            global: {
                plugins: [localPinia],
                stubs: {
                    AppHeader: true,
                    NuxtLink: true,
                    ClientOnly: {
                        template: "<div><slot /></div>"
                    },
                    BackButton: true,
                    ExclamationTriangleIcon: true
                },
                provide: {
                    useRoute: routeMock,
                    useRouter: vi.fn()
                }
            }
        });

        await flushPromises();
        await nextTick();

        // Should display error message
        expect(newWrapper.find("[data-testid='error-message']").exists()).toBe(true);
        expect(newWrapper.text()).toContain("Anime not found");
    });

    it("should format date correctly", async () => {
        // Get the component instance
        const vm = wrapper.vm;

        // Test the formatDate method
        expect(vm.formatDate("2023-01-15")).toBe("January 15, 2023");
        expect(vm.formatDate(null)).toBe("Unknown date");
        expect(vm.formatDate(undefined)).toBe("Unknown date");
    });

    it("should format numbers correctly", async () => {
        // Get the component instance
        const vm = wrapper.vm;

        // Test the formatNumber method
        expect(vm.formatNumber(5000)).toBe("5.0K");
        expect(vm.formatNumber(1500000)).toBe("1.5M");
        expect(vm.formatNumber(500)).toBe("500");
        expect(vm.formatNumber(null)).toBe("0");
        expect(vm.formatNumber(undefined)).toBe("0");
    });

    it("should format status correctly", async () => {
        // Get the component instance
        const vm = wrapper.vm;

        // Test the formatStatus method
        expect(vm.formatStatus("completed")).toBe("Selesai");
        expect(vm.formatStatus("ongoing")).toBe("Sedang Berlangsung");
        expect(vm.formatStatus("upcoming")).toBe("Akan Datang");
        expect(vm.formatStatus("Finished Airing")).toBe("Selesai Tayang");
        expect(vm.formatStatus("Currently Airing")).toBe("Sedang Tayang");
        expect(vm.formatStatus("Not yet aired")).toBe("Belum Tayang");
        expect(vm.formatStatus("unknown")).toBe("unknown");
    });

    it("should get correct status color", async () => {
        // Get the component instance
        const vm = wrapper.vm;

        // Test the getStatusColor method
        expect(vm.getStatusColor("completed")).toContain("bg-green");
        expect(vm.getStatusColor("ongoing")).toContain("bg-blue");
        expect(vm.getStatusColor("upcoming")).toContain("bg-yellow");
        expect(vm.getStatusColor("Finished Airing")).toContain("bg-green");
        expect(vm.getStatusColor("Currently Airing")).toContain("bg-blue");
        expect(vm.getStatusColor("Not yet aired")).toContain("bg-yellow");
        expect(vm.getStatusColor("unknown")).toContain("bg-gray");
    });

    it("should get correct category color", async () => {
        // Get the component instance
        const vm = wrapper.vm;

        // Test the getCategoryColor method
        expect(vm.getCategoryColor("Action")).toContain("bg-red");
        expect(vm.getCategoryColor("Adventure")).toContain("bg-green");
        expect(vm.getCategoryColor("Comedy")).toContain("bg-yellow");
        expect(vm.getCategoryColor("Drama")).toContain("bg-purple");
        expect(vm.getCategoryColor("Fantasy")).toContain("bg-pink");
        expect(vm.getCategoryColor("Unknown")).toContain("bg-gray");
    });

    it("should try to fetch anime again if not found initially", async () => {
        // Create new spies for this test
        const localPinia = createPinia();
        setActivePinia(localPinia);
        const localAnimeStore = useAnimeStore();
        const localGetByIdMock = vi.spyOn(localAnimeStore, "getAnimeById");
        const localFetchAnimesMock = vi.spyOn(localAnimeStore, "fetchAnimes");

        // Mock getAnimeById to return undefined first, then return anime data
        localGetByIdMock
            .mockResolvedValueOnce(undefined) // First call returns undefined
            .mockResolvedValueOnce(mockAnime); // Second call returns anime data

        localFetchAnimesMock.mockResolvedValue(undefined);

        // Create a new wrapper to trigger the lifecycle
        const newWrapper = await mount(AnimeIdPage, {
            global: {
                plugins: [localPinia],
                stubs: {
                    AppHeader: true,
                    NuxtLink: true,
                    ClientOnly: {
                        template: "<div><slot /></div>"
                    },
                    BackButton: true,
                    ExclamationTriangleIcon: true,
                    ChevronRightIcon: true,
                    StarIcon: true,
                    EyeIcon: true,
                    ArrowDownTrayIcon: true,
                    HeartIcon: true,
                    PlayIcon: true,
                    BookmarkIcon: true,
                    UserIcon: true,
                    CalendarIcon: true
                },
                provide: {
                    useRoute: routeMock,
                    useRouter: vi.fn()
                }
            }
        });

        await flushPromises();
        await nextTick();

        // Expect getById to be called twice (initial fetch and retry)
        expect(localGetByIdMock).toHaveBeenCalledTimes(2);

        // Assert that anime details are eventually displayed
        expect(newWrapper.find("[data-testid='anime-details']").exists()).toBe(true);
    });
});
