import type { Anime } from "~/stores/anime";

// Mock database service untuk simulasi API calls
export class MockDatabaseService {
    private static instance: MockDatabaseService;
    private animes: Anime[] = [];
    private isInitialized = false;

    private constructor() {
        this.initializeData();
    }

    public static getInstance(): MockDatabaseService {
        if (!MockDatabaseService.instance) {
            MockDatabaseService.instance = new MockDatabaseService();
        }
        return MockDatabaseService.instance;
    }

    private initializeData(): void {
        if (this.isInitialized) return;

        // Fungsi untuk mengubah kategori lama (genre) menjadi kategori baru dengan variasi
        const updateCategory = (oldCategory: string): string => {
            // Kategori utama dengan berbagai subkategori
            const categories = {
                Anime: ["Sudah diterjemahkan", "Anime Music Video", "Selain Terjemahan Indonesia", "Raw"],
                Audio: ["Lossless", "Lossy"],
                Literature: ["Sudah diterjemahkan", "Selain Terjemahan Indonesia", "Raw"],
                "Live Action": ["Sudah diterjemahkan", "Idol/Promotional Video", "Selain Terjemahan Indonesia", "Raw"],
                Pictures: [],
                Graphics: []
            };

            // Jika kategori lama mengandung kata kunci tertentu, gunakan kategori yang sesuai
            if (oldCategory.includes("Music") || oldCategory.includes("AMV")) {
                return "Anime - Anime Music Video";
            } else if (oldCategory.includes("Raw")) {
                return "Anime - Raw";
            } else if (oldCategory.includes("Romance")) {
                return "Literature - Sudah diterjemahkan";
            } else if (oldCategory.includes("Thriller")) {
                return "Live Action - Sudah diterjemahkan";
            } else if (oldCategory === "Anime - Sudah diterjemahkan") {
                return oldCategory; // Pertahankan kategori yang sudah benar
            }

            // Untuk kategori lainnya, pilih secara acak
            const mainCats = Object.keys(categories);
            const randomMainCat = mainCats[Math.floor(Math.random() * mainCats.length)];

            // Jika ada subkategori, pilih salah satu secara acak
            const subCats = categories[randomMainCat as keyof typeof categories];
            if (subCats.length > 0) {
                const randomSubCat = subCats[Math.floor(Math.random() * subCats.length)];
                return `${randomMainCat} - ${randomSubCat}`;
            }

            // Jika tidak ada subkategori, gunakan kategori utama saja
            return randomMainCat;
        };

        this.animes = [
            {
                id: "d8fba84f-c74c-4cfa-9279-9e3b4bbd19be",
                title: "Attack on Titan",
                category: "Anime - Sudah diterjemahkan",
                genre: ["Action", "Drama", "Fantasy"],
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
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid beings who devour humans seemingly without reason, Eren Yeager joins the military to fight the Titans after his hometown is invaded and his mother is eaten."
            },
            {
                id: "7a6c91e3-eb2f-4bfb-a8c5-1d4f8e9d7b3a",
                title: "Demon Slayer: Kimetsu no Yaiba",
                category: "Anime - Selain Terjemahan Indonesia",
                genre: ["Action", "Adventure", "Thriller"],
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
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister."
            },
            {
                id: "5e9f8c2d-1a3b-4c7d-9e5f-8a2b6c0d4e6f",
                title: "Your Name (Kimi no Na wa)",
                category: "Literature - Sudah diterjemahkan",
                genre: ["Romance", "Drama", "Fantasy"],
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
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "Two teenagers share a profound, magical connection upon discovering they are swapping bodies. Things manage to become even more complicated when the boy and girl decide to meet in person."
            },
            {
                id: "3c1d2e9f-8a7b-6c5d-4e3f-2a1b0c9d8e7f",
                title: "Spirited Away",
                category: "Anime - Raw",
                genre: ["Adventure", "Fantasy", "Family"],
                size: "1.5 GB",
                date: "2023-03-12",
                views: 120,
                likes: 20,
                downloads: 4200,
                submitter: "GhibliFan",
                rating: 9.5,
                episodes: 1,
                year: 2001,
                status: "completed",
                studio: "Studio Ghibli",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts."
            },
            {
                id: "9c8d7e6f-5a4b-3c2d-1e0f-9a8b7c6d5e4f",
                title: "One Piece",
                category: "Anime - Anime Music Video",
                genre: ["Adventure", "Comedy", "Action"],
                size: "15.2 GB",
                date: "2023-03-20",
                views: 300,
                likes: 45,
                downloads: 12000,
                submitter: "PirateKing",
                rating: 9.0,
                episodes: 1000,
                year: 1999,
                status: "ongoing",
                studio: "Toei Animation",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "Follows the adventures of Monkey D. Luffy, a boy whose body gained the properties of rubber after unintentionally eating a Devil Fruit."
            },
            {
                id: "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
                title: "Naruto",
                category: "Audio - Lossless",
                genre: ["Action", "Adventure", "Comedy"],
                size: "8.7 GB",
                date: "2023-04-01",
                views: 180,
                likes: 35,
                downloads: 8500,
                submitter: "NinjaFan",
                rating: 8.8,
                episodes: 220,
                year: 2002,
                status: "completed",
                studio: "Studio Pierrot",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village's leader and strongest ninja."
            },
            {
                id: "b0a9c8d7-e6f5-4b3a-2c1d-0e9f8a7b6c5d",
                title: "Death Note",
                category: "Live Action - Sudah diterjemahkan",
                genre: ["Thriller", "Drama", "Fantasy"],
                size: "2.1 GB",
                date: "2023-04-08",
                views: 95,
                likes: 18,
                downloads: 3800,
                submitter: "LightYagami",
                rating: 9.1,
                episodes: 37,
                year: 2006,
                status: "completed",
                studio: "Madhouse",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it."
            },
            {
                id: "4b9c8d7e-6f5a-4b3c-2d1e-0f9a8b7c6d5e",
                title: "My Hero Academia",
                category: "Pictures",
                genre: ["Action", "Adventure", "Comedy"],
                size: "3.2 GB",
                date: "2023-04-15",
                views: 220,
                likes: 40,
                downloads: 9200,
                submitter: "HeroFan",
                rating: 8.6,
                episodes: 138,
                year: 2016,
                status: "ongoing",
                studio: "Studio Bones",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "A superhero-loving boy without any powers is determined to enroll in a prestigious hero academy and learn what it really means to be a hero."
            },
            {
                id: "5e4d3c2b-1a9b-8c7d-6e5f-4a3b2c1d0e9f",
                title: "Princess Mononoke",
                category: "Graphics",
                genre: ["Adventure", "Drama", "Fantasy"],
                size: "1.8 GB",
                date: "2023-04-22",
                views: 75,
                likes: 12,
                downloads: 2800,
                submitter: "ForestSpirit",
                rating: 9.3,
                episodes: 1,
                year: 1997,
                status: "completed",
                studio: "Studio Ghibli",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "On a journey to find the cure for a Tatarigami's curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara, a mining colony."
            },
            {
                id: "6f5e4d3c-2b1a-9b8c-7d6e-5f4a3b2c1d0e",
                title: "Jujutsu Kaisen",
                category: "Live Action - Idol/Promotional Video",
                genre: ["Action", "Thriller", "Fantasy"],
                size: "2.8 GB",
                date: "2023-04-29",
                views: 250,
                likes: 50,
                downloads: 11000,
                submitter: "CursedEnergy",
                rating: 8.9,
                episodes: 24,
                year: 2020,
                status: "ongoing",
                studio: "MAPPA",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself."
            },
            {
                id: "7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d",
                title: "Akira",
                category: "Audio - Lossy",
                genre: ["Sci-Fi", "Action", "Thriller"],
                size: "1.9 GB",
                date: "2023-05-06",
                views: 60,
                likes: 10,
                downloads: 2200,
                submitter: "CyberPunk",
                rating: 8.8,
                episodes: 1,
                year: 1988,
                status: "completed",
                studio: "Akira Committee",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic psychopath who can only be stopped by a teenager, his gang of biker friends and a group of psychics."
            },
            {
                id: "8b7a6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
                title: "Violet Evergarden",
                category: "Literature - Selain Terjemahan Indonesia",
                genre: ["Drama", "Romance", "Slice of Life"],
                size: "2.3 GB",
                date: "2023-05-13",
                views: 85,
                likes: 16,
                downloads: 3500,
                submitter: "AutoMemories",
                rating: 8.7,
                episodes: 13,
                year: 2018,
                status: "completed",
                studio: "Kyoto Animation",
                coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                description:
                    "After the war, Violet Evergarden needs to learn what it means to live. She becomes an Auto Memory Doll, helping others convey their thoughts and emotions through writing."
            }
        ];

        this.isInitialized = true;
    }

