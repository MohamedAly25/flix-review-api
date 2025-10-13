import { apiClient } from '../lib/apiClient'
import { buildQueryParams, unwrapResponse } from '../utils/api'

const BASE_PATH = '/reviews'

export const reviewService = {
  async list(params = {}) {
    const query = buildQueryParams(params)
    const response = await apiClient.get(`${BASE_PATH}/${query ? `?${query}` : ''}`)
    return unwrapResponse(response)
  },
  async listByMovieSlug(slug) {
    const response = await apiClient.get(`${BASE_PATH}/movie/${slug}/`)
    return unwrapResponse(response)
  },
  async search(params = {}) {
    const query = buildQueryParams(params)
    const response = await apiClient.get(`${BASE_PATH}/search/${query ? `?${query}` : ''}`)
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
}
