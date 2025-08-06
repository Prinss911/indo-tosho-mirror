import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Anime } from "../../types/anime";
import { generateMockAnimes } from "../mocks/database.mock";

// Mock fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// API Service class
class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = "http://localhost:3000/api") {
        this.baseUrl = baseUrl;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        return response.json();
    }

    async getAnimes(): Promise<Anime[]> {
        const response = await fetch(`${this.baseUrl}/animes`);
        return this.handleResponse<Anime[]>(response);
    }

    async getAnimeById(id: string): Promise<Anime> {
        const response = await fetch(`${this.baseUrl}/animes/${id}`);
        return this.handleResponse<Anime>(response);
    }

    async createAnime(anime: Omit<Anime, "id">): Promise<Anime> {
        const response = await fetch(`${this.baseUrl}/animes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(anime)
        });
        return this.handleResponse<Anime>(response);
    }

    async updateAnime(id: string, updates: Partial<Anime>): Promise<Anime> {
        const response = await fetch(`${this.baseUrl}/animes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updates)
        });
        return this.handleResponse<Anime>(response);
    }

    async deleteAnime(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/animes/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
    }

    async searchAnimes(query: string): Promise<Anime[]> {
        const response = await fetch(`${this.baseUrl}/animes/search?q=${encodeURIComponent(query)}`);
        return this.handleResponse<Anime[]>(response);
    }

    async getAnimesByCategory(category: string): Promise<Anime[]> {
        const response = await fetch(`${this.baseUrl}/animes/category/${encodeURIComponent(category)}`);
        return this.handleResponse<Anime[]>(response);
    }

    async getStats(): Promise<{ total: number; categories: string[]; topRated: Anime[] }> {
        const response = await fetch(`${this.baseUrl}/stats`);
        return this.handleResponse<{ total: number; categories: string[]; topRated: Anime[] }>(response);
    }
}

