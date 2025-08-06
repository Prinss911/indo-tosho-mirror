import { vi } from "vitest";
import { ref, computed } from "vue";

// Mock Supabase composables
export const useSupabaseClient = vi.fn(() => ({
    from: vi.fn(table => ({
        select: vi.fn(() => ({
            eq: vi.fn((field, value) => ({
                single: vi.fn(() => {
                    // Untuk pengujian isAdmin
                    if (table === "profiles" && field === "id" && value === "123") {
                        return Promise.resolve({
                            data: { role: "admin" },
                            error: null
                        });
                    }
                    return Promise.resolve({
                        data: null,
                        error: null
                    });
                })
            }))
        }))
    })),
    auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        getSession: vi.fn(() =>
            Promise.resolve({
                data: {
                    session: {
                        user: {
                            id: "123",
                            email: "test@example.com",
                            created_at: "2023-01-01T00:00:00.000Z"
                        }
                    }
                },
                error: null
            })
        ),
        signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signOut: vi.fn(() => Promise.resolve({ error: null }))
    },
    storage: {
        from: vi.fn(() => ({
            upload: vi.fn(),
            getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/image.jpg" } }))
        }))
    }
}));

export const useSupabaseUser = vi.fn(() =>
    ref({
        id: "123",
        email: "test@example.com",
        created_at: "2023-01-01T00:00:00.000Z"
    })
);

export const useRuntimeConfig = vi.fn(() => ({
    public: {
        apiBase: "http://localhost:3000",
        supabase: {
            url: "https://example.supabase.co",
            key: "mock-key"
        }
    }
}));

// Tambahkan fungsi Nuxt lainnya yang mungkin diimpor dari #imports
export const useAsyncData = vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn()
}));

export const useFetch = vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn()
}));

export const defineNuxtPlugin = vi.fn(callback => {
    // Mengembalikan fungsi plugin yang dapat dipanggil dengan nuxtApp dan inject
    return async (nuxtApp, inject) => {
        // Pastikan nuxtApp memiliki properti yang diperlukan
        const mockNuxtApp = {
            ...nuxtApp,
            runWithContext: nuxtApp?.runWithContext || (fn => fn()),
            ssrContext: nuxtApp?.ssrContext || null,
            payload: nuxtApp?.payload || {},
            $router: nuxtApp?.$router || {
                push: vi.fn(),
                currentRoute: { value: { path: "/" } }
            }
        };

        // Panggil callback dengan mockNuxtApp dan tunggu hasilnya jika asinkron
        return await callback(mockNuxtApp, inject);
    };
});

export const useNuxtData = vi.fn(() => ref(null));

export const useState = vi.fn((key, init) => {
    const state = ref(init?.() || null);
    return state;
});

export const useCookie = vi.fn(() => ref(null));

export const useError = vi.fn(() => ref(null));

export const clearError = vi.fn();

export const createError = vi.fn(options => {
    const error = new Error(options.message || "Error");
    Object.assign(error, options);
    return error;
});

export const useNuxtApp = vi.fn(() => ({
    $router: {
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
    },
    $route: {
        path: "/",
        params: {},
        query: {},
        meta: {}
    },
    $fetch: vi.fn(() => Promise.resolve())
}));

// Mock vue-router functions that might be imported directly
export const useRouter = vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: ref({
        path: "/",
        params: {},
        query: {},
        meta: {}
    })
}));

export const useRoute = vi.fn(() => ({
    path: "/",
    params: {},
    query: {},
    meta: {},
    name: "index",
    hash: "",
    fullPath: "/"
}));

// Mock useSeoMeta function
export const useSeoMeta = vi.fn();

// Mock $fetch function
export const $fetch = vi.fn(() => Promise.resolve());

// Mock flushPromises function
export const flushPromises = vi.fn(() => Promise.resolve());

// Mock H3 and Nuxt server functions
export const defineEventHandler = vi.fn(handler => handler);

export const readBody = vi.fn(() => Promise.resolve({}));

export const getQuery = vi.fn(() => ({}));

export const getCookie = vi.fn(() => undefined);

export const setCookie = vi.fn();

export const deleteCookie = vi.fn();

export const getHeader = vi.fn(() => undefined);

export const setHeader = vi.fn();

export const getHeaders = vi.fn(() => ({}));

export const setResponseStatus = vi.fn();

export const send = vi.fn();

export const sendRedirect = vi.fn();
