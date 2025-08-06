import { useSupabase } from "~/services/supabaseClient";
import { useAuthStore } from "~/stores/auth";
import { MIDDLEWARE_CONFIG } from "./auth-helper";

/**
 * Interface untuk hasil pengecekan admin
 */
export interface AdminCheckResult {
    isAdmin: boolean;
    error?: string;
}

/**
 * Utility function untuk mengecek apakah user adalah admin
 * Menggunakan single source of truth dari supabase service
 */
export async function checkAdminRole(authStore: ReturnType<typeof useAuthStore>): Promise<AdminCheckResult> {
    const supabase = useSupabase();

    try {
        // Gunakan built-in isAdmin method yang sudah dioptimasi
        const isAdminUser = await supabase.isAdmin();

        // Sync authStore jika diperlukan
        if (isAdminUser && authStore.user && authStore.user.role !== MIDDLEWARE_CONFIG.ADMIN_ROLE) {
            authStore.user.role = MIDDLEWARE_CONFIG.ADMIN_ROLE;
        }

        return { isAdmin: isAdminUser };
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Admin middleware - Unexpected error:", error);
        }
        return {
            isAdmin: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Utility function untuk membuat error 403 dengan pesan yang konsisten
 */
export function createAccessDeniedError(message?: string) {
    return createError({
        statusCode: 403,
        statusMessage: message || "Access Denied: Admin privileges required"
    });
}

/**
 * Utility function untuk logging admin middleware activity
 */
export function logAdminCheck(authStore: ReturnType<typeof useAuthStore>, result: AdminCheckResult) {
    if (process.env.NODE_ENV === "development") {
        console.log("Admin middleware check:", {
            isAdminFromCheck: result.isAdmin,
            authStoreIsAdmin: authStore.isAdmin,
            userRole: authStore.user?.role,
            error: result.error
        });
    }
}
