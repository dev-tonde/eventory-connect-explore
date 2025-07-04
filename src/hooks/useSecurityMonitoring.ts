import { useState, useEffect, useRef } from "react";
import { errorHandler } from "@/lib/errorHandler";
import { apiRateLimiter } from "@/middleware/rateLimiter";

interface SecurityEvent {
  type: "rate_limit_exceeded" | "suspicious_activity" | "auth_failure";
  message: string;
  timestamp: Date;
}

/**
 * Custom hook for client-side security monitoring: rate limiting, suspicious activity, and event logging.
 */
export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const unblockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Log a security event locally and to the error handler.
   */
  const logSecurityEvent = (event: Omit<SecurityEvent, "timestamp">) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    setSecurityEvents((prev) => [...prev.slice(-9), securityEvent]); // Keep last 10 events

    errorHandler.logError(`Security Event: ${event.type}`, {
      error_type: "security_event",
      error_message: event.message,
    });
  };

  /**
   * Check API rate limit for a given action.
   */
  const checkRateLimit = async (action: string = "general") => {
    try {
      // In production, use a real user/IP identifier
      const identifier = `ip_${Date.now()}`;
      const result = await apiRateLimiter.checkLimit(identifier, action);

      if (!result.allowed) {
        setIsBlocked(true);
        logSecurityEvent({
          type: "rate_limit_exceeded",
          message: result.message || "Rate limit exceeded",
        });

        // Auto-unblock after 5 minutes
        if (unblockTimeoutRef.current) clearTimeout(unblockTimeoutRef.current);
        unblockTimeoutRef.current = setTimeout(
          () => setIsBlocked(false),
          5 * 60 * 1000
        );
      }

      return result.allowed;
    } catch (error) {
      errorHandler.logError(error as Error, {
        error_type: "rate_limit_check_failed",
      });
      return true; // Fail open for user experience
    }
  };

  /**
   * Report suspicious activity.
   */
  const reportSuspiciousActivity = (activity: string) => {
    logSecurityEvent({
      type: "suspicious_activity",
      message: activity,
    });
  };

  useEffect(() => {
    // Monitor for suspicious patterns: rapid navigation (potential bot behavior)
    let navigationCount = 0;
    let startTime = Date.now();

    const handleNavigation = () => {
      navigationCount++;
      if (navigationCount > 10 && Date.now() - startTime < 30000) {
        reportSuspiciousActivity("Rapid navigation detected");
      }
      // Reset after 30 seconds
      if (Date.now() - startTime > 30000) {
        navigationCount = 0;
        startTime = Date.now();
      }
    };

    window.addEventListener("beforeunload", handleNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleNavigation);
      if (unblockTimeoutRef.current) clearTimeout(unblockTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    securityEvents,
    isBlocked,
    checkRateLimit,
    logSecurityEvent,
    reportSuspiciousActivity,
  };
};
// This hook can be used in components to monitor security events, check rate limits, and log suspicious activities.
