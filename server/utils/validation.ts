import { z } from "zod";
import { createError, getHeader } from "h3";
import { sanitizeHtml, sanitizeInput, sanitizeObject } from "~/utils/sanitization";

// Schema validasi untuk Post data
export const PostValidationSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters")
        .regex(/^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{M}]+$/u, "Title contains invalid characters"),

    titleEnglish: z
        .string()
        .max(200, "English title must be less than 200 characters")
        .regex(/^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{M}]*$/u, "English title contains invalid characters")
        .optional()
        .or(z.literal("").transform(() => undefined)),

    episodes: z
        .number()
        .int("Episodes must be an integer")
        .min(1, "Episodes must be at least 1")
        .max(10000, "Episodes must be less than 10000"),

    year: z
        .number()
        .int("Year must be an integer")
        .min(1900, "Year must be 1900 or later")
        .max(new Date().getFullYear() + 5, "Year cannot be more than 5 years in the future"),

    rating: z.number().min(0, "Rating must be at least 0").max(10, "Rating must be at most 10"),

    category: z.string().uuid("Category ID must be a valid UUID"),

    status: z.string().min(1, "Status is required").max(50, "Status must be less than 50 characters"),

    cover: z.string().url("Cover must be a valid URL").optional().or(z.literal("").transform(() => undefined)),

    description: z.string().max(5000, "Description must be less than 5000 characters").optional().or(z.literal("").transform(() => undefined)),

    postDescription: z.string().max(2000, "Post description must be less than 2000 characters").optional().or(z.literal("").transform(() => undefined)),

    genres: z.array(z.string()).max(20, "Maximum 20 genres allowed").optional().or(z.literal(null).transform(() => undefined)),

    malId: z.number().int("MAL ID must be an integer").positive("MAL ID must be positive").optional().or(z.literal(null).transform(() => undefined)),

    releaseFileName: z
        .string()
        .max(255, "Release file name must be less than 255 characters")
        .regex(/^[\p{L}\p{N}\p{P}\p{S}\p{Z}\p{M}\\\/:]+$/u, "Invalid file name format")
        .optional()
        .or(z.literal("").transform(() => undefined)),

    downloadLinks: z
        .array(
            z.object({
                url: z.string().url("Download link must be a valid URL"),
                hosting: z.string().min(1, "Hosting is required").max(50, "Hosting must be less than 50 characters"),
                quality: z.string().max(20, "Quality must be less than 20 characters").optional().or(z.literal("").transform(() => undefined))
            })
        )
        .max(10, "Maximum 10 download links allowed")
        .optional()
        .or(z.literal(null).transform(() => undefined)),

    subtitleType: z.string().max(50, "Subtitle type must be less than 50 characters").optional().or(z.literal("").transform(() => undefined)),

    submitterName: z.string().max(100, "Submitter name must be less than 100 characters").optional().or(z.literal("").transform(() => undefined)),

    statusApproval: z.enum(["pending", "published", "rejected"]).optional(),

    // Additional fields that may be sent from frontend
    submitterId: z.string().uuid("Submitter ID must be a valid UUID").optional(),
    views: z.number().min(0, "Views must be non-negative").optional(),
    downloads: z.number().min(0, "Downloads must be non-negative").optional(),
    likes: z.number().min(0, "Likes must be non-negative").optional(),
    createdAt: z.string().datetime("Invalid datetime format").optional(),
    updatedAt: z.string().datetime("Invalid datetime format").optional()
});

// Schema untuk update (semua field optional kecuali yang required)
export const PostUpdateValidationSchema = PostValidationSchema.partial();

// Schema untuk ID validation
export const UUIDSchema = z.string().uuid("Invalid UUID format");

// Sanitization functions are now imported from ~/utils/sanitization
// This eliminates code duplication and centralizes sanitization logic

/**
 * Sanitize dan validate post data
 */
