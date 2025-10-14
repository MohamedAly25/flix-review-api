'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import { User, RegisterData } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: FormData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')

      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        }
      }
    }

    setIsLoading(false)
  }

  async function login(email: string, password: string) {
    try {
      // Login returns token response with user_id, username, email
      await authService.login({ email, password })
      // Fetch full user data since token response doesn't include all fields
      const userData = await authService.getCurrentUser()
      setUser(userData)
      router.push('/movies')
    } catch (error) {
      throw error
    }
  }

  async function register(data: RegisterData) {
    try {
      await authService.register(data)
      await login(data.email, data.password)
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
      router.push('/login')
    }
  }

  async function updateProfile(data: FormData) {
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  async function refreshUser() {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
