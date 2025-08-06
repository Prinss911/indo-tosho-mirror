import { vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import type { User } from "~/stores/auth";
import type { Category } from "~/stores/anime";

// Definisi kategori yang terpusat untuk pengujian
export const MOCK_CATEGORY_GROUPS = {
    Anime: ["Anime Music Video", "Sudah diterjemahkan", "Selain Terjemahan Indonesia", "Raw"],
    Audio: ["Lossless", "Lossy"],
    Literature: ["Sudah diterjemahkan", "Selain Terjemahan Indonesia", "Raw"],
    "Live Action": ["Sudah diterjemahkan", "Idol/Promotional Video", "Selain Terjemahan Indonesia", "Raw"],
    Pictures: [],
    Graphics: []
};

// Buat array kategori hierarkis dari MOCK_CATEGORY_GROUPS
export const mockCategories: Category[] = [{ id: "all", name: "Semua Kategori" }];

// Tambahkan kategori utama dan subkategori
Object.entries(MOCK_CATEGORY_GROUPS).forEach(([parent, subcategories]) => {
    // Tambahkan kategori utama
    const parentId = parent.toLowerCase().replace(/\s+/g, "-");
    mockCategories.push({ id: parentId, name: parent });

    // Tambahkan subkategori
    subcategories.forEach(sub => {
        const subId = `${parentId}-${sub.toLowerCase().replace(/\s+/g, "-")}`;
        mockCategories.push({ id: subId, name: sub, parent: parentId });
    });
});

// Mock User Database
export const mockUsers: User[] = [
    {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        isActive: true,
        createdAt: new Date("2024-01-01"),
        lastLoginAt: new Date("2024-01-15")
    },
    {
        id: "2",
        username: "user",
        email: "user@example.com",
        role: "user",
        isActive: true,
        createdAt: new Date("2024-01-02"),
        lastLoginAt: new Date("2024-01-14")
    },
    {
        id: "3",
        username: "moderator",
        email: "moderator@example.com",
        role: "moderator",
        isActive: true,
        createdAt: new Date("2024-01-03"),
        lastLoginAt: new Date("2024-01-13")
    },
    {
        id: "4",
        username: "inactive_user",
        email: "inactive@example.com",
        role: "user",
        isActive: false,
        createdAt: new Date("2024-01-04"),
        lastLoginAt: new Date("2024-01-10")
    },
    {
        id: "5",
        username: "test_admin",
        email: "testadmin@example.com",
        role: "admin",
        isActive: true,
        createdAt: new Date("2024-01-05"),
        lastLoginAt: new Date("2024-01-12")
    }
];

// Mock Post/Anime Database
export interface MockPost {
    id: string;
    title: string;
    category: string;
    episodes: number;
    year: number;
    rating: number;
    coverUrl: string;
    description: string;
    submitterId: string;
    submitterName: string;
    status: "Finished Airing" | "Currently Airing" | "Not yet aired";
    statusApproval: "published" | "pending" | "rejected";
    views: number;
    downloads: number;
    likes: number;
    size: string;
    createdAt: Date;
    updatedAt: Date;
    // New fields for manual input
    releaseFileName?: string;
    downloadLink?: string;
    softsubLink?: string;
}

export const mockPosts: MockPost[] = [
    {
        id: uuidv4(),
        title: "Attack on Titan Final Season",
        category: "Anime - Sudah diterjemahkan",
        episodes: 24,
        year: 2023,
        rating: 9.2,
        coverUrl: "https://example.com/aot.jpg",
        description: "The final season of the epic anime series.",
        submitterId: "2",
        submitterName: "user",
        status: "Finished Airing",
        statusApproval: "published",
        views: 15420,
        downloads: 3240,
        likes: 892,
        size: "8.5 GB",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
        releaseFileName: "[SubsPlease] Shingeki no Kyojin - The Final Season - 01 [1080p].mkv",
        downloadLink: "https://example.com/download/aot-final-season",
        softsubLink: "https://example.com/softsub/aot-final-season"
    },
    {
        id: uuidv4(),
        title: "Demon Slayer Season 3",
        category: "Anime - Sudah diterjemahkan",
        episodes: 12,
        year: 2023,
        rating: 8.9,
        coverUrl: "https://example.com/demon-slayer.jpg",
        description: "The third season of Demon Slayer anime.",
        submitterId: "3",
        submitterName: "moderator",
        status: "Finished Airing",
        statusApproval: "published",
        views: 12350,
        downloads: 2890,
        likes: 756,
        size: "6.2 GB",
        createdAt: new Date("2024-01-11"),
        updatedAt: new Date("2024-01-11"),
        releaseFileName: "[Erai-raws] Kimetsu no Yaiba - Katanakaji no Sato-hen - 01 [1080p].mkv",
        downloadLink: "https://example.com/download/demon-slayer-s3",
        softsubLink: "https://example.com/softsub/demon-slayer-s3"
    },
    {
        id: uuidv4(),
        title: "One Piece Episode 1000+",
        category: "Adventure",
        episodes: 50,
        year: 2023,
        rating: 9.0,
        coverUrl: "https://example.com/one-piece.jpg",
        description: "Latest episodes of One Piece anime.",
        submitterId: "2",
        submitterName: "user",
        status: "Currently Airing",
        statusApproval: "pending",
        views: 0,
        downloads: 0,
        likes: 0,
        size: "25.0 GB",
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-12")
    },
    {
        id: uuidv4(),
        title: "Jujutsu Kaisen Season 2",
        category: "Supernatural",
        episodes: 24,
        year: 2023,
        rating: 8.8,
        coverUrl: "https://example.com/jjk.jpg",
        description: "Second season of Jujutsu Kaisen.",
        submitterId: "4",
        submitterName: "inactive_user",
        status: "Not yet aired",
        statusApproval: "rejected",
        views: 0,
        downloads: 0,
        likes: 0,
        size: "12.1 GB",
        createdAt: new Date("2024-01-13"),
        updatedAt: new Date("2024-01-13")
    },
    {
        id: uuidv4(),
        title: "Chainsaw Man",
        category: "Horror",
        episodes: 12,
        year: 2022,
        rating: 8.7,
        coverUrl: "https://example.com/chainsaw-man.jpg",
        description: "Dark supernatural anime series.",
        submitterId: "1",
        submitterName: "admin",
        status: "Finished Airing",
        statusApproval: "published",
        views: 9876,
        downloads: 2134,
        likes: 543,
        size: "7.8 GB",
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-14")
    }
];

// Mock Statistics
export const mockStats = {
    totalAnime: mockPosts.length,
    totalViews: mockPosts.reduce((sum, post) => sum + post.views, 0),
    totalDownloads: mockPosts.reduce((sum, post) => sum + post.downloads, 0),
    totalLikes: mockPosts.reduce((sum, post) => sum + post.likes, 0)
};

export const mockUserStats = {
    total: mockUsers.length,
    active: mockUsers.filter(user => user.isActive).length,
    admins: mockUsers.filter(user => user.role === "admin").length
};

export const mockPostStats = {
    total: mockPosts.length,
    published: mockPosts.filter(post => post.statusApproval === "published").length,
    pending: mockPosts.filter(post => post.statusApproval === "pending").length,
    rejected: mockPosts.filter(post => post.statusApproval === "rejected").length
};

// Mock Theme Database
export interface MockThemePreference {
    userId: string;
    theme: "light" | "dark" | "system";
    updatedAt: Date;
}

export const mockThemePreferences: MockThemePreference[] = [
    {
        userId: "1",
        theme: "dark",
        updatedAt: new Date("2024-01-15")
    },
    {
        userId: "2",
        theme: "light",
        updatedAt: new Date("2024-01-14")
    },
    {
        userId: "3",
        theme: "system",
        updatedAt: new Date("2024-01-13")
    }
];

// Mock Theme API
export const mockThemeAPI = {
    getUserTheme: vi.fn().mockImplementation((userId: string): "light" | "dark" | "system" => {
        const preference = mockThemePreferences.find(p => p.userId === userId);
        return preference?.theme || "light";
    }),

    setUserTheme: vi.fn().mockImplementation((userId: string, theme: "light" | "dark" | "system"): boolean => {
        const existingIndex = mockThemePreferences.findIndex(p => p.userId === userId);

        if (existingIndex >= 0) {
            mockThemePreferences[existingIndex] = {
                userId,
                theme,
                updatedAt: new Date()
            };
        } else {
            mockThemePreferences.push({
                userId,
                theme,
                updatedAt: new Date()
            });
        }

        return true;
    }),

    getSystemTheme: vi.fn().mockReturnValue("light"),

    applyTheme: vi.fn().mockImplementation((theme: "light" | "dark") => {
        if (typeof document !== "undefined") {
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(theme);
        }
    })
};

// Mock localStorage untuk theme testing
export const mockLocalStorage = {
    storage: new Map<string, string>(),

    getItem: vi.fn().mockImplementation(function (key: string): string | null {
        return this.storage.get(key) || null;
    }),

    setItem: vi.fn().mockImplementation(function (key: string, value: string): void {
        this.storage.set(key, value);
    }),

    removeItem: vi.fn().mockImplementation(function (key: string): void {
        this.storage.delete(key);
    }),

    clear: vi.fn().mockImplementation(function (): void {
        this.storage.clear();
    }),

    // Helper methods untuk testing
    setupDarkMode: function (): void {
        this.setItem("theme", "dark");
    },

    setupLightMode: function (): void {
        this.setItem("theme", "light");
    },

    reset: function (): void {
        this.clear();
        vi.clearAllMocks();
    }
};

// Mock window.matchMedia untuk system theme testing
export const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false, // Default to light theme
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
}));

