import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock database interface
interface MockDatabase {
    posts: any[];
    users: any[];
    categories: any[];
}

// Mock database implementation
class MockDatabaseService {
    private db = {
        posts: [] as any[],
        users: [] as any[],
        categories: [] as any[]
    };
    private idCounter = 1;

    // Posts operations
    async createPost(postData: any) {
        const newPost = {
            id: (this.idCounter++).toString(),
            ...postData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.db.posts.push(newPost);
        return newPost;
    }

    async getPostById(id: string) {
        return this.db.posts.find(post => post.id === id) || null;
    }

    async getAllPosts() {
        return [...this.db.posts];
    }

    async updatePost(id: string, updateData: any) {
        const index = this.db.posts.findIndex(post => post.id === id);
        if (index === -1) return null;

        this.db.posts[index] = {
            ...this.db.posts[index],
            ...updateData,
            updatedAt: new Date()
        };
        return this.db.posts[index];
    }

    async deletePost(id: string) {
        const index = this.db.posts.findIndex(post => post.id === id);
        if (index === -1) return false;

        this.db.posts.splice(index, 1);
        return true;
    }

    async getPostsByStatus(status: string) {
        return this.db.posts.filter(post => post.status === status);
    }

    async getPostsByUser(userId: string) {
        return this.db.posts.filter(post => post.submitter === userId);
    }

    // Users operations
    async createUser(userData: any) {
        const newUser = {
            id: (this.idCounter++).toString(),
            ...userData,
            createdAt: new Date()
        };
        this.db.users.push(newUser);
        return newUser;
    }

    async getUserById(id: string) {
        return this.db.users.find(user => user.id === id) || null;
    }

    async getUserByUsername(username: string) {
        return this.db.users.find(user => user.username === username) || null;
    }

    // Categories operations
    async getAllCategories() {
        return [...this.db.categories];
    }

    async createCategory(categoryData: any) {
        const newCategory = {
            id: (this.idCounter++).toString(),
            ...categoryData
        };
        this.db.categories.push(newCategory);
        return newCategory;
    }

    // Utility methods
    async clearDatabase() {
        this.db.posts = [];
        this.db.users = [];
        this.db.categories = [];
        this.idCounter = 1;
    }

    async seedDatabase() {
        // Seed with test data
        await this.createUser({
            username: "testuser",
            email: "test@example.com",
            role: "user"
        });

        await this.createCategory({
            name: "Anime - Sudah diterjemahkan",
            description: "Anime - Sudah diterjemahkan category"
        });

        await this.createPost({
            title: "Test Anime",
            titleEnglish: "Test Anime English",
            episodes: 12,
            year: 2024,
            rating: 8.5,
            category: "Anime - Sudah diterjemahkan",
            status: "pending",
            submitter: "testuser",
            description: "Test anime description"
        });
    }
}

describe("Database Mock Service", () => {
    let mockDb: MockDatabaseService;

    beforeEach(async () => {
        mockDb = new MockDatabaseService();
        await mockDb.clearDatabase();
    });

    afterEach(async () => {
        await mockDb.clearDatabase();
    });

    describe("Posts Operations", () => {
        it("should create a new post", async () => {
            const postData = {
                title: "Attack on Titan",
                titleEnglish: "Shingeki no Kyojin",
                episodes: 25,
                year: 2013,
                rating: 9.0,
                category: "Anime - Sudah diterjemahkan",
                status: "pending",
                submitter: "user123",
                description: "Humanity fights for survival against giant humanoid Titans."
            };

            const createdPost = await mockDb.createPost(postData);

            expect(createdPost).toBeDefined();
            expect(createdPost.id).toBeDefined();
            expect(createdPost.title).toBe(postData.title);
            expect(createdPost.createdAt).toBeInstanceOf(Date);
            expect(createdPost.updatedAt).toBeInstanceOf(Date);
        });

        it("should get post by ID", async () => {
            const postData = {
                title: "Your Name",
                titleEnglish: "Kimi no Na wa",
                episodes: 1,
                year: 2016,
                rating: 8.4,
                category: "Romance",
                status: "published",
                submitter: "user456"
            };

            const createdPost = await mockDb.createPost(postData);
            const retrievedPost = await mockDb.getPostById(createdPost.id);

            expect(retrievedPost).toBeDefined();
            expect(retrievedPost?.id).toBe(createdPost.id);
            expect(retrievedPost?.title).toBe(postData.title);
        });

        it("should return null for non-existent post ID", async () => {
            const retrievedPost = await mockDb.getPostById("non-existent-id");
            expect(retrievedPost).toBeNull();
        });

        it("should get all posts", async () => {
            await mockDb.createPost({ title: "Post 1", status: "published" });
            await mockDb.createPost({ title: "Post 2", status: "pending" });
            await mockDb.createPost({ title: "Post 3", status: "rejected" });

            const allPosts = await mockDb.getAllPosts();

            expect(allPosts).toHaveLength(3);
            expect(allPosts.map(p => p.title)).toEqual(["Post 1", "Post 2", "Post 3"]);
        });

        it("should update an existing post", async () => {
            const postData = {
                title: "Original Title",
                status: "pending"
            };

            const createdPost = await mockDb.createPost(postData);
            const updateData = {
                title: "Updated Title",
                status: "published"
            };

            const updatedPost = await mockDb.updatePost(createdPost.id, updateData);

            expect(updatedPost).toBeDefined();
            expect(updatedPost?.title).toBe("Updated Title");
            expect(updatedPost?.status).toBe("published");
            expect(updatedPost?.updatedAt).toBeInstanceOf(Date);
        });

        it("should return null when updating non-existent post", async () => {
            const result = await mockDb.updatePost("non-existent-id", { title: "New Title" });
            expect(result).toBeNull();
        });

        it("should delete an existing post", async () => {
            const createdPost = await mockDb.createPost({ title: "To Delete" });

            const deleteResult = await mockDb.deletePost(createdPost.id);
            expect(deleteResult).toBe(true);

            const retrievedPost = await mockDb.getPostById(createdPost.id);
            expect(retrievedPost).toBeNull();
        });

        it("should return false when deleting non-existent post", async () => {
            const deleteResult = await mockDb.deletePost("non-existent-id");
            expect(deleteResult).toBe(false);
        });

        it("should filter posts by status", async () => {
            await mockDb.createPost({ title: "Published Post", status: "published" });
            await mockDb.createPost({ title: "Pending Post", status: "pending" });
            await mockDb.createPost({ title: "Another Published", status: "published" });

            const publishedPosts = await mockDb.getPostsByStatus("published");
            const pendingPosts = await mockDb.getPostsByStatus("pending");

            expect(publishedPosts).toHaveLength(2);
            expect(pendingPosts).toHaveLength(1);
            expect(publishedPosts.every(p => p.status === "published")).toBe(true);
            expect(pendingPosts[0].status).toBe("pending");
        });

        it("should filter posts by user", async () => {
            await mockDb.createPost({ title: "User1 Post 1", submitter: "user1" });
            await mockDb.createPost({ title: "User2 Post", submitter: "user2" });
            await mockDb.createPost({ title: "User1 Post 2", submitter: "user1" });

            const user1Posts = await mockDb.getPostsByUser("user1");
            const user2Posts = await mockDb.getPostsByUser("user2");

            expect(user1Posts).toHaveLength(2);
            expect(user2Posts).toHaveLength(1);
            expect(user1Posts.every(p => p.submitter === "user1")).toBe(true);
            expect(user2Posts[0].submitter).toBe("user2");
        });
    });

    describe("Users Operations", () => {
        it("should create a new user", async () => {
            const userData = {
                username: "testuser",
                email: "test@example.com",
                role: "user"
            };

            const createdUser = await mockDb.createUser(userData);

            expect(createdUser).toBeDefined();
            expect(createdUser.id).toBeDefined();
            expect(createdUser.username).toBe(userData.username);
            expect(createdUser.email).toBe(userData.email);
            expect(createdUser.createdAt).toBeInstanceOf(Date);
        });

        it("should get user by ID", async () => {
            const userData = { username: "testuser", email: "test@example.com" };
            const createdUser = await mockDb.createUser(userData);

            const retrievedUser = await mockDb.getUserById(createdUser.id);

            expect(retrievedUser).toBeDefined();
            expect(retrievedUser?.id).toBe(createdUser.id);
            expect(retrievedUser?.username).toBe(userData.username);
        });

        it("should get user by username", async () => {
            const userData = { username: "uniqueuser", email: "unique@example.com" };
            await mockDb.createUser(userData);

            const retrievedUser = await mockDb.getUserByUsername("uniqueuser");

            expect(retrievedUser).toBeDefined();
            expect(retrievedUser?.username).toBe("uniqueuser");
            expect(retrievedUser?.email).toBe("unique@example.com");
        });

        it("should return null for non-existent user", async () => {
            const userById = await mockDb.getUserById("non-existent-id");
            const userByUsername = await mockDb.getUserByUsername("non-existent-user");

            expect(userById).toBeNull();
            expect(userByUsername).toBeNull();
        });
    });

    describe("Categories Operations", () => {
        it("should create a new category", async () => {
            const categoryData = {
                name: "Anime - Sudah diterjemahkan",
                description: "Anime - Sudah diterjemahkan category"
            };

            const createdCategory = await mockDb.createCategory(categoryData);

            expect(createdCategory).toBeDefined();
            expect(createdCategory.id).toBeDefined();
            expect(createdCategory.name).toBe(categoryData.name);
            expect(createdCategory.description).toBe(categoryData.description);
        });

        it("should get all categories", async () => {
            await mockDb.createCategory({
                name: "Anime - Sudah diterjemahkan",
                description: "Anime - Sudah diterjemahkan category"
            });
            await mockDb.createCategory({ name: "Romance", description: "Romance category" });
            await mockDb.createCategory({ name: "Comedy", description: "Comedy category" });

            const allCategories = await mockDb.getAllCategories();

            expect(allCategories).toHaveLength(3);
            expect(allCategories.map(c => c.name)).toEqual(["Anime - Sudah diterjemahkan", "Romance", "Comedy"]);
        });
    });

    describe("Database Utilities", () => {
        it("should clear database", async () => {
            await mockDb.createPost({ title: "Test Post" });
            await mockDb.createUser({ username: "testuser" });
            await mockDb.createCategory({ name: "Test Category" });

            await mockDb.clearDatabase();

            const posts = await mockDb.getAllPosts();
            const categories = await mockDb.getAllCategories();

            expect(posts).toHaveLength(0);
            expect(categories).toHaveLength(0);
        });

        it("should seed database with test data", async () => {
            await mockDb.seedDatabase();

            const posts = await mockDb.getAllPosts();
            const categories = await mockDb.getAllCategories();
            const user = await mockDb.getUserByUsername("testuser");

            expect(posts).toHaveLength(1);
            expect(categories).toHaveLength(1);
            expect(user).toBeDefined();
            expect(user?.username).toBe("testuser");
            expect(posts[0].title).toBe("Test Anime");
            expect(categories[0].name).toBe("Anime - Sudah diterjemahkan");
        });
    });

    describe("Database Integration Tests", () => {
        it("should handle complex operations workflow", async () => {
            // Seed initial data
            await mockDb.seedDatabase();

            // Create additional user
            const newUser = await mockDb.createUser({
                username: "admin",
                email: "admin@example.com",
                role: "admin"
            });

            // Create post by new user
            const newPost = await mockDb.createPost({
                title: "Admin Post",
                submitter: newUser.username,
                status: "published"
            });

            // Update post status
            await mockDb.updatePost(newPost.id, { status: "featured" });

            // Verify workflow
            const adminPosts = await mockDb.getPostsByUser("admin");
            const featuredPosts = await mockDb.getPostsByStatus("featured");
            const allPosts = await mockDb.getAllPosts();
            const updatedPost = await mockDb.getPostById(newPost.id);

            expect(adminPosts).toHaveLength(1);
            expect(featuredPosts).toHaveLength(1);
            expect(allPosts).toHaveLength(2); // seeded post + new post
            expect(updatedPost?.status).toBe("featured");
            expect(updatedPost?.title).toBe("Admin Post");
            expect(adminPosts[0].title).toBe("Admin Post");
            expect(featuredPosts[0].title).toBe("Admin Post");
        });

        it("should handle concurrent operations", async () => {
            const promises = [];

            // Create multiple posts concurrently
            for (let i = 0; i < 5; i++) {
                promises.push(
                    mockDb.createPost({
                        title: `Concurrent Post ${i}`,
                        submitter: `user${i}`,
                        status: i % 2 === 0 ? "published" : "pending"
                    })
                );
            }

            await Promise.all(promises);

            const allPosts = await mockDb.getAllPosts();
            const publishedPosts = await mockDb.getPostsByStatus("published");
            const pendingPosts = await mockDb.getPostsByStatus("pending");

            expect(allPosts).toHaveLength(5);
            expect(publishedPosts).toHaveLength(3); // posts 0, 2, 4
            expect(pendingPosts).toHaveLength(2); // posts 1, 3
        });
    });
});
