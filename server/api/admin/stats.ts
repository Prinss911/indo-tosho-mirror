import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async event => {
    try {
        // Use service role key to bypass RLS for admin stats
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

        const supabaseAdmin = createClient(config.public.supabase.url, serviceRoleKey);

        console.log("[API] Fetching user stats with service role...");

        // Fetch users from profiles table
        const { data: users, error: usersError } = await supabaseAdmin
            .from("profiles")
            .select("id, username, role, status");

        if (usersError) {
            console.error("[API] Error fetching users:", usersError);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to fetch user statistics"
            });
        }

        // Fetch posts from posts table
        const { data: posts, error: postsError } = await supabaseAdmin
            .from("posts")
            .select("id, title, status, status_approval, created_at");

        if (postsError) {
            console.error("[API] Error fetching posts:", postsError);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to fetch post statistics"
            });
        }

        // Calculate user statistics
        const userStats = {
            total: users?.length || 0,
            active: users?.filter(user => user.status === "active").length || 0,
            admins: users?.filter(user => user.role === "admin").length || 0
        };

        // Calculate post statistics based on status_approval column
        const postStats = {
            total: posts?.length || 0,
            published: posts?.filter(post => post.status_approval === "published").length || 0,
            pending: posts?.filter(post => post.status_approval === "pending").length || 0
        };

        console.log("[API] User stats calculated:", userStats);
        console.log("[API] Post stats calculated:", postStats);

        return {
            userStats,
            postStats,
            success: true
        };
    } catch (error) {
        console.error("[API] Error in stats endpoint:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error"
        });
    }
});
