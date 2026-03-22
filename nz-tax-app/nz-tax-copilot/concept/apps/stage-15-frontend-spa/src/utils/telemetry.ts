import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();

const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING || '';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: connectionString,
    enableAutoRouteTracking: true,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: {},
    },
  },
});

if (connectionString) {
  appInsights.loadAppInsights();
}

export const setAuthenticatedUser = (userId: string) => {
  if (connectionString) {
    appInsights.setAuthenticatedUserContext(userId);
  }
};

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (connectionString) {
    appInsights.trackEvent({ name, properties });
  }
};

export default appInsights;