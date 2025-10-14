import apiClient from '@/lib/api/client'
import { User, LoginCredentials, RegisterData, TokenResponse } from '@/types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await apiClient.post('/accounts/login/', credentials)
    // Backend wraps response in {success, message, data} format
    const data = response.data.data || response.data
    const { access, refresh } = data

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
    }

    return data
  },

  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post('/accounts/register/', data)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token')

      try {
        await apiClient.post('/accounts/logout/', { refresh: refreshToken })
      } finally {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/accounts/me/')
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async updateProfile(data: Partial<User> | FormData): Promise<User> {
    const response = await apiClient.patch('/accounts/me/', data)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },
}
