import { vi } from "vitest";

// Mock data for anime search results
const mockSearchResults = {
    data: [
        {
            mal_id: 1,
            title: "Test Anime",
            title_english: "Test Anime English",
            episodes: 12,
            year: 2023,
            score: 8.5,
            images: {
                jpg: {
                    large_image_url: "https://example.com/image.jpg",
                    small_image_url: "https://example.com/small.jpg"
                }
            },
            synopsis: "Test synopsis",
            genres: [{ mal_id: 1, name: "Action" }],
            status: "Finished Airing",
            aired: { from: "2023-01-01" }
        }
    ]
};

// Mock data for current season anime - page 1
const mockCurrentSeasonPage1 = {
    data: [
        {
            mal_id: 2,
            title: "Season Anime 1",
            title_english: "Season Anime English 1",
            episodes: 24,
            year: 2023,
            score: 9.0,
            images: {
                jpg: {
                    large_image_url: "https://example.com/season1.jpg",
                    small_image_url: "https://example.com/season1-small.jpg"
                }
            },
            synopsis: "Season synopsis 1",
            genres: [{ mal_id: 2, name: "Comedy" }],
            status: "Currently Airing",
            aired: { from: "2023-07-01" }
        }
    ],
    pagination: {
        has_next_page: true,
        current_page: 1
    }
};

// Mock data for current season anime - page 2
const mockCurrentSeasonPage2 = {
    data: [
        {
            mal_id: 3,
            title: "Season Anime 2",
            title_english: "Season Anime English 2",
            episodes: 12,
            year: 2023,
            score: 8.7,
            images: {
                jpg: {
                    large_image_url: "https://example.com/season2.jpg",
                    small_image_url: "https://example.com/season2-small.jpg"
                }
            },
            synopsis: "Season synopsis 2",
            genres: [{ mal_id: 3, name: "Drama" }],
            status: "Currently Airing",
            aired: { from: "2023-07-15" }
        }
    ],
    pagination: {
        has_next_page: false,
        current_page: 2
    }
};

// Mock data for anime by ID
const mockAnimeById = {
    data: {
        mal_id: 1,
        title: "Test Anime",
        title_english: "Test Anime English",
        episodes: 12,
        year: 2023,
        score: 8.5,
        images: {
            jpg: {
                large_image_url: "https://example.com/image.jpg",
                small_image_url: "https://example.com/small.jpg"
            }
        },
        synopsis: "Test synopsis",
        genres: [{ mal_id: 1, name: "Action" }],
        status: "Finished Airing",
        aired: { from: "2023-01-01" }
    }
};

// Create mock Jikan API
export const createMockJikanApi = () => {
    return {
        searchAnime: vi.fn().mockResolvedValue(mockSearchResults),
        getAnimeById: vi.fn().mockResolvedValue(mockAnimeById),
        getCurrentSeasonAnime: vi.fn().mockImplementation((page = 1) => {
            if (page === 1) {
                return Promise.resolve(mockCurrentSeasonPage1);
            } else if (page === 2) {
                return Promise.resolve(mockCurrentSeasonPage2);
            } else {
                return Promise.resolve({
                    data: [],
                    pagination: {
                        has_next_page: false,
                        current_page: page
                    }
                });
            }
        }),
        getAnimeBySeason: vi.fn().mockResolvedValue(mockCurrentSeasonPage1),
        getAnimeByGenre: vi.fn().mockResolvedValue(mockSearchResults),
        getTopAnime: vi.fn().mockResolvedValue(mockSearchResults),
        convertToAppFormat: vi.fn().mockImplementation(animeData => {
            return {
                malId: animeData.mal_id,
                title: animeData.title,
                titleEnglish: animeData.title_english,
                episodes: animeData.episodes,
                year: animeData.year,
                rating: animeData.score,
                status: animeData.status,
                cover: animeData.images?.jpg?.large_image_url,
                synopsis: animeData.synopsis,
                genres: animeData.genres?.map((g: any) => g.name) || [],
                studios: [],
                trailer: null
            };
        })
    };
};

// Reset all mocks
export const resetJikanApiMocks = () => {
    const mockApi = createMockJikanApi();
    Object.keys(mockApi).forEach(key => {
        if (typeof mockApi[key as keyof typeof mockApi] === "function") {
            mockApi[key as keyof typeof mockApi].mockReset();
        }
    });
    return mockApi;
};
