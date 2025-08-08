import { useSupabaseClient } from "#imports";
import { useSupabaseUser } from "#imports";
import { useRuntimeConfig } from "#imports";
import type { User } from "@supabase/supabase-js";

/**
 * Provides access to Supabase client and user throughout the application
 * This is a wrapper around the Nuxt Supabase module to provide a consistent interface
 */
export const useSupabase = () => {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const config = useRuntimeConfig();

    /**
     * Get the current authenticated user
     */
    const getCurrentUser = async (): Promise<User | null> => {
        return user.value;
    };

    /**
     * Check if the user is authenticated
     */
    const isAuthenticated = (): boolean => {
        return !!user.value;
    };

    /**
     * Check if the user has admin role
     */
    const isAdmin = async (): Promise<boolean> => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                if (process.env.NODE_ENV === "development") {
                    console.log("No authenticated user found");
                }
                return false;
            }

            if (process.env.NODE_ENV === "development") {
                console.log("Checking admin status for user:", currentUser.id);
            }

            // Use server-side API endpoint to check admin status
            const response = await $fetch('/api/auth/check-admin', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (process.env.NODE_ENV === "development") {
                console.log("Admin check response:", response);
            }

            return response?.isAdmin || false;
        } catch (err) {
            if (process.env.NODE_ENV === "development") {
                console.error("Unexpected error in isAdmin check:", err);
            }
            return false;
        }
    };

    return {
        client: supabase,
        user,
        getCurrentUser,
        isAuthenticated,
        isAdmin
    };
};
