
import { supabase } from "@/integrations/supabase/client";

export interface ErrorLogEntry {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  url?: string;
  user_agent?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  async logError(error: Error | string, context?: Partial<ErrorLogEntry>): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const stackTrace = error instanceof Error ? error.stack : undefined;

      const logEntry: ErrorLogEntry = {
        error_type: context?.error_type || 'client_error',
        error_message: errorMessage,
        stack_trace: stackTrace,
        url: window.location.href,
        user_agent: navigator.userAgent,
        ...context
      };

      // Log to Supabase
      await supabase.from('error_logs').insert(logEntry);

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.error('Error logged:', logEntry);
      }
    } catch (loggingError) {
      // Fallback to console if logging fails
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }

  handleAsyncError = (error: Error, context?: string) => {
    this.logError(error, {
      error_type: 'async_error',
      error_message: `${context ? `${context}: ` : ''}${error.message}`
    });
  };

  wrapAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleAsyncError(error as Error, context);
        throw error;
      }
    }) as T;
  };
}

export const errorHandler = ErrorHandler.getInstance();

// Global error handlers
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(event.reason, {
      error_type: 'unhandled_promise_rejection'
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error || event.message, {
      error_type: 'unhandled_error',
      url: event.filename,
      stack_trace: `Line: ${event.lineno}, Column: ${event.colno}`
    });
  });
};