export function validateAndSanitizePostData(data: any, isUpdate: boolean = false) {
    // Log input data untuk debugging (tanpa data sensitif)
    console.log('[VALIDATION] Input data keys:', Object.keys(data || {}));
    console.log('[VALIDATION] Is update operation:', isUpdate);
    
    // Validasi input data tidak null/undefined
    if (!data || typeof data !== 'object') {
        console.error('[VALIDATION] Invalid input data:', typeof data);
        throw createError({
            statusCode: 400,
            statusMessage: "Validation Error",
            data: {
                message: "Input data is required and must be an object",
                errors: [{ field: "root", message: "Invalid input data format", code: "invalid_type" }]
            }
        });
    }

    // Pilih schema yang sesuai
    const schema = isUpdate ? PostUpdateValidationSchema : PostValidationSchema;

    // Pre-check untuk field wajib pada create operation
    if (!isUpdate) {
        const requiredFields = [
            { field: 'title', value: data.title, message: 'Title is required and cannot be empty' },
            { field: 'category', value: data.category, message: 'Category is required' },
            { field: 'episodes', value: data.episodes, message: 'Episodes is required' },
            { field: 'year', value: data.year, message: 'Year is required' },
            { field: 'rating', value: data.rating, message: 'Rating is required' }
        ];

        const missingFields = [];
        for (const { field, value, message } of requiredFields) {
            if (field === 'title' && (!value || typeof value !== 'string' || value.trim() === '')) {
                console.error(`[VALIDATION] ${field} is required but received:`, typeof value, value);
                missingFields.push({ field, message, code: 'required' });
            } else if (field !== 'title' && (value === undefined || value === null || value === '')) {
                console.error(`[VALIDATION] ${field} is required but received:`, typeof value, value);
                missingFields.push({ field, message, code: 'required' });
            }
        }

        if (missingFields.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: "Validation Error",
                data: {
                    message: "Required fields are missing",
                    errors: missingFields,
                    totalErrors: missingFields.length,
                    failedFields: missingFields.map(f => f.field)
                }
            });
        }
    }

    // Sanitize string fields dengan null/undefined handling yang lebih baik
    const sanitizedData = {
        ...data,
        title: (data.title && typeof data.title === 'string') ? sanitizeHtml(data.title.trim()) : data.title,
        titleEnglish: (data.titleEnglish && typeof data.titleEnglish === 'string') ? sanitizeHtml(data.titleEnglish) : data.titleEnglish,
        description: (data.description && typeof data.description === 'string') ? sanitizeHtml(data.description) : data.description,
        postDescription: (data.postDescription && typeof data.postDescription === 'string') ? sanitizeHtml(data.postDescription) : data.postDescription,
        releaseFileName: (data.releaseFileName && typeof data.releaseFileName === 'string') ? sanitizeHtml(data.releaseFileName) : data.releaseFileName,
        submitterName: (data.submitterName && typeof data.submitterName === 'string') ? sanitizeHtml(data.submitterName) : data.submitterName,
        status: (data.status && typeof data.status === 'string') ? sanitizeHtml(data.status) : data.status,
        subtitleType: (data.subtitleType && typeof data.subtitleType === 'string') ? sanitizeHtml(data.subtitleType) : data.subtitleType,
        // Sanitize downloadLinks array dengan validasi yang lebih ketat
        downloadLinks: (() => {
            if (!data.downloadLinks) {
                return data.downloadLinks; // undefined, null, atau empty
            }
            if (!Array.isArray(data.downloadLinks)) {
                console.warn('[VALIDATION] downloadLinks is not an array:', typeof data.downloadLinks);
                return data.downloadLinks;
            }
            return data.downloadLinks.map((link: any, index: number) => {
                if (!link || typeof link !== 'object') {
                    console.warn(`[VALIDATION] Invalid downloadLink at index ${index}:`, typeof link);
                    return link;
                }
                return {
                    url: (link.url && typeof link.url === 'string') ? sanitizeHtml(link.url.trim()) : link.url,
                    hosting: (link.hosting && typeof link.hosting === 'string') ? sanitizeHtml(link.hosting.trim()) : link.hosting,
                    quality: (link.quality && typeof link.quality === 'string') ? sanitizeHtml(link.quality.trim()) : link.quality,
                    size: (link.size && typeof link.size === 'string') ? sanitizeHtml(link.size.trim()) : link.size
                };
            });
        })(),
        // Sanitize genres array dengan validasi yang lebih ketat
        genres: (() => {
            if (!data.genres) {
                return data.genres; // undefined, null, atau empty
            }
            if (!Array.isArray(data.genres)) {
                console.warn('[VALIDATION] genres is not an array:', typeof data.genres);
                return data.genres;
            }
            return data.genres.map((genre: any, index: number) => {
                if (typeof genre !== 'string') {
                    console.warn(`[VALIDATION] Invalid genre at index ${index}:`, typeof genre);
                    return genre;
                }
                return sanitizeHtml(genre.trim());
            }).filter((genre: string) => genre && genre.length > 0); // Remove empty genres
        })()
    };

    // Log sanitized data untuk debugging
    console.log('[VALIDATION] Sanitized data keys:', Object.keys(sanitizedData));
    console.log('[VALIDATION] Critical fields check:', {
        hasTitle: !!sanitizedData.title,
        hasCategory: !!sanitizedData.category,
        hasEpisodes: sanitizedData.episodes !== undefined,
        hasYear: sanitizedData.year !== undefined,
        hasRating: sanitizedData.rating !== undefined,
        downloadLinksType: Array.isArray(sanitizedData.downloadLinks) ? 'array' : typeof sanitizedData.downloadLinks,
        genresType: Array.isArray(sanitizedData.genres) ? 'array' : typeof sanitizedData.genres
    });

    // Validate dengan Zod
    const result = schema.safeParse(sanitizedData);

    if (!result.success) {
        // Log detailed validation errors untuk debugging
        console.error('[VALIDATION] Validation failed with errors:', result.error.issues);
        
        // Safely handle Zod error structure dengan informasi yang lebih detail
        const errors = result.error?.issues?.map(err => {
            const field = err.path?.join(".") || "unknown";
            const message = err.message || "Validation failed";
            const code = err.code || "unknown";
            const receivedValue = (err as any).received !== undefined ? (err as any).received : 'undefined';
            
            console.error(`[VALIDATION] Field '${field}' failed: ${message} (received: ${receivedValue})`);
            
            return {
                field,
                message,
                code,
                received: receivedValue
            };
        }) || [{ field: "unknown", message: "Validation failed", code: "unknown", received: 'undefined' }];

        // Log summary of validation errors
        console.error('[VALIDATION] Total validation errors:', errors.length);
        console.error('[VALIDATION] Failed fields:', errors.map(e => e.field).join(', '));

        throw createError({
            statusCode: 400,
            statusMessage: "Validation Error",
            data: {
                message: "Input validation failed",
                errors: errors,
                totalErrors: errors.length,
                failedFields: errors.map(e => e.field)
            }
        });
    }

    console.log('[VALIDATION] Validation successful');

    return result.data;
}

