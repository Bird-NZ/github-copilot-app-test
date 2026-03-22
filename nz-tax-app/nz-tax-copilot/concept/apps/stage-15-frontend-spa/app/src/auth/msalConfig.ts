import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const b2cTenantName = import.meta.env.REACT_APP_B2C_TENANT_NAME || 'nztaxcopilot';
const b2cClientId = import.meta.env.REACT_APP_B2C_CLIENT_ID || '';
const b2cPolicyName = import.meta.env.REACT_APP_B2C_POLICY_NAME || 'B2C_1_signup_signin';

export const msalConfig: Configuration = {
  auth: {
    clientId: b2cClientId,
    authority: `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com/${b2cPolicyName}`,
    knownAuthorities: [`${b2cTenantName}.b2clogin.com`],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie