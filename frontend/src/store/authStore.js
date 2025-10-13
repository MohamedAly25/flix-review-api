import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

const decodeUser = (token) => {
  if (!token) return null
  try {
    const decoded = jwtDecode(token)
    return {
      id: decoded.user_id || decoded.id || decoded.sub || null,
      email: decoded.email || null,
      username: decoded.username || decoded.name || null,
      isAdmin: Boolean(decoded.is_admin || decoded.is_staff || decoded.is_superuser),
      raw: decoded,
    }
  } catch (error) {
    console.warn('Failed to decode JWT', error)
    return null
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: ({ accessToken, refreshToken }) => {
        const user = decodeUser(accessToken)
        set({ accessToken, refreshToken: refreshToken || get().refreshToken, user })
      },
      setUser: (user) => set({ user }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: 'flix-review-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
