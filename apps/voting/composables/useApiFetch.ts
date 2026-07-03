export const useApiFetch = <T = any>(url: string, options: any = {}) => {
  const { token, apiBaseURL, refreshAccessToken } = useAuth()

  const defaults = {
    baseURL: apiBaseURL.value,
    headers: token.value ? { 'Authorization': token.value } : {}
  }

  // Interceptor for handling token expiry and refresh
  return $fetch<T>(url, {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...options.headers,
      'Content-Type': 'application/json'
    },
    onResponseError: async ({ response }) => {
      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && token.value) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token
          return $fetch<T>(url, {
            ...defaults,
            ...options,
            headers: {
              ...defaults.headers,
              ...options.headers,
              'Authorization': token.value
            }
          })
        }
      }
    }
  })
}
