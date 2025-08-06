/**
 * Middleware utilities - centralized exports
 * Menyediakan utility functions yang dapat digunakan oleh semua middleware
 */

// Auth helper utilities
export { initializeAuthStore, redirectToLogin, redirectToHome, MIDDLEWARE_CONFIG } from "./auth-helper";

// Admin helper utilities
export { checkAdminRole, createAccessDeniedError, logAdminCheck } from "./admin-helper";

// Type exports
export type { AdminCheckResult } from "./admin-helper";
