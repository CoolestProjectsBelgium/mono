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
    expect(ok).toEqual({ ok: true })
    expect(mockFetch).toHaveBeenCalledWith('/registration', expect.objectContaining({
      method: 'POST',
      body: expect.objectContaining({
        user: expect.objectContaining({ email: 'test@example.com' }),
        project: expect.objectContaining({ own_project: expect.any(Object) }),
      }),
    }))
  })

  it('GET /questions', async () => {
    mockFetch.mockResolvedValue([{ id: 1, name: 'q1', description: 'd', positive: 'y', negative: 'n' }])
    const { fetchQuestions } = await callComposable(() => useRegistration())
    const questions = await fetchQuestions()
    expect(questions).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith('/questions', expect.any(Object))
  })
})
