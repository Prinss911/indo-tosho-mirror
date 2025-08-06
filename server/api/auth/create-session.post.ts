import { createSession, generateCSRFToken } from "~/server/utils/auth-security";

export default defineEventHandler(async event => {
    try {
        const body = await readBody(event);
        const { userId } = body;

        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: "User ID is required"
            });
        }

        // Create session
        const sessionId = createSession(userId, event);

        // Generate CSRF token
        const csrfToken = generateCSRFToken(sessionId);

        return {
            sessionId,
            csrfToken
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to create session"
        });
    }
});
