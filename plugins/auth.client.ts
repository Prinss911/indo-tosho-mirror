export default defineNuxtPlugin(async nuxtApp => {
    // Validasi parameter nuxtApp
    if (!nuxtApp) {
        throw new Error("NuxtApp parameter is required");
    }

    try {
        const authStore = useAuthStore();

        // Hanya jalankan checkAuth di sisi klien (browser)
        if (typeof window !== "undefined") {
            try {
                // Initialize auth state from localStorage on client side
                await authStore.checkAuth();
            } catch (error) {
                console.error("Auth initialization error:", error);
            }
        }
    } catch (error) {
        console.error("Auth initialization error:", error);
    }
});
