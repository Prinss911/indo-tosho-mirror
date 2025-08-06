import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEvent, createError } from "h3";
import { IncomingMessage, ServerResponse } from "http";
import postsHandler from "~/server/api/posts";

// Mock the server utilities
vi.mock("~/server/utils/rate-limiter", () => ({
    endpointRateLimiters: {
        postsCreate: vi.fn(() => ({ allowed: true })),
        postsRead: vi.fn(() => ({ allowed: true })),
        postsUpdate: vi.fn(() => ({ allowed: true })),
        postsDelete: vi.fn(() => ({ allowed: true }))
    }
}));

vi.mock("~/server/utils/validation", () => ({
    validateAndSanitizePostData: vi.fn(data => data),
    validateMethod: vi.fn((event, methods) => event.node.req.method),
    validateContentLength: vi.fn(),
    validateUUID: vi.fn(id => id)
}));

vi.mock("~/server/utils/authorization", () => ({
    canCreatePost: vi.fn(() =>
        Promise.resolve({
            id: "test-user-id",
            email: "test@example.com",
            role: "user"
        })
    ),
    canUpdatePost: vi.fn(() =>
        Promise.resolve({
            isOwner: true,
            isAdmin: false,
            canAccess: true,
            user: {
                id: "test-user-id",
                email: "test@example.com",
                role: "user"
            }
        })
    ),
    canDeletePost: vi.fn(() =>
        Promise.resolve({
            isOwner: true,
            isAdmin: false,
            canAccess: true,
            user: {
                id: "test-user-id",
                email: "test@example.com",
                role: "user"
            }
        })
    ),
    addSecurityHeaders: vi.fn(),
    logSecurityEvent: vi.fn(),
    validateStatusApprovalPermission: vi.fn(() => Promise.resolve())
}));

vi.mock("#supabase/server", () => ({
    serverSupabaseClient: vi.fn(() => {
        return Promise.resolve({
            from: vi.fn(table => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                    })),
                    order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                    single: vi.fn(() => Promise.resolve({ data: null, error: null }))
                })),
                insert: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
                    }))
                })),
                update: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
                })),
                delete: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
                })),
                upsert: vi.fn(() => Promise.resolve({ data: null, error: null }))
            })),
            auth: {
                getUser: vi.fn(() =>
                    Promise.resolve({
                        data: {
                            user: {
                                id: "test-user-id",
                                email: "test@example.com"
                            }
                        },
                        error: null
                    })
                ),
                getSession: vi.fn(() =>
                    Promise.resolve({
                        data: {
                            session: {
                                user: {
                                    id: "test-user-id",
                                    email: "test@example.com"
                                }
                            }
                        },
                        error: null
                    })
                )
            }
        });
    })
}));

// Tidak perlu mock h3 karena kita menggunakan createEvent dan createError asli

// Mock global functions
global.readBody = vi.fn();

