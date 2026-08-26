import type { FetchOptions } from 'ofetch'
import { getActivePinia } from 'pinia'
import { getApiErrorMessage, isEmptyApiResponse } from '~/utils/api-response'
import { resolveApiBase } from '~/utils/api-base'
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

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }
  const err = error as { name?: string, code?: string }
  return err.name === 'AbortError' || err.code === 'ABORT_ERR'
}

function extendAuthSession(path: string): void {
  // Public endpoints must not extend a client session that may only exist in localStorage.
  if (path === '/settings' || path.startsWith('/settings?')) {
    return
  }
  const pinia = getActivePinia()
  if (!pinia) {
    return
  }
  const authStore = useAuthStore(pinia)
  if (!authStore.isLoggedIn) {
    return
  }
  authStore.setExpires(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
}

function handleUnauthorizedSession(): void {
  const pinia = getActivePinia()
  if (!pinia) {
    return
  }
  const authStore = useAuthStore(pinia)
  if (!authStore.isLoggedIn) {
    return
  }
  authStore.clearSession()
  const localePath = useLocalePath()
  void navigateTo(localePath('/login'))
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  const apiBase = resolveApiBase(config.public.apiBase as string)

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
      const csrfToken = await ensureCsrfToken(apiBase)
      headers['x-csrf-token'] = csrfToken
    }

    let responseErrorMessage: string | undefined

    try {
      const response = await $fetch<T | null>(path, {
        baseURL: apiBase,
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
      extendAuthSession(path)
      return response
    }
    catch (error: unknown) {
      if (isAbortError(error)) {
        throw new ApiError('Request aborted')
      }

      const fetchError = error as { statusCode?: number, status?: number }
      const statusCode = fetchError.statusCode ?? fetchError.status
      const message = responseErrorMessage ?? getApiErrorMessage(error) ?? 'API request failed'
      if (statusCode === 401) {
        clearCsrfToken()
        handleUnauthorizedSession()
      }
      throw new ApiError(message, statusCode)
    }
  }

  return {
    apiFetch,
    isEmptyApiResponse,
    clearCsrfToken,
    apiBase,
  }
}
