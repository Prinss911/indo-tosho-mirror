import { validatePassword } from "~/server/utils/auth-security";

export default defineEventHandler(async event => {
    try {
        const body = await readBody(event);
        const { password } = body;

        if (!password) {
            throw createError({
                statusCode: 400,
                statusMessage: "Password is required"
            });
        }

        const validation = validatePassword(password);

        return {
            isValid: validation.isValid,
            errors: validation.errors,
            strength: validation.strength,
            score: validation.score
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to validate password"
        });
    }
});
