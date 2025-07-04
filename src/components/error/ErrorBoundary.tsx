import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.logError(error, errorInfo);
  }

  logError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await supabase.from("error_logs").insert([
        {
          error_type: error.name,
          error_message: error.message,
          stack_trace: error.stack,
          url: window.location.href,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    // Also log to console for development
    console.error("Error caught by boundary:", error, errorInfo);
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. The error has
                been logged and our team will investigate.
              </p>

              {process.env.NODE_ENV === "development" && error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Error Details (Development)
                  </h4>
                  <pre className="text-xs text-red-700 overflow-auto max-h-40">
                    {error.message}
                    {"\n"}
                    {error.stack}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  aria-label="Try again"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                  aria-label="Reload page"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                If the problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
// This component is an Error Boundary that catches JavaScript errors in its child components.
// It logs the error to a Supabase table and displays a fallback UI with options to retry or reload the page.
