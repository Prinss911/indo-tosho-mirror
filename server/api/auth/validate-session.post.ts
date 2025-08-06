import { isSessionValid, updateSessionActivity } from "~/server/utils/auth-security";
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
        console.log("[API] Processing session validation request");
        
        let body;
        try {
            body = await readBody(event);
            console.log("[API] Session validation body received");
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

        console.log("[API] Attempting to validate session:", sessionId.substring(0, 8) + '...');
        
        // Check if session is valid
        const isValid = isSessionValid(sessionId);
        
        console.log("[API] Session validation result:", isValid);

        if (isValid) {
            // Update session activity
            const updated = updateSessionActivity(sessionId, event);
            
            console.log("[API] Session activity updated:", updated);

            return {
                valid: updated
            };
        }

        return {
            valid: false
        };
    } catch (error) {
        console.error("[API] Error in session validation:", error);
        
        if (error.statusCode) {
            throw error;
        }
        
        return {
            valid: false
        };
    }
});
