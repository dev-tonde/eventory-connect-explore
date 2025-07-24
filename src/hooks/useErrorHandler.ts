import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
 * Custom hook for centralized error handling and logging
 */
export const useErrorHandler = () => {
  const { toast } = useToast();

  const logError = async (errorInfo: ErrorInfo) => {
    try {
      // Sanitize sensitive data before logging
      const sanitizedErrorInfo = {
        ...errorInfo,
        errorMessage: errorInfo.errorMessage.replace(/password|token|key|secret/gi, '[REDACTED]'),
        metadata: errorInfo.metadata ? 
          Object.fromEntries(
            Object.entries(errorInfo.metadata).map(([key, value]) => [
              key,
              typeof value === 'string' && /password|token|key|secret/i.test(key) 
                ? '[REDACTED]' 
                : value
            ])
          ) : undefined
      };

      await supabase
        .from('error_logs')
        .insert([{
          error_type: sanitizedErrorInfo.errorType,
          error_message: sanitizedErrorInfo.errorMessage,
          stack_trace: sanitizedErrorInfo.stackTrace,
          url: sanitizedErrorInfo.url,
          user_agent: sanitizedErrorInfo.userAgent,
          user_id: sanitizedErrorInfo.userId,
        }]);
    } catch (logError) {
      // Silently fail logging to prevent error loops
      console.warn('Failed to log error:', logError);
    }
  };

  const handleError = (
    error: Error | string, 
    context?: string, 
    showToast: boolean = true,
    metadata?: Record<string, any>
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'object' ? error.stack : undefined;

    // Log error details
    logError({
      errorType: typeof error === 'string' ? 'CustomError' : error.constructor.name,
      errorMessage,
      stackTrace,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: {
        context,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });

    // Redact sensitive information from console
    const redactedMessage = errorMessage.replace(/password|token|key|secret/gi, '[REDACTED]');
    console.error(`Error in ${context || 'unknown context'}:`, redactedMessage);

    if (showToast) {
      const userFriendlyMessage = getUserFriendlyMessage(errorMessage, context);
      toast({
        title: "Something went wrong",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    }
  };

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    errorMessage?: string
  ): Promise<T> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(
        error as Error, 
        context, 
        true, 
        { customErrorMessage: errorMessage }
      );
      throw error; // Re-throw to allow caller to handle if needed
    }
  };

  return {
    handleError,
    handleAsyncError,
    logError
  };
};

/**
 * Convert technical errors to user-friendly messages
 */
const getUserFriendlyMessage = (errorMessage: string, context?: string): string => {
  const message = errorMessage.toLowerCase();

  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return "Please check your internet connection and try again.";
  }

  // Database errors
  if (message.includes('unique constraint') || message.includes('23505')) {
    return "This item already exists. Please try with different information.";
  }

  if (message.includes('foreign key') || message.includes('23503')) {
    return "Unable to complete this action due to data dependencies.";
  }

  if (message.includes('not null') || message.includes('23502')) {
    return "Please fill in all required fields.";
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401')) {
    return "Please log in to continue.";
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return "You don't have permission to perform this action.";
  }

  // File upload errors
  if (message.includes('file size') || message.includes('too large')) {
    return "The file is too large. Please select a smaller file.";
  }

  if (message.includes('file type') || message.includes('not allowed')) {
    return "This file type is not supported. Please select a different file.";
  }

  // Payment errors
  if (context?.includes('payment') || context?.includes('ticket')) {
    return "There was an issue processing your payment. Please try again or contact support.";
  }

  // Generic fallback
  return "An unexpected error occurred. Please try again.";
};