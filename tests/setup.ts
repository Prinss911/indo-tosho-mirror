import { vi } from "vitest";
import { config } from "@vue/test-utils";
import { IncomingMessage, ServerResponse } from "http";

// Mock Node.js HTTP classes
vi.mock("http", () => ({
    IncomingMessage: vi.fn().mockImplementation(socket => ({
        method: "GET",
        url: "/",
        headers: {},
        socket: socket || null,
        httpVersion: "1.1",
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        complete: true,
        readable: true
    })),
    ServerResponse: vi.fn().mockImplementation(req => ({
        statusCode: 200,
        statusMessage: "OK",
        headersSent: false,
        req: req || null,
        writable: true,
        finished: false,
        setHeader: vi.fn(),
        getHeader: vi.fn(),
        removeHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn()
    }))
}));

// Mock process.env
Object.defineProperty(process, "env", {
    value: {
        NODE_ENV: "test",
        ...process.env
    },
    writable: true
});

// Mock H3 and Nuxt server functions globally
global.defineEventHandler = vi.fn(handler => handler);
global.readBody = vi.fn(() => Promise.resolve({}));
global.getQuery = vi.fn(() => ({}));
global.getCookie = vi.fn(() => undefined);
global.setCookie = vi.fn();
global.getHeader = vi.fn(() => undefined);
global.setHeader = vi.fn();

// Mock Nuxt composables globally
vi.mock("#app", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        currentRoute: {
            value: {
                path: "/",
                params: {},
                query: {},
                meta: {}
            }
        }
    }),
    useRoute: () => ({
        path: "/",
        params: {},
        query: {},
        meta: {}
    }),
    useHead: vi.fn(),
    useSeoMeta: vi.fn(),
    useColorMode: () => ({
        preference: "dark",
        value: "dark"
    }),
    navigateTo: vi.fn(),
    definePageMeta: vi.fn(),
    defineNuxtPlugin: plugin => {
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
    },
    useNuxtApp: () => ({
        $router: {
            push: vi.fn(),
            replace: vi.fn(),
            go: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            currentRoute: { value: { path: "/" } }
        },
        $route: {
            path: "/",
            params: {},
            query: {},
            meta: {}
        },
        runWithContext: fn => fn(),
        ssrContext: null,
        payload: {}
    })
}));

// Mock h3 utilities - moved to bottom of file to avoid conflicts

// Mock heroicons globally
vi.mock("@heroicons/vue/24/outline", async () => {
    const actual = await vi.importActual("@heroicons/vue/24/outline");
    return {
        ...actual,
        StarIcon: { render: () => {} },
        EyeIcon: { render: () => {} },
        HeartIcon: { render: () => {} },
        ArrowDownTrayIcon: { render: () => {} },
        PlayIcon: { render: () => {} },
        BookmarkIcon: { render: () => {} },
        UserIcon: { render: () => {} },
        CalendarIcon: { render: () => {} },
        ChevronRightIcon: { render: () => {} },
        ExclamationTriangleIcon: { render: () => {} },
        ChatBubbleLeftEllipsisIcon: { render: () => {} },
        CheckCircleIcon: { render: () => {} },
        ArrowLeftIcon: { render: () => {} },
        PlusIcon: { render: () => {} },
        FilmIcon: { render: () => {} },
        ClockIcon: { render: () => {} },
        XCircleIcon: { render: () => {} }
    };
});

// Mock definePageMeta globally
global.definePageMeta = vi.fn();

// Mock NuxtLink component
config.global.stubs = {
    NuxtLink: {
        template: '<a :href="to" @click="handleClick"><slot /></a>',
        props: ["to"],
        methods: {
            handleClick(event) {
                this.$emit("click", event);
            }
        }
    }
};

// Mock defineNuxtRouteMiddleware globally
global.defineNuxtRouteMiddleware = vi.fn(middleware => {
    // Return the middleware function for testing
    return middleware;
});

// Mock defineNuxtPlugin globally
global.defineNuxtPlugin = vi.fn(plugin => {
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

// Mock other Nuxt globals
global.useRouter = () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
});

global.useRoute = () => ({
    path: "/",
    params: {},
    query: {},
    meta: {}
});

global.useHead = vi.fn();
global.useSeoMeta = vi.fn();
global.navigateTo = vi.fn();
global.createError = vi.fn(options => {
    const error = new Error(options.statusMessage || options.message || "Unknown error");
    Object.assign(error, options);
    throw error;
});

// Mock readBody globally
global.readBody = vi.fn();

// Mock $fetch globally
const mockFetch = vi.fn();
global.$fetch = mockFetch;

// Create a shared mock auth store that can be modified by tests
const mockAuthStore = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    checkAuth: vi.fn().mockResolvedValue(undefined)
};

// Mock useAuthStore globally
global.useAuthStore = vi.fn(() => mockAuthStore);

