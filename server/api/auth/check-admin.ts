import { createClient } from "@supabase/supabase-js";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async event => {
    try {
        // Get authenticated user
        const user = await serverSupabaseUser(event);
        
        if (!user) {
            return {
                isAdmin: false,
                authenticated: false
            };
        }

        // Use service role key to bypass RLS
        const config = useRuntimeConfig();
        const serviceRoleKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error("[API] Service role key not found in environment variables");
            throw createError({
                statusCode: 500,
                statusMessage: "Server configuration error"
            });
        }

        // Create Supabase client with service role key
        const supabase = createClient(config.public.supabase.url, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Check user role from profiles table
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("[API] Error fetching user profile:", error);
            return {
                isAdmin: false,
                authenticated: true,
                error: "Failed to fetch user profile"
            };
        }

        return {
            isAdmin: profile?.role === "admin",
            authenticated: true,
            role: profile?.role || "user"
        };
    } catch (error: any) {
        console.error("[API] Error in check-admin:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error"
        });
    }
});