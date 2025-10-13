import { apiClient } from '../lib/apiClient'
import { unwrapResponse } from '../utils/api'

const BASE_PATH = '/users'

export const authService = {
  async register(payload) {
    const response = await apiClient.post(`${BASE_PATH}/register/`, payload)
    return unwrapResponse(response)
  },
  async login(payload) {
    const response = await apiClient.post(`${BASE_PATH}/login/`, payload)
    return unwrapResponse(response)
  },
  async getProfile() {
    const response = await apiClient.get(`${BASE_PATH}/profile/`)
    return unwrapResponse(response)
  },
  async updateProfile(payload) {
    const response = await apiClient.put(`${BASE_PATH}/profile/`, payload)
    return unwrapResponse(response)
  },
  async deleteAccount() {
    const response = await apiClient.delete(`${BASE_PATH}/profile/`)
    return unwrapResponse(response)
  },
}
