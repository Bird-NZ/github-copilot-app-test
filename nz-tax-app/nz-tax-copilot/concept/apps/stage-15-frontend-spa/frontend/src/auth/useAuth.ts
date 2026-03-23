import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'

const API_SCOPE = `https://${import.meta.env.VITE_B2C_TENANT_NAME || 'nztaxcopilot'}.onmicrosoft.com/api/read`

export const useAuth = () => {
  const { instance, accounts } = useMsal()
  const isAuthenticated = accounts.length > 0

  const login = async () => {
    try {
      await instance.loginRedirect({
        scopes: ['openid', 'profile', 'email', API_SCOPE],
      })
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const logout = async () => {
    try {
      await instance.logoutRedirect({
        account: instance.getActiveAccount() || undefined,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getAccessToken = async (): Promise<string> => {
    const account = instance.getActiveAccount()
    if (!account) {
      throw new Error('No active account')
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: [API_SCOPE],
        account,
      })
      return response.accessToken
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect({
          scopes: [API_SCOPE],
          account,
        })
        throw new Error('User interaction required')
      }
      throw error
    }
  }

  const getUserId = (): string | null => {
    const account = instance.getActiveAccount()
    const sub = account?.idTokenClaims?.sub
    return typeof sub === 'string' ? sub : null
  }

  const getUserEmail = (): string | null => {
    const account = instance.getActiveAccount()
    const email = account?.idTokenClaims?.email
    return typeof email === 'string' ? email : null
  }

  return {
    isAuthenticated,
    login,
    logout,
    getAccessToken,
    getUserId,
    getUserEmail,
  }
}
