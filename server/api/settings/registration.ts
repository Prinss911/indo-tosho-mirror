import { createClient } from "@supabase/supabase-js";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async event => {
    const method = getMethod(event);
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
    const supabase = createClient(config.public.supabase.url, serviceRoleKey);

    // Check if user is authenticated and is admin for POST requests
    if (method === "POST") {
        const user = await serverSupabaseUser(event);

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: "Authentication required"
            });
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile || profile.role !== "admin") {
            throw createError({
                statusCode: 403,
                statusMessage: "Admin access required"
            });
        }
    }

    if (method === "GET") {
        try {
            // Get registration status from settings table
            const { data, error } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "registration_enabled")
                .single();

            if (error && error.code !== "PGRST116") {
                // PGRST116 = no rows returned
                throw error;
            }

            // Default to enabled if no setting exists
            const isEnabled = data ? data.value === "true" : true;

            return {
                success: true,
                enabled: isEnabled
            };
        } catch (error) {
            console.error("Error fetching registration status:", error);
            return {
                success: false,
                error: "Failed to fetch registration status",
                enabled: true // Default to enabled on error
            };
        }
    }

    if (method === "POST") {
        try {
            const body = await readBody(event);
            const { enabled } = body;

            if (typeof enabled !== "boolean") {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Invalid enabled value. Must be boolean."
                });
            }

            // Update or insert registration status
            const { error } = await supabase.from("settings").upsert(
                {
                    key: "registration_enabled",
                    value: enabled.toString(),
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: "key"
                }
            );

            if (error) {
                throw error;
            }

            return {
                success: true,
                enabled: enabled,
                message: `Registration ${enabled ? "enabled" : "disabled"} successfully`
            };
        } catch (error) {
            console.error("Error updating registration status:", error);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to update registration status"
            });
        }
    }

    throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed"
    });
});
