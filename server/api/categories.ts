// Import Supabase client dengan cara yang kompatibel dengan pengujian
import { serverSupabaseClient } from "#supabase/server";
import { createError, defineEventHandler } from "h3";

export default defineEventHandler(async event => {
    const method = event.node.req.method;

    // Hanya mendukung metode GET
    if (method === "GET") {
        try {
            const supabase = await serverSupabaseClient(event);

            // Ambil semua kategori dari tabel categories
            const { data, error } = await supabase.from("categories").select("*").order("name");

            if (error) {
                throw createError({
                    statusCode: 500,
                    statusMessage: `Error fetching categories: ${error.message}`
                });
            }

            return data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to fetch categories: ${error.message}`
            });
        }
    }

    // Jika bukan metode GET, kembalikan error
    throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed"
    });
});
