import { initializeAuthStore, redirectToLogin } from "./utils/auth-helper";
import { checkAdminRole, createAccessDeniedError, logAdminCheck } from "./utils/admin-helper";

/**
 * Admin middleware - memastikan user adalah admin
 * Digunakan untuk halaman admin yang memerlukan privilege admin
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip pada server side
    if (process.server) {
        return;
    }

    const authStore = await initializeAuthStore();

    // Redirect ke login jika belum terautentikasi
    if (!authStore?.isAuthenticated) {
        return redirectToLogin(to.fullPath);
    }

    // Check admin role dengan multiple validation
    const adminCheckResult = await checkAdminRole(authStore);

    // Log untuk debugging (hanya di development)
    logAdminCheck(authStore, adminCheckResult);

    // Throw error jika bukan admin
    if (!adminCheckResult.isAdmin) {
        throw createAccessDeniedError(adminCheckResult.error ? `Access Denied: ${adminCheckResult.error}` : undefined);
    }

    // Allow access jika semua check passed
});
