/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ErrorInfo {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Custom hook for consistent error handling, logging, and user feedback.
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const logError = useCallback(
    async (errorInfo: ErrorInfo) => {
      try {
        // Sanitize error fields to prevent log injection and XSS
        const sanitize = (str?: string) =>
          typeof str === "string"
            ? str.replace(/[\r\n<>]/g, "").slice(0, 1000)
            : undefined;

        // Redact sensitive info in metadata before logging to DB
        const redactSensitive = (meta?: Record<string, any>) =>
          meta
            ? Object.fromEntries(
                Object.entries(meta).map(([key, value]) =>
                  /pass(word)?|token|secret|key/i.test(key)
                    ? [key, "***REDACTED***"]
                    : [key, value]
                )
              )
            : undefined;

        await supabase.from("error_logs").insert({
          error_type: sanitize(errorInfo.errorType),
          error_message: sanitize(errorInfo.errorMessage),
          stack_trace: sanitize(errorInfo.stackTrace),
          url: sanitize(errorInfo.url || window.location.href),
          user_agent: sanitize(errorInfo.userAgent || navigator.userAgent),
          user_id: sanitize(errorInfo.userId || user?.id),
          metadata: errorInfo.metadata
            ? JSON.stringify(redactSensitive(errorInfo.metadata))
            : null,
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    },
    [user?.id]
  );

  const handleError = useCallback(
    (
      error: Error | string,
      context?: string,
      showToast: boolean = true,
      metadata?: Record<string, any>
    ) => {
      const errorMessage = typeof error === "string" ? error : error.message;
      const stackTrace = typeof error === "object" ? error.stack : undefined;

      // Log to database
      logError({
        errorType: context || "unknown_error",
        errorMessage,
        stackTrace,
        metadata,
      });

      // Prevent logging sensitive info (e.g., passwords, tokens) in console
      const safeMetadata = metadata
        ? Object.fromEntries(
            Object.entries(metadata).map(([key, value]) =>
              /pass(word)?|token|secret|key/i.test(key)
                ? [key, "***REDACTED***"]
                : [key, value]
            )
          )
        : undefined;

      console.error(
        `[${context || "Error"}]:`,
        typeof error === "string" ? errorMessage : error,
        safeMetadata
      );

      // Show user-friendly toast
      if (showToast) {
        const userMessage = getUserFriendlyMessage(errorMessage, context);
        toast({
          title: "Something went wrong",
          description: userMessage,
          variant: "destructive",
        });
      }
    },
    [logError, toast]
  );

  const handleAsyncError = useCallback(
    async (
      asyncFn: () => Promise<any>,
      context?: string,
      errorMessage?: string
    ) => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error as Error, context, true);
        throw error; // Re-throw for component-level handling
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    logError,
  };
};

/**
 * Maps technical errors to user-friendly messages.
 * Ensures no sensitive or technical details are leaked to the user.
 */
function getUserFriendlyMessage(
  errorMessage: string,
  context?: string
): string {
  const errorMappings: Record<string, string> = {
    network_error: "Please check your internet connection and try again.",
    payment_error:
      "Payment processing failed. Please try again or use a different payment method.",
    auth_error: "Authentication failed. Please log in again.",
    validation_error: "Please check your input and try again.",
    server_error:
      "Our servers are experiencing issues. Please try again in a few minutes.",
  };

  if (context && errorMappings[context]) {
    return errorMappings[context];
  }

  // Generic fallbacks based on error message content
  const lowerMsg = errorMessage.toLowerCase();
  if (lowerMsg.includes("network")) {
    return "Connection issue. Please check your internet and try again.";
  }
  if (lowerMsg.includes("payment")) {
    return "Payment failed. Please try again or contact support.";
  }
  if (lowerMsg.includes("auth")) {
    return "Please log in again to continue.";
  }

  // Never leak raw error details to the user
  return "An unexpected error occurred. Please try again.";
}
