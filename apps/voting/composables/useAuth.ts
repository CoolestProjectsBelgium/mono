import { ref, computed } from 'vue'

export const useAuth = () => {
  const config = useRuntimeConfig()
  
  // Runtime-safe API URL detection for static PWA builds
  const apiBaseURL = computed(() => {
    const configUrl = config.public.apiBaseURL
    if (configUrl) return configUrl
    
    // Fallback: detect from current window location in browser
    if (process.client) {
      const location = window.location
      // If app is served from same origin as API, use relative path
      return location.origin
    }
    
    return 'http://localhost:3001' // Development fallback
  })
  
  // Runtime-safe secure check for static PWA builds
  const isSecure = computed(() => {
    if (process.client) {
      return window.location.protocol === 'https:'
    }
    return process.env.NODE_ENV === 'production'
  })
  
  // Production-secure access token with short expiry
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60, // 1 hour - short expiry for access token
    sameSite: 'strict', // Stricter CSRF protection
    secure: isSecure.value, // Runtime-safe HTTPS check
    path: '/'
  })

  // Refresh token stored separately with longer expiry
  const refreshToken = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
    secure: isSecure.value, // Runtime-safe HTTPS check
    path: '/'
  })

  const user = useState<any>('auth_user', () => null)
  const loggedIn = computed(() => !!token.value)

  // Refresh token implementation
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value) return false
    try {
      const response = await $fetch<{ jwt: string; refreshToken?: string }>(`${apiBaseURL.value}/voting/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken.value}`
        }
      })
      
      token.value = response.jwt.startsWith('Bearer ') ? response.jwt : `Bearer ${response.jwt}`
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      return false
    }
  }

  const login = async (credentials: any) => {
    try {
      const response = await $fetch<{ jwt: string; refreshToken?: string }>(`${apiBaseURL.value}/voting/auth/login`, {
        method: 'POST',
        body: credentials,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Store tokens
      token.value = response.jwt.startsWith('Bearer ') ? response.jwt : `Bearer ${response.jwt}`
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }
      
      await fetchUser()
      navigateTo('/')
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Authentication failed')
    }
  }

  const fetchUser = async () => {
    if (!token.value) return
    try {
      user.value = await $fetch(`${apiBaseURL}/voting/auth/user`, {
        headers: {
          'Authorization': token.value
        }
      })
    } catch (error) {
      console.error('Fetch user failed:', error)
      // Attempt token refresh
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        await logout()
      }
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await $fetch(`${apiBaseURL.value}/voting/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': token.value
          }
        }).catch(() => {})
      }
    } finally {
      token.value = null
      refreshToken.value = null
      user.value = null
      navigateTo('/login')
    }
  }

  return {
    token,
    user,
    loggedIn,
    login,
    logout,
    fetchUser,
    refreshAccessToken,
    apiBaseURL,
    isSecure
  }
}
