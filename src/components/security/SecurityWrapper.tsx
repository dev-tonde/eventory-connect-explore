import { useEffect, ReactNode } from "react";
import { setupGlobalErrorHandlers, errorHandler } from "@/lib/errorHandler";
import { validateEnvironment } from "@/lib/constants";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SecurityWrapperProps {
  children: ReactNode;
}

export const SecurityWrapper = ({ children }: SecurityWrapperProps) => {
  const { isBlocked, securityEvents } = useSecurityMonitoring();

  useEffect(() => {
    try {
      // Validate environment variables
      validateEnvironment();

      // Setup global error handlers (window.onerror, unhandledrejection, etc.)
      setupGlobalErrorHandlers();

      // Log application start
      errorHandler.logError("Application started", {
        error_type: "info",
        error_message: "Application initialized successfully",
      });
    } catch (error) {
      // Log security setup failure
      console.error("Security setup failed:", error);
      errorHandler.logError(error as Error, {
        error_type: "security_setup_failed",
      });
    }
    // Only run once on mount
  }, []);

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
          <AlertDescription>
            Your access has been temporarily limited due to unusual activity.
            Please try again in a few minutes.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Development security monitoring panel */}
      {import.meta.env.DEV && securityEvents.length > 0 && (
        <div className="fixed bottom-4 left-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-3 text-xs z-50 shadow-lg">
          <div className="font-semibold text-red-800 mb-1">Security Events</div>
          {securityEvents.slice(-3).map((event, index) => (
            <div key={index} className="text-red-600 break-words">
              <span className="font-bold">{event.type}:</span> {event.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
// This component wraps the application to provide security features such as error handling, environment validation, and security monitoring.
// It sets up global error handlers, validates environment variables, and displays security events in development mode.
// If the user's access is blocked due to security monitoring, it shows an alert message.
