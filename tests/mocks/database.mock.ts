import { vi } from "vitest";
import type { Anime } from "../../types/anime";

// Mock database interface
export interface MockDatabase {
    animes: Anime[];
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    findAll(): Promise<Anime[]>;
    findById(id: string): Promise<Anime | null>;
    create(anime: Omit<Anime, "id">): Promise<Anime>;
    update(id: string, anime: Partial<Anime>): Promise<Anime | null>;
    delete(id: string): Promise<boolean>;
    search(query: string): Promise<Anime[]>;
    findByCategory(category: string): Promise<Anime[]>;
}

// Import UUID v4 for generating unique IDs
import { v4 as uuidv4 } from "uuid";

// Mock data generator
export function generateMockAnimes(count: number = 10): Anime[] {
    const titles = [
        "Attack on Titan",
        "Demon Slayer",
        "Your Name",
        "Spirited Away",
        "One Piece",
        "Naruto",
        "Dragon Ball Z",
        "Death Note",
        "Fullmetal Alchemist",
        "My Hero Academia"
    ];

    const categories = ["Anime", "Audio", "Literature", "Live Action", "Pictures", "Software"];
    const submitters = ["AnimeFan123", "OtakuMaster", "SubsPlease", "Erai-raws"];
    const studios = ["Mappa", "Wit Studio", "Ufotable", "Madhouse", "Bones"];
    const subtitleTypes = ["Softsubs", "Hardsubs", "Raw"];
    const hostings = ["Google Drive", "Mega", "MediaFire", "Dropbox", "OneDrive"];

    return Array.from({ length: count }, (_, i) => ({
        id: uuidv4(),
        title: titles[i % titles.length],
        category: categories[i % categories.length],
        submitter: submitters[i % submitters.length],
        size: `${(2.5 + i * 0.5).toFixed(1)} GB`, // Deterministic size
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        views: 50 + i * 10, // Deterministic views
        likes: 10 + i * 5, // Deterministic likes
        downloads: 500 + i * 100, // Deterministic downloads
        status: ["completed", "ongoing", "upcoming"][i % 3] as "completed" | "ongoing" | "upcoming",
        rating: Math.round((8.0 + (i % 3) * 0.5) * 10) / 10, // Deterministic rating
        episodes: 12 + i * 2, // Deterministic episodes
        genre: [categories[i % categories.length]],
        year: 2020 + (i % 5),
        studio: studios[i % studios.length],
        coverImage: `https://picsum.photos/300/400?random=${i + 1}`,
        description: `Mock description for ${titles[i % titles.length]}`,
        subtitleType: subtitleTypes[i % subtitleTypes.length],
        downloadLinks: [
            {
                hosting: hostings[i % hostings.length],
                url: `https://${hostings[i % hostings.length].toLowerCase().replace(" ", "")}.com/file${i + 1}`
            },
            ...(i % 3 === 0
                ? [
                      {
                          hosting: hostings[(i + 1) % hostings.length],
                          url: `https://${hostings[(i + 1) % hostings.length].toLowerCase().replace(" ", "")}.com/backup${i + 1}`
                      }
                  ]
                : [])
        ],
        releaseFileName: `${titles[i % titles.length].replace(/\s+/g, ".")}.S01E${String(i + 1).padStart(2, "0")}.1080p.mkv`
    }));
}

