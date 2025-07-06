import { useCallback } from 'react';
import { captureException, captureMessage, setUser, setTag, setContext } from '@/lib/sentry';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

export const useErrorTracking = () => {
  const trackError = useCallback((error: Error, context?: ErrorContext) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        if (key === 'userId') {
          setUser({ id: value });
        } else {
          setTag(key, value);
        }
      });
    }
    
    captureException(error);
  }, []);

  const trackMessage = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) => {
    if (context) {
      setContext('additional_info', context);
    }
    
    captureMessage(message, level);
  }, []);

  const trackUser = useCallback((user: { id: string; email?: string; name?: string }) => {
    setUser(user);
  }, []);

  return {
    trackError,
    trackMessage,
    trackUser,
  };
};