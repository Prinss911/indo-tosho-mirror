import { vi } from "vitest";

// Mock data for categories
export const mockCategories = [
    { id: "all", name: "Semua Kategori" },
    { id: "anime", name: "Anime" },
    { id: "anime-music-video", name: "Anime Music Video", parent: "anime" },
    { id: "anime-sudah-diterjemahkan", name: "Sudah diterjemahkan", parent: "anime" },
    { id: "anime-selain-terjemahan-indonesia", name: "Selain Terjemahan Indonesia", parent: "anime" },
    { id: "anime-raw", name: "Raw", parent: "anime" },
    { id: "audio", name: "Audio" },
    { id: "audio-lossless", name: "Lossless", parent: "audio" },
    { id: "audio-lossy", name: "Lossy", parent: "audio" },
    { id: "literature", name: "Literature" },
    { id: "literature-sudah-diterjemahkan", name: "Sudah diterjemahkan", parent: "literature" },
    { id: "literature-selain-terjemahan-indonesia", name: "Selain Terjemahan Indonesia", parent: "literature" },
    { id: "literature-raw", name: "Raw", parent: "literature" },
    { id: "live-action", name: "Live Action" },
    { id: "live-action-sudah-diterjemahkan", name: "Sudah diterjemahkan", parent: "live-action" },
    { id: "live-action-idol-promotional-video", name: "Idol/Promotional Video", parent: "live-action" },
    { id: "live-action-selain-terjemahan-indonesia", name: "Selain Terjemahan Indonesia", parent: "live-action" },
    { id: "live-action-raw", name: "Raw", parent: "live-action" },
    { id: "pictures", name: "Pictures" },
    { id: "pictures-graphics", name: "Graphics", parent: "pictures" },
    { id: "pictures-photos", name: "Photos", parent: "pictures" },
    { id: "software", name: "Software" },
    { id: "software-applications", name: "Applications", parent: "software" },
    { id: "software-games", name: "Games", parent: "software" }
];

// Mock data for animes
export const mockAnimes = [
    {
        id: "1",
        title: "Naruto",
        description: "Ninja adventure",
        categories: ["anime", "anime-sudah-diterjemahkan"],
        rating: 8.5,
        year: 2002,
        imageUrl: "/images/naruto.jpg"
    },
    {
        id: "2",
        title: "One Piece",
        description: "Pirate adventure",
        categories: ["anime", "anime-selain-terjemahan-indonesia"],
        rating: 9.0,
        year: 1999,
        imageUrl: "/images/one-piece.jpg"
    },
    {
        id: "3",
        title: "Your Name AMV",
        description: "Music video compilation",
        categories: ["anime-music-video"],
        rating: 8.0,
        year: 2017,
        imageUrl: "/images/your-name-amv.jpg"
    },
    {
        id: "4",
        title: "Demon Slayer OST",
        description: "Original soundtrack",
        categories: ["audio", "audio-lossless"],
        rating: 9.5,
        year: 2019,
        imageUrl: "/images/demon-slayer-ost.jpg"
    },
    {
        id: "5",
        title: "Manga Collection",
        description: "Digital manga collection",
        categories: ["literature", "literature-selain-terjemahan-indonesia"],
        rating: 8.7,
        year: 2020,
        imageUrl: "/images/manga-collection.jpg"
    }
];

// Mock localStorage
export const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
};

// Mock fetch function
export const mockFetch = vi.fn();

// Setup global mocks
export const setupMocks = () => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage
    });

    // Mock fetch
    global.fetch = mockFetch;

    // Setup default mock responses
    mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockAnimes })
    });
};
