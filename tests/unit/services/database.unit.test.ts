import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Anime } from "~/types/anime";

// Mock database implementation
class MockDatabase {
    private animes: Anime[] = [];
    private categories: string[] = [];
    private isConnected = true;
    private latency = 0;

    constructor(initialData?: { animes?: Anime[]; categories?: string[] }) {
        if (initialData) {
            this.animes = initialData.animes || [];
            this.categories = initialData.categories || [];
        }
    }

    // Simulate network latency
    setLatency(ms: number) {
        this.latency = ms;
    }

    // Simulate connection issues
    setConnectionStatus(connected: boolean) {
        this.isConnected = connected;
    }

    private async simulateLatency() {
        if (this.latency > 0) {
            await new Promise(resolve => setTimeout(resolve, this.latency));
        }
    }

    private checkConnection() {
        if (!this.isConnected) {
            throw new Error("Database connection failed");
        }
    }

    async getAllAnimes(): Promise<Anime[]> {
        this.checkConnection();
        await this.simulateLatency();
        return [...this.animes];
    }

    async getAnimeById(id: number): Promise<Anime | undefined> {
        this.checkConnection();
        await this.simulateLatency();
        return this.animes.find(anime => anime.id === id);
    }

    async getCategories(): Promise<string[]> {
        this.checkConnection();
        await this.simulateLatency();
        return [...this.categories];
    }

    async searchAnimes(query: string): Promise<Anime[]> {
        this.checkConnection();
        await this.simulateLatency();

        if (!query.trim()) return [...this.animes];

        return this.animes.filter(
            anime =>
                anime.title.toLowerCase().includes(query.toLowerCase()) ||
                anime.synopsis?.toLowerCase().includes(query.toLowerCase())
        );
    }

    async filterByCategory(category: string): Promise<Anime[]> {
        this.checkConnection();
        await this.simulateLatency();

        if (category === "Semua Kategori") return [...this.animes];

        return this.animes.filter(anime => anime.category === category);
    }

    async getTotalCount(): Promise<number> {
        this.checkConnection();
        await this.simulateLatency();
        return this.animes.length;
    }

    async addAnime(anime: Anime): Promise<Anime> {
        this.checkConnection();
        await this.simulateLatency();

        const newAnime = { ...anime, id: this.animes.length + 1 };
        this.animes.push(newAnime);
        return newAnime;
    }

    async updateAnime(id: number, updates: Partial<Anime>): Promise<Anime | undefined> {
        this.checkConnection();
        await this.simulateLatency();

        const index = this.animes.findIndex(anime => anime.id === id);
        if (index === -1) return undefined;

        this.animes[index] = { ...this.animes[index], ...updates };
        return this.animes[index];
    }

    async deleteAnime(id: number): Promise<boolean> {
        this.checkConnection();
        await this.simulateLatency();

        const index = this.animes.findIndex(anime => anime.id === id);
        if (index === -1) return false;

        this.animes.splice(index, 1);
        return true;
    }

    // Utility methods for testing
    reset() {
        this.animes = [];
        this.categories = [];
        this.isConnected = true;
        this.latency = 0;
    }

    seed(data: { animes: Anime[]; categories: string[] }) {
        this.animes = [...data.animes];
        this.categories = [...data.categories];
    }
}

// Database service wrapper
class DatabaseService {
    constructor(private db: MockDatabase) {}

    async getAllAnimes() {
        try {
            return await this.db.getAllAnimes();
        } catch (error) {
            throw new Error(`Failed to fetch animes: ${error.message}`);
        }
    }

    async getAnimeById(id: number) {
        try {
            if (!id || id <= 0) {
                throw new Error("Invalid anime ID");
            }
            return await this.db.getAnimeById(id);
        } catch (error) {
            throw new Error(`Failed to fetch anime: ${error.message}`);
        }
    }

