import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { setAuthenticatedUser } from '../utils/telemetry';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  getAccessToken: () => Promise<string>;
  login: () => void;
  logout: () => void;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isAuthenticated && accounts[0]) {
      const userId = accounts[0].idTokenClaims?.sub;
      if (userId) {
        setAuthenticatedUser(userId);
      }
    }
    setInitialized(true);
  }, [isAuthenticated, accounts]);

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
        account: instance.getActiveAccount(),
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

  const userId = accounts[0]?.idTokenClaims?.sub || null;
  const user = accounts[0] || null;

  if (!initialized) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, getAccessToken, login, logout, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};