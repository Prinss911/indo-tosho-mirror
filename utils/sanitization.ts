/**
 * Modul sanitasi terpusat untuk mencegah XSS dan memastikan keamanan input
 * Mengkonsolidasi fungsi sanitasi dari berbagai file untuk konsistensi
 */

// Import DOMPurify untuk server-side sanitization
let DOMPurify: any = null;

// Load DOMPurify hanya di development atau jika tersedia
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
        DOMPurify = require('isomorphic-dompurify');
    } catch (error) {
        console.warn('DOMPurify not available, using fallback sanitization');
    }
}

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
 * Sanitize HTML content untuk mencegah XSS
 * Menggunakan DOMPurify jika tersedia, fallback ke manual sanitization
 */
export function sanitizeHtml(content: string): string {
    if (!content) return "";

    // Jika DOMPurify tersedia, gunakan untuk sanitization
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
        try {
            const cleanContent = DOMPurify.sanitize(content, {
                ALLOWED_TAGS: [], // Tidak ada HTML tags yang diizinkan
                ALLOWED_ATTR: [],
                KEEP_CONTENT: true // Tetap simpan text content
            });
            return cleanContent.trim();
        } catch (error) {
            console.warn('DOMPurify sanitization failed, using fallback:', error);
        }
    }

    // Fallback sanitization untuk environment yang tidak mendukung DOMPurify
    return fallbackSanitizeHtml(content);
}

/**
 * Fallback sanitization function untuk environment tanpa DOMPurify
 * Menghapus HTML tags dan karakter berbahaya
 */
function fallbackSanitizeHtml(content: string): string {
    if (!content) return "";

    return content
        // Hapus semua HTML tags
        .replace(/<[^>]*>/g, '')
        // Hapus script tags dan content
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        // Hapus style tags dan content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Decode HTML entities yang umum
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        // Hapus karakter control yang berbahaya
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Trim whitespace
        .trim();
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
            // Trim whitespace
            .trim()
    );
}

/**
 * Sanitize textarea content
 * @param content - Content yang akan disanitasi
 * @returns Content yang sudah disanitasi
 */
export function sanitizeTextarea(content: string): string {
    if (!content || typeof content !== "string") return "";

    return (
        content
            // Remove dangerous HTML tags but keep basic formatting
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
            .replace(/javascript:/gi, "")
            .replace(/vbscript:/gi, "")
            // Trim whitespace
            .trim()
    );
}

/**
 * Sanitize object dengan berbagai tipe field
 * @param obj - Object yang akan disanitasi
 * @param fieldTypes - Mapping field ke tipe sanitasi
 * @returns Object yang sudah disanitasi
 */
export function sanitizeObject<T extends Record<string, any>>(
    obj: T,
    fieldTypes: Record<keyof T, "input" | "email" | "username" | "url" | "search" | "textarea" | "html">
): T {
    const sanitized = { ...obj };

    for (const [field, type] of Object.entries(fieldTypes)) {
        const value = sanitized[field as keyof T];
        if (value !== undefined && value !== null) {
            switch (type) {
                case "input":
                    sanitized[field as keyof T] = sanitizeInput(String(value)) as T[keyof T];
                    break;
                case "email":
                    sanitized[field as keyof T] = sanitizeEmail(String(value)) as T[keyof T];
                    break;
                case "username":
                    sanitized[field as keyof T] = sanitizeUsername(String(value)) as T[keyof T];
                    break;
                case "url":
                    sanitized[field as keyof T] = sanitizeUrl(String(value)) as T[keyof T];
                    break;
                case "search":
                    sanitized[field as keyof T] = sanitizeSearchQuery(String(value)) as T[keyof T];
                    break;
                case "textarea":
                    sanitized[field as keyof T] = sanitizeTextarea(String(value)) as T[keyof T];
                    break;
                case "html":
                    sanitized[field as keyof T] = sanitizeHtml(String(value)) as T[keyof T];
                    break;
            }
        }
    }

    return sanitized;
}

/**
 * Validate dan sanitize form data
 * @param formData - Data form yang akan divalidasi dan disanitasi
 * @returns Data form yang sudah divalidasi dan disanitasi
 */
