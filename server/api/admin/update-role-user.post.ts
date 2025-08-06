import { createClient } from "@supabase/supabase-js";
import { validateMethod, validateContentLength } from "~/server/utils/validation";
import { addSecurityHeaders, logSecurityEvent } from "~/server/utils/authorization";

export default defineEventHandler(async event => {
    // Add security headers
    addSecurityHeaders(event);
    
    // Validate HTTP method
    validateMethod(event, ["POST"]);
    
    // Validate content length
    validateContentLength(event, 1024); // 1KB max
    
    try {
        console.log("[API] Processing user role update request");
        
        let body;
        try {
            body = await readBody(event);
            console.log("[API] User role update body received");
        } catch (error) {
            console.error("[API] Error reading request body:", error);
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid request body"
            });
        }
        
        const { userId, newRole } = body;

        console.log("[API] Role update request:", { userId, newRole });

        // Validasi input
        if (!userId || !newRole) {
            throw createError({
                statusCode: 400,
                statusMessage: "userId dan newRole harus disediakan"
            });
        }

        // Validasi role yang valid
        if (!["user", "admin"].includes(newRole)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Role harus berupa user atau admin"
            });
        }

        // Gunakan service role untuk bypass RLS
        const config = useRuntimeConfig();
        const supabase = createClient(
            config.public.supabase.url,
            config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        console.log("Attempting to update user role...");

        // Update role user di database
        const { data, error } = await supabase
            .from("profiles")
            .update({
                role: newRole,
                updated_at: new Date().toISOString()
            })
            .eq("id", userId)
            .select("id, username, role, updated_at")
            .single();

        console.log("Supabase update result:", { data, error });

        if (error) {
            console.error("Supabase error:", error);
            throw createError({
                statusCode: 500,
                statusMessage: `Gagal mengupdate role: ${error.message}`
            });
        }

        console.log("Update successful:", data);

        // Return response sukses
        return {
            success: true,
            message: "Role user berhasil diupdate",
            data: data
        };
    } catch (error) {
        console.error("Error in update-role-user API:", error);

        // Jika sudah error yang dibuat dengan createError, lempar ulang
        if (error.statusCode) {
            throw error;
        }

        // Jika error lain, buat error generic
        throw createError({
            statusCode: 500,
            statusMessage: "Terjadi kesalahan internal server"
        });
    }
});
