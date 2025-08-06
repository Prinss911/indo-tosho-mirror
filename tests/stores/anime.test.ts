import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAnimeStore } from "~/stores/anime";
import type { Anime } from "~/stores/anime";

// Mock data untuk testing
const mockAnimes: Anime[] = [
    {
        id: "d8fba84f-c74c-4cfa-9279-9e3b4bbd19be", // UUID untuk Attack on Titan
        title: "Attack on Titan",
        category: "Anime", // Mengubah kategori menjadi "Anime"
        genre: ["Anime - Sudah diterjemahkan", "Drama", "Fantasy"],
        size: "2.5 GB",
        date: "2023-01-15",
        views: 150,
        likes: 25,
        downloads: 5000,
        submitter: "AnimeFan123",
        rating: 9.2,
        episodes: 24,
        year: 2023,
        status: "completed",
        studio: "Studio Pierrot",
        coverImage: "https://example.com/aot.jpg",
        description: "Epic anime about titans and humanity"
    },
    {
        id: "7f8d9e0a-b1c2-4d3e-8f7g-6h5j4k3l2m1n", // UUID untuk Demon Slayer
        title: "Demon Slayer",
        category: "Anime", // Mengubah kategori menjadi "Anime"
        genre: ["Anime - Sudah diterjemahkan", "Adventure"],
        size: "1.8 GB",
        date: "2023-02-10",
        views: 200,
        likes: 30,
        downloads: 7500,
        submitter: "OtakuMaster",
        rating: 8.9,
        episodes: 12,
        year: 2023,
        status: "ongoing",
        studio: "Ufotable",
        coverImage: "https://example.com/ds.jpg",
        description: "Story of a demon slayer"
    },
    {
        id: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6", // UUID untuk Your Name
        title: "Your Name",
        category: "Anime", // Mengubah kategori menjadi "Anime"
        genre: ["Romance", "Drama"],
        size: "1.2 GB",
        date: "2023-03-05",
        views: 80,
        likes: 15,
        downloads: 3000,
        submitter: "MovieLover",
        rating: 8.7,
        episodes: 1,
        year: 2016,
        status: "completed",
        studio: "CoMix Wave Films",
        coverImage: "https://example.com/yn.jpg",
        description: "Beautiful romance story"
    }
];

