/**
 * Client-side input sanitization utilities
 * Untuk mencegah XSS dan memastikan input yang aman
 */

/**
 * Sanitize string input untuk mencegah XSS
 * @param input - String yang akan disanitasi
 * @returns String yang sudah disanitasi
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") return "";

    return (
        input
            // Remove HTML tags
            .replace(/<[^>]*>/g, "")
            // Escape special characters
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;")
            // Remove potential script injections
            .replace(/javascript:/gi, "")
            .replace(/vbscript:/gi, "")
            .replace(/onload/gi, "")
            .replace(/onerror/gi, "")
            .replace(/onclick/gi, "")
            .replace(/onmouseover/gi, "")
            // Trim whitespace
            .trim()
    );
}

/**
 * Sanitize email input
 * @param email - Email yang akan disanitasi
 * @returns Email yang sudah disanitasi
 */
export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== "string") return "";

    return email
        .toLowerCase()
        .replace(/[^a-z0-9@._-]/g, "")
        .trim();
}

/**
 * Sanitize username input
 * @param username - Username yang akan disanitasi
 * @returns Username yang sudah disanitasi
 */
export function sanitizeUsername(username: string): string {
    if (!username || typeof username !== "string") return "";

    return username.replace(/[^a-zA-Z0-9_-]/g, "").trim();
}

/**
 * Sanitize URL input
 * @param url - URL yang akan disanitasi
 * @returns URL yang sudah disanitasi
 */
export function sanitizeUrl(url: string): string {
    if (!url || typeof url !== "string") return "";

    // Remove dangerous protocols
    const sanitized = url
        .replace(/javascript:/gi, "")
        .replace(/vbscript:/gi, "")
        .replace(/data:/gi, "")
        .trim();

    // Ensure it starts with http:// or https://
    if (sanitized && !sanitized.match(/^https?:\/\//)) {
        return `https://${sanitized}`;
    }

    return sanitized;
}

/**
 * Sanitize search query input
 * @param query - Search query yang akan disanitasi
 * @returns Search query yang sudah disanitasi
 */
export function sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== "string") return "";

    return (
        query
            // Remove HTML tags
            .replace(/<[^>]*>/g, "")
            // Remove special characters that could be used for injection
            .replace(/[<>"'&]/g, "")
            // Remove SQL injection patterns
            .replace(/('|(\-\-)|(;)|(\|)|(\*)|(%))/g, "")
            // Limit length
            .substring(0, 100)
            .trim()
    );
}

/**
 * Sanitize textarea content (untuk deskripsi, komentar, dll)
 * @param content - Content yang akan disanitasi
 * @returns Content yang sudah disanitasi
 */
export function sanitizeTextarea(content: string): string {
    if (!content || typeof content !== "string") return "";

    return (
        content
            // Remove script tags completely
            .replace(/<script[^>]*>.*?<\/script>/gi, "")
            // Remove dangerous HTML tags
            .replace(/<(iframe|object|embed|form|input|button)[^>]*>.*?<\/\1>/gi, "")
            // Remove event handlers
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
            // Remove javascript: and vbscript: protocols
            .replace(/(javascript|vbscript):/gi, "")
            // Limit length untuk mencegah DoS
            .substring(0, 10000)
            .trim()
    );
}

/**
 * Sanitize object dengan multiple fields
 * @param obj - Object yang akan disanitasi
 * @param fieldTypes - Mapping field ke tipe sanitization
 * @returns Object yang sudah disanitasi
 */
export function sanitizeObject<T extends Record<string, any>>(
    obj: T,
    fieldTypes: Record<keyof T, "input" | "email" | "username" | "url" | "search" | "textarea">
): T {
    const sanitized = { ...obj };

    for (const [field, type] of Object.entries(fieldTypes)) {
        if (sanitized[field] && typeof sanitized[field] === "string") {
            switch (type) {
                case "input":
                    sanitized[field] = sanitizeInput(sanitized[field]);
                    break;
                case "email":
                    sanitized[field] = sanitizeEmail(sanitized[field]);
                    break;
                case "username":
                    sanitized[field] = sanitizeUsername(sanitized[field]);
                    break;
                case "url":
                    sanitized[field] = sanitizeUrl(sanitized[field]);
                    break;
                case "search":
                    sanitized[field] = sanitizeSearchQuery(sanitized[field]);
                    break;
                case "textarea":
                    sanitized[field] = sanitizeTextarea(sanitized[field]);
                    break;
            }
        }
    }

    return sanitized;
}

/**
 * Validate dan sanitize form data
 * @param formData - Data form yang akan divalidasi dan disanitasi
 * @returns Form data yang sudah disanitasi
 */
export function validateAndSanitizeForm(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === "string") {
            // Auto-detect field type berdasarkan nama field
            if (key.toLowerCase().includes("email")) {
                sanitized[key] = sanitizeEmail(value);
            } else if (key.toLowerCase().includes("username")) {
                sanitized[key] = sanitizeUsername(value);
            } else if (key.toLowerCase().includes("url") || key.toLowerCase().includes("link")) {
                sanitized[key] = sanitizeUrl(value);
            } else if (key.toLowerCase().includes("search") || key.toLowerCase().includes("query")) {
                sanitized[key] = sanitizeSearchQuery(value);
            } else if (
                key.toLowerCase().includes("description") ||
                key.toLowerCase().includes("content") ||
                key.toLowerCase().includes("comment")
            ) {
                sanitized[key] = sanitizeTextarea(value);
            } else {
                sanitized[key] = sanitizeInput(value);
            }
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
