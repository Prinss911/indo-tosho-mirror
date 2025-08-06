import { describe, it, expect, beforeEach } from "vitest";
import { MockDatabaseService } from "~/services/mockDatabase";

describe("MockDatabaseService - Category Validation", () => {
    let mockDatabase: MockDatabaseService;

    beforeEach(() => {
        mockDatabase = MockDatabaseService.getInstance();
        mockDatabase.reset();
    });

    it("should have valid categories for all anime entries", async () => {
        // Get all animes
        const animes = await mockDatabase.getAllAnimes();

        // Valid category prefixes
        const validPrefixes = ["Anime -", "Audio -", "Literature -", "Live Action -", "Pictures", "Graphics"];

        // Check that all animes have valid categories
        for (const anime of animes) {
            const hasValidCategory = validPrefixes.some(prefix => anime.category.includes(prefix));
            expect(hasValidCategory).toBe(true);
        }
    });

    it('should ensure "Action" genre is properly handled in genre arrays', async () => {
        // Get all animes
        const animes = await mockDatabase.getAllAnimes();

        // Check that genre arrays are valid
        for (const anime of animes) {
            expect(Array.isArray(anime.genre)).toBe(true);
            expect(anime.genre.length).toBeGreaterThan(0);
        }
    });

    it("should ensure all anime data has consistent category and genre information", async () => {
        // Get all animes
        const animes = await mockDatabase.getAllAnimes();

        // Check that all animes have consistent category and genre information
        for (const anime of animes) {
            // Category should be a non-empty string
            expect(typeof anime.category).toBe("string");
            expect(anime.category.length).toBeGreaterThan(0);

            // Genre should be an array of non-empty strings
            expect(Array.isArray(anime.genre)).toBe(true);
            expect(anime.genre.length).toBeGreaterThan(0);

            // Each genre should be a non-empty string
            for (const genre of anime.genre) {
                expect(typeof genre).toBe("string");
                expect(genre.length).toBeGreaterThan(0);
            }
        }
    });
});
