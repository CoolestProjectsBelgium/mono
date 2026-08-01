const longDateFormat = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
} as const

export function useLongDate() {
  const { d } = useI18n()

  function formatLongDate(value: string | Date | null | undefined): string {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(value)
    return d(date, 'long')
  }

  return { formatLongDate }
}

export { longDateFormat }
