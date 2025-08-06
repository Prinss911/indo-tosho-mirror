import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async event => {
    const query = getQuery(event);
    const username = query.username as string;

    if (!username) {
        throw createError({
            statusCode: 400,
            statusMessage: "Username is required"
        });
    }

    const config = useRuntimeConfig();

    // Use service role key for server-side operations
    const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey);

    try {
        const { data, error } = await supabase.from("profiles").select("email").eq("username", username).single();

        if (error) {
            if (error.code === "PGRST116") {
                // No rows found
                return { email: null };
            }
            throw error;
        }

        return { email: data?.email || null };
    } catch (error: any) {
        console.error("Error fetching email by username:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error"
        });
    }
});
