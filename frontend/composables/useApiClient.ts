import type { FetchOptions } from 'ofetch'
import { isEmptyApiResponse } from '~/utils/api-response'

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

    try {
      const response = await $fetch<T | null>(path, {
        baseURL: config.public.apiBase as string,
        credentials: 'include',
        ...options,
        headers,
      })
      return response
    }
    catch (error: unknown) {
      const fetchError = error as { statusCode?: number; status?: number; message?: string }
      const statusCode = fetchError.statusCode ?? fetchError.status
      if (statusCode === 401) {
        const authStore = useAuthStore()
        authStore.clearSession()
        if (import.meta.client) {
          await navigateTo('/login')
        }
      }
      throw new ApiError(fetchError.message ?? 'API request failed', statusCode)
    }
  }

  return {
    apiFetch,
    isEmptyApiResponse,
  }
}
