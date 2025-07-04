/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SecurityEvent {
  id: string;
  type:
    | "login_attempt"
    | "payment_attempt"
    | "data_access"
    | "suspicious_activity";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Custom hook for security auditing and event logging.
 */
export const useSecurityAudit = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  /**
   * Log a security event to Supabase and local state.
   */
  const logSecurityEvent = async (
    event: Omit<SecurityEvent, "id" | "timestamp">
  ) => {
    try {
      // Log to database
      const { error } = await supabase.from("error_logs").insert({
        error_type: "security_event",
        error_message: `${event.type}: ${event.message}`,
        user_id: user?.id,
        stack_trace: JSON.stringify({
          severity: event.severity,
          metadata: event.metadata || {},
        }),
      });

      if (error) {
        console.error("Failed to log security event:", error);
      }

      // Add to local state for monitoring (keep last 20)
      const securityEvent: SecurityEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setSecurityEvents((prev) => [...prev.slice(-19), securityEvent]);
    } catch (error) {
      console.error("Security audit logging failed:", error);
    }
  };

  /**
   * Returns a function to detect rapid successive actions (potential abuse).
   */
  const detectSuspiciousActivity = () => {
    let actionCount = 0;
    let lastActionTime = 0;

    return (actionType: string) => {
      const now = Date.now();
      const timeDiff = now - lastActionTime;

      if (timeDiff < 1000) {
        actionCount++;
        if (actionCount > 5) {
          logSecurityEvent({
            type: "suspicious_activity",
            severity: "high",
            message: `Rapid successive ${actionType} actions detected`,
            metadata: { actionType, actionCount, timeDiff },
          });
        }
      } else {
        actionCount = 1;
      }

      lastActionTime = now;
    };
  };

  /**
   * Track access to sensitive pages.
   */
  const trackPageAccess = (page: string) => {
    const sensitivePaths = [
      "/dashboard",
      "/admin",
      "/create-event",
      "/profile",
    ];
    if (sensitivePaths.some((path) => page.includes(path))) {
      logSecurityEvent({
        type: "data_access",
        severity: "low",
        message: `Accessed sensitive page: ${page}`,
        metadata: { page, userAgent: navigator.userAgent },
      });
    }
  };

  /**
   * Track payment attempts.
   */
  const trackPaymentAttempt = (
    amount: number,
    eventId: string,
    success: boolean
  ) => {
    logSecurityEvent({
      type: "payment_attempt",
      severity: success ? "low" : "medium",
      message: `Payment ${success ? "succeeded" : "failed"} for R${amount}`,
      metadata: {
        amount,
        eventId,
        success,
        timestamp: new Date().toISOString(),
      },
    });
  };

  /**
   * Track login attempts.
   */
  const trackLoginAttempt = (success: boolean, method: string = "email") => {
    logSecurityEvent({
      type: "login_attempt",
      severity: success ? "low" : "medium",
      message: `Login ${success ? "succeeded" : "failed"} via ${method}`,
      metadata: { success, method, userAgent: navigator.userAgent },
    });
  };

  // Monitor for potential XSS attempts in console errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(" ");
      if (
        message.includes("script") ||
        message.includes("eval") ||
        message.includes("javascript:")
      ) {
        logSecurityEvent({
          type: "suspicious_activity",
          severity: "critical",
          message: "Potential XSS attempt detected in console",
          metadata: { consoleError: message },
        });
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    securityEvents,
    logSecurityEvent,
    detectSuspiciousActivity,
    trackPageAccess,
    trackPaymentAttempt,
    trackLoginAttempt,
  };
};
