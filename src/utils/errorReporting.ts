import { supabase } from "@/integrations/supabase/client";

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  timestamp: string; // Use ISO string for consistency in storage
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Reports an error to Supabase and logs it in development.
 * @param error Error object or string
 * @param severity Severity level
 * @param userId Optional user ID for context
 */
export const reportError = async (
  error: Error | string,
  severity: "low" | "medium" | "high" | "critical" = "medium",
  userId?: string
) => {
  try {
    const errorReport: ErrorReport = {
      message: typeof error === "string" ? error : error.message,
      stack:
        typeof error === "object" && "stack" in error ? error.stack : undefined,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      timestamp: new Date().toISOString(),
      severity,
      userId,
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error reported:", errorReport);
    }

    // Send to database for tracking
    await supabase.from("error_logs").insert({
      error_type: "client_error",
      error_message: errorReport.message,
      stack_trace: errorReport.stack,
      url: errorReport.url,
      user_agent: errorReport.userAgent,
      user_id: errorReport.userId,
      created_at: errorReport.timestamp,
    });
  } catch (reportingError) {
    console.error("Failed to report error:", reportingError);
  }
};

// Global error handler (browser only)
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    reportError(event.error || event.message, "high");
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      "high"
    );
  });
}
