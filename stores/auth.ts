import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import { useSupabase } from "~/services/supabaseClient";
import { sanitizeAuthError } from "~/utils/sanitization";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { debounce } from "lodash-es";

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
    const sessionTimeout = ref<number>(30 * 60 * 1000); // 30 minutes
    const { client: supabase, user: supabaseUser } = useSupabase();
    
    // Cache untuk optimasi
    const _userProfileCache = ref<Map<string, any>>(new Map());
    const _validationCache = ref<Map<string, any>>(new Map());

    // Getters dengan memoization
    const isAuthenticated = computed(() => !!user.value);
    const isAdmin = computed(() => user.value?.role === "admin");
    const currentUser = computed(() => user.value);
    const isSessionValid = computed(() => {
        if (!user.value || !lastActivity.value) return false;
        return Date.now() - lastActivity.value < sessionTimeout.value;
    });
    
    // Computed untuk user info dengan caching
    const userDisplayName = computed(() => {
        if (!user.value) return "";
        return user.value.username || user.value.email?.split("@")[0] || "User";
    });
    
    const userInitials = computed(() => {
        if (!user.value) return "";
        const name = userDisplayName.value;
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    });

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

            // Fetch user profile from profiles table dengan caching
            let profileData = _userProfileCache.value.get(data.user.id);
            
            if (!profileData) {
                const { data: fetchedProfile, error: profileError } = await supabase
                    .from("profiles")
                    .select("username, role, created_at, status")
                    .eq("id", data.user.id)
                    .single();

                if (profileError) {
                    // Don't log sensitive profile errors
                    error.value = "Terjadi kesalahan saat mengambil profil pengguna";
                    return { success: false, error: error.value };
                }
                
                profileData = fetchedProfile;
                // Cache profile data selama 5 menit
                _userProfileCache.value.set(data.user.id, profileData);
                setTimeout(() => {
                    _userProfileCache.value.delete(data.user.id);
                }, 5 * 60 * 1000);
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

            // Validate password strength dengan caching
            const passwordHash = btoa(credentials.password).slice(0, 10); // Simple hash untuk cache key
            let passwordValidation = _validationCache.value.get(passwordHash);
            
            if (!passwordValidation) {
                passwordValidation = await $fetch("/api/auth/validate-password", {
                    method: "POST",
                    body: { password: credentials.password }
                }).catch(() => ({ isValid: false, errors: ["Password tidak memenuhi persyaratan keamanan"] }));
                
                // Cache validation result selama 1 menit
                _validationCache.value.set(passwordHash, passwordValidation);
                setTimeout(() => {
                    _validationCache.value.delete(passwordHash);
                }, 60 * 1000);
            }

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
            // Silent logout - hanya membersihkan local state tanpa memanggil Supabase API
            // untuk menghindari ERR_ABORTED error
            
            // Invalidate session if exists (tetap panggil API internal untuk cleanup)
            if (sessionId.value) {
                try {
                    await $fetch("/api/auth/invalidate-session", {
                        method: "POST",
                        body: { sessionId: sessionId.value }
                    });
                } catch (sessionErr) {
                    // Ignore session invalidation errors - tidak critical untuk UX
                    console.warn('Session invalidation failed, continuing with logout:', sessionErr);
                }
            }

            // Clear local state immediately tanpa memanggil Supabase signOut
            user.value = null;
            sessionId.value = null;
            csrfToken.value = null;
            lastActivity.value = Date.now();
            clearCache();

            // Clear semua stored tokens dan session data dari browser storage
            if (typeof window !== 'undefined') {
                try {
                    // Clear localStorage items
                    localStorage.removeItem('supabase.auth.token');
                    localStorage.removeItem('sb-jayavvymuqkkvvlcaudv-auth-token');
                    
                    // Clear sessionStorage items juga
                    sessionStorage.removeItem('supabase.auth.token');
                    sessionStorage.removeItem('sb-jayavvymuqkkvvlcaudv-auth-token');
                    
                    // Clear semua keys yang mengandung 'supabase' atau 'auth'
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.includes('supabase') || key.includes('auth'))) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    
                } catch (storageErr) {
                    // Ignore localStorage errors - tidak critical
                    console.warn('Storage cleanup failed:', storageErr);
                }
            }

            // Berhasil logout tanpa error
            console.log('Silent logout completed successfully');

        } catch (err) {
            // Bahkan jika ada error, tetap clear local state untuk UX yang baik
            user.value = null;
            sessionId.value = null;
            csrfToken.value = null;
            lastActivity.value = Date.now();
            
            console.warn('Logout error occurred, but local state cleared for good UX:', err);
            // Tidak set error.value agar user tidak melihat error message
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

    // Session activity tracking dengan debouncing
    const updateActivity = debounce(() => {
        if (user.value && sessionId.value) {
            lastActivity.value = Date.now();
            // Update session activity on server
            $fetch("/api/auth/update-activity", {
                method: "POST",
                body: { sessionId: sessionId.value }
            }).catch(() => {});
        }
    }, 1000); // Debounce selama 1 detik
    
    // Clear cache untuk membebaskan memori
    const clearCache = () => {
        _userProfileCache.value.clear();
        _validationCache.value.clear();
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
        isSessionValid,
        userDisplayName,
        userInitials,

        // Actions
        login,
        register,
        logout,
        checkAuth,
        clearError,
        updateActivity,
        clearCache
    };
});
