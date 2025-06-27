
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ErrorInfo {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const logError = useCallback(async (errorInfo: ErrorInfo) => {
    try {
      await supabase.from('error_logs').insert({
        error_type: errorInfo.errorType,
        error_message: errorInfo.errorMessage,
        stack_trace: errorInfo.stackTrace,
        url: errorInfo.url || window.location.href,
        user_agent: errorInfo.userAgent || navigator.userAgent,
        user_id: errorInfo.userId || user?.id,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }, [user?.id]);

  const handleError = useCallback((
    error: Error | string,
    context?: string,
    showToast: boolean = true,
    metadata?: Record<string, any>
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'object' ? error.stack : undefined;
    
    // Log to database
    logError({
      errorType: context || 'unknown_error',
      errorMessage,
      stackTrace,
      metadata,
    });

    // Log to console for development
    console.error(`[${context || 'Error'}]:`, error, metadata);

    // Show user-friendly toast
    if (showToast) {
      const userMessage = getUserFriendlyMessage(errorMessage, context);
      toast({
        title: "Something went wrong",
        description: userMessage,
        variant: "destructive",
      });
    }
  }, [logError, toast]);

  const handleAsyncError = useCallback(async (
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
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    logError,
  };
};

function getUserFriendlyMessage(errorMessage: string, context?: string): string {
  // Map technical errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'network_error': 'Please check your internet connection and try again.',
    'payment_error': 'Payment processing failed. Please try again or use a different payment method.',
    'auth_error': 'Authentication failed. Please log in again.',
    'validation_error': 'Please check your input and try again.',
    'server_error': 'Our servers are experiencing issues. Please try again in a few minutes.',
  };

  if (context && errorMappings[context]) {
    return errorMappings[context];
  }

  // Generic fallbacks based on error message content
  if (errorMessage.toLowerCase().includes('network')) {
    return 'Connection issue. Please check your internet and try again.';
  }
  if (errorMessage.toLowerCase().includes('payment')) {
    return 'Payment failed. Please try again or contact support.';
  }
  if (errorMessage.toLowerCase().includes('auth')) {
    return 'Please log in again to continue.';
  }

  return 'An unexpected error occurred. Please try again.';
}
