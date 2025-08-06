import { invalidateSession } from "~/server/utils/auth-security";
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
        console.log("[API] Processing session invalidation request");
        
        let body;
        try {
            body = await readBody(event);
            console.log("[API] Session invalidation body received");
        } catch (error) {
            console.error("[API] Error reading request body:", error);
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid request body"
            });
        }
        
        const { sessionId } = body;

        if (!sessionId || typeof sessionId !== 'string') {
            console.error("[API] Missing or invalid session ID");
            throw createError({
                statusCode: 400,
                statusMessage: "Session ID is required"
            });
        }

        console.log("[API] Attempting to invalidate session:", sessionId.substring(0, 8) + '...');
        
        // Invalidate session
        invalidateSession(sessionId);
        
        // Log security event
        logSecurityEvent(event, "session_invalidated", { sessionId: sessionId.substring(0, 8) + '...' });
        
        console.log("[API] Session invalidated successfully");

        return {
            success: true
        };
    } catch (error) {
        console.error("[API] Error in session invalidation:", error);
        
        if (error.statusCode) {
            throw error;
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to invalidate session"
        });
    }
});
