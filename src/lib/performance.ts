/**
 * Performance optimization utilities for the Eventory application.
 * Provides caching, request deduplication, and performance monitoring.
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface PerformanceConfig {
  cacheTimeout: number;
  maxRetries: number;
  retryDelay: number;
}

export class PerformanceOptimizer {
  private requestCache = new Map<string, CacheEntry>();
  private config: PerformanceConfig;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      cacheTimeout: 300000, // 5 minutes
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  async cacheRequest<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    customTimeout?: number
  ): Promise<T> {
    const cached = this.requestCache.get(cacheKey);
    const timeout = customTimeout ?? this.config.cacheTimeout;

    if (cached && Date.now() - cached.timestamp < timeout) {
      return cached.data as T;
    }

    const data = await this.retryRequest(fetchFn);
    this.requestCache.set(cacheKey, { data, timestamp: Date.now() });

    this.cleanupCache();
    return data;
  }

  /**
   * Retry a request with exponential backoff.
   */
  private async retryRequest<T>(
    fetchFn: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt >= this.config.maxRetries) {
        throw error;
      }

      const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryRequest(fetchFn, attempt + 1);
    }
  }

  /**
   * Clean up old cache entries.
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.requestCache.entries()) {
      if (now - entry.timestamp > this.config.cacheTimeout) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data.
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Get cache statistics.
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.requestCache.size,
      keys: Array.from(this.requestCache.keys()),
    };
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

/**
 * Higher-order function to add caching to any async function.
 */
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  cacheKey: string,
  timeout?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = `${cacheKey}-${JSON.stringify(args)}`;
    return performanceOptimizer.cacheRequest(key, () => fn(...args), timeout);
  }) as T;
}

/**
 * Debounce function to limit how often a function can be called.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Throttle function to limit how often a function can be called.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}