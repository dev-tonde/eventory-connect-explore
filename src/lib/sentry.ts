import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: "https://your-sentry-dsn@sentry.io/project-id", // Replace with your actual DSN
    environment: import.meta.env.MODE,
    beforeSend(event) {
      // Filter out development errors
      if (import.meta.env.MODE === 'development') {
        console.log('Sentry Event:', event);
        return null; // Don't send in development
      }
      return event;
    },
  });
};

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setContext = Sentry.setContext;