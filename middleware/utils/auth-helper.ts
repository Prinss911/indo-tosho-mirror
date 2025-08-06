import { useAuthStore } from "~/stores/auth";

/**
 * Utility function untuk menginisialisasi auth store dengan retry mechanism
 * Menghindari duplikasi kode di semua middleware
 */
export async function initializeAuthStore(): Promise<ReturnType<typeof useAuthStore>> {
    const authStore = useAuthStore();

    // Skip pada server side untuk menghindari hydration mismatch
    if (process.server) {
        return authStore;
    }

    // Tunggu store terinisialisasi dengan retry mechanism
    let attempts = 0;
    const maxAttempts = 50; // Maksimal 5 detik
    const retryDelay = 100; // 100ms per attempt

    while (!authStore.isInitialized && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        attempts++;
    }

    // Jika masih belum terinisialisasi, coba sekali lagi
    if (!authStore.isInitialized) {
        await authStore.checkAuth();
    }

    return authStore;
}

/**
 * Utility function untuk redirect ke login dengan query parameter
 */
export function redirectToLogin(redirectPath: string) {
    return navigateTo({
        path: "/login",
        query: { redirect: redirectPath }
    });
}

/**
 * Utility function untuk redirect ke home
 */
export function redirectToHome() {
    return navigateTo("/");
}

/**
 * Constants untuk middleware
 */
export const MIDDLEWARE_CONFIG = {
    MAX_INIT_ATTEMPTS: 50,
    RETRY_DELAY: 100,
    ADMIN_ROLE: "admin"
} as const;
