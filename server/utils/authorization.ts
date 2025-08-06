import { serverSupabaseClient } from "#supabase/server";

/**
 * Interface untuk user context
 */
export interface UserContext {
    id: string;
    email?: string;
    role?: string;
}

/**
 * Interface untuk ownership check result
 */
export interface OwnershipResult {
    isOwner: boolean;
    isAdmin: boolean;
    canAccess: boolean;
    user?: UserContext;
}

/**
 * Get authenticated user dari request
 */
export async function getAuthenticatedUser(event: any): Promise<UserContext | null> {
    try {
        const supabase = await serverSupabaseClient(event);

        const {
            data: { user },
            error
        } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        // Get user profile untuk mendapatkan role
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.warn("Failed to get user profile:", profileError);
        }

        // Set user context di event untuk digunakan oleh rate limiter
        event.context.userId = user.id;

        return {
            id: user.id,
            email: user.email,
            role: profile?.role || "user"
        };
    } catch (error) {
        console.error("Error getting authenticated user:", error);
        return null;
    }
}

/**
 * Require authentication - throw error jika tidak terautentikasi
 */
export async function requireAuthentication(event: any): Promise<UserContext> {
    const user = await getAuthenticatedUser(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            data: {
                message: "Authentication required",
                code: "AUTH_REQUIRED"
            }
        });
    }

    return user;
}

/**
 * Require admin role - throw error jika bukan admin
 */
export async function requireAdmin(event: any): Promise<UserContext> {
    const user = await requireAuthentication(event);

    if (user.role !== "admin") {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            data: {
                message: "Admin privileges required",
                code: "ADMIN_REQUIRED"
            }
        });
    }

    return user;
}

/**
 * Check ownership of a post
 */
export async function checkPostOwnership(event: any, postId: string): Promise<OwnershipResult> {
    const user = await getAuthenticatedUser(event);

    if (!user) {
        return {
            isOwner: false,
            isAdmin: false,
            canAccess: false
        };
    }

    const isAdmin = user.role === "admin";

    try {
        const supabase = await serverSupabaseClient(event);

        // Get post data untuk check ownership
        const { data: post, error } = await supabase.from("posts").select("submitter_id").eq("id", postId).single();

        if (error) {
            if (error.code === "PGRST116") {
                throw createError({
                    statusCode: 404,
                    statusMessage: "Post Not Found",
                    data: {
                        message: "The requested post does not exist",
                        code: "POST_NOT_FOUND"
                    }
                });
            }
            throw error;
        }

        const isOwner = post.submitter_id === user.id;
        const canAccess = isOwner || isAdmin;

        return {
            isOwner,
            isAdmin,
            canAccess,
            user
        };
    } catch (error) {
        console.error("Error checking post ownership:", error);
        throw error;
    }
}

/**
 * Require post ownership atau admin - throw error jika tidak memiliki akses
 */
export async function requirePostAccess(event: any, postId: string): Promise<OwnershipResult> {
    const ownershipResult = await checkPostOwnership(event, postId);

    if (!ownershipResult.canAccess) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            data: {
                message: "You do not have permission to access this post",
                code: "ACCESS_DENIED"
            }
        });
    }

    return ownershipResult;
}

/**
 * Check if user can create posts (authenticated users only)
 */
export async function canCreatePost(event: any): Promise<UserContext> {
    const user = await requireAuthentication(event);

    // Additional checks bisa ditambahkan di sini
    // Misalnya: check if user is banned, has verified email, etc.

    return user;
}

/**
 * Check if user can update post (owner atau admin)
 */
export async function canUpdatePost(event: any, postId: string): Promise<OwnershipResult> {
    return await requirePostAccess(event, postId);
}

/**
 * Check if user can delete post (owner atau admin)
 */
export async function canDeletePost(event: any, postId: string): Promise<OwnershipResult> {
    return await requirePostAccess(event, postId);
}

/**
 * Check if user can approve/reject posts (admin only)
 */
export async function canModeratePost(event: any): Promise<UserContext> {
    return await requireAdmin(event);
}

/**
 * Validate post status approval permissions
 */
export async function validateStatusApprovalPermission(event: any, statusApproval?: string): Promise<void> {
    if (!statusApproval) return;

    // Only admins can set status to 'published' or 'rejected'
    if (statusApproval === "published" || statusApproval === "rejected") {
        await requireAdmin(event);
    }

    // Regular users can only set to 'pending'
    if (statusApproval !== "pending" && statusApproval !== "published" && statusApproval !== "rejected") {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid Status",
            data: {
                message: "Invalid status approval value",
                allowedValues: ["pending", "published", "rejected"],
                code: "INVALID_STATUS"
            }
        });
    }
}

/**
 * Log security events untuk audit trail
 */
export function logSecurityEvent(event: any, action: string, details: any = {}) {
    const timestamp = new Date().toISOString();
    const ip = getClientIP(event);
    const userAgent = getHeader(event, "user-agent") || "unknown";

    console.log(`[SECURITY] ${timestamp} - ${action}`, {
        ip,
        userAgent,
        userId: event.context.userId,
        ...details
    });
}

/**
 * Get client IP address
 */
function getClientIP(event: any): string {
    const forwarded = getHeader(event, "x-forwarded-for");
    const realIp = getHeader(event, "x-real-ip");
    const cfConnectingIp = getHeader(event, "cf-connecting-ip");

    if (cfConnectingIp) return cfConnectingIp;
    if (realIp) return realIp;
    if (forwarded) return forwarded.split(",")[0].trim();

    return event.node.req.socket?.remoteAddress || "unknown";
}

/**
 * Middleware untuk menambahkan security headers
 */
export function addSecurityHeaders(event: any) {
    // Prevent clickjacking
    setHeader(event, "X-Frame-Options", "DENY");

    // Prevent MIME type sniffing
    setHeader(event, "X-Content-Type-Options", "nosniff");

    // Enable XSS protection
    setHeader(event, "X-XSS-Protection", "1; mode=block");

    // Referrer policy
    setHeader(event, "Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy (basic)
    setHeader(event, "Content-Security-Policy", "default-src 'self'");
}
