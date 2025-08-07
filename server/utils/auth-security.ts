import { H3Event } from "h3";
import { createHash, randomBytes } from "crypto";
import { LRUCache } from "lru-cache";

// CSRF Token Management
interface CSRFToken {
    token: string;
    timestamp: number;
    sessionId: string;
}

const csrfTokens = new LRUCache<string, CSRFToken>({
    max: 1000,
    ttl: 1000 * 60 * 60 // 1 hour
});

// Session Management
interface SessionInfo {
    userId: string;
    lastActivity: number;
    ipAddress: string;
    userAgent: string;
    isValid: boolean;
}

const activeSessions = new LRUCache<string, SessionInfo>({
    max: 10000,
    ttl: 1000 * 60 * 60 * 24 // 24 hours
});

// Rate limiting for auth operations
const authAttempts = new LRUCache<string, { count: number; lastAttempt: number }>({
    max: 10000,
    ttl: 1000 * 60 * 15 // 15 minutes
});

/**
 * Generate CSRF token
 */
export function generateCSRFToken(sessionId: string): string {
    const token = randomBytes(32).toString("hex");
    const csrfData: CSRFToken = {
        token,
        timestamp: Date.now(),
        sessionId
    };

    csrfTokens.set(token, csrfData);
    return token;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionId: string): boolean {
    const csrfData = csrfTokens.get(token);

    if (!csrfData) {
        return false;
    }

    // Check if token belongs to the session
    if (csrfData.sessionId !== sessionId) {
        return false;
    }

    // Check if token is not expired (1 hour)
    const isExpired = Date.now() - csrfData.timestamp > 1000 * 60 * 60;
    if (isExpired) {
        csrfTokens.delete(token);
        return false;
    }

    return true;
}

/**
 * Get client IP address
 */
export function getClientIP(event: H3Event): string {
    const forwarded = getHeader(event, "x-forwarded-for");
    const realIP = getHeader(event, "x-real-ip");
    const remoteAddress = event.node.req.socket?.remoteAddress;

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    return realIP || remoteAddress || "unknown";
}

/**
 * Get user agent
 */
export function getUserAgent(event: H3Event): string {
    return getHeader(event, "user-agent") || "unknown";
}

/**
 * Create session tracking
 */
export function createSession(userId: string, event: H3Event): string {
    const sessionId = randomBytes(32).toString("hex");
    const sessionInfo: SessionInfo = {
        userId,
        lastActivity: Date.now(),
        ipAddress: getClientIP(event),
        userAgent: getUserAgent(event),
        isValid: true
    };

    activeSessions.set(sessionId, sessionInfo);
    return sessionId;
}

/**
 * Update session activity
 */
export function updateSessionActivity(sessionId: string, event: H3Event): boolean {
    const session = activeSessions.get(sessionId);

    if (!session || !session.isValid) {
        return false;
    }

    // Check for session hijacking (IP or User-Agent change)
    const currentIP = getClientIP(event);
    const currentUA = getUserAgent(event);

    if (session.ipAddress !== currentIP || session.userAgent !== currentUA) {
        // Potential session hijacking - invalidate session
        session.isValid = false;
        activeSessions.set(sessionId, session);
        return false;
    }

    // Update last activity
    session.lastActivity = Date.now();
    activeSessions.set(sessionId, session);

    return true;
}

/**
 * Invalidate session
 */
export function invalidateSession(sessionId: string): void {
    const session = activeSessions.get(sessionId);
    if (session) {
        session.isValid = false;
        activeSessions.set(sessionId, session);
    }
}

/**
 * Check if session is valid
 */
export function isSessionValid(sessionId: string): boolean {
    const session = activeSessions.get(sessionId);

    if (!session || !session.isValid) {
        return false;
    }

    // Check session timeout (24 hours)
    const isExpired = Date.now() - session.lastActivity > 1000 * 60 * 60 * 24;
    if (isExpired) {
        session.isValid = false;
        activeSessions.set(sessionId, session);
        return false;
    }

    return true;
}

/**
 * Rate limiting for authentication attempts
 */
export function checkAuthRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number } {
    const key = `auth_${identifier}`;
    const attempts = authAttempts.get(key);
    const now = Date.now();

    if (!attempts) {
        authAttempts.set(key, { count: 1, lastAttempt: now });
        return { allowed: true, remainingAttempts: 4 };
    }

    // Reset if 15 minutes have passed
    if (now - attempts.lastAttempt > 1000 * 60 * 15) {
        authAttempts.set(key, { count: 1, lastAttempt: now });
        return { allowed: true, remainingAttempts: 4 };
    }

    // Check if limit exceeded (5 attempts per 15 minutes)
    if (attempts.count >= 5) {
        return { allowed: false, remainingAttempts: 0 };
    }

    // Increment attempt count
    attempts.count++;
    attempts.lastAttempt = now;
    authAttempts.set(key, attempts);

    return { allowed: true, remainingAttempts: 5 - attempts.count };
}

/**
 * Enhanced password validation
 */
export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong" | "very-strong";
    score: number;
}

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Minimum length check (8 characters)
    if (password.length < 8) {
        errors.push("Password harus minimal 8 karakter");
    } else {
        score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
    }

    // Character type checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasLowercase) {
        errors.push("Password harus mengandung huruf kecil");
    } else {
        score += 1;
    }

    if (!hasUppercase) {
        errors.push("Password harus mengandung huruf besar");
    } else {
        score += 1;
    }

    if (!hasNumbers) {
        errors.push("Password harus mengandung angka");
    } else {
        score += 1;
    }

    if (!hasSymbols) {
        errors.push("Password harus mengandung simbol (!@#$%^&* dll)");
    } else {
        score += 2;
    }

    // Common password patterns
    const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /admin/i,
        /(.)\1{2,}/, // Repeated characters
        /^[a-zA-Z]+$/, // Only letters
        /^\d+$/ // Only numbers
    ];

    for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
            errors.push("Password terlalu umum atau mudah ditebak");
            score -= 2;
            break;
        }
    }

    // Calculate strength
    let strength: "weak" | "medium" | "strong" | "very-strong" = "weak";
    if (score >= 8) strength = "very-strong";
    else if (score >= 6) strength = "strong";
    else if (score >= 4) strength = "medium";

    return {
        isValid: errors.length === 0 && score >= 4,
        errors,
        strength,
        score: Math.max(0, score)
    };
}

/**
 * Sanitize error messages to prevent information disclosure
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
 * Generate secure session cookie options
 */
export function getSecureCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/"
    };
}

// logSecurityEvent function telah dipindahkan ke authorization.ts untuk menghindari duplikasi
