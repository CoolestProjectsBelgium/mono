import { describe, expect, it, beforeEach } from 'vitest'
import { consumeRegistrationSuccess, setRegistrationSuccess } from './registration-success'

describe('registration-success', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('set and consume returns email', () => {
    setRegistrationSuccess('test@example.com')
    expect(consumeRegistrationSuccess()).toEqual({ email: 'test@example.com' })
  })

  it('second consume returns null', () => {
    setRegistrationSuccess('test@example.com')
    consumeRegistrationSuccess()
    expect(consumeRegistrationSuccess()).toBeNull()
  })

  it('clears storage after consume', () => {
    setRegistrationSuccess('test@example.com')
    consumeRegistrationSuccess()
    expect(sessionStorage.length).toBe(0)
  })
})
