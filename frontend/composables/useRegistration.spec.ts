import { describe, expect, it, beforeEach } from 'vitest'
import { userFixture } from '~/fixtures/user'
import type { RegistrationFormState } from '~/utils/registration-payload'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

const form: RegistrationFormState = {
  user: { ...userFixture },
  isOwnProject: true,
  ownProject: { project_name: 'P', project_descr: 'D', project_type: 'T', project_lang: 'nl' },
  otherProject: { project_code: '' },
  mandatoryApprovals: ['1'],
}

describe('useRegistration', () => {
  beforeEach(() => mockFetch.mockReset())

  it('POST /registration with correct body', async () => {
    mockFetch.mockResolvedValue({})
    const { submitRegistration } = await callComposable(() => useRegistration())
    const ok = await submitRegistration(form)
    expect(ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/registration', expect.objectContaining({
      method: 'POST',
      body: expect.objectContaining({
        user: expect.objectContaining({ email: 'test@example.com' }),
        project: expect.objectContaining({ own_project: expect.any(Object) }),
      }),
    }))
  })
})
