import { apiClient } from '../lib/apiClient'
import { buildQueryParams, unwrapResponse } from '../utils/api'

const BASE_PATH = '/movies'

export const movieService = {
  async list(params = {}) {
    const query = buildQueryParams(params)
    const response = await apiClient.get(`${BASE_PATH}/${query ? `?${query}` : ''}`)
    return unwrapResponse(response)
  },
  async retrieve(id) {
    const response = await apiClient.get(`${BASE_PATH}/${id}/`)
    return unwrapResponse(response)
  },
  async create(payload) {
    const response = await apiClient.post(`${BASE_PATH}/`, payload)
    return unwrapResponse(response)
  },
  async update(id, payload) {
    const response = await apiClient.put(`${BASE_PATH}/${id}/`, payload)
    return unwrapResponse(response)
  },
  async destroy(id) {
    const response = await apiClient.delete(`${BASE_PATH}/${id}/`)
    return unwrapResponse(response)
  },
  async getRecommendations(type = 'recommendations', params = {}) {
    const query = buildQueryParams(params)
    const response = await apiClient.get(`/recommendations/${type}/${query ? `?${query}` : ''}`)
    return unwrapResponse(response)
  },
}
