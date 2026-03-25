import { useCallback, useEffect, useMemo, useState } from 'react'
import apiClient, { setAuthToken } from '../api/apiClient'

type AuthUser = {
  id: string
  email: string
}

type Session = {
  userId: string
  email: string
  createdAt?: string
}

const TOKEN_KEY = 'nz_tax_auth_token'

function readStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

function writeStoredToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_KEY)
  }
}

export const useAuth = () => {
  const [token, setTokenState] = useState<string | null>(() => readStoredToken())
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const applyToken = useCallback((nextToken: string | null) => {
    setTokenState(nextToken)
    writeStoredToken(nextToken)
    setAuthToken(nextToken)
  }, [])

  const refreshSession = useCallback(async () => {
    const currentToken = readStoredToken()
    if (!currentToken) {
      setSession(null)
      setLoading(false)
      return null
    }

    try {
      setAuthToken(currentToken)
      const response = await apiClient.get('/auth/session')
      const nextSession = response.data?.session || null
      setSession(nextSession)
      setLoading(false)
      return nextSession
    } catch {
      applyToken(null)
      setSession(null)
      setLoading(false)
      return null
    }
  }, [applyToken])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const signup = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const response = await apiClient.post('/auth/signup', { email, password })
    return response.data?.user
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post('/auth/signin', { email, password })
    const nextToken = response.data?.token as string | undefined
    const user = response.data?.user as AuthUser | undefined
    if (!nextToken || !user) throw new Error('LOGIN_FAILED')
    applyToken(nextToken)
    await refreshSession()
    return user
  }, [applyToken, refreshSession])

  const logout = useCallback(async () => {
    try {
      if (readStoredToken()) {
        await apiClient.post('/auth/signout')
      }
    } catch {
      // ignore signout cleanup errors
    } finally {
      applyToken(null)
      setSession(null)
    }
  }, [applyToken])

  const isAuthenticated = Boolean(session && token)

  return useMemo(() => ({
    isAuthenticated,
    isLoading: loading,
    login,
    signup,
    logout,
    refreshSession,
    getAccessToken: async () => readStoredToken() || '',
    getUserId: () => session?.userId || null,
    getUserEmail: () => session?.email || null,
  }), [isAuthenticated, loading, login, signup, logout, refreshSession, session])
}
