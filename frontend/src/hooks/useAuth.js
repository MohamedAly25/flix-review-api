import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const user = useAuthStore((state) => state.user)
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.clearAuth)

  return useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken),
      setTokens,
      setUser,
      logout,
    }),
    [accessToken, refreshToken, user, setTokens, setUser, logout],
  )
}
