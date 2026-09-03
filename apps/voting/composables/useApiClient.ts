import type { FetchOptions } from 'ofetch'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-response'
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

function handleUnauthorizedSession(): void {
  useAuthStore().clearSession()
  clearCsrfToken()
  void navigateTo('/login')
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const apiBase = resolveApiBase(config.public.apiBaseURL as string)
  const authStore = useAuthStore()

  async function apiFetch<T>(
    path: string,
    options: FetchOptions<'json'> = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    }

    const bearer = authStore.authorization
    if (bearer && !headers.Authorization) {
      headers.Authorization = bearer
    }

    const method = (options.method ?? 'GET').toUpperCase()
    if (isUnsafeMethod(method) && !headers['x-csrf-token']) {
      const csrfToken = await ensureCsrfToken(apiBase)
      headers['x-csrf-token'] = csrfToken
    }

    let responseErrorMessage: string | undefined

    try {
      return await $fetch<T>(path, {
        baseURL: apiBase,
        credentials: 'include',
        ...options,
        headers,
        onResponseError({ response }) {
          const data = response._data as { message?: string } | undefined
          responseErrorMessage = data?.message ?? response.statusText
        },
      })
    }
    catch (error: unknown) {
      if (isAbortError(error)) {
        throw new ApiError('Request aborted')
      }

      const fetchError = error as { statusCode?: number, status?: number, message?: string }
      const statusCode = fetchError.statusCode ?? fetchError.status
      const message = responseErrorMessage
        ?? getApiErrorMessage(error)
        ?? fetchError.message
        ?? 'API request failed'

      if (statusCode === 401 && bearer) {
        handleUnauthorizedSession()
      }

      throw new ApiError(message, statusCode)
    }
  }

  return {
    apiFetch,
    apiBase,
    clearCsrfToken,
  }
}