/**
 * Validate UUID parameter
 */
export function validateUUID(id: string, fieldName: string = "ID") {
    const result = UUIDSchema.safeParse(id);

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid ID Format",
            data: {
                message: `${fieldName} must be a valid UUID`,
                field: fieldName.toLowerCase()
            }
        });
    }

    return result.data;
}

/**
 * Validate request method
 */
export function validateMethod(event: any, allowedMethods: string[]) {
    const method = event.node.req.method;

    if (!allowedMethods.includes(method)) {
        throw createError({
            statusCode: 405,
            statusMessage: "Method Not Allowed",
            data: {
                message: `Method ${method} is not allowed`,
                allowedMethods: allowedMethods
            }
        });
    }

    return method;
}

/**
 * Validate content length untuk mencegah payload yang terlalu besar
 */
export function validateContentLength(event: any, maxSize: number = 1024 * 1024) {
    // Default 1MB
    const contentLength = getHeader(event, "content-length");

    if (contentLength && parseInt(contentLength) > maxSize) {
        throw createError({
            statusCode: 413,
            statusMessage: "Payload Too Large",
            data: {
                message: `Request payload exceeds maximum size of ${maxSize} bytes`,
                maxSize: maxSize
            }
        });
    }
}

/**
 * Validate dan sanitize query parameters
 */
export function validateQueryParams(query: any, allowedParams: string[]) {
    const sanitizedQuery: Record<string, any> = {};

    for (const [key, value] of Object.entries(query)) {
        if (allowedParams.includes(key)) {
            // Sanitize query parameter values
            if (typeof value === "string") {
                sanitizedQuery[key] = sanitizeHtml(value);
            } else {
                sanitizedQuery[key] = value;
            }
        }
    }

    return sanitizedQuery;
}

/**
 * Rate limiting validation helper
 */
export function validateRateLimit(rateLimitResult: any) {
    if (!rateLimitResult.allowed) {
        throw createError({
            statusCode: 429,
            statusMessage: "Too Many Requests",
            data: {
                message: "Rate limit exceeded",
                retryAfter: rateLimitResult.retryAfter
            }
        });
    }
}
