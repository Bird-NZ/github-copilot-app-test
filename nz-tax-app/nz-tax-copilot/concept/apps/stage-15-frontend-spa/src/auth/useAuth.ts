import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;

  const login = async () => {
    try {
      await instance.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutRedirect({
        account: instance.getActiveAccount() || undefined,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getAccessToken = async (): Promise<string> => {
    const account = instance.getActiveAccount();
    if (!account) {
      throw new Error('No active account. User must log in.');
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account: account,
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect({
          scopes: ['openid', 'profile', 'email'],
          account: account,
        });
        throw new Error('User interaction required for token acquisition');
      }
      throw error;
    }
  };

  const getUserId = (): string | null => {
    const account = instance.getActiveAccount();
    return account?.idTokenClaims?.sub as string || null;
  };

  const getUserEmail = (): string | null => {
    const account = instance.getActiveAccount();
    return account?.username || null;
  };

  return { isAuthenticated, login, logout, getAccessToken, getUserId, getUserEmail };
};