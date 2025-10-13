const FALLBACK_API_BASE_URL = 'http://localhost:8000/api'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || FALLBACK_API_BASE_URL,
}
