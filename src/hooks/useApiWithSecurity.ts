import { useState, useCallback } from "react";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { monitoring } from "@/lib/monitoring";
import { errorHandler } from "@/lib/errorHandler";

interface ApiOptions {
  requireAuth?: boolean;
  rateLimit?: boolean;
  action?: string;
}

/**
 * Custom hook to make secure API calls with optional rate limiting and monitoring.
 * Tracks API performance and logs errors.
 */
export const useApiWithSecurity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { checkRateLimit } = useSecurityMonitoring();

  const makeSecureApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options: ApiOptions = {}
    ): Promise<T | null> => {
      const {
        requireAuth = true,
        rateLimit = true,
        action = "api_call",
      } = options;

      const startTime = performance.now();
      try {
        setIsLoading(true);

        // Rate limiting
        if (rateLimit) {
          const allowed = await checkRateLimit(action);
          if (!allowed) {
            throw new Error("Rate limit exceeded");
          }
        }

        // Optionally, add authentication checks here if requireAuth is true

        // Make the API call
        const result = await apiCall();

        // Track success metrics
        const duration = performance.now() - startTime;
        monitoring.trackApiCall(action, duration, true);

        return result;
      } catch (error) {
        // Track error metrics
        const duration = performance.now() - startTime;
        monitoring.trackApiCall(action, duration, false);

        // Log error
        errorHandler.logError(error as Error, {
          error_type: "api_error",
          error_message: `API call failed: ${action}`,
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [checkRateLimit]
  );

  return {
    makeSecureApiCall,
    isLoading,
  };
};
