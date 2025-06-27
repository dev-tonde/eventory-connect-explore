
import { supabase } from '@/integrations/supabase/client';

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const reportError = async (error: Error | string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  try {
    const errorReport: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      severity
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', errorReport);
    }

    // Send to database for tracking
    await supabase.from('error_logs').insert({
      error_type: 'client_error',
      error_message: errorReport.message,
      stack_trace: errorReport.stack,
      url: errorReport.url,
      user_agent: errorReport.userAgent
    });

  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};

// Global error handler
window.addEventListener('error', (event) => {
  reportError(event.error, 'high');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  reportError(new Error(event.reason), 'high');
});
