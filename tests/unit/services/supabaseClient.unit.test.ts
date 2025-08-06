import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useSupabase } from "~/services/supabaseClient";
import type { User } from "@supabase/supabase-js";

// Mock Nuxt imports
const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
};

const mockSupabaseClient = {
    from: vi.fn(() => mockQueryBuilder),
    auth: {
        getUser: vi.fn(),
        getSession: vi.fn()
    }
};

const mockSupabaseUser = {
    value: null as User | null
};

const mockRuntimeConfig = {
    public: {
        supabase: {
            url: "https://test.supabase.co",
            anonKey: "test-anon-key"
        }
    }
};

vi.mock("#imports", () => ({
    useSupabaseClient: () => mockSupabaseClient,
    useSupabaseUser: () => mockSupabaseUser,
    useRuntimeConfig: () => mockRuntimeConfig
}));

describe("useSupabase Service", () => {
    let supabaseService: ReturnType<typeof useSupabase>;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Reset mock query builder
        mockQueryBuilder.select.mockReturnThis();
        mockQueryBuilder.eq.mockReturnThis();
        mockQueryBuilder.single.mockResolvedValue({ data: null, error: null });

        // Reset user state
        mockSupabaseUser.value = null;

        // Create service instance
        supabaseService = useSupabase();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Service Initialization", () => {
        it("should provide access to supabase client", () => {
            expect(supabaseService.client).toBe(mockSupabaseClient);
        });

        it("should provide access to user state", () => {
            expect(supabaseService.user).toBe(mockSupabaseUser);
        });

        it("should provide utility methods", () => {
            expect(typeof supabaseService.getCurrentUser).toBe("function");
            expect(typeof supabaseService.isAuthenticated).toBe("function");
            expect(typeof supabaseService.isAdmin).toBe("function");
        });
    });

    describe("getCurrentUser", () => {
        it("should return current user when authenticated", async () => {
            const mockUser: User = {
                id: "123",
                email: "test@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            const result = await supabaseService.getCurrentUser();

            expect(result).toBe(mockUser);
        });

        it("should return null when not authenticated", async () => {
            mockSupabaseUser.value = null;

            const result = await supabaseService.getCurrentUser();

            expect(result).toBeNull();
        });
    });

    describe("isAuthenticated", () => {
        it("should return true when user is present", () => {
            const mockUser: User = {
                id: "123",
                email: "test@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            expect(supabaseService.isAuthenticated()).toBe(true);
        });

        it("should return false when user is null", () => {
            mockSupabaseUser.value = null;

            expect(supabaseService.isAuthenticated()).toBe(false);
        });

        it("should return false when user is undefined", () => {
            mockSupabaseUser.value = undefined as any;

            expect(supabaseService.isAuthenticated()).toBe(false);
        });
    });

    describe("isAdmin", () => {
        it("should return true for admin user", async () => {
            const mockUser: User = {
                id: "123",
                email: "admin@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            // Mock profile query response
            mockQueryBuilder.single.mockResolvedValue({
                data: { role: "admin" },
                error: null
            });

            const result = await supabaseService.isAdmin();

            expect(result).toBe(true);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith("profiles");
            expect(mockQueryBuilder.select).toHaveBeenCalledWith("role");
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", "123");
        });

        it("should return false for regular user", async () => {
            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            // Mock profile query response
            mockQueryBuilder.single.mockResolvedValue({
                data: { role: "user" },
                error: null
            });

            const result = await supabaseService.isAdmin();

            expect(result).toBe(false);
        });

        it("should return false when user is not authenticated", async () => {
            mockSupabaseUser.value = null;

            const result = await supabaseService.isAdmin();

            expect(result).toBe(false);
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
        });

        it("should return false when profile query fails", async () => {
            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            // Mock profile query error
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: { message: "Profile not found" }
            });

            const result = await supabaseService.isAdmin();

            expect(result).toBe(false);
        });

        it("should return false when profile data is null", async () => {
            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            // Mock profile query with null data
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null
            });

            const result = await supabaseService.isAdmin();

            expect(result).toBe(false);
        });

        it("should return false when role is null or undefined", async () => {
            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            // Test with null role
            mockQueryBuilder.single.mockResolvedValue({
                data: { role: null },
                error: null
            });

            let result = await supabaseService.isAdmin();
            expect(result).toBe(false);

            // Test with undefined role
            mockQueryBuilder.single.mockResolvedValue({
                data: { role: undefined },
                error: null
            });

            result = await supabaseService.isAdmin();
            expect(result).toBe(false);
        });

        it("should handle unexpected errors gracefully", async () => {
            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            // Mock unexpected error
            mockQueryBuilder.single.mockRejectedValue(new Error("Network error"));

            const result = await supabaseService.isAdmin();

            expect(result).toBe(false);
        });

        it("should handle different role values correctly", async () => {
            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            const testCases = [
                { role: "admin", expected: true },
                { role: "user", expected: false },
                { role: "moderator", expected: false },
                { role: "ADMIN", expected: false }, // Case sensitive
                { role: "", expected: false },
                { role: "admin ", expected: false } // With whitespace
            ];

            for (const testCase of testCases) {
                mockQueryBuilder.single.mockResolvedValue({
                    data: { role: testCase.role },
                    error: null
                });

                const result = await supabaseService.isAdmin();
                expect(result).toBe(testCase.expected);
            }
        });
    });

    describe("Console Logging", () => {
        let consoleSpy: any;
        let originalNodeEnv: string | undefined;

        beforeEach(() => {
            consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
            originalNodeEnv = process.env.NODE_ENV;
        });

        afterEach(() => {
            consoleSpy.mockRestore();
            process.env.NODE_ENV = originalNodeEnv;
        });

        it("should log debug information during admin check in development", async () => {
            // Set environment to development
            process.env.NODE_ENV = "development";

            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            mockQueryBuilder.single.mockResolvedValue({
                data: { role: "admin" },
                error: null
            });

            await supabaseService.isAdmin();

            expect(consoleSpy).toHaveBeenCalledWith("isAdmin result:", true);
        });

        it("should log when no profile data found in development", async () => {
            // Set environment to development
            process.env.NODE_ENV = "development";

            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: null
            });

            await supabaseService.isAdmin();

            expect(consoleSpy).toHaveBeenCalledWith("No profile data found for user");
        });

        it("should not log debug information in production", async () => {
            // Set environment to production
            process.env.NODE_ENV = "production";

            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            mockQueryBuilder.single.mockResolvedValue({
                data: { role: "admin" },
                error: null
            });

            await supabaseService.isAdmin();

            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it("should log when no user is found in development", async () => {
            // Set environment to development
            process.env.NODE_ENV = "development";

            mockSupabaseUser.value = null;

            await supabaseService.isAdmin();

            expect(consoleSpy).toHaveBeenCalledWith("isAdmin check - no user found");
        });

        it("should not log when no user is found in production", async () => {
            // Set environment to production
            process.env.NODE_ENV = "production";

            mockSupabaseUser.value = null;

            await supabaseService.isAdmin();

            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe("Error Logging", () => {
        let consoleErrorSpy: any;
        let originalNodeEnv: string | undefined;

        beforeEach(() => {
            consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            originalNodeEnv = process.env.NODE_ENV;
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
            process.env.NODE_ENV = originalNodeEnv;
        });

        it("should log database errors in development", async () => {
            // Set environment to development
            process.env.NODE_ENV = "development";

            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            const mockError = { message: "Database error" };
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: mockError
            });

            await supabaseService.isAdmin();

            expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking admin status:", mockError);
        });

        it("should not log database errors in production", async () => {
            // Set environment to production
            process.env.NODE_ENV = "production";

            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            const mockError = { message: "Database error" };
            mockQueryBuilder.single.mockResolvedValue({
                data: null,
                error: mockError
            });

            await supabaseService.isAdmin();

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it("should log unexpected errors in development", async () => {
            // Set environment to development
            process.env.NODE_ENV = "development";

            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            const mockError = new Error("Unexpected error");
            mockQueryBuilder.single.mockRejectedValue(mockError);

            await supabaseService.isAdmin();

            expect(consoleErrorSpy).toHaveBeenCalledWith("Unexpected error in isAdmin check:", mockError);
        });

        it("should not log unexpected errors in production", async () => {
            // Set environment to production
            process.env.NODE_ENV = "production";

            const mockUser: User = {
                id: "123",
                email: "user@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;

            const mockError = new Error("Unexpected error");
            mockQueryBuilder.single.mockRejectedValue(mockError);

            await supabaseService.isAdmin();

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe("Integration with Nuxt Composables", () => {
        it("should use correct Nuxt imports", () => {
            // Verify that the service is using the mocked Nuxt composables
            expect(supabaseService.client).toBe(mockSupabaseClient);
            expect(supabaseService.user).toBe(mockSupabaseUser);
        });

        it("should handle reactive user changes", async () => {
            // Initially no user
            expect(supabaseService.isAuthenticated()).toBe(false);

            // Set user
            const mockUser: User = {
                id: "123",
                email: "test@example.com",
                created_at: "2023-01-01T00:00:00Z",
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                confirmation_sent_at: "2023-01-01T00:00:00Z"
            };

            mockSupabaseUser.value = mockUser;
            expect(supabaseService.isAuthenticated()).toBe(true);

            // Clear user
            mockSupabaseUser.value = null;
            expect(supabaseService.isAuthenticated()).toBe(false);
        });
    });
});
