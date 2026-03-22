import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const b2cTenantName = import.meta.env.VITE_B2C_TENANT_NAME || 'nztaxcopilot';
const b2cClientId = import.meta.env.VITE_B2C_CLIENT_ID || '';
const b2cAuthority = import.meta.env.VITE_B2C_AUTHORITY || 
  `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com/B2C_1_signup_signin`;

export const msalConfig: Configuration = {
  auth: {
    clientId: b2cClientId,
    authority: b2cAuthority,
    knownAuthorities: [`${b2cTenantName}.b2clogin.com`],
    redirectUri: window.location.origin + '/auth/callback',
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(message);
      },
      piiLoggingEnabled: false,
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Handle redirect promise
msalInstance.initialize().then(() => {
  msalInstance.handleRedirectPromise()
    .then((response) => {
      if (response) {
        msalInstance.setActiveAccount(response.account);
      }
    })
    .catch((error) => {
      console.error('Authentication error:', error);
    });
});