// Create mock database implementation
export function createMockDatabase(initialData?: Anime[]): MockDatabase {
    let animes = initialData || generateMockAnimes();
    let isConnected = false;

    return {
        animes,

        async connect() {
            if (isConnected) {
                throw new Error("Database already connected");
            }
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 100));
            isConnected = true;
        },

        async disconnect() {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            isConnected = false;
        },

        async findAll() {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            // Simulate query delay
            await new Promise(resolve => setTimeout(resolve, 50));
            return [...animes];
        },

        async findById(id: string) {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 30));
            return animes.find(anime => anime.id === id) || null;
        },

        async create(animeData: Omit<Anime, "id">) {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 100));

            // Import UUID v4 dynamically to avoid issues with ESM/CJS compatibility
            const { v4: uuidv4 } = await import("uuid");

            const newAnime: Anime = {
                ...animeData,
                id: uuidv4()
            };

            animes.push(newAnime);
            return newAnime;
        },

        async update(id: string, updates: Partial<Anime>) {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 80));

            const index = animes.findIndex(anime => anime.id === id);
            if (index === -1) {
                return null;
            }

            animes[index] = { ...animes[index], ...updates };
            return animes[index];
        },

        async delete(id: string) {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 60));

            const index = animes.findIndex(anime => anime.id === id);
            if (index === -1) {
                return false;
            }

            animes.splice(index, 1);
            return true;
        },

        async search(query: string) {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 70));

            const searchLower = query.toLowerCase();
            return animes.filter(
                anime =>
                    anime.title.toLowerCase().includes(searchLower) ||
                    anime.submitter.toLowerCase().includes(searchLower) ||
                    anime.studio.toLowerCase().includes(searchLower)
            );
        },

        async findByCategory(category: string) {
            if (!isConnected) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 60));

            if (category === "all" || category.toLowerCase() === "semua kategori") {
                return [...this.animes];
            }

            return animes.filter(anime => anime.genre.some(g => g.toLowerCase().includes(category.toLowerCase())));
        }
    };
}

// Vitest mock factory
export function createDatabaseMock() {
    let mockDb = createMockDatabase();
    let connectionState = false;

    const mockFunctions = {
        connect: vi.fn().mockImplementation(async () => {
            if (connectionState) {
                throw new Error("Database already connected");
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            connectionState = true;
            return mockDb.connect();
        }),

        disconnect: vi.fn().mockImplementation(async () => {
            if (!connectionState) {
                // Don't throw error, just return silently for graceful cleanup
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            connectionState = false;
            // Don't call mockDb.disconnect() as it might throw error
        }),

        findAll: vi.fn().mockImplementation(async () => {
            if (!connectionState) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            return [...mockDb.animes];
        }),

        findById: vi.fn().mockImplementation(async (id: string) => {
            if (!connectionState) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 30));
            return mockDb.animes.find(anime => anime.id === id) || null;
        }),

        create: vi.fn().mockImplementation(async (animeData: Omit<Anime, "id">) => {
            if (!connectionState) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 100));

            // Import UUID v4 dynamically to avoid issues with ESM/CJS compatibility
            const { v4: uuidv4 } = await import("uuid");

            const newAnime: Anime = {
                ...animeData,
                id: uuidv4()
            };
            mockDb.animes.push(newAnime);
            return newAnime;
        }),

        update: vi.fn().mockImplementation(async (id: string, updates: Partial<Anime>) => {
            if (!connectionState) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 80));
            const index = mockDb.animes.findIndex(anime => anime.id === id);
            if (index === -1) {
                return null;
            }
            mockDb.animes[index] = { ...mockDb.animes[index], ...updates };
            return mockDb.animes[index];
        }),

        delete: vi.fn().mockImplementation(async (id: string) => {
            if (!connectionState) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 60));
            const index = mockDb.animes.findIndex(anime => anime.id === id);
            if (index === -1) {
                return false;
            }
            mockDb.animes.splice(index, 1);
            return true;
        }),

        search: vi.fn().mockImplementation(async (query: string) => {
            if (!connectionState) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 70));
            const searchLower = query.toLowerCase();
            return mockDb.animes.filter(
                anime =>
                    anime.title.toLowerCase().includes(searchLower) ||
                    anime.submitter.toLowerCase().includes(searchLower) ||
                    anime.studio.toLowerCase().includes(searchLower)
            );
        }),

        findByCategory: vi.fn().mockImplementation(async (category: string) => {
            if (!connectionState) {
                throw new Error("Database not connected");
            }
            await new Promise(resolve => setTimeout(resolve, 60));
            if (category === "all" || category.toLowerCase() === "semua kategori") {
                return [...this.animes];
            }
            return mockDb.animes.filter(anime =>
                anime.genre.some(g => g.toLowerCase().includes(category.toLowerCase()))
            );
        }),

        // Helper methods for testing
        resetMocks: () => {
            vi.clearAllMocks();
            connectionState = false;
        },

        setMockData: (data: Anime[]) => {
            mockDb = createMockDatabase(data);
            connectionState = false;
        },

        getMockData: () => [...mockDb.animes],

        resetDatabase: () => {
            mockDb = createMockDatabase();
            connectionState = false;
        },

        // Get connection state for testing
        isConnected: () => connectionState
    };

    return mockFunctions;
}