describe("/api/posts", () => {
    let mockServerSupabaseClient: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Import dan setup mock untuk setiap test
        const { serverSupabaseClient } = await import("#supabase/server");
        mockServerSupabaseClient = vi.mocked(serverSupabaseClient);
    });

    describe("POST /api/posts", () => {
        it("should create a new post successfully", async () => {
            const postData = {
                title: "Test Post",
                titleEnglish: "Test Post English",
                episodes: 12,
                year: 2024,
                rating: 8.5,
                category: "550e8400-e29b-41d4-a716-446655440000",
                description: "Test description",
                genres: ["Action", "Adventure"],
                malId: 12345,
                releaseFileName: "test-release.mkv",
                downloadLinks: [{ url: "http://example.com/download", quality: "1080p" }],
                subtitleType: "hardsub"
            };

            const mockCategory = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                name: "Test Category"
            };

            const mockCreatedPost = {
                id: "test-uuid-123",
                title: "Test Post",
                title_english: "Test Post English",
                episodes: 12,
                year: 2024,
                rating: 8.5,
                category_id: "550e8400-e29b-41d4-a716-446655440000",
                description: "Test description",
                genres: ["Action", "Adventure"],
                mal_id: 12345,
                release_file_name: "test-release.mkv",
                download_links: [{ url: "http://example.com/download", quality: "1080p" }],
                subtitle_type: "hardsub",
                submitter_id: "user-123",
                submitter_name: "Test User",
                views: 0,
                downloads: 0,
                likes: 0,
                status_approval: "published",
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
                categories: mockCategory
            };

            // Mock Supabase for this specific test
            mockServerSupabaseClient.mockResolvedValueOnce({
                from: vi.fn(table => {
                    if (table === "categories") {
                        return {
                            select: vi.fn(() => ({
                                eq: vi.fn(() => ({
                                    single: vi.fn().mockResolvedValue({ data: mockCategory, error: null })
                                }))
                            }))
                        };
                    }
                    if (table === "posts") {
                        return {
                            insert: vi.fn(() => ({
                                select: vi.fn(() => ({
                                    single: vi.fn().mockResolvedValue({ data: mockCreatedPost, error: null })
                                }))
                            }))
                        };
                    }
                    return {
                        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
                        insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
                    };
                }),
                auth: {
                    getUser: vi.fn(() =>
                        Promise.resolve({
                            data: {
                                user: {
                                    id: "test-user-id",
                                    email: "test@example.com"
                                }
                            },
                            error: null
                        })
                    )
                }
            });

            const event = createEvent(new IncomingMessage(null as any), new ServerResponse(null as any));

            event.node.req.method = "POST";

            // Mock readBody
            global.readBody.mockResolvedValue(postData);

            const response = await postsHandler(event);

            expect(response).toHaveProperty("id");
            expect(response).toHaveProperty("title");
            expect(response).toHaveProperty("category");
            expect(response).toHaveProperty("status");
            expect(response).toHaveProperty("createdAt");
            expect(response).toHaveProperty("updatedAt");
        });

        it("should throw error for invalid category_id format", async () => {
            const postData = {
                title: "Test Post",
                titleEnglish: "Test Post English",
                episodes: 12,
                year: 2024,
                rating: 8.5,
                category: "invalid-uuid",
                description: "Test description",
                genres: ["Action", "Adventure"],
                malId: 12345,
                releaseFileName: "test-release.mkv",
                downloadLinks: [{ url: "http://example.com/download", quality: "1080p" }],
                subtitleType: "hardsub"
            };

            const event = createEvent(new IncomingMessage(null as any), new ServerResponse(null as any));

            event.node.req.method = "POST";

            // Mock readBody
            global.readBody.mockResolvedValue(postData);

            await expect(postsHandler(event)).rejects.toThrow();
        });
    });

    describe("GET /api/posts", () => {
        it("should return posts successfully", async () => {
            const mockPosts = [
                {
                    id: "post-1",
                    title: "Post 1",
                    title_english: "Post 1 English",
                    episodes: 12,
                    year: 2024,
                    rating: 8.5,
                    category_id: "cat-1",
                    status_approval: "published",
                    cover: null,
                    description: "Description 1",
                    genres: ["Action"],
                    mal_id: 12345,
                    release_file_name: "release1.mkv",
                    download_links: [{ url: "http://example.com/1", quality: "1080p" }],
                    subtitle_type: "hardsub",
                    submitter_id: "user-1",
                    submitter_name: "User 1",
                    views: 100,
                    downloads: 50,
                    likes: 10,
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z",
                    categories: {
                        id: "cat-1",
                        name: "Category 1"
                    }
                }
            ];

            // Mock Supabase for this specific test
            mockServerSupabaseClient.mockResolvedValueOnce({
                from: vi.fn(() => ({
                    select: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({ data: mockPosts, error: null }))
                    }))
                })),
                auth: {
                    getUser: vi.fn(() =>
                        Promise.resolve({
                            data: {
                                user: {
                                    id: "test-user-id",
                                    email: "test@example.com"
                                }
                            },
                            error: null
                        })
                    )
                }
            });

            const event = createEvent(new IncomingMessage(null as any), new ServerResponse(null as any));

            event.node.req.method = "GET";

            const response = await postsHandler(event);

            expect(Array.isArray(response)).toBe(true);

            if (response.length > 0) {
                const post = response[0];
                expect(post).toHaveProperty("id");
                expect(post).toHaveProperty("title");
                expect(post).toHaveProperty("category");
                expect(post).toHaveProperty("status");
                expect(post).toHaveProperty("createdAt");
                expect(post).toHaveProperty("updatedAt");
            }
        });

        it("should return empty array when no posts exist", async () => {
            // Mock Supabase for this specific test
            mockServerSupabaseClient.mockResolvedValueOnce({
                from: vi.fn(() => ({
                    select: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                    }))
                })),
                auth: {
                    getUser: vi.fn(() =>
                        Promise.resolve({
                            data: {
                                user: {
                                    id: "test-user-id",
                                    email: "test@example.com"
                                }
                            },
                            error: null
                        })
                    )
                }
            });

            const event = createEvent(new IncomingMessage(null as any), new ServerResponse(null as any));

            event.node.req.method = "GET";

            const response = await postsHandler(event);

            expect(Array.isArray(response)).toBe(true);
            expect(response).toHaveLength(0);
        });
    });

    describe("Method not allowed", () => {
        it("should throw error for unsupported methods", async () => {
            const methods = ["PUT", "DELETE", "PATCH"];

            for (const method of methods) {
                const event = createEvent(new IncomingMessage(null as any), new ServerResponse(null as any));

                event.node.req.method = method;

                await expect(postsHandler(event)).rejects.toThrow();
            }
        });
    });
});
