import * as Sentry from "@sentry/react";

export const initSentry = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('API_KEY')) {
            return null;
          }
        }
        return event;
      }
    });
  }
};

export const SentryBoundary = Sentry.ErrorBoundary;
