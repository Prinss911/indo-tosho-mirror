import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockDatabaseService, mockDatabase } from "~/services/mockDatabase";
import type { Anime } from "~/stores/anime";

describe("MockDatabaseService", () => {
    let service: MockDatabaseService;

    beforeEach(() => {
        service = MockDatabaseService.getInstance();
        service.reset(); // Reset data before each test
    });

    describe("Singleton Pattern", () => {
        it("should return the same instance", () => {
            const instance1 = MockDatabaseService.getInstance();
            const instance2 = MockDatabaseService.getInstance();
            expect(instance1).toBe(instance2);
        });

        it("should export a singleton instance", () => {
            expect(mockDatabase).toBeInstanceOf(MockDatabaseService);
            expect(mockDatabase).toBe(MockDatabaseService.getInstance());
        });
    });

    describe("getAllAnimes", () => {
        it("should return all animes", async () => {
            const animes = await service.getAllAnimes();
            expect(Array.isArray(animes)).toBe(true);
            expect(animes.length).toBeGreaterThan(0);

            // Check if first anime has required properties
            const firstAnime = animes[0];
            expect(firstAnime).toHaveProperty("id");
            expect(firstAnime).toHaveProperty("title");
            expect(firstAnime).toHaveProperty("category");
            expect(firstAnime).toHaveProperty("genre");
            expect(firstAnime).toHaveProperty("rating");
        });

        it("should return a copy of the data (not reference)", async () => {
            const animes1 = await service.getAllAnimes();
            const animes2 = await service.getAllAnimes();

            expect(animes1).not.toBe(animes2); // Different array references
            expect(animes1).toEqual(animes2); // Same content
        });
    });

    describe("getAnimeById", () => {
        it("should return anime by valid ID", async () => {
            const anime = await service.getAnimeById("d8fba84f-c74c-4cfa-9279-9e3b4bbd19be");
            expect(anime).toBeTruthy();
            expect(anime?.id).toBe("d8fba84f-c74c-4cfa-9279-9e3b4bbd19be");
            expect(anime?.title).toBe("Attack on Titan");
        });

        it("should return null for invalid ID", async () => {
            const anime = await service.getAnimeById("999");
            expect(anime).toBeNull();
        });

        it("should return null for empty ID", async () => {
            const anime = await service.getAnimeById("");
            expect(anime).toBeNull();
        });
    });

    describe("searchAnimes", () => {
        it("should search by title", async () => {
            const results = await service.searchAnimes("Attack");
            expect(results.length).toBe(1);
            expect(results[0].title).toBe("Attack on Titan");
        });

        it("should search case-insensitively", async () => {
            const results = await service.searchAnimes("attack");
            expect(results.length).toBe(1);
            expect(results[0].title).toBe("Attack on Titan");
        });

        it("should search by genre", async () => {
            const results = await service.searchAnimes("Action");
            expect(results.length).toBeGreaterThan(0);
            results.forEach(anime => {
                expect(anime.genre).toContain("Action");
            });
        });

        it("should search by studio", async () => {
            const results = await service.searchAnimes("Studio Ghibli");
            expect(results.length).toBeGreaterThan(0);
            results.forEach(anime => {
                expect(anime.studio).toBe("Studio Ghibli");
            });
        });

        it("should search by submitter", async () => {
            const results = await service.searchAnimes("AnimeFan123");
            expect(results.length).toBe(1);
            expect(results[0].submitter).toBe("AnimeFan123");
        });

        it("should return empty array for no matches", async () => {
            const results = await service.searchAnimes("NonexistentAnime");
            expect(results).toEqual([]);
        });

        it("should handle empty search query", async () => {
            const results = await service.searchAnimes("");
            expect(results).toEqual([]);
        });
    });

    describe("getAnimesByCategory", () => {
        it("should filter by category", async () => {
            const actionAnimes = await service.getAnimesByCategory("Anime - Sudah diterjemahkan");
            expect(actionAnimes.length).toBeGreaterThan(0);
            actionAnimes.forEach(anime => {
                expect(anime.category).toBe("Anime - Sudah diterjemahkan");
            });
        });

        it('should return all animes for "All" category', async () => {
            const allAnimes = await service.getAllAnimes();
            const categoryAnimes = await service.getAnimesByCategory("All");
            expect(categoryAnimes.length).toBe(allAnimes.length);
        });

        it("should return all animes for empty category", async () => {
            const allAnimes = await service.getAllAnimes();
            const categoryAnimes = await service.getAnimesByCategory("");
            expect(categoryAnimes.length).toBe(allAnimes.length);
        });

        it("should return empty array for non-existent category", async () => {
            const results = await service.getAnimesByCategory("NonexistentCategory");
            expect(results).toEqual([]);
        });
    });

    describe("getAnimesWithPagination", () => {
        it("should return paginated results", async () => {
            const result = await service.getAnimesWithPagination(1, 5);

            expect(result.animes.length).toBeLessThanOrEqual(5);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(5);
            expect(result.total).toBeGreaterThan(0);
            expect(result.totalPages).toBeGreaterThan(0);
        });

        it("should handle different page numbers", async () => {
            const page1 = await service.getAnimesWithPagination(1, 3);
            const page2 = await service.getAnimesWithPagination(2, 3);

            expect(page1.animes).not.toEqual(page2.animes);
            expect(page1.page).toBe(1);
            expect(page2.page).toBe(2);
        });

        it("should apply search filter", async () => {
            const result = await service.getAnimesWithPagination(1, 10, {
                search: "Attack"
            });

            expect(result.animes.length).toBe(1);
            expect(result.animes[0].title).toBe("Attack on Titan");
        });

        it("should apply category filter", async () => {
            const result = await service.getAnimesWithPagination(1, 10, {
                category: "Anime - Sudah diterjemahkan"
            });

            result.animes.forEach(anime => {
                expect(anime.category).toBe("Anime - Sudah diterjemahkan");
            });
        });

        it("should apply sorting by title ascending", async () => {
            const result = await service.getAnimesWithPagination(1, 10, {
                sortBy: "title",
                sortOrder: "asc"
            });

            for (let i = 1; i < result.animes.length; i++) {
                const comparison = result.animes[i - 1].title
                    .toLowerCase()
                    .localeCompare(result.animes[i].title.toLowerCase());
                expect(comparison).toBeLessThanOrEqual(0);
            }
        });

        it("should apply sorting by rating descending", async () => {
            const result = await service.getAnimesWithPagination(1, 10, {
                sortBy: "rating",
                sortOrder: "desc"
            });

            for (let i = 1; i < result.animes.length; i++) {
                expect(result.animes[i - 1].rating).toBeGreaterThanOrEqual(result.animes[i].rating);
            }
        });

        it("should apply sorting by date", async () => {
            const result = await service.getAnimesWithPagination(1, 10, {
                sortBy: "date",
                sortOrder: "desc"
            });

            for (let i = 1; i < result.animes.length; i++) {
                const date1 = new Date(result.animes[i - 1].date).getTime();
                const date2 = new Date(result.animes[i].date).getTime();
                expect(date1).toBeGreaterThanOrEqual(date2);
            }
        });

        it("should combine multiple filters", async () => {
            const result = await service.getAnimesWithPagination(1, 10, {
                search: "a",
                category: "Anime - Sudah diterjemahkan",
                sortBy: "rating",
                sortOrder: "desc"
            });

            result.animes.forEach(anime => {
                expect(anime.category).toBe("Anime - Sudah diterjemahkan");
                expect(anime.title.toLowerCase()).toContain("a");
            });
        });
    });

    describe("getPopularAnimes", () => {
        it("should return animes sorted by downloads", async () => {
            const popular = await service.getPopularAnimes(5);

            expect(popular.length).toBeLessThanOrEqual(5);
            for (let i = 1; i < popular.length; i++) {
                expect(popular[i - 1].downloads).toBeGreaterThanOrEqual(popular[i].downloads);
            }
        });

        it("should respect the limit parameter", async () => {
            const popular = await service.getPopularAnimes(3);
            expect(popular.length).toBeLessThanOrEqual(3);
        });
    });

    describe("getRecentAnimes", () => {
        it("should return animes sorted by date", async () => {
            const recent = await service.getRecentAnimes(5);

            expect(recent.length).toBeLessThanOrEqual(5);
            for (let i = 1; i < recent.length; i++) {
                const date1 = new Date(recent[i - 1].date).getTime();
                const date2 = new Date(recent[i].date).getTime();
                expect(date1).toBeGreaterThanOrEqual(date2);
            }
        });
    });

    describe("getTopRatedAnimes", () => {
        it("should return animes sorted by rating", async () => {
            const topRated = await service.getTopRatedAnimes(5);

            expect(topRated.length).toBeLessThanOrEqual(5);
            for (let i = 1; i < topRated.length; i++) {
                expect(topRated[i - 1].rating).toBeGreaterThanOrEqual(topRated[i].rating);
            }
        });
    });

    describe("getCategories", () => {
        it('should return all categories including "all"', async () => {
            const categories = await service.getCategories();

            expect(categories).toContain("all");
            expect(categories[0]).toBe("all");
            expect(categories.length).toBeGreaterThan(1);
        });

        it("should return unique categories", async () => {
            const categories = await service.getCategories();
            const uniqueCategories = [...new Set(categories)];

            expect(categories.length).toBe(uniqueCategories.length);
        });
    });

    describe("getStatistics", () => {
        it("should return correct statistics", async () => {
            const stats = await service.getStatistics();

            expect(stats).toHaveProperty("totalAnimes");
            expect(stats).toHaveProperty("totalCategories");
            expect(stats).toHaveProperty("totalDownloads");
            expect(stats).toHaveProperty("averageRating");

            expect(stats.totalAnimes).toBeGreaterThan(0);
            expect(stats.totalCategories).toBeGreaterThan(0);
            expect(stats.totalDownloads).toBeGreaterThan(0);
            expect(stats.averageRating).toBeGreaterThan(0);
            expect(stats.averageRating).toBeLessThanOrEqual(10);
        });
    });

    describe("CRUD Operations", () => {
        const testAnime: Anime = {
            id: "test-1",
            title: "Test Anime",
            category: "Test",
            genre: ["Test"],
            size: "1.0 GB",
            date: "2023-01-01",
            views: 10,
            likes: 5,
            downloads: 100,
            submitter: "TestUser",
            rating: 8.0,
            episodes: 12,
            year: 2023,
            status: "completed",
            studio: "Test Studio",
            coverImage: "test.jpg",
            description: "Test description"
        };

        describe("addAnime", () => {
            it("should add new anime", async () => {
                const added = await service.addAnime(testAnime);
                expect(added).toEqual(testAnime);

                const found = await service.getAnimeById("test-1");
                expect(found).toEqual(testAnime);
            });
        });

        describe("updateAnime", () => {
            it("should update existing anime", async () => {
                await service.addAnime(testAnime);

                const updates = { title: "Updated Test Anime", rating: 9.0 };
                const updated = await service.updateAnime("test-1", updates);

                expect(updated?.title).toBe("Updated Test Anime");
                expect(updated?.rating).toBe(9.0);
                expect(updated?.category).toBe("Test"); // Should keep other properties
            });

            it("should return null for non-existent anime", async () => {
                const updated = await service.updateAnime("non-existent", { title: "New Title" });
                expect(updated).toBeNull();
            });
        });

        describe("deleteAnime", () => {
            it("should delete existing anime", async () => {
                await service.addAnime(testAnime);

                const deleted = await service.deleteAnime("test-1");
                expect(deleted).toBe(true);

                const found = await service.getAnimeById("test-1");
                expect(found).toBeNull();
            });

            it("should return false for non-existent anime", async () => {
                const deleted = await service.deleteAnime("non-existent");
                expect(deleted).toBe(false);
            });
        });
    });

    describe("Error Simulation", () => {
        it("should simulate network error", async () => {
            await expect(service.simulateError()).rejects.toThrow("Network error");
        });
    });

    describe("Performance and Timing", () => {
        it("should have reasonable response times", async () => {
            const start = Date.now();
            await service.getAllAnimes();
            const end = Date.now();

            // Should complete within 1 second (including simulated delay)
            expect(end - start).toBeLessThan(1000);
        });

        it("should simulate different delays for different operations", async () => {
            const start1 = Date.now();
            await service.getAnimeById("d8fba84f-c74c-4cfa-9279-9e3b4bbd19be");
            const end1 = Date.now();

            const start2 = Date.now();
            await service.getAllAnimes();
            const end2 = Date.now();

            // getAnimeById should be faster than getAllAnimes
            expect(end1 - start1).toBeLessThan(end2 - start2);
        });
    });

    describe("Data Integrity", () => {
        it("should maintain data consistency across operations", async () => {
            const initialCount = (await service.getAllAnimes()).length;

            const testAnime: Anime = {
                id: "integrity-test",
                title: "Integrity Test",
                category: "Test",
                genre: ["Test"],
                size: "1.0 GB",
                date: "2023-01-01",
                views: 10,
                likes: 5,
                downloads: 100,
                submitter: "TestUser",
                rating: 8.0,
                episodes: 12,
                year: 2023,
                status: "completed",
                studio: "Test Studio",
                coverImage: "test.jpg",
                description: "Test description"
            };

            await service.addAnime(testAnime);
            expect((await service.getAllAnimes()).length).toBe(initialCount + 1);

            await service.deleteAnime("integrity-test");
            expect((await service.getAllAnimes()).length).toBe(initialCount);
        });

        it("should reset data correctly", () => {
            service.reset();
            // After reset, should still have initial data
            expect(service.getAllAnimes()).resolves.toHaveLength(12); // Initial mock data count
        });

        it("should use valid UUID format for all anime IDs", async () => {
            const animes = await service.getAllAnimes();

            // Fungsi untuk validasi UUID
            function isValidUUID(uuid: string) {
                return uuidValidate(uuid) && uuidVersion(uuid) === 4;
            }

            // Verifikasi bahwa semua ID anime menggunakan format UUID
            animes.forEach(anime => {
                // Kecualikan anime test jika ada
                if (anime.id === "integrity-test") return;

                // Verifikasi format UUID
                expect(anime.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
            });
        });
    });
});
