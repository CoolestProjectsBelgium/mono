import { describe, expect, it } from 'vitest'
import {
  activeSettingsFixture,
  closedRegistrationFixture,
  inactiveSettingsFixture,
  waitingListFixture,
} from '~/fixtures/settings'
import { mapSettingsToViewModel, shouldRedirectToNoEvent } from '~/utils/settings'

describe('mapSettingsToViewModel', () => {
  it('maps active open registration', () => {
    const vm = mapSettingsToViewModel(activeSettingsFixture)
    expect(vm.isActive).toBe(true)
    expect(vm.isRegistrationOpen).toBe(true)
    expect(vm.showRegistrationCta).toBe(true)
    expect(vm.showInactiveAlert).toBe(false)
    expect(vm.officialStartDate).toBeInstanceOf(Date)
  })

  it('shows inactive alert when event not active', () => {
    const vm = mapSettingsToViewModel(inactiveSettingsFixture)
    expect(vm.showInactiveAlert).toBe(true)
    expect(vm.showRegistrationCta).toBe(false)
  })

  it('shows registration closed alert', () => {
    const vm = mapSettingsToViewModel(closedRegistrationFixture)
    expect(vm.showRegistrationClosedAlert).toBe(true)
    expect(vm.showRegistrationCta).toBe(false)
  })

  it('shows waiting list alert', () => {
    const vm = mapSettingsToViewModel(waitingListFixture)
    expect(vm.showWaitingListAlert).toBe(true)
  })

  it('handles null settings', () => {
    const vm = mapSettingsToViewModel(null)
    expect(vm.isActive).toBe(false)
    expect(vm.eventTitle).toBe('')
  })
})

describe('shouldRedirectToNoEvent', () => {
  it('returns true when inactive', () => {
    expect(shouldRedirectToNoEvent(inactiveSettingsFixture)).toBe(true)
  })

  it('returns false when active', () => {
    expect(shouldRedirectToNoEvent(activeSettingsFixture)).toBe(false)
  })
})
