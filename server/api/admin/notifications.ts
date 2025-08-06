import { createClient } from "@supabase/supabase-js";
import { validateMethod, validateContentLength } from "~/server/utils/validation";
import { addSecurityHeaders, logSecurityEvent } from "~/server/utils/authorization";

export default defineEventHandler(async event => {
    // Add security headers
    addSecurityHeaders(event);
    
    const method = getMethod(event);
    const config = useRuntimeConfig();

    // Validate HTTP method
    validateMethod(event, ["GET", "POST", "DELETE"]);
    
    // Validate content length for write operations
    if (method === "POST" || method === "DELETE") {
        validateContentLength(event, 1024 * 1024); // 1MB max
    }

    // Validate that service role key is available
    const serviceRoleKey = config.supabaseServiceKey;
    if (!serviceRoleKey) {
        console.error("[API] Service role key not found in environment variables");
        throw createError({
            statusCode: 500,
            statusMessage: "Server configuration error"
        });
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(config.public.supabase.url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        if (method === "GET") {
            const query = getQuery(event);
            const pageLocation = query.page || "all";
            const showAll = query.showAll === "true";

            if (showAll) {
                // Get all notifications for admin management
                const { data, error } = await supabase
                    .from("admin_notifications")
                    .select("*")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching notifications:", error);
                    return {
                        success: false,
                        error: "Failed to fetch notifications"
                    };
                }

                return {
                    success: true,
                    data: data || []
                };
            } else {
                // Get single notification for specific page or all pages
                const { data, error } = await supabase
                    .from("admin_notifications")
                    .select("*")
                    .eq("is_active", true)
                    .in("page_location", [pageLocation, "all"])
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error("Error fetching notification:", error);
                    return {
                        success: false,
                        error: "Failed to fetch notification"
                    };
                }

                return {
                    success: true,
                    data: data || null
                };
            }
        }

        if (method === "POST") {
            const body = await readBody(event);
            const { message, type = "info", page_location = "all", is_active = true } = body;

            if (!message) {
                return {
                    success: false,
                    error: "Message is required"
                };
            }

            // Deactivate all existing notifications first
            await supabase.from("admin_notifications").update({ is_active: false }).eq("is_active", true);

            // Insert new notification
            const { data, error } = await supabase
                .from("admin_notifications")
                .insert({
                    message,
                    type,
                    page_location,
                    is_active,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating notification:", error);
                return {
                    success: false,
                    error: "Failed to create notification"
                };
            }

            return {
                success: true,
                data,
                message: "Notification created successfully"
            };
        }

        if (method === "DELETE") {
            console.log("[API] Processing DELETE request for notifications");
            
            // Get ID from query parameters instead of body for DELETE requests
            const query = getQuery(event);
            const { id } = query;
            
            console.log("[API] DELETE query received:", query);

            if (!id || typeof id !== 'string') {
                console.error("[API] Missing or invalid notification ID in DELETE request");
                throw createError({
                    statusCode: 400,
                    statusMessage: "Notification ID is required as query parameter"
                });
            }

            console.log("[API] Attempting to delete notification with ID:", id);

            // Delete specific notification by ID
            const { data, error } = await supabase
                .from("admin_notifications")
                .delete()
                .eq("id", id)
                .select();

            if (error) {
                console.error("[API] Supabase error deleting notification:", error);
                logSecurityEvent(event, "notification_delete_failed", { id, error: error.message });
                throw createError({
                    statusCode: 500,
                    statusMessage: "Failed to delete notification"
                });
            }

            if (!data || data.length === 0) {
                console.warn("[API] No notification found with ID:", id);
                throw createError({
                    statusCode: 404,
                    statusMessage: "Notification not found"
                });
            }

            console.log("[API] Notification deleted successfully:", id);
            logSecurityEvent(event, "notification_deleted", { id });

            return {
                success: true,
                message: "Notification deleted successfully",
                data: data[0]
            };
        }

        return {
            success: false,
            error: "Method not allowed"
        };
    } catch (error) {
        console.error("API Error:", error);
        return {
            success: false,
            error: "Internal server error"
        };
    }
});
