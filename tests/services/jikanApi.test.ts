import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jikanApi, { type JikanAnime, type JikanSearchResponse } from "~/services/jikanApi";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("JikanApiService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("searchAnime", () => {
        it("should search anime successfully", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [
                    {
                        mal_id: 16498,
                        title: "Attack on Titan",
                        title_english: "Attack on Titan",
                        title_japanese: "進撃の巨人",
                        episodes: 25,
                        year: 2013,
                        score: 9.0,
                        rank: 1,
                        popularity: 1,
                        members: 3000000,
                        synopsis: "Humanity fights for survival against giant humanoid Titans.",
                        status: "Finished Airing",
                        aired: {
                            from: "2013-04-07T00:00:00+00:00",
                            to: "2013-09-29T00:00:00+00:00"
                        },
                        images: {
                            jpg: {
                                image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
                                small_image_url: "https://cdn.myanimelist.net/images/anime/10/47347t.jpg",
                                large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg"
                            }
                        },
                        genres: [
                            { mal_id: 1, name: "Action" },
                            { mal_id: 8, name: "Drama" },
                            { mal_id: 10, name: "Fantasy" }
                        ]
                    }
                ],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: {
                        count: 1,
                        total: 1,
                        per_page: 25
                    }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await jikanApi.searchAnime("Attack on Titan");

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.jikan.moe/v4/anime?q=Attack+on+Titan&page=1&limit=25&order_by=score&sort=desc"
            );
            expect(result).toEqual(mockResponse);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].title).toBe("Attack on Titan");
        });

        it("should handle API errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            await expect(jikanApi.searchAnime("nonexistent")).rejects.toThrow("HTTP error! status: 404");
        });

        it("should handle network errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(jikanApi.searchAnime("test")).rejects.toThrow("Network error");
        });
    });

    describe("getAnimeById", () => {
        it("should get anime by ID successfully", async () => {
            const mockResponse = {
                data: {
                    mal_id: 16498,
                    title: "Attack on Titan",
                    title_english: "Attack on Titan",
                    title_japanese: "進撃の巨人",
                    type: "TV",
                    episodes: 25,
                    status: "Finished Airing",
                    aired: {
                        from: "2013-04-07T00:00:00+00:00",
                        to: "2013-09-29T00:00:00+00:00",
                        prop: {
                            from: { day: 7, month: 4, year: 2013 },
                            to: { day: 29, month: 9, year: 2013 }
                        }
                    },
                    duration: "24 min per ep",
                    rating: "R - 17+ (violence & profanity)",
                    score: 9.0,
                    scored_by: 1500000,
                    rank: 1,
                    popularity: 1,
                    members: 3000000,
                    favorites: 150000,
                    synopsis: "Humanity fights for survival against giant humanoid Titans.",
                    background: "Based on the manga series.",
                    season: "spring",
                    year: 2013,
                    broadcast: {
                        day: "Sundays",
                        time: "17:30",
                        timezone: "Asia/Tokyo",
                        string: "Sundays at 17:30 (JST)"
                    },
                    producers: [],
                    licensors: [],
                    studios: [],
                    genres: [
                        {
                            mal_id: 1,
                            type: "anime",
                            name: "Action",
                            url: "https://myanimelist.net/anime/genre/1/Action"
                        },
                        { mal_id: 8, type: "anime", name: "Drama", url: "https://myanimelist.net/anime/genre/8/Drama" }
                    ],
                    themes: [],
                    demographics: [],
                    images: {
                        jpg: {
                            image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
                            small_image_url: "https://cdn.myanimelist.net/images/anime/10/47347t.jpg",
                            large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg"
                        },
                        webp: {
                            image_url: "https://cdn.myanimelist.net/images/anime/10/47347.webp",
                            small_image_url: "https://cdn.myanimelist.net/images/anime/10/47347t.webp",
                            large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.webp"
                        }
                    },
                    trailer: undefined,
                    approved: true,
                    titles: []
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await jikanApi.getAnimeById(16498);

            expect(mockFetch).toHaveBeenCalledWith("https://api.jikan.moe/v4/anime/16498");
            expect(result).toEqual(mockResponse);
            expect(result.data.mal_id).toBe(16498);
            expect(result.data.title).toBe("Attack on Titan");
        });

        it("should handle invalid anime ID", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            await expect(jikanApi.getAnimeById(999999)).rejects.toThrow("HTTP error! status: 404");
        });
    });

    describe("getAnimeByGenre", () => {
        it("should get anime by genre successfully", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [
                    {
                        mal_id: 1,
                        title: "Action Anime",
                        title_english: "Action Anime",
                        title_japanese: "アクション",
                        type: "TV",
                        episodes: 12,
                        status: "Finished Airing",
                        aired: {
                            from: "2023-01-01T00:00:00+00:00",
                            to: "2023-03-31T00:00:00+00:00",
                            prop: {
                                from: { day: 1, month: 1, year: 2023 },
                                to: { day: 31, month: 3, year: 2023 }
                            }
                        },
                        duration: "24 min per ep",
                        rating: "PG-13",
                        score: 8.5,
                        scored_by: 100000,
                        rank: 100,
                        popularity: 50,
                        members: 200000,
                        favorites: 5000,
                        synopsis: "An action-packed anime.",
                        background: "Background info.",
                        season: "winter",
                        year: 2023,
                        broadcast: {
                            day: "Sundays",
                            time: "17:00",
                            timezone: "JST",
                            string: "Sundays at 17:00 (JST)"
                        },
                        producers: [],
                        licensors: [],
                        studios: [],
                        genres: [
                            {
                                mal_id: 1,
                                type: "anime",
                                name: "Action",
                                url: "https://myanimelist.net/anime/genre/1/Action"
                            }
                        ],
                        themes: [],
                        demographics: [],
                        images: {
                            jpg: {
                                image_url: "https://example.com/image.jpg",
                                small_image_url: "https://example.com/small.jpg",
                                large_image_url: "https://example.com/large.jpg"
                            },
                            webp: {
                                image_url: "https://example.com/image.webp",
                                small_image_url: "https://example.com/small.webp",
                                large_image_url: "https://example.com/large.webp"
                            }
                        },
                        trailer: undefined,
                        approved: true,
                        titles: []
                    }
                ],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: {
                        count: 1,
                        total: 1,
                        per_page: 25
                    }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await jikanApi.getAnimeByGenre(1, 2);

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.jikan.moe/v4/anime?genres=1&page=2&order_by=score&sort=desc"
            );
            expect(result).toEqual(mockResponse);
        });

        it("should use default page when not provided", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await jikanApi.getAnimeByGenre(1);

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.jikan.moe/v4/anime?genres=1&page=1&order_by=score&sort=desc"
            );
        });
    });

    describe("getTopAnime", () => {
        it("should get top anime with specified type", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await jikanApi.getTopAnime("airing", 2);

            expect(mockFetch).toHaveBeenCalledWith("https://api.jikan.moe/v4/top/anime?type=airing&page=2");
        });

        it("should use default parameters", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await jikanApi.getTopAnime();

            expect(mockFetch).toHaveBeenCalledWith("https://api.jikan.moe/v4/top/anime?type=bypopularity&page=1");
        });
    });

    describe("getAnimeBySeason", () => {
        it("should get anime by season successfully", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await jikanApi.getAnimeBySeason(2023, "spring", 2);

            expect(mockFetch).toHaveBeenCalledWith("https://api.jikan.moe/v4/seasons/2023/spring?page=2");
        });

        it("should use default page", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await jikanApi.getAnimeBySeason(2023, "winter");

            expect(mockFetch).toHaveBeenCalledWith("https://api.jikan.moe/v4/seasons/2023/winter?page=1");
        });
    });

    describe("getCurrentSeasonAnime", () => {
        it("should get current season anime", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await jikanApi.getCurrentSeasonAnime(3);

            expect(mockFetch).toHaveBeenCalledWith("https://api.jikan.moe/v4/seasons/now?page=3");
        });

        it("should use default page", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            await jikanApi.getCurrentSeasonAnime();

            expect(mockFetch).toHaveBeenCalledWith("https://api.jikan.moe/v4/seasons/now?page=1");
        });
    });

    describe("Rate Limiting", () => {
        it("should implement rate limiting between requests", async () => {
            const mockResponse: JikanSearchResponse = {
                data: [],
                pagination: {
                    last_visible_page: 1,
                    has_next_page: false,
                    current_page: 1,
                    items: { count: 0, total: 0, per_page: 25 }
                }
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            });

            const startTime = Date.now();

            // Reset lastRequestTime untuk test ini
            (jikanApi as any).lastRequestTime = 0;

            // Panggil dua request berturut-turut
            await jikanApi.searchAnime("test1");
            await jikanApi.searchAnime("test2");

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Harus ada delay minimal 1 detik antara request (dengan toleransi 10ms untuk timing)
            expect(duration).toBeGreaterThanOrEqual(990);
        });
    });

    describe("Error Handling", () => {
        it("should log errors to console", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(jikanApi.searchAnime("test")).rejects.toThrow("Network error");
            expect(consoleSpy).toHaveBeenCalledWith("Jikan API Error:", expect.any(Error));

            consoleSpy.mockRestore();
        });

        it("should handle JSON parsing errors", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.reject(new Error("Invalid JSON"))
            });

            await expect(jikanApi.searchAnime("test")).rejects.toThrow("Invalid JSON");
        });
    });

    describe("convertToAppFormat", () => {
        it("should convert Jikan anime to app format", () => {
            const jikanAnime: JikanAnime = {
                mal_id: 16498,
                title: "Attack on Titan",
                title_english: "Attack on Titan",
                title_japanese: "進撃の巨人",
                type: "TV",
                episodes: 25,
                status: "Finished Airing",
                aired: {
                    from: "2013-04-07T00:00:00+00:00",
                    to: "2013-09-29T00:00:00+00:00",
                    prop: {
                        from: { day: 7, month: 4, year: 2013 },
                        to: { day: 29, month: 9, year: 2013 }
                    }
                },
                duration: "24 min per ep",
                rating: "R - 17+ (violence & profanity)",
                score: 9.0,
                scored_by: 1500000,
                rank: 1,
                popularity: 1,
                members: 3000000,
                favorites: 150000,
                synopsis: "Humanity fights for survival against giant humanoid Titans.",
                background: "Based on the manga series.",
                season: "spring",
                year: 2013,
                broadcast: {
                    day: "Sundays",
                    time: "17:30",
                    timezone: "Asia/Tokyo",
                    string: "Sundays at 17:30 (JST)"
                },
                producers: [
                    {
                        mal_id: 1,
                        type: "anime",
                        name: "Aniplex",
                        url: "https://myanimelist.net/anime/producer/1/Aniplex"
                    }
                ],
                licensors: [
                    {
                        mal_id: 2,
                        type: "anime",
                        name: "Funimation",
                        url: "https://myanimelist.net/anime/producer/2/Funimation"
                    }
                ],
                studios: [
                    {
                        mal_id: 3,
                        type: "anime",
                        name: "Wit Studio",
                        url: "https://myanimelist.net/anime/producer/3/Wit_Studio"
                    }
                ],
                genres: [
                    { mal_id: 1, type: "anime", name: "Action", url: "https://myanimelist.net/anime/genre/1/Action" },
                    { mal_id: 8, type: "anime", name: "Drama", url: "https://myanimelist.net/anime/genre/8/Drama" }
                ],
                themes: [
                    {
                        mal_id: 38,
                        type: "anime",
                        name: "Military",
                        url: "https://myanimelist.net/anime/genre/38/Military"
                    }
                ],
                demographics: [
                    {
                        mal_id: 27,
                        type: "anime",
                        name: "Shounen",
                        url: "https://myanimelist.net/anime/genre/27/Shounen"
                    }
                ],
                images: {
                    jpg: {
                        image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
                        small_image_url: "https://cdn.myanimelist.net/images/anime/10/47347t.jpg",
                        large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg"
                    },
                    webp: {
                        image_url: "https://cdn.myanimelist.net/images/anime/10/47347.webp",
                        small_image_url: "https://cdn.myanimelist.net/images/anime/10/47347t.webp",
                        large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.webp"
                    }
                },
                trailer: {
                    youtube_id: "MGRm4IzK1SQ",
                    url: "https://www.youtube.com/watch?v=MGRm4IzK1SQ",
                    embed_url: "https://www.youtube.com/embed/MGRm4IzK1SQ?enablejsapi=1&wmode=opaque&autoplay=1"
                },
                approved: true,
                titles: [
                    { type: "Default", title: "Shingeki no Kyojin" },
                    { type: "Synonym", title: "AoT" },
                    { type: "Japanese", title: "進撃の巨人" },
                    { type: "English", title: "Attack on Titan" }
                ]
            };

            const result = jikanApi.convertToAppFormat(jikanAnime);

            expect(result.malId).toBe(16498);
            expect(result.title).toBe("Attack on Titan");
            expect(result.titleEnglish).toBe("Attack on Titan");
            expect(result.titleJapanese).toBe("進撃の巨人");
            expect(result.type).toBe("TV");
            expect(result.episodes).toBe(25);
            expect(result.status).toBe("Finished Airing");
            expect(result.year).toBe(2013);
            expect(result.season).toBe("spring");
            expect(result.rating).toBe(9.0);
            expect(result.cover).toBe("https://cdn.myanimelist.net/images/anime/10/47347l.jpg");
            expect(result.synopsis).toBe("Humanity fights for survival against giant humanoid Titans.");
            expect(result.genres).toEqual(["Action", "Drama"]);
            expect(result.themes).toEqual(["Military"]);
            expect(result.demographics).toEqual(["Shounen"]);
            expect(result.studios).toEqual(["Wit Studio"]);
            expect(result.trailer).toBe("https://www.youtube.com/watch?v=MGRm4IzK1SQ");
        });

        it("should handle missing optional fields", () => {
            const jikanAnime: JikanAnime = {
                mal_id: 12345,
                title: "Test Anime",
                title_english: undefined,
                title_japanese: undefined,
                type: "TV",
                episodes: undefined,
                status: "Currently Airing",
                aired: {
                    from: "2023-01-01T00:00:00+00:00",
                    prop: {
                        from: { day: 1, month: 1, year: 2023 }
                    }
                },
                duration: "Unknown",
                rating: "PG-13",
                score: undefined,
                scored_by: undefined,
                rank: undefined,
                popularity: undefined,
                members: undefined,
                favorites: undefined,
                synopsis: undefined,
                background: undefined,
                season: undefined,
                year: undefined,
                broadcast: undefined,
                producers: [],
                licensors: [],
                studios: [],
                genres: [],
                themes: [],
                demographics: [],
                images: {
                    jpg: {
                        image_url: "https://example.com/image.jpg",
                        small_image_url: "https://example.com/small.jpg",
                        large_image_url: "https://example.com/large.jpg"
                    },
                    webp: {
                        image_url: "https://example.com/image.webp",
                        small_image_url: "https://example.com/small.webp",
                        large_image_url: "https://example.com/large.webp"
                    }
                },
                trailer: undefined,
                approved: true,
                titles: []
            };

            const result = jikanApi.convertToAppFormat(jikanAnime);

            expect(result.malId).toBe(12345);
            expect(result.title).toBe("Test Anime");
            expect(result.titleEnglish).toBeUndefined();
            expect(result.titleJapanese).toBeUndefined();
            expect(result.type).toBe("TV");
            expect(result.episodes).toBe(0);
            expect(result.status).toBe("Currently Airing");
            expect(result.year).toBe(2023);
            expect(result.rating).toBe(0);
            expect(result.cover).toBe("https://example.com/large.jpg");
            expect(result.synopsis).toBeUndefined();
            expect(result.genres).toEqual([]);
            expect(result.themes).toEqual([]);
            expect(result.demographics).toEqual([]);
            expect(result.studios).toEqual([]);
            expect(result.trailer).toBeNull();
        });
    });
});
