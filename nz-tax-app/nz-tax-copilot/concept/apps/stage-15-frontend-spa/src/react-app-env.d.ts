/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_URL: string;
    REACT_APP_B2C_TENANT_NAME: string;
    REACT_APP_B2C_CLIENT_ID: string;
    REACT_APP_B2C_AUTHORITY: string;
    REACT_APP_APPINSIGHTS_CONNECTION_STRING: string;
  }
}