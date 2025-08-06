import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async event => {
    try {
        // Use service role key to bypass RLS for admin recent activity
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

        console.log("[API] Fetching recent activity with service role...");

        // Fetch recent posts (for content additions)
        const { data: recentPosts, error: postsError } = await supabaseAdmin
            .from("posts")
            .select("title, created_at, submitter_id")
            .order("created_at", { ascending: false })
            .limit(10);

        if (postsError) {
            console.error("[API] Error fetching recent posts:", postsError);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to fetch recent posts"
            });
        }

        // Fetch recent user registrations
        const { data: recentUsers, error: usersError } = await supabaseAdmin
            .from("profiles")
            .select("username, created_at")
            .order("created_at", { ascending: false })
            .limit(8);

        if (usersError) {
            console.error("[API] Error fetching recent users:", usersError);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to fetch recent users"
            });
        }

        // Combine and sort activities
        const activities = [];

        // Add post activities
        if (recentPosts) {
            recentPosts.forEach(post => {
                activities.push({
                    type: "post",
                    content: `New anime "${post.title}" added to database`,
                    created_at: post.created_at,
                    timestamp: new Date(post.created_at).getTime()
                });
            });
        }

        // Add user registration activities
        if (recentUsers) {
            recentUsers.forEach(user => {
                activities.push({
                    type: "user",
                    content: `User "${user.username}" registered`,
                    created_at: user.created_at,
                    timestamp: new Date(user.created_at).getTime()
                });
            });
        }

        // Sort by timestamp (newest first) and limit to 15
        activities.sort((a, b) => b.timestamp - a.timestamp);
        const recentActivity = activities.slice(0, 15);

        console.log("[API] Recent activity fetched successfully:", recentActivity.length, "activities");

        return {
            success: true,
            data: recentActivity
        };
    } catch (error) {
        console.error("[API] Error in recent activity endpoint:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error"
        });
    }
});
