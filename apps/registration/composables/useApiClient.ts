import type { FetchOptions } from 'ofetch'
import { getApiErrorMessage, isEmptyApiResponse } from '~/utils/api-response'
import { clearCsrfToken, ensureCsrfToken, isUnsafeMethod } from '~/utils/csrf-token'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  const route = useRoute()

  function getAcceptLanguage(): string {
    const i18n = nuxtApp.$i18n as { locale?: { value: string } } | undefined
    return i18n?.locale?.value ?? 'nl'
  }

  async function apiFetch<T>(
    path: string,
    options: FetchOptions<'json'> = {},
  ): Promise<T | null> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    }

    if (!headers['Accept-Language'] && !headers['accept-language']) {
      headers['Accept-Language'] = getAcceptLanguage()
    }

    const method = (options.method ?? 'GET').toUpperCase()
    if (isUnsafeMethod(method) && !headers['x-csrf-token']) {
      const csrfToken = await ensureCsrfToken(config.public.apiBase as string)
      headers['x-csrf-token'] = csrfToken
    }

    let responseErrorMessage: string | undefined

    try {
      const response = await $fetch<T | null>(path, {
        baseURL: config.public.apiBase as string,
        credentials: 'include',
        ...options,
        headers,
        onResponseError({ response }) {
          responseErrorMessage = getApiErrorMessage({
            data: response._data,
            statusCode: response.status,
          })
        },
      })
      return response
    }
    catch (error: unknown) {
      const fetchError = error as { statusCode?: number, status?: number }
      const statusCode = fetchError.statusCode ?? fetchError.status
      const message = responseErrorMessage ?? getApiErrorMessage(error) ?? 'API request failed'
      if (statusCode === 401) {
        clearCsrfToken()
        const authStore = useAuthStore()
        authStore.clearSession()
        // Do not redirect while activating a magic link — that strips ?token= from the URL.
        const onMagicLinkPage = path === '/login' || Boolean(route.query.token)
        if (import.meta.client && !onMagicLinkPage) {
          await navigateTo('/login')
        }
      }
      throw new ApiError(message, statusCode)
    }
  }

  return {
    apiFetch,
    isEmptyApiResponse,
    clearCsrfToken,
  }
}
