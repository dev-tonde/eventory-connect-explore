
interface PerformanceConfig {
  enableBatchQueries: boolean;
  cacheTimeout: number;
  maxRetries: number;
  requestTimeout: number;
}

class PerformanceManager {
  private config: PerformanceConfig = {
    enableBatchQueries: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    requestTimeout: 30000 // 30 seconds
  };

  private requestCache = new Map<string, { data: any; timestamp: number }>();

  async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    customTimeout?: number
  ): Promise<T> {
    const cached = this.requestCache.get(cacheKey);
    const timeout = customTimeout || this.config.cacheTimeout;
    
    if (cached && Date.now() - cached.timestamp < timeout) {
      return cached.data;
    }

    const data = await this.retryRequest(fetchFn);
    this.requestCache.set(cacheKey, { data, timestamp: Date.now() });
    
    // Clean up old cache entries
    this.cleanupCache();
    
    return data;
  }

  private async retryRequest<T>(
    fetchFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await Promise.race([
        fetchFn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.config.requestTimeout)
        )
      ]);
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.retryRequest(fetchFn, retryCount + 1);
      }
      throw error;
    }
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.config.cacheTimeout * 2) {
        this.requestCache.delete(key);
      }
    }
  }

  clearCache() {
    this.requestCache.clear();
  }

  updateConfig(newConfig: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const performanceManager = new PerformanceManager();

// Batch query helper for multiple database calls
export const batchQueries = async <T>(queries: (() => Promise<T>)[]): Promise<T[]> => {
  const results = await Promise.allSettled(queries.map(query => query()));
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Query ${index} failed:`, result.reason);
      throw result.reason;
    }
  });
};
