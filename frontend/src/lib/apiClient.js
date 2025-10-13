import axios from 'axios'
import { env } from '../config/env'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-toastify'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error
    if (!response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    if (response.status === 401) {
      useAuthStore.getState().clearAuth()
      toast.error('Session expired. Please log in again.')
    }

    if (response.status >= 500) {
      toast.error('Unexpected server error. Please try again later.')
    }

    return Promise.reject(error)
  },
)
