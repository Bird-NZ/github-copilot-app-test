import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights: ApplicationInsights | null = null;

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (appInsights) {
    appInsights.trackEvent({ name, properties });
  }
};

export const trackPageView = (name?: string) => {
  if (appInsights) {
    appInsights.trackPageView({ name });
  }
};