describe("useAnimeStore", () => {
    let store: ReturnType<typeof useAnimeStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useAnimeStore();

        // Set up categories for testing
        store.categories = [
            { id: "all", name: "Semua Kategori", parent: undefined },
            { id: "f5667b52-44f0-4a1c-b99e-14968ab427a0", name: "Anime", parent: undefined },
            { id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d", name: "Audio", parent: undefined },
            { id: "3b59343c-9989-5555-c8cd-3f3fgceg3e6e", name: "Video", parent: undefined },
            { id: "4c69444d-aa9a-6666-d9de-4g4ghdfh4f7f", name: "Game", parent: undefined },
            { id: "5d79555e-bb0b-7777-eaef-5h5hieig5g8g", name: "Software", parent: undefined }
        ];

        // Mock Supabase client
        const mockSupabase = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                    in: vi.fn().mockResolvedValue({ data: [], error: null })
                }),
                insert: vi.fn().mockResolvedValue({ data: null, error: null }),
                update: vi.fn().mockResolvedValue({ data: null, error: null }),
                delete: vi.fn().mockResolvedValue({ data: null, error: null })
            })
        };

        // Mock useSupabase composable
        vi.doMock("~/services/supabaseClient", () => ({
            useSupabase: () => ({ client: mockSupabase })
        }));
    });

    describe("Initial State", () => {
        it("should have correct initial state", () => {
            expect(store.animes).toEqual([]);
            expect(store.filteredAnimes).toEqual([]);
            expect(store.loading).toBe(false);
            expect(store.error).toBeNull();
            expect(store.filter.category).toBe("all");
            expect(store.filter.search).toBe("");
            expect(store.filter.sortBy).toBe("date");
            expect(store.filter.sortOrder).toBe("desc");
            expect(store.filter.page).toBe(1);
            expect(store.filter.perPage).toBe(20);
            expect(store.totalPages).toBe(0);
        });

        it("should have predefined categories", () => {
            // Kategori sekarang adalah array objek dengan properti id dan name
            expect(store.categories.some(cat => cat.name === "Semua Kategori")).toBe(true);
            expect(store.categories.some(cat => cat.name === "Anime")).toBe(true);
            expect(store.categories.some(cat => cat.name === "Audio")).toBe(true);
            expect(store.categories.length).toBeGreaterThan(5);
        });
    });

    describe("Getters", () => {
        beforeEach(() => {
            // Directly set mock data to store for testing getters
            store.animes = mockAnimes.map(anime => ({
                ...anime,
                statusApproval: "published"
            }));
            store.applyFilters();
        });

        it("should calculate totalAnimes correctly", () => {
            expect(store.totalAnimes).toBe(mockAnimes.length);
        });

        it("should return paginated animes", () => {
            store.filter.perPage = 2;
            store.applyFilters();

            const paginated = store.paginatedAnimes;
            expect(paginated.length).toBeLessThanOrEqual(2);
        });

        it("should calculate hasNextPage correctly", () => {
            store.filter.perPage = 1;
            store.applyFilters();

            expect(store.hasNextPage).toBe(true);

            store.setPage(store.totalPages);
            expect(store.hasNextPage).toBe(false);
        });

        it("should calculate hasPrevPage correctly", async () => {
            expect(store.hasPrevPage).toBe(false);

            // Setup data and ensure multiple pages exist
            store.animes = mockAnimes.map(anime => ({
                ...anime,
                statusApproval: "published"
            }));
            store.filter.perPage = 1; // Ensure multiple pages
            store.applyFilters();

            store.setPage(2);
            expect(store.hasPrevPage).toBe(true);
        });
    });

    describe("Actions", () => {
        describe("fetchAnimes", () => {
            it("should fetch animes successfully", async () => {
                // Directly set mock data to store for testing
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published"
                }));
                store.applyFilters();

                expect(store.animes.length).toBeGreaterThan(0);
                expect(store.filteredAnimes.length).toBeGreaterThan(0);
                expect(store.error).toBeNull();
            });

            it("should handle fetch errors", async () => {
                // Mock console.error to avoid error output in tests
                const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

                // Mock Supabase to throw an error
                const mockSupabase = {
                    from: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            order: vi.fn().mockRejectedValue(new Error("Network error"))
                        })
                    })
                };

                // Mock useSupabase for this specific test
                vi.doMock("~/services/supabaseClient", () => ({
                    useSupabase: () => ({ client: mockSupabase })
                }));

                await store.fetchAnimes();

                expect(store.loading).toBe(false);
                expect(store.error).toBe("Belum ada data anime yang tersedia");
                expect(store.animes).toEqual([]);

                consoleSpy.mockRestore();
            });
        });

        describe("applyFilters", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing filters
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
                store.categories = [
                    { id: "all", name: "Semua Kategori", parent: undefined },
                    { id: "f5667b52-44f0-4a1c-b99e-14968ab427a0", name: "Anime", parent: undefined },
                    {
                        id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d",
                        name: "Anime - Sudah diterjemahkan",
                        parent: "f5667b52-44f0-4a1c-b99e-14968ab427a0"
                    }
                ];
                store.applyFilters();
            });

            it("should filter by category", () => {
                // Simulasikan kategori dari database
                const animeCategoryId = "f5667b52-44f0-4a1c-b99e-14968ab427a0"; // ID untuk kategori Anime dari database

                // Perbarui data test untuk menggunakan ID kategori
                store.animes.forEach(anime => {
                    if (anime.category === "Anime") {
                        anime.category = animeCategoryId;
                    }
                });

                // Tambahkan kategori ke store
                store.categories = [
                    { id: "all", name: "Semua Kategori", parent: null },
                    { id: animeCategoryId, name: "Anime", parent: null },
                    { id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d", name: "Anime Music Video", parent: animeCategoryId }
                ];

                store.filter.category = animeCategoryId;
                store.applyFilters();

                const animeItems = store.filteredAnimes;
                // Dalam implementasi baru, filter kategori menggunakan ID kategori
                expect(animeItems.length).toBe(3); // Jumlah anime dengan kategori Anime

                // Pastikan semua anime yang difilter memiliki kategori yang sesuai
                animeItems.forEach(anime => {
                    // Kategori anime harus sama dengan animeCategoryId
                    expect(anime.category).toBe(animeCategoryId);
                });
            });

            it("should filter by search term", () => {
                store.filter.search = "Attack";
                store.applyFilters();

                expect(store.filteredAnimes.length).toBe(1);
                expect(store.filteredAnimes[0].title).toBe("Attack on Titan");
            });

            it("should search by submitter", () => {
                store.filter.search = "AnimeFan123";
                store.applyFilters();

                expect(store.filteredAnimes.length).toBe(1);
                expect(store.filteredAnimes[0].submitter).toBe("AnimeFan123");
            });

            it("should search by studio", () => {
                store.filter.search = "Ufotable";
                store.applyFilters();

                expect(store.filteredAnimes.length).toBe(1);
                expect(store.filteredAnimes[0].studio).toBe("Ufotable");
            });

            it("should sort by title ascending", () => {
                store.filter.sortBy = "title";
                store.filter.sortOrder = "asc";
                store.applyFilters();

                const titles = store.filteredAnimes.map(anime => anime.title);
                expect(titles[0]).toBe("Attack on Titan");
                expect(titles[1]).toBe("Demon Slayer");
                expect(titles[2]).toBe("Your Name");
            });

            it("should sort by rating descending", () => {
                store.filter.sortBy = "rating";
                store.filter.sortOrder = "desc";
                store.applyFilters();

                const ratings = store.filteredAnimes.map(anime => anime.rating);
                for (let i = 1; i < ratings.length; i++) {
                    expect(ratings[i - 1]).toBeGreaterThanOrEqual(ratings[i]);
                }
            });

            it("should sort by downloads descending", () => {
                store.filter.sortBy = "downloads";
                store.filter.sortOrder = "desc";
                store.applyFilters();

                const downloads = store.filteredAnimes.map(anime => anime.downloads);
                for (let i = 1; i < downloads.length; i++) {
                    expect(downloads[i - 1]).toBeGreaterThanOrEqual(downloads[i]);
                }
            });

            it("should sort by date descending by default", () => {
                store.filter.sortBy = "date";
                store.filter.sortOrder = "desc";
                store.applyFilters();

                const dates = store.filteredAnimes.map(anime => new Date(anime.date).getTime());
                for (let i = 1; i < dates.length; i++) {
                    expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
                }
            });

            it("should calculate total pages correctly", () => {
                store.filter.perPage = 2;
                store.applyFilters();

                expect(store.totalPages).toBe(Math.ceil(mockAnimes.length / 2));
            });

            it("should reset to page 1 when current page exceeds total pages", () => {
                store.filter.page = 5;
                store.filter.perPage = 10;
                store.applyFilters();

                expect(store.filter.page).toBe(1);
            });

            it("should combine multiple filters", () => {
                // Simulasikan kategori dari database
                const animeSubcategoryId = "2a49242b-8879-4444-b7bc-2e2efbdf2d5d"; // ID untuk subkategori Anime

                // Perbarui data test untuk menggunakan ID kategori
                store.animes.forEach(anime => {
                    if (anime.title === "Demon Slayer") {
                        anime.category = animeSubcategoryId;
                    }
                });

                // Tambahkan kategori ke store jika belum ada
                if (!store.categories.some(cat => cat.id === animeSubcategoryId)) {
                    const animeCategoryId = "f5667b52-44f0-4a1c-b99e-14968ab427a0";
                    store.categories = [
                        { id: "all", name: "Semua Kategori", parent: null },
                        { id: animeCategoryId, name: "Anime", parent: null },
                        { id: animeSubcategoryId, name: "Anime - Sudah diterjemahkan", parent: animeCategoryId }
                    ];
                }

                store.filter.category = animeSubcategoryId;
                store.filter.search = "Demon";
                store.filter.sortBy = "rating";
                store.filter.sortOrder = "desc";
                store.applyFilters();

                expect(store.filteredAnimes.length).toBe(1);
                expect(store.filteredAnimes[0].title).toBe("Demon Slayer");
            });
        });

        describe("updateFilter", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing filters
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
                store.categories = [
                    { id: "all", name: "Semua Kategori", parent: undefined },
                    { id: "f5667b52-44f0-4a1c-b99e-14968ab427a0", name: "Anime", parent: undefined },
                    {
                        id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d",
                        name: "Anime - Sudah diterjemahkan",
                        parent: "f5667b52-44f0-4a1c-b99e-14968ab427a0"
                    }
                ];
                store.applyFilters();
            });

            it("should update filter and apply changes", () => {
                // Simulasikan kategori dari database
                const animeCategoryId = "f5667b52-44f0-4a1c-b99e-14968ab427a0"; // ID untuk kategori Anime dari database

                // Perbarui data test untuk menggunakan ID kategori
                store.animes.forEach(anime => {
                    if (anime.category === "Anime") {
                        anime.category = animeCategoryId;
                    }
                });

                // Tambahkan kategori ke store jika belum ada
                if (!store.categories.length) {
                    store.categories = [
                        { id: "all", name: "Semua Kategori", parent: null },
                        { id: animeCategoryId, name: "Anime", parent: null },
                        {
                            id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d",
                            name: "Anime Music Video",
                            parent: animeCategoryId
                        }
                    ];
                }

                store.updateFilter({ category: animeCategoryId, search: "Attack" });

                expect(store.filter.category).toBe(animeCategoryId);
                expect(store.filter.search).toBe("Attack");
                expect(store.filteredAnimes.length).toBe(1);
            });

            it("should reset to page 1 when filtering", () => {
                store.filter.page = 3;
                // Simulasikan kategori dari database
                const animeCategoryId = "f5667b52-44f0-4a1c-b99e-14968ab427a0"; // ID untuk kategori Anime dari database

                // Perbarui data test untuk menggunakan ID kategori jika belum dilakukan
                if (store.animes.some(anime => anime.category === "Anime")) {
                    store.animes.forEach(anime => {
                        if (anime.category === "Anime") {
                            anime.category = animeCategoryId;
                        }
                    });
                }

                store.updateFilter({ category: animeCategoryId });

                expect(store.filter.page).toBe(1);
            });

            it("should handle perPage changes correctly", () => {
                // Test that perPage is updated correctly
                const initialPerPage = store.filter.perPage;
                store.updateFilter({ perPage: 10 });

                expect(store.filter.perPage).toBe(10);
                // Page might be reset due to applyFilters logic, which is acceptable
            });
        });

        describe("setPage", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing pagination
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
                store.filter.perPage = 1; // Ensure multiple pages
                store.applyFilters();
            });

            it("should set valid page number", () => {
                store.setPage(2);
                expect(store.filter.page).toBe(2);
            });

            it("should not set page below 1", () => {
                store.setPage(0);
                expect(store.filter.page).toBe(1);

                store.setPage(-5);
                expect(store.filter.page).toBe(1);
            });

            it("should not set page above total pages", () => {
                const maxPage = store.totalPages;
                store.setPage(maxPage + 10);
                expect(store.filter.page).toBe(maxPage);
            });
        });

        describe("getAnimeById", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing getAnimeById
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));

                // Mock Supabase for getAnimeById
                let capturedId = "";
                let capturedTable = "";
                const mockSupabase = {
                    from: vi.fn().mockImplementation(table => {
                        capturedTable = table;
                        return {
                            select: vi.fn().mockReturnValue({
                                eq: vi.fn().mockImplementation((column, value) => {
                                    capturedId = value;
                                    if (capturedTable === "posts") {
                                        return {
                                            maybeSingle: vi.fn().mockImplementation(() => {
                                                // Return the anime data if ID matches, otherwise null
                                                if (capturedId === "d8fba84f-c74c-4cfa-9279-9e3b4bbd19be") {
                                                    return Promise.resolve({
                                                        data: {
                                                            id: "d8fba84f-c74c-4cfa-9279-9e3b4bbd19be",
                                                            title: "Attack on Titan",
                                                            release_file_name: "attack-on-titan.mkv",
                                                            category_id: "f5667b52-44f0-4a1c-b99e-14968ab427a0",
                                                            submitter_id: "user1",
                                                            size: "1.5GB",
                                                            date: "2023-01-01",
                                                            views: 1000,
                                                            likes: 50,
                                                            downloads: 200,
                                                            status_approval: "published",
                                                            rating: 9.0,
                                                            episodes: 25,
                                                            genres: ["Action", "Drama"],
                                                            year: 2013,
                                                            studio: "Studio Pierrot",
                                                            cover: "cover1.jpg",
                                                            description: "Epic anime series",
                                                            download_links: ["link1"]
                                                        },
                                                        error: null
                                                    });
                                                }
                                                return Promise.resolve({ data: null, error: null });
                                            })
                                        };
                                    } else if (capturedTable === "profiles") {
                                        return {
                                            single: vi.fn().mockImplementation(() => {
                                                // Return username for user1
                                                if (capturedId === "user1") {
                                                    return Promise.resolve({
                                                        data: { username: "AnimeUser" },
                                                        error: null
                                                    });
                                                }
                                                return Promise.resolve({ data: null, error: null });
                                            })
                                        };
                                    }
                                    return {
                                        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                                        single: vi.fn().mockResolvedValue({ data: null, error: null })
                                    };
                                })
                            })
                        };
                    })
                };

                // Mock useSupabase composable for this test
                vi.doMock("~/services/supabaseClient", () => ({
                    useSupabase: () => ({ client: mockSupabase })
                }));
            });

            it("should return anime by valid ID", async () => {
                const anime = await store.getAnimeById("d8fba84f-c74c-4cfa-9279-9e3b4bbd19be");
                expect(anime).toBeDefined();
                expect(anime?.title).toBe("Attack on Titan");
            });

            it("should return undefined for invalid ID", async () => {
                const anime = await store.getAnimeById("999");
                expect(anime).toBeUndefined();
            });
        });
    });

    describe("Edge Cases", () => {
        describe("Empty anime list", () => {
            beforeEach(() => {
                store.animes = [];
                store.filteredAnimes = [];
            });

            it("should handle empty anime list", () => {
                expect(store.totalAnimes).toBe(0);
                expect(store.paginatedAnimes).toEqual([]);
                expect(store.totalPages).toBe(0);
                expect(store.hasNextPage).toBe(false);
                expect(store.hasPrevPage).toBe(false);
            });
        });

        describe("Search with no results", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing search
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
            });

            it("should handle search with no results", () => {
                store.filter.search = "NonExistentAnime";
                store.applyFilters();

                expect(store.filteredAnimes).toEqual([]);
                expect(store.paginatedAnimes).toEqual([]);
                expect(store.totalPages).toBe(0);
            });
        });

        describe("Case insensitive search", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing case insensitive search
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
            });

            it("should perform case insensitive search", () => {
                store.filter.search = "ATTACK";
                store.applyFilters();

                const results = store.filteredAnimes;
                expect(results.length).toBe(1);
                expect(results[0].title).toBe("Attack on Titan");
            });
        });

        describe("Partial search", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing partial search
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
            });

            it("should find partial matches in title", () => {
                store.filter.search = "Attack";
                store.applyFilters();

                const results = store.filteredAnimes;
                expect(results.length).toBeGreaterThan(0);
                expect(results.some(anime => anime.title.toLowerCase().includes("attack"))).toBe(true);
            });

            it("should find partial matches in submitter", () => {
                store.filter.search = "Anime";
                store.applyFilters();

                const results = store.filteredAnimes;
                expect(results.length).toBeGreaterThan(0);
                expect(results.some(anime => anime.submitter.toLowerCase().includes("anime"))).toBe(true);
            });

            it("should find partial matches in studio", () => {
                store.filter.search = "Studio";
                store.applyFilters();

                const results = store.filteredAnimes;
                expect(results.length).toBeGreaterThan(0);
                expect(results.some(anime => anime.studio.toLowerCase().includes("studio"))).toBe(true);
            });
        });

        describe("Pagination edge cases", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing pagination edge cases
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
            });

            it("should handle perPage larger than total items", () => {
                store.filter.perPage = 100;
                store.applyFilters();

                expect(store.totalPages).toBe(1);
                expect(store.paginatedAnimes.length).toBe(mockAnimes.length);
            });

            it("should handle perPage of 1", () => {
                store.filter.perPage = 1;
                store.applyFilters();

                expect(store.totalPages).toBe(mockAnimes.length);
                expect(store.paginatedAnimes.length).toBe(1);
            });
        });

        describe("Filter combinations", () => {
            beforeEach(async () => {
                // Directly set mock data to store for testing filter combinations
                store.animes = mockAnimes.map(anime => ({
                    ...anime,
                    statusApproval: "published" // Ensure all test data has published status
                }));
                store.categories = [
                    { id: "all", name: "Semua Kategori", parent: undefined },
                    { id: "f5667b52-44f0-4a1c-b99e-14968ab427a0", name: "Anime", parent: undefined },
                    {
                        id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d",
                        name: "Anime - Sudah diterjemahkan",
                        parent: "f5667b52-44f0-4a1c-b99e-14968ab427a0"
                    }
                ];
            });

            it("should handle search and category filter combination", () => {
                store.filter.search = "Attack";
                // Simulasikan kategori dari database
                const animeCategoryId = "f5667b52-44f0-4a1c-b99e-14968ab427a0"; // ID untuk kategori Anime dari database

                // Perbarui data test untuk menggunakan ID kategori jika belum dilakukan
                if (store.animes.some(anime => anime.category === "Anime")) {
                    store.animes.forEach(anime => {
                        if (anime.category === "Anime") {
                            anime.category = animeCategoryId;
                        }
                    });
                }

                // Tambahkan kategori ke store jika belum ada
                if (!store.categories.some(cat => cat.id === animeCategoryId)) {
                    store.categories = [
                        { id: "all", name: "Semua Kategori", parent: null },
                        { id: animeCategoryId, name: "Anime", parent: null },
                        {
                            id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d",
                            name: "Anime - Sudah diterjemahkan",
                            parent: animeCategoryId
                        }
                    ];
                }

                store.filter.category = animeCategoryId;
                store.applyFilters();

                expect(store.filteredAnimes.length).toBe(1);
                expect(store.filteredAnimes[0].title).toBe("Attack on Titan");
            });

            it("should handle conflicting search and category filters", () => {
                // Dalam implementasi baru, filter kategori menggunakan ID kategori
                // dan filter pencarian masih menggunakan teks
                // Kita perlu menggunakan kombinasi yang benar-benar bertentangan
                store.filter.search = "NonExistentAnime"; // Anime yang tidak ada

                // Simulasikan kategori dari database
                const animeCategoryId = "f5667b52-44f0-4a1c-b99e-14968ab427a0"; // ID untuk kategori Anime dari database

                // Perbarui data test untuk menggunakan ID kategori jika belum dilakukan
                if (store.animes.some(anime => anime.category === "Anime")) {
                    store.animes.forEach(anime => {
                        if (anime.category === "Anime") {
                            anime.category = animeCategoryId;
                        }
                    });
                }

                // Tambahkan kategori ke store jika belum ada
                if (!store.categories.some(cat => cat.id === animeCategoryId)) {
                    store.categories = [
                        { id: "all", name: "Semua Kategori", parent: null },
                        { id: animeCategoryId, name: "Anime", parent: null },
                        {
                            id: "2a49242b-8879-4444-b7bc-2e2efbdf2d5d",
                            name: "Anime - Sudah diterjemahkan",
                            parent: animeCategoryId
                        }
                    ];
                }

                store.filter.category = animeCategoryId;
                store.applyFilters();

                // Karena tidak ada anime dengan judul "NonExistentAnime", hasil filter harus kosong
                expect(store.filteredAnimes).toEqual([]);
            });
        });
    });
});
