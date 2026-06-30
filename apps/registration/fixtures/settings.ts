import type { SettingDto } from '~/types/api'

export const activeSettingsFixture: SettingDto = {
  startDateEvent: '2026-06-15T00:00:00.000Z',
  maxAge: 18,
  minAge: 7,
  guardianAge: 16,
  tshirtDate: '2026-05-01T00:00:00.000Z',
  enviroment: 'dev',
  waitingListActive: false,
  maxUploadSize: 104857600,
  isActive: true,
  eventBeginDate: '2026-06-15T08:00:00.000Z',
  registrationOpenDate: '2026-03-01T00:00:00.000Z',
  registrationClosedDate: '2026-05-15T23:59:59.000Z',
  projectClosedDate: '2026-06-01T23:59:59.000Z',
  officialStartDate: '2026-06-15T09:00:00.000Z',
  eventEndDate: '2026-06-15T18:00:00.000Z',
  eventTitle: 'Coolest Projects 2026',
  isRegistrationOpen: true,
  isProjectClosed: false,
  maxRegistration: 500,
  maxParticipants: 4,
}

export const inactiveSettingsFixture: SettingDto = {
  ...activeSettingsFixture,
  isActive: false,
  isRegistrationOpen: false,
}

export const closedRegistrationFixture: SettingDto = {
  ...activeSettingsFixture,
  isRegistrationOpen: false,
}

export const waitingListFixture: SettingDto = {
  ...activeSettingsFixture,
  waitingListActive: true,
}
