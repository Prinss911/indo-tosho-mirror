import { initializeAuthStore, redirectToLogin } from "./utils/auth-helper";

/**
 * Auth middleware - memastikan user sudah terautentikasi
 * Digunakan untuk halaman yang memerlukan login (user atau admin)
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip pada server side
    if (process.server) {
        return;
    }

    const authStore = await initializeAuthStore();

    // Redirect ke login jika belum terautentikasi
    if (!authStore.isAuthenticated) {
        return redirectToLogin(to.fullPath);
    }
});
