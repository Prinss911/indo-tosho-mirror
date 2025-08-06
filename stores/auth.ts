import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import { useSupabase } from "~/services/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Helper function to sanitize auth errors
function sanitizeAuthError(error: any): string {
    const message = error?.message || error || "Authentication failed";

    const errorMappings: Record<string, string> = {
        "Invalid login credentials": "Email atau password salah",
        "Email not confirmed": "Email belum diverifikasi",
        "User not found": "Email atau password salah",
        "Invalid email": "Format email tidak valid",
        "Password should be at least": "Password tidak memenuhi persyaratan keamanan",
        "User already registered": "Email sudah terdaftar",
        "Signup disabled": "Registrasi sedang ditutup",
        "Email rate limit exceeded": "Terlalu banyak percobaan. Coba lagi nanti",
        "Token has expired": "Kode verifikasi telah kedaluwarsa",
        "Invalid token": "Kode verifikasi tidak valid"
    };

    for (const [key, value] of Object.entries(errorMappings)) {
        if (message.includes(key)) {
            return value;
        }
    }

    return "Terjadi kesalahan. Silakan coba lagi";
}

export interface User {
    id: string;
    username: string;
    role: "admin" | "user";
    email?: string;
    createdAt: string;
    lastActivity?: string;
    sessionId?: string;
}

export interface LoginCredentials {
    emailOrUsername: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    username: string;
}

