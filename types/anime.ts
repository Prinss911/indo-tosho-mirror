export interface Anime {
    id: string;
    title: string;
    category: string;
    submitter: string;

    date: string;
    created_at?: string;
    views: number;
    likes: number;
    downloads: number;
    status: "Finished Airing" | "Currently Airing" | "Not yet aired" | "completed" | "ongoing" | "upcoming";
    rating: number;
    description?: string;
    episodes?: number;
    genre: string[];
    year: number;
    studio: string;
    coverImage: string;
}

export interface AnimeFilter {
    category: string;
    search: string;
    sortBy: "date" | "title" | "rating" | "downloads";
    sortOrder: "asc" | "desc";
    page: number;
    perPage: number;
}

export interface AnimeStats {
    totalAnimes: number;
    totalDownloads: number;
    averageRating: number;
    topCategory: string;
    recentUploads: number;
}

export interface DatabaseConnection {
    isConnected: boolean;
    connectionTime?: Date;
    lastQuery?: Date;
}

export interface DatabaseError {
    code: string;
    message: string;
    timestamp: Date;
    operation?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

export interface SearchResult {
    animes: Anime[];
    total: number;
    query: string;
    executionTime: number;
}

export interface CategoryStats {
    category: string;
    count: number;
    averageRating: number;
    totalDownloads: number;
}

export interface UserActivity {
    id: string;
    userId: string;
    action: "create" | "update" | "delete" | "view";
    animeId: string;
    timestamp: Date;
    details?: Record<string, any>;
}

export interface DatabaseMetrics {
    queryCount: number;
    averageQueryTime: number;
    slowQueries: number;
    errorCount: number;
    uptime: number;
}

export interface BackupInfo {
    id: string;
    timestamp: Date;
    size: number;
    recordCount: number;
    status: "success" | "failed" | "in_progress";
    filePath?: string;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface AnimeValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Database operation types
export type DatabaseOperation = "create" | "read" | "update" | "delete" | "search" | "connect" | "disconnect";

// Sort options
export type SortField = keyof Pick<Anime, "title" | "date" | "rating" | "downloads" | "views" | "likes">;
export type SortOrder = "asc" | "desc";

// Status types
export type AnimeStatus = Anime["status"];
export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";

// Query options
export interface QueryOptions {
    limit?: number;
    offset?: number;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    filters?: Partial<Anime>;
}

// Database configuration
export interface DatabaseConfig {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

// Mock database specific types
export interface MockDatabaseState {
    animes: Anime[];
    isConnected: boolean;
    queryCount: number;
    lastOperation?: DatabaseOperation;
    operationHistory: Array<{
        operation: DatabaseOperation;
        timestamp: Date;
        duration: number;
        success: boolean;
    }>;
}

export interface MockDatabaseOptions {
    initialData?: Anime[];
    simulateLatency?: boolean;
    latencyRange?: [number, number];
    errorRate?: number;
    enableLogging?: boolean;
}
