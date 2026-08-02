export function baseUrlWithLanguage(baseUrl: string, language: string): string {
  const trimmed = baseUrl.replace(/\/$/, '')
  if (language === 'nl') {
    return trimmed
  }
  return `${trimmed}/${language}`
}

export function buildRegistrationInviteUrl(
  baseUrl: string,
  language: string,
  token: string,
): string {
  return `${baseUrlWithLanguage(baseUrl, language)}/registration?token=${encodeURIComponent(token)}`
}

export function buildInviteMailtoUrl(
  subject: string,
  body: string,
): string {
  const params = new URLSearchParams()
  params.set('subject', subject)
  params.set('body', body)
  return `mailto:?${params.toString()}`
}