// Helper to set dark mode preference
mockMatchMedia.setDarkMode = () => {
    mockMatchMedia.mockImplementation((query: string) => ({
        matches: query.includes("prefers-color-scheme: dark"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }));
};

// Helper to set light mode preference
mockMatchMedia.setLightMode = () => {
    mockMatchMedia.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }));
};

// Helper function untuk setup theme testing environment
export const setupThemeTestEnvironment = () => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true
    });

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: mockMatchMedia
    });

    // Reset storage
    mockLocalStorage.reset();
};

// Export untuk kemudahan testing sudah dilakukan di atas

// Mock Activity Log
export interface MockActivity {
    id: string;
    type: "user_login" | "post_created" | "post_published" | "post_rejected" | "user_created" | "user_updated";
    description: string;
    userId: string;
    userName: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export const mockActivities: MockActivity[] = [
    {
        id: "1",
        type: "user_login",
        description: "User logged in",
        userId: "1",
        userName: "admin",
        timestamp: new Date("2024-01-15T10:30:00"),
        metadata: { ip: "192.168.1.1" }
    },
    {
        id: "2",
        type: "post_created",
        description: "New anime post submitted",
        userId: "2",
        userName: "user",
        timestamp: new Date("2024-01-15T09:15:00"),
        metadata: { postId: "3", title: "One Piece Episode 1000+" }
    },
    {
        id: "3",
        type: "post_published",
        description: "Anime post published",
        userId: "1",
        userName: "admin",
        timestamp: new Date("2024-01-14T16:45:00"),
        metadata: { postId: "1", title: "Attack on Titan Final Season" }
    },
    {
        id: "4",
        type: "user_created",
        description: "New user registered",
        userId: "1",
        userName: "admin",
        timestamp: new Date("2024-01-14T14:20:00"),
        metadata: { newUserId: "5", newUserName: "test_admin" }
    },
    {
        id: "5",
        type: "post_rejected",
        description: "Anime post rejected",
        userId: "1",
        userName: "admin",
        timestamp: new Date("2024-01-13T11:30:00"),
        metadata: { postId: "4", title: "Jujutsu Kaisen Season 2", reason: "Poor quality" }
    }
];

// Database Mock Functions
export class MockDatabase {
    private users: User[] = [...mockUsers];
    private posts: MockPost[] = [...mockPosts];
    private activities: MockActivity[] = [...mockActivities];

