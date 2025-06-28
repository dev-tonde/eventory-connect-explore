
import { useState, useEffect } from "react";
import { errorHandler } from "@/lib/errorHandler";
import { apiRateLimiter } from "@/middleware/rateLimiter";

interface SecurityEvent {
  type: 'rate_limit_exceeded' | 'suspicious_activity' | 'auth_failure';
  message: string;
  timestamp: Date;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);

  const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    setSecurityEvents(prev => [...prev.slice(-9), securityEvent]); // Keep last 10 events

    // Log to error handler
    errorHandler.logError(`Security Event: ${event.type}`, {
      error_type: 'security_event',
      error_message: event.message
    });
  };

  const checkRateLimit = async (action: string = 'general') => {
    try {
      const identifier = `ip_${Date.now()}`; // In real app, use actual IP
      const result = await apiRateLimiter.checkLimit(identifier, action);

      if (!result.allowed) {
        setIsBlocked(true);
        logSecurityEvent({
          type: 'rate_limit_exceeded',
          message: result.message || 'Rate limit exceeded'
        });

        // Auto-unblock after 5 minutes
        setTimeout(() => setIsBlocked(false), 5 * 60 * 1000);
      }

      return result.allowed;
    } catch (error) {
      errorHandler.logError(error as Error, {
        error_type: 'rate_limit_check_failed'
      });
      return true; // Fail open
    }
  };

  const reportSuspiciousActivity = (activity: string) => {
    logSecurityEvent({
      type: 'suspicious_activity',
      message: activity
    });
  };

  useEffect(() => {
    // Monitor for suspicious patterns
    const checkForSuspiciousActivity = () => {
      // Check for rapid navigation (potential bot behavior)
      let navigationCount = 0;
      const startTime = Date.now();

      const handleNavigation = () => {
        navigationCount++;
        if (navigationCount > 10 && (Date.now() - startTime) < 30000) {
          reportSuspiciousActivity('Rapid navigation detected');
        }
      };

      window.addEventListener('beforeunload', handleNavigation);
      
      return () => {
        window.removeEventListener('beforeunload', handleNavigation);
      };
    };

    const cleanup = checkForSuspiciousActivity();
    return cleanup;
  }, []);

  return {
    securityEvents,
    isBlocked,
    checkRateLimit,
    logSecurityEvent,
    reportSuspiciousActivity
  };
};
