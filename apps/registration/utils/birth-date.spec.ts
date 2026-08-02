import { describe, expect, it } from 'vitest'
import { activeSettingsFixture } from '~/fixtures/settings'
import {
  getAgeBounds,
  getEligibleMonths,
  getEligibleYears,
  syncBirthMonth,
} from '~/utils/birth-date'

const bounds = getAgeBounds(activeSettingsFixture)

describe('birth-date', () => {
  it('lists eligible birth years from event age limits', () => {
    const years = getEligibleYears(bounds)
    expect(years[0]).toBe(2008)
    expect(years.at(-1)).toBe(2019)
  })

  it('filters eligible months for the selected year', () => {
    expect(getEligibleMonths(2008, bounds)).toEqual([5, 6, 7, 8, 9, 10, 11])
    expect(getEligibleMonths(2019, bounds)).toEqual([0, 1, 2, 3, 4, 5])
    expect(getEligibleMonths(2012, bounds)).toHaveLength(12)
  })

  it('resets month when it is not valid for the selected year', () => {
    expect(syncBirthMonth(2012, 6, bounds)).toBe(6)
    expect(syncBirthMonth(2012, -1, bounds)).toBe(-1)
    expect(syncBirthMonth(2008, 0, bounds)).toBe(-1)
    expect(syncBirthMonth(2008, 6, bounds)).toBe(6)
  })
})
