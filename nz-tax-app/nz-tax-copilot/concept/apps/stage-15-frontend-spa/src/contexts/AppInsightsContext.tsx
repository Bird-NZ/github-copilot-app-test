import React, { createContext, useContext } from 'react';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.REACT_APP_APPINSIGHTS_CONNECTION_STRING || '',
    enableAutoRouteTracking: true,
    extensions: [reactPlugin],
  },
});

appInsights.loadAppInsights();

interface AppInsightsContextType {
  appInsights: ApplicationInsights;
}

const AppInsightsContext = createContext<AppInsightsContextType>({ appInsights });

export const AppInsightsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppInsightsContext.Provider value={{ appInsights }}>
      {children}
    </AppInsightsContext.Provider>
  );
};

export const useAppInsights = (): ApplicationInsights => {
  const context = useContext(AppInsightsContext);
  return context.appInsights;
};