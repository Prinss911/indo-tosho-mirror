import { v4 as uuidv4 } from "uuid";
import type { Anime } from "~/stores/anime";

// Mock database service untuk pengujian kategori baru
export class MockCategoryDatabaseService {
    private static instance: MockCategoryDatabaseService;
    private animes: Anime[] = [];
    private isInitialized = false;

    private constructor() {
        this.initializeData();
    }

    public static getInstance(): MockCategoryDatabaseService {
        if (!MockCategoryDatabaseService.instance) {
            MockCategoryDatabaseService.instance = new MockCategoryDatabaseService();
        }
        return MockCategoryDatabaseService.instance;
    }

    private initializeData(): void {
        if (this.isInitialized) return;

        // Fungsi untuk mengubah kategori lama (genre) menjadi kategori baru
        const updateCategory = (oldCategory: string): string => {
            // Semua anime akan masuk ke kategori "Anime" dengan subkategori yang sesuai
            // Secara default, kita gunakan "Sudah diterjemahkan" sebagai subkategori
            return "Anime - Sudah diterjemahkan";
        };

        this.animes = [
            {
                id: uuidv4(),
                title: "Attack on Titan",
                category: updateCategory("Anime - Sudah diterjemahkan"),
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
                id: uuidv4(),
                title: "Demon Slayer: Kimetsu no Yaiba",
                category: updateCategory("Anime - Sudah diterjemahkan"),
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
                id: uuidv4(),
                title: "Your Name (Kimi no Na wa)",
                category: updateCategory("Romance"),
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

    // Get anime by ID
    public async getAnimeById(id: string): Promise<Anime | null> {
        await this.delay(200);
        return this.animes.find(anime => anime.id === id) || null;
    }

    // Reset database
    public reset(): void {
        this.animes = [];
        this.isInitialized = false;
        this.initializeData();
    }
}

export const mockCategoryDatabase = MockCategoryDatabaseService.getInstance();
