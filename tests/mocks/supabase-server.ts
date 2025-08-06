import { vi } from "vitest";

// Mock serverSupabaseClient function
export const serverSupabaseClient = vi.fn(() => {
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
            ),
            admin: {
                createUser: vi.fn(() =>
                    Promise.resolve({
                        data: { user: { id: "new-user-id" } },
                        error: null
                    })
                ),
                deleteUser: vi.fn(() => Promise.resolve({ error: null }))
            }
        },
        rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/image.jpg" } }))
            }))
        }
    });
});
