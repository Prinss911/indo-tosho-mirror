import { LRUCache } from "lru-cache";

// Interface untuk rate limiter options
interface RateLimiterOptions {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    keyGenerator?: (event: any) => string; // Custom key generator
}

// Interface untuk rate limit info
interface RateLimitInfo {
    count: number;
    resetTime: number;
}

// Default rate limiter configurations
export const RATE_LIMIT_CONFIGS = {
    // Strict limits for write operations (POST, PUT, DELETE)
    WRITE_OPERATIONS: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10 // 10 requests per minute
    },
    // More lenient for read operations (GET)
    READ_OPERATIONS: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100 // 100 requests per minute
    },
    // Very strict for sensitive operations
    SENSITIVE_OPERATIONS: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5 // 5 requests per minute
    }
} as const;

// LRU Cache untuk menyimpan rate limit data
const rateLimitCache = new LRUCache<string, RateLimitInfo>({
    max: 10000, // Maximum 10k entries
    ttl: 60 * 60 * 1000 // 1 hour TTL
});

/**
 * Default key generator - menggunakan IP address
 */
function defaultKeyGenerator(event: any): string {
    // Try to get real IP from various headers
    const forwarded = getHeader(event, "x-forwarded-for");
    const realIp = getHeader(event, "x-real-ip");
    const cfConnectingIp = getHeader(event, "cf-connecting-ip");

    let ip = event.node.req.socket?.remoteAddress || "unknown";

    if (cfConnectingIp) {
        ip = cfConnectingIp;
    } else if (realIp) {
        ip = realIp;
    } else if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        ip = forwarded.split(",")[0].trim();
    }

    return `rate_limit:${ip}`;
}

/**
 * Rate limiter utility function
 */
export function createRateLimiter(options: RateLimiterOptions) {
    const { windowMs, maxRequests, keyGenerator = defaultKeyGenerator } = options;

    return function rateLimitMiddleware(event: any) {
        const key = keyGenerator(event);
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get current rate limit info
        let rateLimitInfo = rateLimitCache.get(key);

        // Reset if window has expired
        if (!rateLimitInfo || rateLimitInfo.resetTime <= now) {
            rateLimitInfo = {
                count: 0,
                resetTime: now + windowMs
            };
        }

        // Increment request count
        rateLimitInfo.count++;

        // Update cache
        rateLimitCache.set(key, rateLimitInfo);

        // Check if limit exceeded
        if (rateLimitInfo.count > maxRequests) {
            const resetInSeconds = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

            throw createError({
                statusCode: 429,
                statusMessage: "Too Many Requests",
                data: {
                    error: "Rate limit exceeded",
                    retryAfter: resetInSeconds,
                    limit: maxRequests,
                    windowMs: windowMs
                }
            });
        }

        // Add rate limit headers
        setHeader(event, "X-RateLimit-Limit", maxRequests.toString());
        setHeader(event, "X-RateLimit-Remaining", (maxRequests - rateLimitInfo.count).toString());
        setHeader(event, "X-RateLimit-Reset", Math.ceil(rateLimitInfo.resetTime / 1000).toString());

        return {
            allowed: true,
            count: rateLimitInfo.count,
            remaining: maxRequests - rateLimitInfo.count,
            resetTime: rateLimitInfo.resetTime
        };
    };
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
    writeOperations: createRateLimiter(RATE_LIMIT_CONFIGS.WRITE_OPERATIONS),
    readOperations: createRateLimiter(RATE_LIMIT_CONFIGS.READ_OPERATIONS),
    sensitiveOperations: createRateLimiter(RATE_LIMIT_CONFIGS.SENSITIVE_OPERATIONS)
};

/**
 * User-specific rate limiter (requires authentication)
 */
export function createUserRateLimiter(options: RateLimiterOptions) {
    return createRateLimiter({
        ...options,
        keyGenerator: (event: any) => {
            // This will be set by the auth middleware
            const userId = event.context.userId;
            if (!userId) {
                // Fallback to IP-based limiting for unauthenticated users
                return defaultKeyGenerator(event);
            }
            return `user_rate_limit:${userId}`;
        }
    });
}

/**
 * Rate limiter for specific endpoints
 */
export const endpointRateLimiters = {
    // Posts API rate limiters
    postsCreate: createUserRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5 // 5 posts per minute
    }),
    postsUpdate: createUserRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10 // 10 updates per minute
    }),
    postsDelete: createUserRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 3 // 3 deletes per minute
    }),
    postsRead: createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 200 // 200 reads per minute per IP
    })
};