// Mock stores/auth module
vi.mock("~/stores/auth", () => ({
    useAuthStore: vi.fn(() => mockAuthStore)
}));

// Export the mock store for test access
global.mockAuthStore = mockAuthStore;

// Mock $fetch globally
global.$fetch = vi.fn(() => Promise.resolve());

// Mock useSupabaseClient from h3
vi.mock("#supabase/server", () => ({
    serverSupabaseClient: vi.fn(() => ({
        from: vi.fn(table => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null }))
                }))
            })),
            insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
            update: vi.fn(() => Promise.resolve({ data: null, error: null })),
            delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null }))
        }
    }))
}));

// Mock useSupabaseClient from h3 specifically
vi.mock("h3", async () => {
    const actual = await vi.importActual("h3");
    return {
        ...actual,
        createError: vi.fn(options => {
            const error = new Error(options.statusMessage || "Error");
            error.statusCode = options.statusCode || 500;
            return error;
        }),
        createEvent: vi.fn((req, res) => {
            const mockReq = req || { method: "GET", url: "/", headers: {} };
            const mockRes = res || { statusCode: 200, headers: {} };
            return {
                node: { req: mockReq, res: mockRes },
                context: {},
                headers: {},
                method: mockReq.method || "GET",
                url: mockReq.url || "/"
            };
        }),
        readBody: vi.fn(() => Promise.resolve({})),
        getQuery: vi.fn(() => ({})),
        getCookie: vi.fn(() => undefined),
        setCookie: vi.fn(),
        getHeader: vi.fn(() => undefined),
        setHeader: vi.fn(),
        useSupabaseClient: vi.fn(() => ({
            from: vi.fn(table => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
                    }))
                })),
                insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
                update: vi.fn(() => Promise.resolve({ data: null, error: null })),
                delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
            })),
            auth: {
                getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
                getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null }))
            }
        }))
    };
});

// Mock icon component
const mockIcon = {
    name: "MockIcon",
    template: "<svg><path /></svg>",
    props: ["class"]
};

vi.mock("@heroicons/vue/24/solid", () => ({
    ExclamationTriangleIcon: mockIcon,
    MagnifyingGlassIcon: mockIcon,
    PlusIcon: mockIcon,
    XMarkIcon: mockIcon,
    EyeIcon: mockIcon,
    HeartIcon: mockIcon,
    ArrowDownTrayIcon: mockIcon,
    CalendarIcon: mockIcon,
    StarIcon: mockIcon,
    TagIcon: mockIcon,
    UserIcon: mockIcon,
    ClockIcon: mockIcon,
    FilmIcon: mockIcon,
    ChevronDownIcon: mockIcon,
    SunIcon: mockIcon,
    MoonIcon: mockIcon,
    UserCircleIcon: mockIcon,
    Bars3Icon: mockIcon,
    default: mockIcon
}));

// Mock useSupabaseClient
vi.mock("#supabase/nuxt", () => ({
    useSupabaseClient: vi.fn(() => ({
        from: vi.fn(() => ({
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
            signUp: vi.fn(() =>
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
            signIn: vi.fn(() =>
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
            signOut: vi.fn(() => Promise.resolve({ error: null })),
            verifyOtp: vi.fn(() =>
                Promise.resolve({
                    data: {
                        user: {
                            id: "test-user-id",
                            email: "test@example.com"
                        }
                    },
                    error: null
                })
            )
        }
    }))
}));

// Global mock for useSupabaseClient
vi.stubGlobal(
    "useSupabaseClient",
    vi.fn(() => ({
        from: vi.fn(() => ({
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
            signUp: vi.fn(() =>
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
            signIn: vi.fn(() =>
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
            signOut: vi.fn(() => Promise.resolve({ error: null })),
            verifyOtp: vi.fn(() =>
                Promise.resolve({
                    data: {
                        user: {
                            id: "test-user-id",
                            email: "test@example.com"
                        }
                    },
                    error: null
                })
            )
        }
    }))
);

// Mock console.error to avoid stderr output in tests
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

// Global test configuration
config.global.stubs = {
    NuxtLink: {
        name: "NuxtLink",
        template: '<a :href="to"><slot /></a>',
        props: ["to"]
    },
    ClientOnly: {
        name: "ClientOnly",
        template: "<div><slot /></div>"
    },
    BackButton: {
        name: "BackButton",
        template: '<button @click="goBack"><slot>{{ label || "Kembali" }}</slot></button>',
        props: ["label", "to", "buttonClass"],
        methods: {
            goBack() {
                if (this.to) {
                    this.$router?.push(this.to);
                } else {
                    this.$router?.back();
                }
            }
        }
    }
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Mock localStorage
Object.defineProperty(window, "localStorage", {
    value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    },
    writable: true
});

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
    value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    },
    writable: true
});
