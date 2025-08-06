import { initializeAuthStore, redirectToHome } from "./utils/auth-helper";

/**
 * Guest middleware - mencegah user yang sudah login mengakses halaman guest
 * Digunakan untuk halaman seperti login, register yang hanya untuk guest
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip pada server side
    if (process.server) {
        return;
    }

    const authStore = await initializeAuthStore();

    // Redirect ke home jika sudah terautentikasi
    if (authStore.isAuthenticated) {
        return redirectToHome();
    }
});
