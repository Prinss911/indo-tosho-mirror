import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useApi } from "~/composables/useApi";

// Mock the $fetch function
vi.mock("#imports", async () => {
    const actual = await vi.importActual("#imports");
    return {
        ...(actual as any),
        $fetch: vi.fn(),
        useRuntimeConfig: vi.fn(() => ({
            public: {
                apiBase: "http://localhost:3000/api"
            }
        }))
    };
});

// Import $fetch directly for mocking
import { $fetch } from "#imports";

// Mock global $fetch
global.$fetch = $fetch;

describe("useApi composable", () => {
    let api;

    // Mock response data
    const mockPost = {
        id: "123",
        title: "Test Post",
        content: "This is a test post",
        category_id: "456",
        user_id: "789",
        status: "published",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z"
    };

    const mockFormattedPost = {
        id: "123",
        title: "Test Post",
        content: "This is a test post",
        categoryId: "456",
        userId: "789",
        status: "published",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z"
    };

    const mockPosts = [mockPost];
    const mockFormattedPosts = [mockFormattedPost];

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        // Initialize the API
        api = useApi();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("createPost", () => {
        it("should create a post successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce(mockPost);

            // Call the function
            const result = await api.createPost({
                title: "Test Post",
                content: "This is a test post",
                categoryId: "456"
            });

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith(
                "/api/posts",
                expect.objectContaining({
                    method: "POST",
                    body: expect.objectContaining({
                        title: "Test Post",
                        content: "This is a test post",
                        categoryId: "456"
                    })
                })
            );

            // Check the result
            expect(result).toEqual(mockPost);
        });

        it("should handle errors when creating a post", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Failed to create post"));

            // Call the function and expect it to throw
            await expect(
                api.createPost({
                    title: "Test Post",
                    content: "This is a test post",
                    categoryId: "456"
                })
            ).rejects.toThrow("Failed to create post");
        });
    });

    describe("updatePost", () => {
        it("should update a post successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce(mockPost);

            // Call the function
            const result = await api.updatePost("123", {
                title: "Updated Post",
                content: "This is an updated post",
                categoryId: "456"
            });

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith(
                "/api/posts/123",
                expect.objectContaining({
                    method: "PUT",
                    body: expect.objectContaining({
                        title: "Updated Post",
                        content: "This is an updated post",
                        categoryId: "456"
                    })
                })
            );

            // Check the result
            expect(result).toEqual(mockPost);
        });

        it("should handle errors when updating a post", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Failed to update post"));

            // Call the function and expect it to throw
            await expect(
                api.updatePost("123", {
                    title: "Updated Post",
                    content: "This is an updated post",
                    categoryId: "456"
                })
            ).rejects.toThrow("Failed to update post");
        });
    });

    describe("getPostById", () => {
        it("should get a post by ID successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce(mockPost);

            // Call the function
            const result = await api.getPostById("123");

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith("/api/posts/123");

            // Check the result
            expect(result).toEqual(mockPost);
        });

        it("should handle errors when getting a post by ID", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Post not found"));

            // Call the function - getPostById returns null on error instead of throwing
            const result = await api.getPostById("123");
            expect(result).toBeNull();
        });
    });

    describe("getUserPosts", () => {
        it("should get user posts successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce(mockPosts);

            // Call the function
            const result = await api.getUserPosts();

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith("/api/posts/user");

            // Check the result
            expect(result).toEqual(mockPosts);
        });

        it("should handle errors when getting user posts", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Failed to get user posts"));

            // Call the function - getUserPosts returns empty array on error
            const result = await api.getUserPosts();
            expect(result).toEqual([]);
        });
    });

    describe("deletePost", () => {
        it("should delete a post successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce({ success: true });

            // Call the function
            const result = await api.deletePost("123");

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith("/api/posts/123", {
                method: "DELETE"
            });

            // Check the result
            expect(result).toBe(true);
        });

        it("should handle errors when deleting a post", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Failed to delete post"));

            // Call the function - deletePost returns false on error
            const result = await api.deletePost("123");
            expect(result).toBe(false);
        });
    });

    describe("getAllPosts", () => {
        it("should get all posts successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce(mockPosts);

            // Call the function
            const result = await api.getAllPosts();

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith("/api/posts");

            // Check the result
            expect(result).toEqual(mockPosts);
        });

        it("should handle errors when getting all posts", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Failed to get posts"));

            // Call the function - getAllPosts returns empty array on error
            const result = await api.getAllPosts();
            expect(result).toEqual([]);
        });
    });

    describe("approvePost", () => {
        it("should approve a post successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce({ ...mockPost, status: "published" });

            // Call the function
            const result = await api.approvePost("123");

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith("/api/posts/123/approve", {
                method: "POST"
            });

            // Check the result
            expect(result).toEqual({ ...mockPost, status: "published" });
        });

        it("should handle errors when approving a post", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Failed to approve post"));

            // Call the function and expect it to throw
            await expect(api.approvePost("123")).rejects.toThrow("Failed to approve post");
        });
    });

    describe("rejectPost", () => {
        it("should reject a post successfully", async () => {
            // Mock the $fetch response
            $fetch.mockResolvedValueOnce({ ...mockPost, status: "rejected" });

            // Call the function
            const result = await api.rejectPost("123");

            // Check if $fetch was called with the correct parameters
            expect($fetch).toHaveBeenCalledWith("/api/posts/123/reject", {
                method: "POST"
            });

            // Check the result
            expect(result).toEqual({ ...mockPost, status: "rejected" });
        });

        it("should handle errors when rejecting a post", async () => {
            // Mock the $fetch response with an error
            $fetch.mockRejectedValueOnce(new Error("Failed to reject post"));

            // Call the function and expect it to throw
            await expect(api.rejectPost("123")).rejects.toThrow("Failed to reject post");
        });
    });

    // Note: formatResponse method is not exposed in the current useApi implementation
    // These tests have been removed as the method is not part of the public API
});
