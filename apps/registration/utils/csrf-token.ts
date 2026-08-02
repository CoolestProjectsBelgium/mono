const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let cachedToken: string | null = null
let inflight: Promise<string> | null = null

export function isUnsafeMethod(method?: string): boolean {
  return UNSAFE_METHODS.has((method ?? 'GET').toUpperCase())
}

export function clearCsrfToken(): void {
  cachedToken = null
  inflight = null
}

export async function ensureCsrfToken(baseURL: string): Promise<string> {
  if (cachedToken) {
    return cachedToken
  }

  if (!inflight) {
    inflight = $fetch<{ csrfToken: string }>('/csrf-token', {
      baseURL,
      credentials: 'include',
    }).then((response) => {
      cachedToken = response.csrfToken
      return cachedToken
    }).finally(() => {
      inflight = null
    })
  }

  return inflight
}
