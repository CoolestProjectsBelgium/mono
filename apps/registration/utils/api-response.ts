export type ApiUiState = 'ready' | 'noData' | 'unavailable'

export function isEmptyApiResponse<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined
}

export function resolveApiUiState<T>(value: T | null | undefined): ApiUiState {
  if (isEmptyApiResponse(value)) {
    return 'unavailable'
  }
  if (Array.isArray(value) && value.length === 0) {
    return 'noData'
  }
  return 'ready'
}

export function hasApiData<T>(value: T | null | undefined): value is T {
  return !isEmptyApiResponse(value)
}

type ApiErrorBody = { message?: string | string[] }

function readMessageFromBody(body: unknown): string | undefined {
  if (typeof body === 'string') {
    try {
      return readMessageFromBody(JSON.parse(body))
    }
    catch {
      return body.length > 0 ? body : undefined
    }
  }
  if (!body || typeof body !== 'object' || !('message' in body)) {
    return undefined
  }
  const message = (body as ApiErrorBody).message
  if (typeof message === 'string' && message.length > 0) {
    return message
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.join(', ')
  }
  return undefined
}

function isHttpStatusLine(message: string): boolean {
  return /^\[(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\]/i.test(message)
    || message === 'Bad Request'
    || message === 'API request failed'
}

/** Extract a user-facing message from ofetch / ApiError failures. */
export function getApiErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const err = error as {
    name?: string
    message?: string
    data?: unknown
    response?: { _data?: unknown }
  }

  for (const candidate of [err.data, err.response?._data, err]) {
    const fromBody = readMessageFromBody(candidate)
    if (fromBody) {
      return fromBody
    }
  }

  if (typeof err.message === 'string' && err.message.length > 0 && !isHttpStatusLine(err.message)) {
    return err.message
  }

  return undefined
}
