import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "~/stores/auth";

// Mock Nuxt composables
const mockNavigateTo = vi.fn();
vi.mock("#app", () => ({
    navigateTo: mockNavigateTo,
    defineNuxtRouteMiddleware: (fn: any) => fn
}));

// Mock global navigateTo and make it available in the middleware context
global.navigateTo = mockNavigateTo;

// Mock navigateTo as a global function that can be called directly
vi.stubGlobal("navigateTo", mockNavigateTo);

// Mock useAuthStore
vi.mock("~/stores/auth", () => ({
    useAuthStore: vi.fn()
}));

// Mock middleware utils
vi.mock("~/middleware/utils/auth-helper", () => ({
    initializeAuthStore: vi.fn(),
    redirectToHome: vi.fn()
}));

// Mock process.server and process.env
Object.defineProperty(global, "process", {
    value: {
        server: false,
        env: {
            NODE_ENV: "test"
        }
    },
    writable: true
});

describe("Guest Middleware", () => {
    let mockAuthStore: any;
    let mockTo: any;
    let mockFrom: any;
    let guestMiddleware: any;
    let mockInitializeAuthStore: any;
    let mockRedirectToHome: any;

    beforeEach(async () => {
        // Setup Pinia
        const pinia = createPinia();
        setActivePinia(pinia);

        // Reset mocks
        vi.clearAllMocks();

        // Setup mock auth store
        mockAuthStore = {
            isInitialized: true,
            isAuthenticated: false,
            checkAuth: vi.fn()
        };

        // Setup mock utility functions
        const { initializeAuthStore, redirectToHome } = await import("~/middleware/utils/auth-helper");
        mockInitializeAuthStore = vi.mocked(initializeAuthStore);
        mockRedirectToHome = vi.mocked(redirectToHome);

        mockInitializeAuthStore.mockResolvedValue(mockAuthStore);
        mockRedirectToHome.mockReturnValue(undefined);

        vi.mocked(useAuthStore).mockReturnValue(mockAuthStore);

        // Import middleware after mocks are setup
        const middlewareModule = await import("~/middleware/guest");
        guestMiddleware = middlewareModule.default;

        // Setup mock route objects
        mockTo = {
            path: "/login",
            name: "login",
            params: {},
            query: {},
            meta: {}
        };

        mockFrom = {
            path: "/",
            name: "index",
            params: {},
            query: {},
            meta: {}
        };

        // Reset process.server
        global.process.server = false;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Server Side Behavior", () => {
        it("should skip auth check on server side", async () => {
            global.process.server = true;

            const result = await guestMiddleware(mockTo, mockFrom);

            expect(result).toBeUndefined();
            expect(mockAuthStore.checkAuth).not.toHaveBeenCalled();
            expect(mockNavigateTo).not.toHaveBeenCalled();
        });
    });

    describe("Client Side Behavior", () => {
        it("should allow access when user is not authenticated", async () => {
            mockAuthStore.isAuthenticated = false;
            mockInitializeAuthStore.mockResolvedValue(mockAuthStore);

            const result = await guestMiddleware(mockTo, mockFrom);

            expect(mockInitializeAuthStore).toHaveBeenCalled();
            expect(mockRedirectToHome).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        }, 10000);

        it("should redirect to home when user is authenticated", async () => {
            mockAuthStore.isAuthenticated = true;
            mockInitializeAuthStore.mockResolvedValue(mockAuthStore);
            mockRedirectToHome.mockReturnValue("redirect-result");

            const result = await guestMiddleware(mockTo, mockFrom);

            expect(mockInitializeAuthStore).toHaveBeenCalled();
            expect(mockRedirectToHome).toHaveBeenCalled();
            expect(result).toBe("redirect-result");
        });

        it("should skip on server side", async () => {
            global.process.server = true;

            const result = await guestMiddleware(mockTo, mockFrom);

            expect(mockInitializeAuthStore).not.toHaveBeenCalled();
            expect(mockRedirectToHome).not.toHaveBeenCalled();
            expect(result).toBeUndefined();

            // Reset for other tests
            global.process.server = false;
        });
    });

    describe("Edge Cases", () => {
        it("should handle initializeAuthStore rejection", async () => {
            mockInitializeAuthStore.mockRejectedValue(new Error("Auth initialization failed"));

            // Should not throw an error, but should handle gracefully
            await expect(async () => {
                await guestMiddleware(mockTo, mockFrom);
            }).rejects.toThrow("Auth initialization failed");
        });

        it("should handle auth store with undefined isAuthenticated", async () => {
            const authStoreWithUndefined = {
                ...mockAuthStore,
                isAuthenticated: undefined
            };
            mockInitializeAuthStore.mockResolvedValue(authStoreWithUndefined);

            const result = await guestMiddleware(mockTo, mockFrom);

            expect(mockInitializeAuthStore).toHaveBeenCalled();
            expect(mockRedirectToHome).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});
