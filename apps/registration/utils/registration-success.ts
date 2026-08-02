const STORAGE_KEY = 'cp-registration-success'

export type RegistrationSuccessFlash = {
  email: string
}

export function setRegistrationSuccess(email: string): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  const payload: RegistrationSuccessFlash = { email }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function consumeRegistrationSuccess(): RegistrationSuccessFlash | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }
  const raw = sessionStorage.getItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as RegistrationSuccessFlash
    if (typeof parsed.email === 'string' && parsed.email.trim()) {
      return { email: parsed.email.trim() }
    }
    return null
  }
  catch {
    return null
  }
}
