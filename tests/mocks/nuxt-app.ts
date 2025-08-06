import { vi } from "vitest";
import { ref, computed, reactive, watch, onMounted, onUnmounted, nextTick } from "vue";

// Mock Nuxt composables
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

export const useHead = vi.fn();
export const useSeoMeta = vi.fn();

export const useColorMode = vi.fn(() => ({
    preference: ref("dark"),
    value: computed(() => "dark"),
    unknown: ref(false)
}));

export const navigateTo = vi.fn();
export const definePageMeta = vi.fn();

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
    }
}));

export const useRuntimeConfig = vi.fn(() => ({
    public: {
        apiBase: "http://localhost:3000/api"
    }
}));

export const useLazyFetch = vi.fn(url => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn()
}));

export const useFetch = vi.fn(url => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn()
}));

export const $fetch = vi.fn();

export const useAsyncData = vi.fn((key, handler) => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn()
}));

export const useState = vi.fn((key, init) => {
    const state = ref(init ? init() : null);
    return state;
});

export const useCookie = vi.fn((name, options) => {
    const cookie = ref(null);
    return cookie;
});

export const useRequestHeaders = vi.fn(() => ({}));
export const useRequestURL = vi.fn(() => new URL("http://localhost:3000"));

export const useError = vi.fn(() => ref(null));
export const clearError = vi.fn();
export const showError = vi.fn();
export const createError = vi.fn(options => new Error(options.statusMessage || "Error"));

export const abortNavigation = vi.fn();
export const addRouteMiddleware = vi.fn();
export const defineNuxtRouteMiddleware = vi.fn(middleware => middleware);
export const setPageLayout = vi.fn();

export const defineNuxtPlugin = vi.fn(plugin => {
    // Return the plugin function for testing
    return async (nuxtApp, inject) => {
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
        return await plugin(mockNuxtApp, inject);
    };
});

export const useLoadingIndicator = vi.fn(() => ({
    progress: ref(0),
    isLoading: ref(false),
    start: vi.fn(),
    finish: vi.fn(),
    clear: vi.fn()
}));

// Global mock untuk definePageMeta
global.definePageMeta = vi.fn();

// Re-export Vue reactivity
export { ref, computed, reactive, watch, onMounted, onUnmounted, nextTick };
