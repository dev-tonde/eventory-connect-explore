import React from 'react';
import * as Sentry from '@sentry/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

const DefaultErrorFallback = ({ error, resetError }: any) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          We're sorry, but something unexpected happened. Our team has been notified.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Button onClick={resetError} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Go Home
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-4 bg-muted rounded-lg">
          <summary className="cursor-pointer font-medium">Error Details</summary>
          <pre className="mt-2 text-xs overflow-auto">{error?.stack || 'No stack trace available'}</pre>
        </details>
      )}
    </div>
  </div>
);

export const ErrorBoundaryWithSentry = ({ children }: { children: React.ReactNode }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={DefaultErrorFallback}
      beforeCapture={(scope) => {
        scope.setTag('errorBoundary', true);
        scope.setLevel('error');
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default ErrorBoundaryWithSentry;