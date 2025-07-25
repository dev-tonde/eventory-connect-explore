import { useEffect, ReactNode } from "react";
import { setupGlobalErrorHandlers, errorHandler } from "@/lib/errorHandler";
import { validateEnvironment } from "@/lib/constants";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";

interface SecurityWrapperProps {
  children: ReactNode;
}

export const SecurityWrapper = ({ children }: SecurityWrapperProps) => {
  const { isBlocked, securityEvents, isInitialized } = useSecurityMonitoring();

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

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
      
      // Try to log error safely
      try {
        errorHandler.logError(error as Error, {
          error_type: "security_setup_failed",
        });
      } catch (logError) {
        console.warn("Failed to log security setup error:", logError);
      }
    }
  }, []);

  // Show loading state while security monitoring initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Shield className="h-5 w-5 animate-pulse" />
          <span>Initializing security...</span>
        </div>
      </div>
    );
  }

  // Show blocked state if access is restricted
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert className="max-w-md border-destructive">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-foreground">
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
      {typeof window !== 'undefined' && 
       import.meta.env.DEV && 
       securityEvents.length > 0 && (
        <div className="fixed bottom-4 left-4 max-w-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs z-50 shadow-lg">
          <div className="font-semibold text-destructive mb-1 flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Security Events</span>
          </div>
          {securityEvents.slice(-3).map((event, index) => (
            <div key={`${event.timestamp.getTime()}-${index}`} className="text-destructive/80 break-words">
              <span className="font-bold">{event.type}:</span> {event.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
};