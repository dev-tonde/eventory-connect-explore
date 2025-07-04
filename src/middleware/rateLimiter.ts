import { supabase } from "@/integrations/supabase/client";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many requests, please try again later.",
};

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Checks if the identifier has exceeded the rate limit for the given action.
   * @param identifier Unique identifier (e.g., user id, IP address)
   * @param action Action name for rate limiting scope
   * @returns { allowed: boolean, message?: string }
   */
  async checkLimit(
    identifier: string,
    action: string = "general"
  ): Promise<{ allowed: boolean; message?: string }> {
    try {
      const { data, error } = await supabase.rpc("check_rate_limit", {
        identifier_val: identifier,
        action_val: action,
        max_requests: this.config.maxRequests,
        window_minutes: Math.floor(this.config.windowMs / 60000),
      });

      if (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Rate limit check failed:", error);
        }
        // Fail open for availability, but consider logging/alerting in production
        return { allowed: true };
      }

      const allowed = Boolean(data);
      return {
        allowed,
        message: allowed ? undefined : this.config.message,
      };
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Rate limiter error:", error);
      }
      // Fail open for availability
      return { allowed: true };
    }
  }
}

// Predefined rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 15 * 60 * 1000,
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

export const uploadRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
  message: "Too many file uploads. Please try again later.",
});