    // Simulate API delay
    private async delay(ms: number = 500): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get all animes
    public async getAllAnimes(): Promise<Anime[]> {
        await this.delay();
        return [...this.animes];
    }

    // Alias for getAllAnimes to match API naming convention
    public async getAnimes(): Promise<Anime[]> {
        return this.getAllAnimes();
    }

    // Get anime by ID
    public async getAnimeById(id: string): Promise<Anime | null> {
        await this.delay(200);
        return this.animes.find(anime => anime.id === id) || null;
    }

    // Search animes
    public async searchAnimes(query: string): Promise<Anime[]> {
        await this.delay(300);
        if (!query || query.trim() === "") {
            return [];
        }
        const lowercaseQuery = query.toLowerCase();
        return this.animes.filter(
            anime =>
                anime.title.toLowerCase().includes(lowercaseQuery) ||
                anime.genre.some(g => g.toLowerCase().includes(lowercaseQuery)) ||
                anime.studio.toLowerCase().includes(lowercaseQuery) ||
                anime.submitter.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Filter animes by category
    public async getAnimesByCategory(category: string): Promise<Anime[]> {
        await this.delay(300);
        if (category === "All" || !category) {
            return [...this.animes];
        }
        return this.animes.filter(anime => anime.category === category);
    }

    // Get animes with pagination
    public async getAnimesWithPagination(
        page: number = 1,
        limit: number = 25,
        filters?: {
            search?: string;
            category?: string;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        }
    ): Promise<{
        animes: Anime[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        await this.delay(400);

        let filteredAnimes = [...this.animes];

        // Apply search filter
        if (filters?.search) {
            const query = filters.search.toLowerCase();
            filteredAnimes = filteredAnimes.filter(
                anime =>
                    anime.title.toLowerCase().includes(query) ||
                    anime.genre.some(g => g.toLowerCase().includes(query)) ||
                    anime.studio.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (filters?.category && filters.category !== "All") {
            filteredAnimes = filteredAnimes.filter(anime => anime.category === filters.category);
        }

        // Apply sorting
        if (filters?.sortBy) {
            filteredAnimes.sort((a, b) => {
                let aValue: any = a[filters.sortBy as keyof Anime];
                let bValue: any = b[filters.sortBy as keyof Anime];

                // Handle different data types
                if (filters.sortBy === "date") {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                } else if (typeof aValue === "string") {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return filters.sortOrder === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return filters.sortOrder === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        const total = filteredAnimes.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedAnimes = filteredAnimes.slice(startIndex, endIndex);

        return {
            animes: paginatedAnimes,
            total,
            page,
            limit,
            totalPages
        };
    }

    // Get popular animes
    public async getPopularAnimes(limit: number = 10): Promise<Anime[]> {
        await this.delay(300);
        return [...this.animes].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
    }

    // Get recent animes
    public async getRecentAnimes(limit: number = 10): Promise<Anime[]> {
        await this.delay(300);
        return [...this.animes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
    }

    // Get top rated animes
    public async getTopRatedAnimes(limit: number = 10): Promise<Anime[]> {
        await this.delay(300);
        return [...this.animes].sort((a, b) => b.rating - a.rating).slice(0, limit);
    }

    // Get categories
    public async getCategories(): Promise<string[]> {
        await this.delay(100);
        const categories = [...new Set(this.animes.map(anime => anime.category))];
        return ["all", ...categories.sort()];
    }

    // Get statistics
    public async getStatistics(): Promise<{
        totalAnimes: number;
        totalCategories: number;
        totalDownloads: number;
        averageRating: number;
    }> {
        await this.delay(200);

        const totalAnimes = this.animes.length;
        const categories = new Set(this.animes.map(anime => anime.category));
        const totalCategories = categories.size;
        const totalDownloads = this.animes.reduce((sum, anime) => sum + anime.downloads, 0);
        const averageRating = this.animes.reduce((sum, anime) => sum + anime.rating, 0) / totalAnimes;

        return {
            totalAnimes,
            totalCategories,
            totalDownloads,
            averageRating: Math.round(averageRating * 10) / 10
        };
    }

    // Simulate network error
    public async simulateError(): Promise<never> {
        await this.delay(1000);
        throw new Error("Network error: Failed to fetch data from server");
    }

    // Reset data (for testing)
    public reset(): void {
        this.animes = [];
        this.isInitialized = false;
        this.initializeData();
    }

    // Add anime (for testing)
    public async addAnime(anime: Anime): Promise<Anime> {
        await this.delay(300);
        this.animes.push(anime);
        return anime;
    }

    // Update anime (for testing)
    public async updateAnime(id: string, updates: Partial<Anime>): Promise<Anime | null> {
        await this.delay(300);
        const index = this.animes.findIndex(anime => anime.id === id);
        if (index === -1) return null;

        this.animes[index] = { ...this.animes[index], ...updates };
        return this.animes[index];
    }

    // Delete anime (for testing)
    public async deleteAnime(id: string): Promise<boolean> {
        await this.delay(300);
        const index = this.animes.findIndex(anime => anime.id === id);
        if (index === -1) return false;

        this.animes.splice(index, 1);
        return true;
    }

    // This function was already defined above, so we're removing the duplicate
}

// Export singleton instance
export const mockDatabase = MockDatabaseService.getInstance();