export function validateAndSanitizeForm(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
        if (value !== undefined && value !== null) {
            // Tentukan tipe sanitasi berdasarkan nama field
            if (key.toLowerCase().includes('email')) {
                sanitized[key] = sanitizeEmail(String(value));
            } else if (key.toLowerCase().includes('username')) {
                sanitized[key] = sanitizeUsername(String(value));
            } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
                sanitized[key] = sanitizeUrl(String(value));
            } else if (key.toLowerCase().includes('search') || key.toLowerCase().includes('query')) {
                sanitized[key] = sanitizeSearchQuery(String(value));
            } else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('content')) {
                sanitized[key] = sanitizeTextarea(String(value));
            } else {
                sanitized[key] = sanitizeInput(String(value));
            }
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Sanitize error messages untuk mencegah information disclosure
 * Mengkonsolidasi fungsi sanitizeAuthError dari berbagai file
 */
export function sanitizeAuthError(error: any): string {
    const message = error?.message || error || "Authentication failed";

    // Map specific errors to generic messages
    const errorMappings: Record<string, string> = {
        "Invalid login credentials": "Email atau password salah",
        "Email not confirmed": "Email belum diverifikasi",
        "User not found": "Email atau password salah",
        "Invalid email": "Format email tidak valid",
        "Password should be at least": "Password tidak memenuhi persyaratan keamanan",
        "User already registered": "Email sudah terdaftar",
        "Signup disabled": "Registrasi sedang ditutup",
        "Email rate limit exceeded": "Terlalu banyak percobaan. Coba lagi nanti",
        "Token has expired": "Kode verifikasi telah kedaluwarsa",
        "Invalid token": "Kode verifikasi tidak valid"
    };

    // Check for mapped errors
    for (const [key, value] of Object.entries(errorMappings)) {
        if (message.includes(key)) {
            return value;
        }
    }

    // Default generic message
    return "Terjadi kesalahan. Silakan coba lagi";
}

/**
 * Sanitize error messages secara umum
 * @param error - Error yang akan disanitasi
 * @returns Error message yang sudah disanitasi
 */
export function sanitizeError(error: any): string {
    if (!error) return "Terjadi kesalahan yang tidak diketahui";
    
    const message = error?.message || error?.toString() || "Terjadi kesalahan";
    
    // Remove sensitive information
    return message
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_ADDRESS]') // IP addresses
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email addresses
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[UUID]') // UUIDs
        .replace(/password/gi, '[PASSWORD]') // Password references
        .replace(/token/gi, '[TOKEN]') // Token references
        .trim();
}

// Export semua fungsi untuk kompatibilitas dengan file lama
export {
    sanitizeInput as sanitizeString,
    sanitizeHtml as sanitizeContent,
    fallbackSanitizeHtml
};

// Type definitions untuk sanitization options
export interface SanitizationOptions {
    allowHtml?: boolean;
    allowedTags?: string[];
    allowedAttributes?: string[];
    maxLength?: number;
    trimWhitespace?: boolean;
}

/**
 * Advanced sanitization dengan opsi kustomisasi
 * @param input - Input yang akan disanitasi
 * @param options - Opsi sanitasi
 * @returns Input yang sudah disanitasi
 */
export function sanitizeWithOptions(input: string, options: SanitizationOptions = {}): string {
    if (!input || typeof input !== "string") return "";
    
    const {
        allowHtml = false,
        allowedTags = [],
        allowedAttributes = [],
        maxLength,
        trimWhitespace = true
    } = options;
    
    let result = input;
    
    // Trim whitespace if enabled
    if (trimWhitespace) {
        result = result.trim();
    }
    
    // Limit length if specified
    if (maxLength && result.length > maxLength) {
        result = result.substring(0, maxLength);
    }
    
    // Sanitize based on HTML allowance
    if (allowHtml && allowedTags.length > 0) {
        // Use DOMPurify with allowed tags if available
        if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
            try {
                result = DOMPurify.sanitize(result, {
                    ALLOWED_TAGS: allowedTags,
                    ALLOWED_ATTR: allowedAttributes,
                    KEEP_CONTENT: true
                });
            } catch (error) {
                console.warn('DOMPurify sanitization failed, using fallback:', error);
                result = sanitizeInput(result);
            }
        } else {
            result = sanitizeInput(result);
        }
    } else {
        result = sanitizeInput(result);
    }
    
    return result;
}