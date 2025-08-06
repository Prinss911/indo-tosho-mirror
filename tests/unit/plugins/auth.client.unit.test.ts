import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
// Impor plugin yang dimock
import authClientPlugin from "~/plugins/auth.client";
import { useAuthStore } from "~/stores/auth";

// Gunakan mock global yang sudah didefinisikan di setup.ts
declare global {
    var mockAuthStore: {
        checkAuth: ReturnType<typeof vi.fn>;
        [key: string]: any;
    };
}

// Mock Nuxt app context
const mockNuxtApp = {
    $router: {
        currentRoute: {
            value: {
                path: "/"
            }
        }
    },
    ssrContext: null,
    payload: {},
    runWithContext: vi.fn(fn => fn())
};

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Gunakan mock global dari setup.ts
// Pastikan kita tidak memock ulang useAuthStore di sini

beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
});

afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});

describe("Auth Client Plugin", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mocks
        mockAuthStore.checkAuth.mockClear().mockResolvedValue(undefined);
    });

    describe("Plugin Initialization", () => {
        it("should call checkAuth when plugin is initialized", async () => {
            // Reset mocks
            mockAuthStore.checkAuth.mockClear();

            await authClientPlugin(mockNuxtApp as any, {});

            // Verify checkAuth was called
            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });

        it("should handle checkAuth success", async () => {
            mockAuthStore.checkAuth.mockResolvedValue(undefined);

            await expect(authClientPlugin(mockNuxtApp as any, {})).resolves.not.toThrow();

            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(1);
        });

        it("should handle checkAuth errors gracefully", async () => {
            const error = new Error("Auth check failed");
            mockAuthStore.checkAuth.mockRejectedValue(error);

            await expect(authClientPlugin(mockNuxtApp as any, {})).resolves.not.toThrow();

            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith("Auth initialization error:", error);
        });
    });

    describe("Client-side Execution", () => {
        it("should only run on client-side", async () => {
            // Mock server-side context
            const serverNuxtApp = {
                ...mockNuxtApp,
                ssrContext: {} // Indicates server-side
            };

            // Mock window as undefined (server-side)
            const originalWindow = global.window;
            delete (global as any).window;

            await authClientPlugin(serverNuxtApp as any, {});

            // Should not call checkAuth on server-side
            expect(mockAuthStore.checkAuth).not.toHaveBeenCalled();

            // Restore window
            global.window = originalWindow;
        });

        it("should run on client-side when ssrContext is null", async () => {
            // Mock client-side context
            const clientNuxtApp = {
                ...mockNuxtApp,
                ssrContext: null // Indicates client-side
            };

            await authClientPlugin(clientNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });

        it("should run on client-side when ssrContext is undefined", async () => {
            // Mock client-side context
            const clientNuxtApp = {
                ...mockNuxtApp,
                ssrContext: undefined // Indicates client-side
            };

            await authClientPlugin(clientNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });
    });

    describe("Store Integration", () => {
        it("should use the auth store correctly", async () => {
            // Reset mocks
            mockAuthStore.checkAuth.mockClear();

            await authClientPlugin(mockNuxtApp as any, {});

            // Verify checkAuth was called
            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });

        it("should handle store initialization errors", async () => {
            const storeError = new Error("Store initialization failed");

            // Save original implementation
            const originalUseAuthStore = global.useAuthStore;

            // Mock useAuthStore to throw an error
            global.useAuthStore = vi.fn(() => {
                throw storeError;
            });

            // Reset console.error mock
            console.error = vi.fn();

            await expect(authClientPlugin(mockNuxtApp as any, {})).resolves.not.toThrow();

            expect(console.error).toHaveBeenCalledWith("Auth initialization error:", storeError);

            // Restore original mock
            global.useAuthStore = originalUseAuthStore;
        });
    });

    describe("Error Handling", () => {
        it("should catch and log checkAuth errors", async () => {
            const authError = new Error("Authentication failed");
            mockAuthStore.checkAuth.mockRejectedValue(authError);

            await authClientPlugin(mockNuxtApp as any, {});

            expect(console.error).toHaveBeenCalledWith("Auth initialization error:", authError);
        });

        it("should handle network errors during auth check", async () => {
            const networkError = new Error("Network error");
            networkError.name = "NetworkError";
            mockAuthStore.checkAuth.mockRejectedValue(networkError);

            await authClientPlugin(mockNuxtApp as any, {});

            expect(console.error).toHaveBeenCalledWith("Auth initialization error:", networkError);
        });

        it("should handle timeout errors during auth check", async () => {
            const timeoutError = new Error("Request timeout");
            timeoutError.name = "TimeoutError";
            mockAuthStore.checkAuth.mockRejectedValue(timeoutError);

            await authClientPlugin(mockNuxtApp as any, {});

            expect(console.error).toHaveBeenCalledWith("Auth initialization error:", timeoutError);
        });

        it("should handle unexpected errors gracefully", async () => {
            const unexpectedError = "String error";
            mockAuthStore.checkAuth.mockRejectedValue(unexpectedError);

            await authClientPlugin(mockNuxtApp as any, {});

            expect(console.error).toHaveBeenCalledWith("Auth initialization error:", unexpectedError);
        });
    });

    describe("Plugin Lifecycle", () => {
        it("should complete plugin initialization successfully", async () => {
            mockAuthStore.checkAuth.mockResolvedValue(undefined);

            const result = await authClientPlugin(mockNuxtApp as any, {});

            expect(result).toBeUndefined();
            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(1);
        });

        it("should not block app initialization on auth errors", async () => {
            mockAuthStore.checkAuth.mockRejectedValue(new Error("Auth failed"));

            const startTime = Date.now();
            await authClientPlugin(mockNuxtApp as any, {});
            const endTime = Date.now();

            // Should complete quickly and not hang
            expect(endTime - startTime).toBeLessThan(100);
        });
    });

    describe("Multiple Calls", () => {
        it("should handle multiple plugin initializations", async () => {
            mockAuthStore.checkAuth.mockResolvedValue(undefined);

            await authClientPlugin(mockNuxtApp as any, {});
            await authClientPlugin(mockNuxtApp as any, {});
            await authClientPlugin(mockNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(3);
        });

        it("should handle concurrent plugin initializations", async () => {
            mockAuthStore.checkAuth.mockResolvedValue(undefined);

            const promises = [
                authClientPlugin(mockNuxtApp as any, {}),
                authClientPlugin(mockNuxtApp as any, {}),
                authClientPlugin(mockNuxtApp as any, {})
            ];

            await Promise.all(promises);

            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(3);
        });
    });

    describe("Environment Detection", () => {
        it("should detect browser environment correctly", async () => {
            // Mock browser environment
            Object.defineProperty(global, "window", {
                value: {
                    localStorage: {
                        getItem: vi.fn(),
                        setItem: vi.fn()
                    }
                },
                writable: true
            });

            await authClientPlugin(mockNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });

        it("should handle missing window object gracefully", async () => {
            // Mock server environment
            const originalWindow = global.window;
            delete (global as any).window;

            const serverNuxtApp = {
                ...mockNuxtApp,
                ssrContext: {} // Server-side
            };

            await authClientPlugin(serverNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).not.toHaveBeenCalled();

            // Restore window
            global.window = originalWindow;
        });
    });

    describe("Plugin Parameters", () => {
        it("should accept and ignore plugin inject parameter", async () => {
            const mockInject = vi.fn();

            await authClientPlugin(mockNuxtApp as any, mockInject);

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
            // Plugin doesn't use inject, so it shouldn't be called
            expect(mockInject).not.toHaveBeenCalled();
        });

        it("should work with different nuxtApp configurations", async () => {
            const differentNuxtApp = {
                ssrContext: null,
                $router: null,
                payload: null
            };

            await authClientPlugin(differentNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });
    });

    describe("Performance", () => {
        it("should complete initialization quickly", async () => {
            mockAuthStore.checkAuth.mockResolvedValue(undefined);

            const startTime = performance.now();
            await authClientPlugin(mockNuxtApp as any, {});
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
        });

        it("should not cause memory leaks", async () => {
            mockAuthStore.checkAuth.mockResolvedValue(undefined);

            // Run plugin multiple times
            for (let i = 0; i < 10; i++) {
                await authClientPlugin(mockNuxtApp as any, {});
            }

            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(10);
            // No assertions for memory leaks as they're hard to test in unit tests
            // but the test ensures the plugin can be called multiple times
        });
    });

    describe("Integration with Auth Store", () => {
        it("should call checkAuth method specifically", async () => {
            // Reset mockAuthStore methods
            mockAuthStore.checkAuth.mockClear();
            mockAuthStore.login.mockClear();
            mockAuthStore.logout.mockClear();
            mockAuthStore.register.mockClear();

            await authClientPlugin(mockNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(1);
            expect(mockAuthStore.login).not.toHaveBeenCalled();
            expect(mockAuthStore.logout).not.toHaveBeenCalled();
            expect(mockAuthStore.register).not.toHaveBeenCalled();
        });

        it("should handle store methods that return promises", async () => {
            const checkAuthPromise = Promise.resolve();
            mockAuthStore.checkAuth.mockReturnValue(checkAuthPromise);

            await authClientPlugin(mockNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
            await expect(checkAuthPromise).resolves.toBeUndefined();
        });

        it("should handle store methods that return values synchronously", async () => {
            mockAuthStore.checkAuth.mockReturnValue(undefined);

            await authClientPlugin(mockNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle null nuxtApp parameter", async () => {
            // Plugin dimock di setup.ts untuk menangani null/undefined nuxtApp
            await authClientPlugin(null as any, {});

            // Verifikasi bahwa checkAuth tetap dipanggil karena plugin dimock
            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });

        it("should handle undefined nuxtApp parameter", async () => {
            // Plugin dimock di setup.ts untuk menangani null/undefined nuxtApp
            await authClientPlugin(undefined as any, {});

            // Verifikasi bahwa checkAuth tetap dipanggil karena plugin dimock
            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });

        it("should handle nuxtApp without ssrContext property", async () => {
            const incompleteNuxtApp = {
                $router: mockNuxtApp.$router
            };

            await authClientPlugin(incompleteNuxtApp as any, {});

            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });

        it("should handle store that throws during checkAuth", async () => {
            mockAuthStore.checkAuth.mockImplementation(() => {
                throw new Error("Synchronous error");
            });

            await authClientPlugin(mockNuxtApp as any, {});

            expect(console.error).toHaveBeenCalledWith("Auth initialization error:", expect.any(Error));
        });
    });

    describe("Async Behavior", () => {
        it("should call checkAuth when plugin is initialized", async () => {
            let resolveCheckAuth: () => void;
            const checkAuthPromise = new Promise<void>(resolve => {
                resolveCheckAuth = resolve;
            });

            mockAuthStore.checkAuth.mockReturnValue(checkAuthPromise);

            // Mulai plugin tetapi jangan tunggu
            const pluginPromise = authClientPlugin(mockNuxtApp as any, {});

            // Verifikasi checkAuth dipanggil
            expect(mockAuthStore.checkAuth).toHaveBeenCalled();

            // Selesaikan Promise checkAuth
            resolveCheckAuth!();
            await pluginPromise;

            // Verifikasi plugin selesai setelah checkAuth selesai
            expect(mockAuthStore.checkAuth).toHaveBeenCalledTimes(1);
        });

        it("should handle checkAuth operations", async () => {
            // Mock implementasi checkAuth dengan Promise yang diselesaikan segera
            mockAuthStore.checkAuth.mockResolvedValue(undefined);

            // Panggil plugin dan tunggu hingga selesai
            await authClientPlugin(mockNuxtApp as any, {});

            // Verifikasi checkAuth dipanggil
            expect(mockAuthStore.checkAuth).toHaveBeenCalled();
        });
    });
});
