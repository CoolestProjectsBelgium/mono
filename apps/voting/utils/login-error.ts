import { ApiError } from '~/composables/useApiClient'

export function formatLoginError(error: unknown): string {
  if (error instanceof ApiError) {
    const status = error.statusCode ? `${error.statusCode}: ` : ''
    return `${status}${error.message}`
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Please check your credentials and try again.'
}
