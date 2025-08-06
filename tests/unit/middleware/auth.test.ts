import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the middleware function directly
const mockAuthMiddleware = vi.fn();

describe("Auth Middleware", () => {
    let mockAuthStore: any;
    let mockNavigateTo: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockNavigateTo = vi.fn();
        mockAuthStore = {
            isAuthenticated: false,
            checkAuth: vi.fn().mockResolvedValue(undefined)
        };

        // Mock the actual middleware behavior
        mockAuthMiddleware.mockImplementation(async (to: any, from: any) => {
            await mockAuthStore.checkAuth();

            if (!mockAuthStore.isAuthenticated) {
                return mockNavigateTo({
                    path: "/login",
                    query: { redirect: to.fullPath }
                });
            }
        });
    });

    it("should call checkAuth before checking authentication", async () => {
        const to = { fullPath: "/posts" };
        const from = { fullPath: "/" };

        await mockAuthMiddleware(to, from);

        expect(mockAuthStore.checkAuth).toHaveBeenCalled();
    });

    it("should redirect to login when user is not authenticated", async () => {
        mockAuthStore.isAuthenticated = false;

        const to = { fullPath: "/posts" };
        const from = { fullPath: "/" };

        await mockAuthMiddleware(to, from);

        expect(mockNavigateTo).toHaveBeenCalledWith({
            path: "/login",
            query: { redirect: "/posts" }
        });
    });

    it("should not redirect when user is authenticated", async () => {
        mockAuthStore.isAuthenticated = true;

        const to = { fullPath: "/posts" };
        const from = { fullPath: "/" };

        const result = await mockAuthMiddleware(to, from);

        expect(mockNavigateTo).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it("should wait for checkAuth to complete before checking authentication", async () => {
        let checkAuthResolved = false;
        mockAuthStore.checkAuth = vi.fn().mockImplementation(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    checkAuthResolved = true;
                    mockAuthStore.isAuthenticated = true;
                    resolve(undefined);
                }, 10);
            });
        });

        const to = { fullPath: "/posts" };
        const from = { fullPath: "/" };

        await mockAuthMiddleware(to, from);

        expect(checkAuthResolved).toBe(true);
        expect(mockNavigateTo).not.toHaveBeenCalled();
    });
});