    // User operations
    getUsers(): User[] {
        return [...this.users];
    }

    getUserById(id: string): User | undefined {
        return this.users.find(user => user.id === id);
    }

    getUserByUsername(username: string): User | undefined {
        return this.users.find(user => user.username === username);
    }

    createUser(userData: Omit<User, "id" | "createdAt">): User {
        const newUser: User = {
            ...userData,
            id: (this.users.length + 1).toString(),
            createdAt: new Date()
        };
        this.users.push(newUser);
        return newUser;
    }

    updateUser(id: string, updates: Partial<User>): User | undefined {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return undefined;

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        return this.users[userIndex];
    }

    deleteUser(id: string): boolean {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return false;

        this.users.splice(userIndex, 1);
        return true;
    }

    // Post operations
    getPosts(): MockPost[] {
        return [...this.posts];
    }

    getPostById(id: string): MockPost | undefined {
        return this.posts.find(post => post.id === id);
    }

    createPost(postData: Omit<MockPost, "id" | "createdAt" | "updatedAt">): MockPost {
        const newPost: MockPost = {
            ...postData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.posts.push(newPost);
        return newPost;
    }

    updatePost(id: string, updates: Partial<MockPost>): MockPost | undefined {
        const postIndex = this.posts.findIndex(post => post.id === id);
        if (postIndex === -1) return undefined;

        this.posts[postIndex] = {
            ...this.posts[postIndex],
            ...updates,
            updatedAt: new Date()
        };
        return this.posts[postIndex];
    }

    deletePost(id: string): boolean {
        const postIndex = this.posts.findIndex(post => post.id === id);
        if (postIndex === -1) return false;

        this.posts.splice(postIndex, 1);
        return true;
    }

    // Activity operations
    getActivities(): MockActivity[] {
        return [...this.activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    addActivity(activity: Omit<MockActivity, "id">): MockActivity {
        const newActivity: MockActivity = {
            ...activity,
            id: uuidv4()
        };
        this.activities.push(newActivity);
        return newActivity;
    }

    // Statistics
    getStats() {
        return {
            totalAnime: this.posts.length,
            totalViews: this.posts.reduce((sum, post) => sum + post.views, 0),
            totalDownloads: this.posts.reduce((sum, post) => sum + post.downloads, 0),
            totalLikes: this.posts.reduce((sum, post) => sum + post.likes, 0)
        };
    }

    getUserStats() {
        return {
            total: this.users.length,
            active: this.users.filter(user => user.isActive).length,
            admins: this.users.filter(user => user.role === "admin").length
        };
    }

    getPostStats() {
        return {
            total: this.posts.length,
            published: this.posts.filter(post => post.statusApproval === "published").length,
            pending: this.posts.filter(post => post.statusApproval === "pending").length,
            rejected: this.posts.filter(post => post.statusApproval === "rejected").length
        };
    }

    // Reset database to initial state
    reset(): void {
        this.users = [...mockUsers];
        this.posts = [...mockPosts];
        this.activities = [...mockActivities];
    }
}

// Export singleton instance
export const mockDatabase = new MockDatabase();
