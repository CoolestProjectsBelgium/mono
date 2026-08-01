import type { SettingDto } from '~/types/api'

export interface SettingsViewModel {
  isActive: boolean
  isRegistrationOpen: boolean
  waitingListActive: boolean
  eventTitle: string
  officialStartDate: Date | null
  registrationOpenDate: Date | null
  registrationClosedDate: Date | null
  projectClosedDate: Date | null
  minAge: number
  maxAge: number
  maxRegistration: number
  maxParticipants: number
  showInactiveAlert: boolean
  showRegistrationClosedAlert: boolean
  showWaitingListAlert: boolean
  showRegistrationCta: boolean
}

function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function mapSettingsToViewModel(settings: SettingDto | null): SettingsViewModel {
  const isActive = settings?.isActive ?? false
  const isRegistrationOpen = settings?.isRegistrationOpen ?? false
  const waitingListActive = settings?.waitingListActive ?? false

  return {
    isActive,
    isRegistrationOpen,
    waitingListActive,
    eventTitle: settings?.eventTitle ?? '',
    officialStartDate: parseDate(settings?.officialStartDate),
    registrationOpenDate: parseDate(settings?.registrationOpenDate),
    registrationClosedDate: parseDate(settings?.registrationClosedDate),
    projectClosedDate: parseDate(settings?.projectClosedDate),
    minAge: settings?.minAge ?? 0,
    maxAge: settings?.maxAge ?? 0,
    maxRegistration: settings?.maxRegistration ?? 0,
    maxParticipants: settings?.maxParticipants ?? 0,
    showInactiveAlert: !isActive,
    showRegistrationClosedAlert: isActive && !isRegistrationOpen,
    showWaitingListAlert: isActive && waitingListActive,
    showRegistrationCta: isActive && isRegistrationOpen,
  }
}

export function shouldRedirectToNoEvent(settings: SettingDto | null): boolean {
  return !settings?.isActive
}
