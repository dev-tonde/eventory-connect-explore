interface PerformanceConfig {
  enableBatchQueries: boolean;
  cacheTimeout: number;
  maxRetries: number;
  requestTimeout: number;
}

class PerformanceManager<T = unknown> {
  private config: PerformanceConfig = {
    enableBatchQueries: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    requestTimeout: 30000, // 30 seconds
  };

  private requestCache = new Map<string, { data: T; timestamp: number }>();

  /**
   * Returns cached data if valid, otherwise fetches and caches new data.
   */
  async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    customTimeout?: number
  ): Promise<T> {
    const cached = this.requestCache.get(cacheKey);
    const timeout = customTimeout ?? this.config.cacheTimeout;

    if (cached && Date.now() - cached.timestamp < timeout) {
      return cached.data;
    }

    const data = await this.retryRequest(fetchFn);
    this.requestCache.set(cacheKey, { data, timestamp: Date.now() });

    this.cleanupCache();
    return data;
  }

  /**
   * Retries a fetch function with exponential backoff and timeout.
   */
  private async retryRequest<T>(
    fetchFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await Promise.race([
        fetchFn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout")),
            this.config.requestTimeout
          )
        ),
      ]);
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
        return this.retryRequest(fetchFn, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Removes stale cache entries.
   */
  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.config.cacheTimeout * 2) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Clears all cached requests.
   */
  clearCache() {
    this.requestCache.clear();
  }

  /**
   * Updates the performance configuration.
   */
  updateConfig(newConfig: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const performanceManager = new PerformanceManager();

/**
 * Batch query helper for multiple async database/API calls.
 * Returns an array of results or throws on the first failure.
 */
export const batchQueries = async <T>(
  queries: Array<() => Promise<T>>
): Promise<T[]> => {
  const results = await Promise.allSettled(queries.map((query) => query()));

  // If any query fails, throw the first error found
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected") {
      console.error(`Query ${i} failed:`, result.reason);
      throw result.reason;
    }
  }

  // All succeeded, return values
  return results.map((result) => (result as PromiseFulfilledResult<T>).value);
};
