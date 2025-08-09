import { ref, computed } from 'vue'
import { useSupabase as useSupabaseClient } from '~/services/supabaseClient'
import { debounce } from 'lodash-es'

// Connection status tracking
const connectionStatus = ref<'connected' | 'disconnected' | 'connecting'>('disconnected')
const lastError = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Query cache untuk optimasi
interface QueryCacheEntry {
  data: any
  timestamp: number
  query: string
}

const QUERY_CACHE_DURATION = 30 * 1000 // 30 detik
const _queryCache = new Map<string, QueryCacheEntry>()

/**
 * Enhanced Supabase composable dengan optimasi performa
 */
export const useSupabase = () => {
  const supabase = useSupabaseClient()
  
  // Connection health check
  const checkConnection = async () => {
    try {
      connectionStatus.value = 'connecting'
      const { error } = await supabase.from('animes').select('id').limit(1)
      
      if (error) {
        throw error
      }
      
      connectionStatus.value = 'connected'
      retryCount.value = 0
      lastError.value = null
      return true
    } catch (error) {
      connectionStatus.value = 'disconnected'
      lastError.value = error instanceof Error ? error.message : 'Connection failed'
      console.error('Supabase connection check failed:', error)
      return false
    }
  }
  
  // Retry logic dengan exponential backoff
  const withRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        retryCount.value = 0
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        retryCount.value = attempt + 1
        
        if (attempt === maxRetries) {
          throw lastError
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        
        console.warn(`Supabase operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`, error)
      }
    }
    
    throw lastError!
  }
  
  // Cached query function
  const cachedQuery = async (table: string, query: any, cacheKey?: string) => {
    const key = cacheKey || `${table}-${JSON.stringify(query)}`
    const now = Date.now()
    
    // Check cache first
    const cached = _queryCache.get(key)
    if (cached && (now - cached.timestamp) < QUERY_CACHE_DURATION) {
      return cached.data
    }
    
    // Execute query with retry
    const result = await withRetry(async () => {
      const { data, error } = await query
      if (error) throw error
      return data
    })
    
    // Cache the result
    _queryCache.set(key, {
      data: result,
      timestamp: now,
      query: key
    })
    
    return result
  }
  
  // Debounced query untuk search
  const debouncedQuery = debounce(cachedQuery, 300)
  
  // Clear cache function
  const clearQueryCache = (pattern?: string) => {
    if (pattern) {
      for (const [key] of _queryCache) {
        if (key.includes(pattern)) {
          _queryCache.delete(key)
        }
      }
    } else {
      _queryCache.clear()
    }
  }
  
  // Batch operations untuk multiple queries
  const batchQuery = async (operations: Array<() => Promise<any>>) => {
    return await Promise.allSettled(operations.map(op => withRetry(op)))
  }
  
  // Health status computed
  const isHealthy = computed(() => connectionStatus.value === 'connected')
  const isConnecting = computed(() => connectionStatus.value === 'connecting')
  
  // Initialize connection check
  checkConnection()
  
  return {
    // Original supabase client
    ...supabase,
    
    // Enhanced features
    connectionStatus: readonly(connectionStatus),
    lastError: readonly(lastError),
    retryCount: readonly(retryCount),
    isHealthy,
    isConnecting,
    
    // Methods
    checkConnection,
    withRetry,
    cachedQuery,
    debouncedQuery,
    clearQueryCache,
    batchQuery
  }
}

/**
 * Legacy export untuk kompatibilitas
 * @deprecated Gunakan useSupabase() langsung
 */
export { useSupabase as useSupabaseClient } from '~/services/supabaseClient'
