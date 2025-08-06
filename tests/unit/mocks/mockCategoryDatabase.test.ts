import { describe, it, expect, beforeEach } from "vitest";
import { MockCategoryDatabaseService } from "~/tests/mocks/mockCategoryDatabase";
import { validate as uuidValidate, version as uuidVersion } from "uuid";

describe("MockCategoryDatabaseService", () => {
    let mockCategoryDatabase: MockCategoryDatabaseService;

    beforeEach(() => {
        mockCategoryDatabase = MockCategoryDatabaseService.getInstance();
        mockCategoryDatabase.reset();
    });

    it("should be a singleton", () => {
        const instance1 = MockCategoryDatabaseService.getInstance();
        const instance2 = MockCategoryDatabaseService.getInstance();
        expect(instance1).toBe(instance2);
    });

    it("should return all animes with correct properties", async () => {
        const animes = await mockCategoryDatabase.getAllAnimes();
        expect(animes.length).toBeGreaterThan(0);

        for (const anime of animes) {
            // Verifikasi properti dasar
            expect(anime).toHaveProperty("id");
            expect(anime).toHaveProperty("title");
            expect(anime).toHaveProperty("category");
            expect(anime).toHaveProperty("genre");
            expect(anime).toHaveProperty("rating");

            // Verifikasi format kategori baru
            expect(anime.category).toContain("Anime -");

            // Verifikasi genre
            expect(Array.isArray(anime.genre)).toBe(true);
            expect(anime.genre.length).toBeGreaterThan(0);
        }
    });

    it("should return a copy of the data when calling getAllAnimes", async () => {
        const animes1 = await mockCategoryDatabase.getAllAnimes();
        const animes2 = await mockCategoryDatabase.getAllAnimes();

        expect(animes1).not.toBe(animes2); // Memastikan referensi berbeda
        expect(animes1).toEqual(animes2); // Memastikan konten sama
    });

    it("should find anime by ID", async () => {
        const animes = await mockCategoryDatabase.getAllAnimes();
        const firstAnime = animes[0];

        const foundAnime = await mockCategoryDatabase.getAnimeById(firstAnime.id);
        expect(foundAnime).not.toBeNull();
        expect(foundAnime?.id).toBe(firstAnime.id);
        expect(foundAnime?.title).toBe(firstAnime.title);
    });

    it("should return null when anime ID is not found", async () => {
        const nonExistentId = "00000000-0000-0000-0000-000000000000";
        const foundAnime = await mockCategoryDatabase.getAnimeById(nonExistentId);
        expect(foundAnime).toBeNull();
    });

    it("should use valid UUID v4 for all anime IDs", async () => {
        const animes = await mockCategoryDatabase.getAllAnimes();

        for (const anime of animes) {
            expect(uuidValidate(anime.id)).toBe(true);
            expect(uuidVersion(anime.id)).toBe(4); // Verifikasi UUID v4
        }
    });
});