describe("ApiService", () => {
    let apiService: ApiService;
    let mockAnimes: Anime[];

    beforeEach(() => {
        apiService = new ApiService();
        mockAnimes = generateMockAnimes(5);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("GET Operations", () => {
        it("should fetch all animes successfully", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnimes
            } as Response);

            const animes = await apiService.getAnimes();

            expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/animes");
            expect(animes).toEqual(mockAnimes);
            expect(animes).toHaveLength(5);
        });

        it("should fetch anime by id successfully", async () => {
            const targetAnime = mockAnimes[0];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => targetAnime
            } as Response);

            const anime = await apiService.getAnimeById(targetAnime.id);

            expect(mockFetch).toHaveBeenCalledWith(`http://localhost:3000/api/animes/${targetAnime.id}`);
            expect(anime).toEqual(targetAnime);
        });

        it("should handle 404 error when anime not found", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => "Anime not found"
            } as Response);

            await expect(apiService.getAnimeById("non-existent-id")).rejects.toThrow("HTTP 404: Anime not found");
        });

        it("should search animes successfully", async () => {
            const searchResults = mockAnimes.slice(0, 2);
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => searchResults
            } as Response);

            const results = await apiService.searchAnimes("Attack");

            expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/animes/search?q=Attack");
            expect(results).toEqual(searchResults);
        });

        it("should handle special characters in search query", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => []
            } as Response);

            await apiService.searchAnimes("Attack & Titan");

            expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/animes/search?q=Attack%20%26%20Titan");
        });

        it("should get animes by category successfully", async () => {
            const categoryResults = mockAnimes.filter(anime => anime.category === "Anime - Sudah diterjemahkan");
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => categoryResults
            } as Response);

            const results = await apiService.getAnimesByCategory("Anime - Sudah diterjemahkan");

            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:3000/api/animes/category/Anime%20-%20Sudah%20diterjemahkan"
            );
            expect(results).toEqual(categoryResults);
        });

        it("should get stats successfully", async () => {
            const mockStats = {
                total: 50,
                categories: ["Anime - Sudah diterjemahkan", "Adventure", "Comedy"],
                topRated: mockAnimes.slice(0, 3)
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockStats
            } as Response);

            const stats = await apiService.getStats();

            expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/stats");
            expect(stats).toEqual(mockStats);
        });
    });

    describe("POST Operations", () => {
        it("should create anime successfully", async () => {
            const newAnimeData: Omit<Anime, "id"> = {
                title: "New Test Anime",
                category: "Anime - Sudah diterjemahkan",
                submitter: "TestUser",
                size: "2.5 GB",
                date: "2024-01-01",
                views: 50,
                likes: 10,
                downloads: 500,
                status: "completed",
                rating: 8.5,
                episodes: 12,
                genre: ["Action", "Adventure"],
                year: 2024,
                studio: "Test Studio",
                coverImage: "https://example.com/cover.jpg",
                description: "Test anime description"
            };

            const createdAnime: Anime = { ...newAnimeData, id: "anime-new" };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => createdAnime
            } as Response);

            const result = await apiService.createAnime(newAnimeData);

            expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/animes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newAnimeData)
            });
            expect(result).toEqual(createdAnime);
        });

        it("should handle validation errors when creating anime", async () => {
            const invalidAnimeData = {
                title: "", // Invalid empty title
                category: "Anime - Sudah diterjemahkan"
            } as Omit<Anime, "id">;

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => "Validation failed: Title is required"
            } as Response);

            await expect(apiService.createAnime(invalidAnimeData)).rejects.toThrow(
                "HTTP 400: Validation failed: Title is required"
            );
        });
    });

    describe("PUT Operations", () => {
        it("should update anime successfully", async () => {
            const targetAnime = mockAnimes[0];
            const updates = {
                title: "Updated Title",
                rating: 9.5
            };
            const updatedAnime = { ...targetAnime, ...updates };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => updatedAnime
            } as Response);

            const result = await apiService.updateAnime(targetAnime.id, updates);

            expect(mockFetch).toHaveBeenCalledWith(`http://localhost:3000/api/animes/${targetAnime.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updates)
            });
            expect(result).toEqual(updatedAnime);
        });

        it("should handle 404 error when updating non-existent anime", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => "Anime not found"
            } as Response);

            await expect(apiService.updateAnime("non-existent-id", { title: "Updated" })).rejects.toThrow(
                "HTTP 404: Anime not found"
            );
        });
    });

    describe("DELETE Operations", () => {
        it("should delete anime successfully", async () => {
            const targetAnime = mockAnimes[0];

            mockFetch.mockResolvedValueOnce({
                ok: true
            } as Response);

            await apiService.deleteAnime(targetAnime.id);

            expect(mockFetch).toHaveBeenCalledWith(`http://localhost:3000/api/animes/${targetAnime.id}`, {
                method: "DELETE"
            });
        });

        it("should handle 404 error when deleting non-existent anime", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => "Anime not found"
            } as Response);

            await expect(apiService.deleteAnime("non-existent-id")).rejects.toThrow("HTTP 404: Anime not found");
        });

        it("should handle 403 error when unauthorized to delete", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                text: async () => "Forbidden: Insufficient permissions"
            } as Response);

            await expect(apiService.deleteAnime("anime-1")).rejects.toThrow(
                "HTTP 403: Forbidden: Insufficient permissions"
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle network errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(apiService.getAnimes()).rejects.toThrow("Network error");
        });

        it("should handle timeout errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

            await expect(apiService.getAnimeById("anime-1")).rejects.toThrow("Request timeout");
        });

        it("should handle server errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => "Internal Server Error"
            } as Response);

            await expect(apiService.getAnimes()).rejects.toThrow("HTTP 500: Internal Server Error");
        });

        it("should handle malformed JSON responses", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error("Invalid JSON");
                }
            } as Response);

            await expect(apiService.getAnimes()).rejects.toThrow("Invalid JSON");
        });
    });

    describe("Custom Base URL", () => {
        it("should use custom base URL", async () => {
            const customApiService = new ApiService("https://api.example.com/v1");

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnimes
            } as Response);

            await customApiService.getAnimes();

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/v1/animes");
        });
    });

    describe("Concurrent Requests", () => {
        it("should handle multiple concurrent requests", async () => {
            // Mock different responses for different endpoints
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAnimes
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAnimes[0]
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAnimes.slice(0, 2)
                } as Response);

            const promises = [
                apiService.getAnimes(),
                apiService.getAnimeById(mockAnimes[0].id),
                apiService.searchAnimes("test")
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(results[0]).toEqual(mockAnimes);
            expect(results[1]).toEqual(mockAnimes[0]);
            expect(results[2]).toEqual(mockAnimes.slice(0, 2));
        });

        it("should handle mixed success and failure requests", async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAnimes
                } as Response)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    text: async () => "Not found"
                } as Response);

            const promises = [apiService.getAnimes(), apiService.getAnimeById("non-existent")];

            const results = await Promise.allSettled(promises);

            expect(results[0].status).toBe("fulfilled");
            expect(results[1].status).toBe("rejected");
            if (results[1].status === "rejected") {
                expect(results[1].reason.message).toContain("HTTP 404: Not found");
            }
        });
    });
});