    async searchAnimes(query: string) {
        try {
            if (typeof query !== "string") {
                throw new Error("Search query must be a string");
            }
            return await this.db.searchAnimes(query);
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    async filterByCategory(category: string) {
        try {
            if (!category) {
                throw new Error("Category is required");
            }
            return await this.db.filterByCategory(category);
        } catch (error) {
            throw new Error(`Filter failed: ${error.message}`);
        }
    }

    async getCategories() {
        try {
            return await this.db.getCategories();
        } catch (error) {
            throw new Error(`Failed to fetch categories: ${error.message}`);
        }
    }

    async getTotalCount() {
        try {
            return await this.db.getTotalCount();
        } catch (error) {
            throw new Error(`Failed to get total count: ${error.message}`);
        }
    }
}

describe("Database Service Unit Tests with Mocking", () => {
    let mockDb: MockDatabase;
    let dbService: DatabaseService;
    let mockAnimes: Anime[];
    let mockCategories: string[];

    const createMockAnimes = (): Anime[] => [
        {
            id: 1,
            title: "Attack on Titan",
            category: "Anime - Sudah diterjemahkan",
            rating: 9.0,
            year: 2013,
            status: "Completed",
            synopsis: "Humanity fights against titans in a post-apocalyptic world",
            episodes: 25,
            image: "https://example.com/aot.jpg"
        },
        {
            id: 2,
            title: "Death Note",
            category: "Thriller",
            rating: 9.0,
            year: 2006,
            status: "Completed",
            synopsis: "Light Yagami uses a supernatural notebook to kill criminals",
            episodes: 37,
            image: "https://example.com/deathnote.jpg"
        },
        {
            id: 3,
            title: "One Piece",
            category: "Adventure",
            rating: 8.8,
            year: 1999,
            status: "Ongoing",
            synopsis: "Monkey D. Luffy searches for the legendary One Piece treasure",
            episodes: 1000,
            image: "https://example.com/onepiece.jpg"
        },
        {
            id: 4,
            title: "Naruto",
            category: "Anime - Sudah diterjemahkan",
            rating: 8.5,
            year: 2002,
            status: "Completed",
            synopsis: "Young ninja Naruto Uzumaki seeks recognition and dreams of becoming Hokage",
            episodes: 220,
            image: "https://example.com/naruto.jpg"
        }
    ];

    const createMockCategories = (): string[] => [
        "Semua Kategori",
        "Anime - Sudah diterjemahkan",
        "Adventure",
        "Comedy",
        "Drama",
        "Thriller"
    ];

    beforeEach(() => {
        mockAnimes = createMockAnimes();
        mockCategories = createMockCategories();

        mockDb = new MockDatabase({
            animes: mockAnimes,
            categories: mockCategories
        });

        dbService = new DatabaseService(mockDb);
    });

    describe("Basic Database Operations", () => {
        it("should fetch all animes from mock database", async () => {
            const result = await dbService.getAllAnimes();

            expect(result).toHaveLength(4);
            expect(result).toEqual(mockAnimes);
        });

        it("should fetch anime by ID from mock database", async () => {
            const result = await dbService.getAnimeById(1);

            expect(result).toEqual(mockAnimes[0]);
            expect(result?.title).toBe("Attack on Titan");
        });

        it("should return undefined for non-existent anime ID", async () => {
            const result = await dbService.getAnimeById(999);

            expect(result).toBeUndefined();
        });

        it("should fetch categories from mock database", async () => {
            const result = await dbService.getCategories();

            expect(result).toEqual(mockCategories);
            expect(result).toContain("Anime - Sudah diterjemahkan");
            expect(result).toContain("Semua Kategori");
        });

        it("should get total count from mock database", async () => {
            const result = await dbService.getTotalCount();

            expect(result).toBe(4);
        });
    });

    describe("Search Functionality with Mock Database", () => {
        it("should search animes by title", async () => {
            const result = await dbService.searchAnimes("Attack");

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Attack on Titan");
        });

        it("should search animes by synopsis", async () => {
            const result = await dbService.searchAnimes("notebook");

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Death Note");
        });

        it("should return all animes for empty search query", async () => {
            const result = await dbService.searchAnimes("");

            expect(result).toHaveLength(4);
            expect(result).toEqual(mockAnimes);
        });

        it("should return empty array for non-matching search", async () => {
            const result = await dbService.searchAnimes("NonExistentAnime");

            expect(result).toHaveLength(0);
        });

        it("should handle case-insensitive search", async () => {
            const result = await dbService.searchAnimes("ATTACK");

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Attack on Titan");
        });
    });

    describe("Category Filtering with Mock Database", () => {
        it("should filter animes by category", async () => {
            const result = await dbService.filterByCategory("Anime - Sudah diterjemahkan");

            expect(result).toHaveLength(2); // Naruto and One Piece
            expect(result.every(anime => anime.category === "Anime - Sudah diterjemahkan")).toBe(true);
        });

        it('should return all animes for "Semua Kategori"', async () => {
            const result = await dbService.filterByCategory("Semua Kategori");

            expect(result).toHaveLength(4);
            expect(result).toEqual(mockAnimes);
        });

        it("should return empty array for non-existent category", async () => {
            const result = await dbService.filterByCategory("NonExistentCategory");

            expect(result).toHaveLength(0);
        });

        it("should filter single category correctly", async () => {
            const result = await dbService.filterByCategory("Thriller");

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Death Note");
        });
    });

    describe("Error Handling with Mock Database", () => {
        it("should handle database connection errors", async () => {
            mockDb.setConnectionStatus(false);

            await expect(dbService.getAllAnimes()).rejects.toThrow("Failed to fetch animes");
        });

        it("should handle invalid anime ID", async () => {
            await expect(dbService.getAnimeById(0)).rejects.toThrow("Invalid anime ID");
            await expect(dbService.getAnimeById(-1)).rejects.toThrow("Invalid anime ID");
        });

        it("should handle invalid search query type", async () => {
            await expect(dbService.searchAnimes(null as any)).rejects.toThrow("Search query must be a string");
            await expect(dbService.searchAnimes(123 as any)).rejects.toThrow("Search query must be a string");
        });

        it("should handle empty category filter", async () => {
            await expect(dbService.filterByCategory("")).rejects.toThrow("Category is required");
            await expect(dbService.filterByCategory(null as any)).rejects.toThrow("Category is required");
        });

        it("should recover from temporary connection issues", async () => {
            // Simulate connection failure
            mockDb.setConnectionStatus(false);
            await expect(dbService.getAllAnimes()).rejects.toThrow();

            // Restore connection
            mockDb.setConnectionStatus(true);
            const result = await dbService.getAllAnimes();
            expect(result).toEqual(mockAnimes);
        });
    });

    describe("Performance Testing with Mock Database", () => {
        it("should handle network latency simulation", async () => {
            mockDb.setLatency(100); // 100ms latency

            const startTime = Date.now();
            await dbService.getAllAnimes();
            const endTime = Date.now();

            expect(endTime - startTime).toBeGreaterThanOrEqual(100);
        });

        it("should handle concurrent requests", async () => {
            const promises = [dbService.getAllAnimes(), dbService.getCategories(), dbService.getTotalCount()];

            const results = await Promise.all(promises);

            expect(results[0]).toEqual(mockAnimes);
            expect(results[1]).toEqual(mockCategories);
            expect(results[2]).toBe(4);
        });

        it("should handle large dataset efficiently", async () => {
            // Create large mock dataset
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                title: `Anime ${i + 1}`,
                category: ["Anime - Sudah diterjemahkan", "Anime - Sudah diterjemahkan", "Anime - Sudah diterjemahkan"][
                    i % 3
                ],
                rating: 7.0 + (i % 3),
                year: 2000 + (i % 20),
                status: i % 2 === 0 ? "Completed" : "Ongoing",
                synopsis: `Synopsis for anime ${i + 1}`,
                episodes: 12 + (i % 50),
                image: `https://example.com/anime${i + 1}.jpg`
            }));

            mockDb.seed({ animes: largeDataset, categories: mockCategories });

            const startTime = Date.now();
            const result = await dbService.getAllAnimes();
            const endTime = Date.now();

            expect(result).toHaveLength(1000);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    describe("Data Integrity with Mock Database", () => {
        it("should maintain data consistency across operations", async () => {
            const initialCount = await dbService.getTotalCount();
            const allAnimes = await dbService.getAllAnimes();

            expect(allAnimes.length).toBe(initialCount);

            // Verify each anime has required properties
            allAnimes.forEach(anime => {
                expect(anime).toHaveProperty("id");
                expect(anime).toHaveProperty("title");
                expect(anime).toHaveProperty("category");
                expect(anime).toHaveProperty("rating");
                expect(anime).toHaveProperty("year");
                expect(anime).toHaveProperty("status");
            });
        });

        it("should return immutable data copies", async () => {
            const result1 = await dbService.getAllAnimes();
            const result2 = await dbService.getAllAnimes();

            // Results should be different array instances
            expect(result1).not.toBe(result2);
            expect(result1).toEqual(result2);

            // Both should have the same content initially
            expect(result1[0].title).toBe(result2[0].title);
        });

        it("should handle empty database gracefully", async () => {
            mockDb.reset();

            const animes = await dbService.getAllAnimes();
            const categories = await dbService.getCategories();
            const count = await dbService.getTotalCount();

            expect(animes).toEqual([]);
            expect(categories).toEqual([]);
            expect(count).toBe(0);
        });
    });

    describe("Advanced Query Operations", () => {
        it("should handle complex search queries", async () => {
            const result = await dbService.searchAnimes("ninja");

            // Should find Naruto based on synopsis
            expect(result.some(anime => anime.title === "Naruto")).toBe(true);
        });

        it("should combine search and filter operations", async () => {
            // First filter by category
            const animeTranslatedCategory = await dbService.filterByCategory("Anime - Sudah diterjemahkan");
            expect(animeTranslatedCategory).toHaveLength(2);

            // Then search within results (simulated)
            const searchResults = animeTranslatedCategory.filter(anime => anime.title.toLowerCase().includes("naruto"));
            expect(searchResults).toHaveLength(1);
            expect(searchResults[0].title).toBe("Naruto");
        });

        it("should handle edge cases in data", async () => {
            // Add anime with special characters
            const specialAnime: Anime = {
                id: 5,
                title: "Anime with Special Characters: @#$%",
                category: "Comedy",
                rating: 7.5,
                year: 2023,
                status: "Ongoing",
                synopsis: "Special characters in title and synopsis: !@#$%^&*()",
                episodes: 12,
                image: "https://example.com/special.jpg"
            };

            mockDb.seed({
                animes: [...mockAnimes, specialAnime],
                categories: mockCategories
            });

            const result = await dbService.searchAnimes("Special Characters");
            expect(result).toHaveLength(1);
            expect(result[0].title).toContain("Special Characters");
        });
    });
});
