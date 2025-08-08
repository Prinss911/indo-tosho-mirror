import { createClient } from "@supabase/supabase-js";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async event => {
    try {
        // Get authenticated user
        const user = await serverSupabaseUser(event);
        
        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: "Authentication required"
            });
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

        // Fetch user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username, role, created_at, status")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("[API] Error fetching user profile:", profileError);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to fetch user profile"
            });
        }

        return {
            id: user.id,
            username: profileData?.username ?? user.email?.split("@")[0] ?? "user",
            role: profileData?.role ?? "user",
            email: user.email,
            created_at: profileData?.created_at ?? user.created_at ?? new Date().toISOString(),
            status: profileData?.status ?? "active"
        };
    } catch (error: any) {
        console.error("[API] Error in get-profile:", error);
        
        // If it's already a createError, re-throw it
        if (error.statusCode) {
            throw error;
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error"
        });
    }
});