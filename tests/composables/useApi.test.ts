import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useApi, type PostData, type UserPost } from "~/composables/useApi";

// Mock $fetch
const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

// Mock console.error to avoid stderr output in tests
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

describe("useApi Composable", () => {
    let api: ReturnType<typeof useApi>;

    beforeEach(() => {
        api = useApi();
        vi.clearAllMocks();
        mockConsoleError.mockClear();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    const mockPostData: PostData = {
        title: "Test Anime",
        titleEnglish: "Test Anime English",
        episodes: 12,
        year: 2024,
        rating: 8.5,
        category: "Anime - Sudah diterjemahkan",
        status: "Finished Airing",
        cover: "https://example.com/cover.jpg",
        description: "Test description",
        genres: ["Action", "Adventure"],
        malId: 12345,
        releaseFileName: "test-anime-episode-01.mkv",
        downloadLink: "https://example.com/download/test-anime",
        softsubLink: "https://example.com/softsub/test-anime"
    };

    const mockUserPost: UserPost = {
        ...mockPostData,
        id: "1",
        submitterId: "user123",
        submitterName: "testuser",
        status: "pending",
        views: 100,
        downloads: 50,
        likes: 25,
        submittedAt: new Date("2024-01-01"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02")
    };

    describe("createPost", () => {
        it("should create a post successfully", async () => {
            mockFetch.mockResolvedValue(mockUserPost);

            const result = await api.createPost(mockPostData);

            expect(mockFetch).toHaveBeenCalledWith("/api/posts", {
                method: "POST",
                body: mockPostData
            });
            expect(result).toEqual(mockUserPost);
        });

        it("should create a post with new fields (releaseFileName, downloadLink, softsubLink)", async () => {
            const postWithNewFields = {
                ...mockPostData,
                releaseFileName: "custom-release-name.mkv",
                downloadLink: "https://custom-download.com",
                softsubLink: "https://custom-softsub.com"
            };

            mockFetch.mockResolvedValue({ ...mockUserPost, ...postWithNewFields });

            const result = await api.createPost(postWithNewFields);

            expect(mockFetch).toHaveBeenCalledWith("/api/posts", {
                method: "POST",
                body: postWithNewFields
            });
            expect(result.releaseFileName).toBe("custom-release-name.mkv");
            expect(result.downloadLink).toBe("https://custom-download.com");
            expect(result.softsubLink).toBe("https://custom-softsub.com");
        });

        it("should handle create post error", async () => {
            const error = new Error("Create failed");
            mockFetch.mockRejectedValue(error);

            await expect(api.createPost(mockPostData)).rejects.toThrow("Create failed");
        });
    });

    describe("updatePost", () => {
        it("should update a post successfully", async () => {
            const updateData = {
                releaseFileName: "updated-release.mkv",
                downloadLink: "https://updated-download.com",
                softsubLink: "https://updated-softsub.com"
            };
            const updatedPost = { ...mockUserPost, ...updateData };
            mockFetch.mockResolvedValue(updatedPost);

            const result = await api.updatePost("1", updateData);

            expect(mockFetch).toHaveBeenCalledWith("/api/posts/1", {
                method: "PUT",
                body: updateData
            });
            expect(result).toEqual(updatedPost);
        });

        it("should handle update post error", async () => {
            const error = new Error("Update failed");
            mockFetch.mockRejectedValue(error);

            await expect(api.updatePost("1", {})).rejects.toThrow("Update failed");
        });
    });

    describe("getPostById", () => {
        it("should get a post by id successfully", async () => {
            mockFetch.mockResolvedValue(mockUserPost);

            const result = await api.getPostById("1");

            expect(mockFetch).toHaveBeenCalledWith("/api/posts/1");
            expect(result).toEqual(mockUserPost);
        });

        it("should return null when post not found", async () => {
            mockFetch.mockRejectedValue(new Error("Not found"));

            const result = await api.getPostById("999");

            expect(result).toBeNull();
        });
    });

    describe("getUserPosts", () => {
        it("should get user posts successfully", async () => {
            const userPosts = [mockUserPost];
            mockFetch.mockResolvedValue(userPosts);

            const result = await api.getUserPosts();

            expect(mockFetch).toHaveBeenCalledWith("/api/posts/user");
            expect(result).toEqual(userPosts);
        });

        it("should return empty array on error", async () => {
            mockFetch.mockRejectedValue(new Error("Fetch failed"));

            const result = await api.getUserPosts();

            expect(result).toEqual([]);
        });
    });

    describe("deletePost", () => {
        it("should delete a post successfully", async () => {
            mockFetch.mockResolvedValue(undefined);

            const result = await api.deletePost("1");

            expect(mockFetch).toHaveBeenCalledWith("/api/posts/1", {
                method: "DELETE"
            });
            expect(result).toBe(true);
        });

        it("should return false on delete error", async () => {
            mockFetch.mockRejectedValue(new Error("Delete failed"));

            const result = await api.deletePost("1");

            expect(result).toBe(false);
        });
    });

    describe("getAllPosts", () => {
        it("should get all posts successfully", async () => {
            const allPosts = [mockUserPost];
            mockFetch.mockResolvedValue(allPosts);

            const result = await api.getAllPosts();

            expect(mockFetch).toHaveBeenCalledWith("/api/posts");
            expect(result).toEqual(allPosts);
        });

        it("should return empty array on error", async () => {
            mockFetch.mockRejectedValue(new Error("Fetch failed"));

            const result = await api.getAllPosts();

            expect(result).toEqual([]);
        });
    });

    describe("approvePost", () => {
        it("should approve a post successfully", async () => {
            const publishedPost = { ...mockUserPost, status: "published" as const };
            mockFetch.mockResolvedValue(publishedPost);

            const result = await api.approvePost("1");

            expect(mockFetch).toHaveBeenCalledWith("/api/posts/1/approve", {
                method: "POST"
            });
            expect(result).toEqual(publishedPost);
        });

        it("should handle approve post error", async () => {
            const error = new Error("Approve failed");
            mockFetch.mockRejectedValue(error);

            await expect(api.approvePost("1")).rejects.toThrow("Approve failed");
        });
    });

    describe("rejectPost", () => {
        it("should reject a post successfully", async () => {
            const rejectedPost = { ...mockUserPost, status: "rejected" as const };
            mockFetch.mockResolvedValue(rejectedPost);

            const result = await api.rejectPost("1", "Test rejection reason");

            expect(mockFetch).toHaveBeenCalledWith("/api/posts/1/reject", {
                method: "POST",
                body: {
                    rejectionReason: "Test rejection reason"
                }
            });
            expect(result).toEqual(rejectedPost);
        });

        it("should handle reject post error", async () => {
            const error = new Error("Reject failed");
            mockFetch.mockRejectedValue(error);

            await expect(api.rejectPost("1", "Test rejection reason")).rejects.toThrow("Reject failed");
        });
    });

    describe("Field validation for new fields", () => {
        it("should handle posts with optional new fields", async () => {
            const postWithoutNewFields: PostData = {
                title: "Test Anime",
                titleEnglish: "Test Anime English",
                episodes: 12,
                year: 2024,
                rating: 8.5,
                category: "Anime - Sudah diterjemahkan",
                status: "Finished Airing",
                cover: "https://example.com/cover.jpg",
                description: "Test description",
                genres: ["Action", "Adventure"],
                malId: 12345
                // No releaseFileName, downloadLink, softsubLink
            };

            mockFetch.mockResolvedValue({ ...mockUserPost, ...postWithoutNewFields });

            const result = await api.createPost(postWithoutNewFields);

            expect(mockFetch).toHaveBeenCalledWith("/api/posts", {
                method: "POST",
                body: postWithoutNewFields
            });
            expect(result).toBeDefined();
        });

        it("should handle partial updates with only new fields", async () => {
            const partialUpdate = {
                releaseFileName: "new-release-name.mkv"
            };

            mockFetch.mockResolvedValue({ ...mockUserPost, ...partialUpdate });

            const result = await api.updatePost("1", partialUpdate);

            expect(mockFetch).toHaveBeenCalledWith("/api/posts/1", {
                method: "PUT",
                body: partialUpdate
            });
            expect(result.releaseFileName).toBe("new-release-name.mkv");
        });
    });
});
