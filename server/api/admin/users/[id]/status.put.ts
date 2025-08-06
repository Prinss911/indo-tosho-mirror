import { validateMethod, validateContentLength } from "~/server/utils/validation";
import { addSecurityHeaders, logSecurityEvent } from "~/server/utils/authorization";

export default defineEventHandler(async event => {
    // Add security headers
    addSecurityHeaders(event);
    
    // Validate HTTP method
    validateMethod(event, ["PUT"]);
    
    // Validate content length
    validateContentLength(event, 1024); // 1KB max
    
    const config = useRuntimeConfig();
    const { createClient } = await import("@supabase/supabase-js");

    // Validate that service role key is available
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

    try {
        console.log("[API] Processing user status update request");
        
        // Get user ID from route params
        const userId = getRouterParam(event, "id");
        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: "User ID is required"
            });
        }

        // Get request body with error handling
        let body;
        try {
            body = await readBody(event);
            console.log("[API] User status update body received");
        } catch (error) {
            console.error("[API] Error reading request body:", error);
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid request body"
            });
        }
        const { status, deleteUserPosts } = body;

        if (!status || !["active", "inactive", "banned"].includes(status)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Valid status is required (active, inactive, banned)"
            });
        }

        // Update user status in profiles table
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .update({ status })
            .eq("id", userId)
            .select()
            .single();

        if (profileError) {
            console.error("Error updating user status:", profileError);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to update user status"
            });
        }

        // If user is banned and deleteUserPosts is true, delete their posts
        if (status === "banned" && deleteUserPosts) {
            const { error: deletePostsError } = await supabase.from("posts").delete().eq("submitter_id", userId);

            if (deletePostsError) {
                console.error("Error deleting user posts:", deletePostsError);
                // Don't throw error here, just log it
            }
        }

        // If user is being set to active, ensure email is confirmed
        if (status === "active") {
            const { error: confirmEmailError } = await supabase.auth.admin.updateUserById(userId, {
                email_confirm: true
            });

            if (confirmEmailError) {
                console.error("Error confirming user email:", confirmEmailError);
                // Don't throw error here, just log it
            }
        }

        return {
            success: true,
            data: profileData
        };
    } catch (error) {
        console.error("Error in status update API:", error);

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error"
        });
    }
});
