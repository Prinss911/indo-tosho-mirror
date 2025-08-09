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
        if (!user.value) {
            if (process.env.NODE_ENV === "development") {
                console.log("isAdmin check - no user found");
            }
            return false;
        }

        try {
            // Fetch user's role from the profiles table
            const { data, error } = await supabase.from("profiles").select("role").eq("id", user.value.id).single();

            if (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error checking admin status:", error);
                }
                return false;
            }

            if (!data) {
                if (process.env.NODE_ENV === "development") {
                    console.log("No profile data found for user");
                }
                return false;
            }

            // Explicitly check for 'admin' role
            const isUserAdmin = data.role === "admin";

            if (process.env.NODE_ENV === "development") {
                console.log("isAdmin result:", isUserAdmin);
            }

            return isUserAdmin;
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
