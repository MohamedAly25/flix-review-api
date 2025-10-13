export const unwrapResponse = (response) => response?.data?.data ?? response?.data ?? response

export const buildQueryParams = (params = {}) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&')
        : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&')
