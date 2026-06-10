import type { SettingDto } from '~/types/api'

export interface AgeBounds {
  eventDate: Date
  beginAgeDate: Date
  endAgeDate: Date
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export function getAgeBounds(settings: Pick<SettingDto, 'officialStartDate' | 'minAge' | 'maxAge'>): AgeBounds {
  const eventDate = new Date(settings.officialStartDate)
  return {
    eventDate,
    beginAgeDate: startOfMonth(addYears(eventDate, -settings.maxAge)),
    endAgeDate: addYears(eventDate, -settings.minAge),
  }
}

export function getEligibleYears(bounds: AgeBounds): number[] {
  const years: number[] = []
  for (let year = bounds.beginAgeDate.getFullYear(); year <= bounds.endAgeDate.getFullYear(); year++) {
    years.push(year)
  }
  return years
}

export function getEligibleMonths(year: number, bounds: AgeBounds): number[] {
  const months: number[] = []
  for (let month = 0; month < 12; month++) {
    const candidate = new Date(year, month, 1)
    if (candidate < bounds.beginAgeDate || candidate > bounds.endAgeDate) {
      continue
    }
    months.push(month)
  }
  return months
}

export function differenceInYears(later: Date, earlier: Date): number {
  let years = later.getFullYear() - earlier.getFullYear()
  const monthDiff = later.getMonth() - earlier.getMonth()
  const dayDiff = later.getDate() - earlier.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--
  }
  return years
}

export function syncBirthMonth(year: number, currentMonth: number, bounds: AgeBounds): number {
  const eligibleMonths = getEligibleMonths(year, bounds)
  if (eligibleMonths.includes(currentMonth)) {
    return currentMonth
  }
  return -1
}

export function formatBirthMonth(month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, month, 1))
}

export function isGuardianRequired(
  settings: Pick<SettingDto, 'officialStartDate' | 'guardianAge'>,
  year: number,
  month: number,
): boolean {
  const eventDate = new Date(settings.officialStartDate)
  const birthDate = new Date(year, month, 1)
  return differenceInYears(eventDate, birthDate) < settings.guardianAge
}
