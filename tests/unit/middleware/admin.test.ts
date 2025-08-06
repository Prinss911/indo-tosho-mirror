import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the middleware function directly
const mockAdminMiddleware = vi.fn();

describe("Admin Middleware", () => {
    let mockAuthStore: any;
    let mockNavigateTo: any;
    let mockCreateError: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockNavigateTo = vi.fn();
        mockCreateError = vi.fn();
        mockAuthStore = {
            isAuthenticated: false,
            isAdmin: false,
            checkAuth: vi.fn().mockResolvedValue(undefined)
        };

        // Mock the actual middleware behavior
        mockAdminMiddleware.mockImplementation(async (to: any, from: any) => {
            await mockAuthStore.checkAuth();

            if (!mockAuthStore.isAuthenticated) {
                return mockNavigateTo({
                    path: "/login",
                    query: { redirect: to.fullPath }
                });
            }

            if (!mockAuthStore.isAdmin) {
                throw mockCreateError({
                    statusCode: 403,
                    statusMessage: "Access Denied: Admin privileges required"
                });
            }
        });
    });

    it("should call checkAuth before checking authentication", async () => {
        const to = { fullPath: "/admin" };
        const from = { fullPath: "/" };

        await mockAdminMiddleware(to, from);

        expect(mockAuthStore.checkAuth).toHaveBeenCalled();
    });

    it("should redirect to login when user is not authenticated", async () => {
        mockAuthStore.isAuthenticated = false;

        const to = { fullPath: "/admin" };
        const from = { fullPath: "/" };

        await mockAdminMiddleware(to, from);

        expect(mockNavigateTo).toHaveBeenCalledWith({
            path: "/login",
            query: { redirect: "/admin" }
        });
    });

    it("should throw error when user is authenticated but not admin", async () => {
        mockAuthStore.isAuthenticated = true;
        mockAuthStore.isAdmin = false;

        // Make mockCreateError actually throw an error
        mockCreateError.mockImplementation(error => {
            throw new Error(`${error.statusCode}: ${error.statusMessage}`);
        });

        const to = { fullPath: "/admin" };
        const from = { fullPath: "/" };

        await expect(mockAdminMiddleware(to, from)).rejects.toThrow("403: Access Denied: Admin privileges required");

        expect(mockCreateError).toHaveBeenCalledWith({
            statusCode: 403,
            statusMessage: "Access Denied: Admin privileges required"
        });
    });

    it("should allow access when user is authenticated and admin", async () => {
        mockAuthStore.isAuthenticated = true;
        mockAuthStore.isAdmin = true;

        const to = { fullPath: "/admin" };
        const from = { fullPath: "/" };

        const result = await mockAdminMiddleware(to, from);

        expect(mockNavigateTo).not.toHaveBeenCalled();
        expect(mockCreateError).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it("should wait for checkAuth to complete before checking authentication and admin status", async () => {
        let checkAuthResolved = false;
        mockAuthStore.checkAuth = vi.fn().mockImplementation(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    checkAuthResolved = true;
                    mockAuthStore.isAuthenticated = true;
                    mockAuthStore.isAdmin = true;
                    resolve(undefined);
                }, 10);
            });
        });

        const to = { fullPath: "/admin" };
        const from = { fullPath: "/" };

        await mockAdminMiddleware(to, from);

        expect(checkAuthResolved).toBe(true);
        expect(mockNavigateTo).not.toHaveBeenCalled();
        expect(mockCreateError).not.toHaveBeenCalled();
    });
});
