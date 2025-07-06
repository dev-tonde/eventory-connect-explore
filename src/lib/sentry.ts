import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: "https://a43022a2068cfd6931f3f5d89ff65560@o4509621706162176.ingest.de.sentry.io/4509621743321168",
    environment: import.meta.env.MODE,
    beforeSend(event) {
      // Filter out development errors
      if (import.meta.env.MODE === "development") {
        console.log("Sentry Event:", event);
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
