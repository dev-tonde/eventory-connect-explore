import { useState, useEffect, useRef, useCallback } from "react";
import { errorHandler } from "@/lib/errorHandler";
import { apiRateLimiter } from "@/middleware/rateLimiter";

interface SecurityEvent {
  type: "rate_limit_exceeded" | "suspicious_activity" | "auth_failure";
  message: string;
  timestamp: Date;
}

interface SecurityMonitoringState {
  securityEvents: SecurityEvent[];
  isBlocked: boolean;
  isInitialized: boolean;
}

const DEFAULT_STATE: SecurityMonitoringState = {
  securityEvents: [],
  isBlocked: false,
  isInitialized: false,
};

/**
 * Custom hook for client-side security monitoring: rate limiting, suspicious activity, and event logging.
 * Follows React Hook Rules and handles SSR safely.
 */
export const useSecurityMonitoring = () => {
  // Initialize with safe defaults
  const [state, setState] = useState<SecurityMonitoringState>(DEFAULT_STATE);
  const unblockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  /**
   * Log a security event locally and to the error handler.
   */
  const logSecurityEvent = useCallback((event: Omit<SecurityEvent, "timestamp">) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      securityEvents: [...prev.securityEvents.slice(-9), securityEvent], // Keep last 10 events
    }));

    // Only log to error handler if available
    try {
      errorHandler.logError(`Security Event: ${event.type}`, {
        error_type: "security_event",
        error_message: event.message,
      });
    } catch (error) {
      console.warn("Failed to log security event:", error);
    }
  }, []);

  /**
   * Check API rate limit for a given action.
   */
  const checkRateLimit = useCallback(async (action: string = "general"): Promise<boolean> => {
    try {
      // Generate a safe identifier
      const identifier = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const result = await apiRateLimiter.checkLimit(identifier, action);

      if (!result.allowed) {
        setState(prev => ({ ...prev, isBlocked: true }));
        
        logSecurityEvent({
          type: "rate_limit_exceeded",
          message: result.message || "Rate limit exceeded",
        });

        // Auto-unblock after 5 minutes
        if (unblockTimeoutRef.current) {
          clearTimeout(unblockTimeoutRef.current);
        }
        
        unblockTimeoutRef.current = setTimeout(
          () => setState(prev => ({ ...prev, isBlocked: false })),
          5 * 60 * 1000
        );
      }

      return result.allowed;
    } catch (error) {
      // Log error safely
      try {
        errorHandler.logError(error as Error, {
          error_type: "rate_limit_check_failed",
        });
      } catch (logError) {
        console.warn("Failed to log rate limit error:", logError);
      }
      
      return true; // Fail open for user experience
    }
  }, [logSecurityEvent]);

  /**
   * Report suspicious activity.
   */
  const reportSuspiciousActivity = useCallback((activity: string) => {
    logSecurityEvent({
      type: "suspicious_activity",
      message: activity,
    });
  }, [logSecurityEvent]);

  /**
   * Handle navigation events for suspicious activity detection
   */
  const handleNavigation = useCallback(() => {
    navigationCountRef.current++;
    const currentTime = Date.now();
    
    if (navigationCountRef.current > 10 && currentTime - startTimeRef.current < 30000) {
      reportSuspiciousActivity("Rapid navigation detected");
    }
    
    // Reset after 30 seconds
    if (currentTime - startTimeRef.current > 30000) {
      navigationCountRef.current = 0;
      startTimeRef.current = currentTime;
    }
  }, [reportSuspiciousActivity]);

  // Initialize and setup monitoring
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Initialize start time
      startTimeRef.current = Date.now();

      // Set as initialized
      setState(prev => ({ ...prev, isInitialized: true }));

      // Add navigation monitoring
      window.addEventListener("beforeunload", handleNavigation);

      // Optional: Monitor for rapid clicks/interactions
      const handleClick = () => handleNavigation();
      document.addEventListener("click", handleClick);

      return () => {
        // Cleanup event listeners
        window.removeEventListener("beforeunload", handleNavigation);
        document.removeEventListener("click", handleClick);
        
        // Clear timeout
        if (unblockTimeoutRef.current) {
          clearTimeout(unblockTimeoutRef.current);
        }
      };
    } catch (error) {
      console.warn("Failed to setup security monitoring:", error);
      
      // Set as initialized even if setup fails
      setState(prev => ({ ...prev, isInitialized: true }));
    }
  }, [handleNavigation]);

  return {
    securityEvents: state.securityEvents,
    isBlocked: state.isBlocked,
    isInitialized: state.isInitialized,
    checkRateLimit,
    logSecurityEvent,
    reportSuspiciousActivity,
  };
};