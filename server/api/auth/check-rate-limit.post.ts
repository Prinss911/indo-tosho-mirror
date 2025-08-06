import { checkAuthRateLimit } from "~/server/utils/auth-security";
import { getClientIP } from "~/server/utils/auth-security";

export default defineEventHandler(async event => {
    try {
        const body = await readBody(event);
        const { identifier, type = "login" } = body;

        if (!identifier) {
            throw createError({
                statusCode: 400,
                statusMessage: "Identifier is required"
            });
        }

        // Use IP + identifier for rate limiting key
        const clientIP = getClientIP(event);
        const rateLimitKey = `${type}_${clientIP}_${identifier}`;

        const result = checkAuthRateLimit(rateLimitKey);

        return {
            allowed: result.allowed,
            remainingAttempts: result.remainingAttempts
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to check rate limit"
        });
    }
});