export const useAuthStore = defineStore("auth", () => {
    // State
    const user = ref<User | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const isInitialized = ref(false);
    const sessionId = ref<string | null>(null);
    const csrfToken = ref<string | null>(null);
    const lastActivity = ref<number>(Date.now());
    const { client: supabase, user: supabaseUser } = useSupabase();

    // Getters
    const isAuthenticated = computed(() => !!user.value);
    const isAdmin = computed(() => user.value?.role === "admin");
    const currentUser = computed(() => user.value);

    // Actions
    const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Validate credentials
            if (!credentials.emailOrUsername || !credentials.password) {
                error.value = "Email/Username dan password diperlukan";
                return { success: false, error: error.value };
            }

            // Check rate limiting
            const rateLimitResponse = await $fetch("/api/auth/check-rate-limit", {
                method: "POST",
                body: { identifier: credentials.emailOrUsername }
            }).catch(() => ({ allowed: true }));

            if (!rateLimitResponse.allowed) {
                error.value = "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.";
                return { success: false, error: error.value };
            }

            let email = credentials.emailOrUsername;

            // Check if input is username (not email format)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(credentials.emailOrUsername)) {
                // Input is username, find the corresponding email using API endpoint
                try {
                    const response = await $fetch("/api/auth/get-email-by-username", {
                        query: { username: credentials.emailOrUsername }
                    });

                    if (!response.email) {
                        error.value = "Email atau password salah. Silakan coba lagi.";
                        return { success: false, error: error.value };
                    }

                    email = response.email;
                } catch (fetchError) {
                    // Don't log sensitive information
                    error.value = "Email atau password salah. Silakan coba lagi.";
                    return { success: false, error: error.value };
                }
            }

            // Login with Supabase using email
            const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
                email: email,
                password: credentials.password
            });

            if (supabaseError) {
                // Sanitize error messages to prevent information disclosure
                error.value = sanitizeAuthError(supabaseError);
                return { success: false, error: error.value };
            }

            if (!data.user) {
                error.value = "Login gagal. Silakan coba lagi.";
                return { success: false, error: error.value };
            }

            // Fetch user profile from profiles table
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("username, role, created_at, status")
                .eq("id", data.user.id)
                .single();

            if (profileError) {
                // Don't log sensitive profile errors
                error.value = "Terjadi kesalahan saat mengambil profil pengguna";
                return { success: false, error: error.value };
            }

            // Check user status
            const userStatus = profileData?.status || "active";
            if (userStatus === "inactive") {
                await supabase.auth.signOut();
                error.value = "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.";
                return { success: false, error: error.value };
            }

            if (userStatus === "banned") {
                await supabase.auth.signOut();
                error.value = "Akun Anda telah diblokir. Silakan hubungi administrator.";
                return { success: false, error: error.value };
            }

            // Create session and CSRF token
            try {
                const sessionResponse = await $fetch("/api/auth/create-session", {
                    method: "POST",
                    body: { userId: data.user.id }
                });

                sessionId.value = sessionResponse.sessionId;
                csrfToken.value = sessionResponse.csrfToken;
            } catch (sessionError) {
                // Continue without custom session tracking
            }

            // Set user with enhanced security info
            user.value = {
                id: data.user.id,
                username: profileData?.username ?? data.user.email?.split("@")[0] ?? "user",
                role: profileData?.role ?? "user",
                email: data.user.email,
                createdAt: profileData?.created_at ?? data.user.created_at ?? new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                sessionId: sessionId.value
            };

            lastActivity.value = Date.now();
            return { success: true };
        } catch (err) {
            // Don't log sensitive error information
            error.value = "Terjadi kesalahan saat login. Silakan coba lagi.";
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
        isLoading.value = true;
        error.value = null;

        try {
            // Validate credentials
            if (!credentials.email || !credentials.password || !credentials.username) {
                error.value = "Email, username dan password diperlukan";
                return { success: false, error: error.value };
            }

            // Validate password strength
            const passwordValidation = await $fetch("/api/auth/validate-password", {
                method: "POST",
                body: { password: credentials.password }
            }).catch(() => ({ isValid: false, errors: ["Password tidak memenuhi persyaratan keamanan"] }));

            if (!passwordValidation.isValid) {
                error.value = passwordValidation.errors.join(", ");
                return { success: false, error: error.value };
            }

            // Check rate limiting for registration
            const rateLimitResponse = await $fetch("/api/auth/check-rate-limit", {
                method: "POST",
                body: { identifier: credentials.email, type: "register" }
            }).catch(() => ({ allowed: true }));

            if (!rateLimitResponse.allowed) {
                error.value = "Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.";
                return { success: false, error: error.value };
            }

            // Register with Supabase
            const { data, error: supabaseError } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                    data: {
                        username: credentials.username
                    }
                }
            });

            if (supabaseError) {
                error.value = sanitizeAuthError(supabaseError);
                return { success: false, error: error.value };
            }

            if (!data.user) {
                error.value = "Registrasi gagal. Silakan coba lagi.";
                return { success: false, error: error.value };
            }

            // Profile will be created by trigger handle_new_user
            // Don't set user state for unverified accounts
            return { success: true };
        } catch (err) {
            // Don't log sensitive registration errors
            error.value = "Registrasi gagal. Silakan coba lagi.";
            return { success: false, error: error.value };
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            // Invalidate session if exists
            if (sessionId.value) {
                await $fetch("/api/auth/invalidate-session", {
                    method: "POST",
                    body: { sessionId: sessionId.value }
                }).catch(() => {});
            }

            // Sign out from Supabase
            const { error: supabaseError } = await supabase.auth.signOut();

            if (supabaseError) {
                // Don't expose logout errors
                error.value = "Terjadi kesalahan saat logout";
            }

            // Clear local state
            user.value = null;
            sessionId.value = null;
            csrfToken.value = null;
            lastActivity.value = Date.now();
        } catch (err) {
            // Don't log sensitive logout errors
            error.value = "Logout gagal. Silakan coba lagi.";
        } finally {
            isLoading.value = false;
        }
    };

    const checkAuth = async () => {
        isLoading.value = true;
        try {
            // Get current session from Supabase
            const { data } = await supabase.auth.getSession();

            if (data.session?.user) {
                // Fetch user profile from profiles table
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("username, role, created_at, status")
                    .eq("id", data.session.user.id)
                    .single();

                if (profileError) {
                    // Don't log sensitive profile errors
                    user.value = null;
                    return;
                }

                // Check user status first
                const userStatus = profileData?.status || "active";
                if (userStatus === "inactive" || userStatus === "banned") {
                    await supabase.auth.signOut();
                    user.value = null;
                    sessionId.value = null;
                    csrfToken.value = null;
                    return;
                }

                // Update role if not set
                if (profileData && !profileData.role) {
                    await supabase.from("profiles").update({ role: "user" }).eq("id", data.session.user.id);
                }

                // Get latest role data
                const { data: roleData } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.session.user.id)
                    .single();

                const userRole = roleData?.role ?? profileData?.role ?? "user";

                // Validate existing session if available
                if (sessionId.value) {
                    try {
                        const sessionValid = await $fetch("/api/auth/validate-session", {
                            method: "POST",
                            body: { sessionId: sessionId.value }
                        });

                        if (!sessionValid.valid) {
                            sessionId.value = null;
                            csrfToken.value = null;
                        }
                    } catch {
                        sessionId.value = null;
                        csrfToken.value = null;
                    }
                }

                // Set user with enhanced security info
                user.value = {
                    id: data.session.user.id,
                    username: profileData?.username ?? data.session.user.email?.split("@")[0] ?? "user",
                    role: userRole,
                    email: data.session.user.email,
                    createdAt: profileData?.created_at ?? data.session.user.created_at ?? new Date().toISOString(),
                    lastActivity: new Date().toISOString(),
                    sessionId: sessionId.value
                };

                lastActivity.value = Date.now();
            } else {
                user.value = null;
                sessionId.value = null;
                csrfToken.value = null;
            }
        } catch (err) {
            // Don't log sensitive auth state errors
            user.value = null;
            sessionId.value = null;
            csrfToken.value = null;
        } finally {
            isLoading.value = false;
            isInitialized.value = true;
        }
    };

    const clearError = () => {
        error.value = null;
    };

    // Initialize auth state
    if (typeof window !== "undefined") {
        checkAuth();
    }

    // Session activity tracking
    const updateActivity = () => {
        if (user.value && sessionId.value) {
            lastActivity.value = Date.now();
            // Update session activity on server
            $fetch("/api/auth/update-activity", {
                method: "POST",
                body: { sessionId: sessionId.value }
            }).catch(() => {});
        }
    };

    // Auto-update activity every 5 minutes
    if (typeof window !== "undefined") {
        setInterval(updateActivity, 5 * 60 * 1000);
    }

    return {
        // State
        user,
        isLoading,
        error,
        isInitialized,
        sessionId: readonly(sessionId),
        csrfToken: readonly(csrfToken),

        // Getters
        isAuthenticated,
        isAdmin,
        currentUser,

        // Actions
        login,
        register,
        logout,
        checkAuth,
        clearError,
        updateActivity
    };
});
