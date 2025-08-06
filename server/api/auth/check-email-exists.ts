import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async event => {
    const query = getQuery(event);
    const email = query.email as string;

    console.log("🔍 Check email API called with:", email);

    if (!email) {
        throw createError({
            statusCode: 400,
            statusMessage: "Email is required"
        });
    }

    const config = useRuntimeConfig();

    // Validate that service role key is available
    const serviceRoleKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        console.error("[API] Service role key not found in environment variables");
        throw createError({
            statusCode: 500,
            statusMessage: "Server configuration error"
        });
    }

    // Use service role key for server-side operations
    const supabase = createClient(config.public.supabase.url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        console.log("🔍 Checking email in profiles table...");

        // Check if email exists in profiles table
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("email", email)
            .maybeSingle(); // Use maybeSingle instead of single to avoid error when no data

        console.log("📊 Profile query result:", { profileData, profileError });

        if (profileError) {
            console.error("❌ Profile query error:", profileError);
            throw createError({
                statusCode: 500,
                statusMessage: "Database error while checking email in profiles"
            });
        }

        // If found in profiles, email exists
        if (profileData) {
            console.log("✅ Email found in profiles table");
            return {
                exists: true,
                message: "Email sudah terdaftar"
            };
        }

        console.log("🔍 Checking email in auth.users table...");

        // Also check auth.users table
        const { data: authData, error: authError } = await supabase
            .from("auth.users")
            .select("email")
            .eq("email", email)
            .maybeSingle();

        console.log("📊 Auth query result:", { authData, authError });

        if (authError) {
            console.error("❌ Auth query error:", authError);
            // Don't throw error for auth table, just continue
        }

        // If found in auth.users, email exists
        if (authData) {
            console.log("✅ Email found in auth.users table");
            return {
                exists: true,
                message: "Email sudah terdaftar"
            };
        }

        console.log("✅ Email not found in any table - available");

        // Email not found in either table
        return {
            exists: false,
            message: "Email tersedia"
        };
    } catch (error: any) {
        console.error("❌ API Error:", error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "Failed to check email"
        });
    }
});
