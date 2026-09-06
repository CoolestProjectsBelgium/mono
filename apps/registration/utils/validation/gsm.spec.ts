import { describe, expect, it } from 'vitest'
import { isBelgianGsm, normalizeGsm } from '~/utils/validation/gsm'

describe('normalizeGsm', () => {
  it('strips spaces and common separators', () => {
    expect(normalizeGsm('0470 12 34 56')).toBe('0470123456')
    expect(normalizeGsm('+32 470 12 34 56')).toBe('+32470123456')
    expect(normalizeGsm('0470/12.34.56')).toBe('0470123456')
  })
})

describe('isBelgianGsm', () => {
  it('accepts national and international formats with spaces', () => {
    expect(isBelgianGsm('0470 12 34 56')).toBe(true)
    expect(isBelgianGsm('+32 470 12 34 56')).toBe(true)
    expect(isBelgianGsm('0470123456')).toBe(true)
  })

  it('rejects numbers that are not Belgian mobiles', () => {
    expect(isBelgianGsm('123')).toBe(false)
    expect(isBelgianGsm('+31 6 12345678')).toBe(false)
  })
})
