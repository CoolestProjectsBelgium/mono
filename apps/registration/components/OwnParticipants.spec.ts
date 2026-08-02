import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createI18n } from 'vue-i18n'
import OwnParticipants from './OwnParticipants.vue'
import type { ParticipantDto } from '~/types/api'

const i18n = createI18n({
  legacy: false,
  locale: 'nl',
  messages: {
    nl: {
      participants: 'Deelnemer',
      'label_Voornaam:': 'Voornaam',
      participantStatusLabel: 'Status',
      participantPending: 'Uitnodiging open',
      participantStatusPending: 'Token nog niet gebruikt',
      participantStatusRegistered: 'Geregistreerd',
      participantCopyLink: 'Link kopiëren',
      participantCopyToken: 'Token kopiëren',
      AddToken: 'Deelnemer toevoegen',
      Delete: 'Verwijderen',
      pleaseWait: 'Even geduld',
    },
  },
})

const owner: ParticipantDto = {
  id: 1,
  name: 'Alex',
  self: true,
  status: 'registered',
}

const pendingInvite: ParticipantDto = {
  id: 10,
  name: '',
  self: false,
  status: 'pending',
  token: 'invite-token',
}

const registeredInvite: ParticipantDto = {
  id: 11,
  name: 'Sam',
  self: false,
  status: 'registered',
}

async function mountParticipants(props: Partial<InstanceType<typeof OwnParticipants>['$props']> = {}) {
  return mountSuspended(OwnParticipants, {
    props: {
      participants: [owner, pendingInvite],
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('OwnParticipants', () => {
  it('renders pending participant label and status dot', async () => {
    const wrapper = await mountParticipants()

    expect(wrapper.text()).toContain('Uitnodiging open')
    expect(wrapper.find('.bg-amber-400').exists()).toBe(true)
  })

  it('shows copy link and copy token actions only for pending invites', async () => {
    const wrapper = await mountParticipants()

    expect(wrapper.find('[data-testid="copy-invite"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="copy-token"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Token kopiëren')
  })

  it('hides copy actions for registered co-participants', async () => {
    const wrapper = await mountParticipants({
      participants: [owner, registeredInvite],
    })

    expect(wrapper.find('[data-testid="copy-invite"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="copy-token"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Sam')
  })

  it('disables add button when addDisabled is true', async () => {
    const wrapper = await mountParticipants({ addDisabled: true })

    const button = wrapper.find('button.btn-primary')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('shows loading label while adding', async () => {
    const wrapper = await mountParticipants({ adding: true })

    expect(wrapper.text()).toContain('Even geduld')
  })

  it('shows remove button for co-participants', async () => {
    const wrapper = await mountParticipants()

    expect(wrapper.find('[data-testid="remove-participant"]').exists()).toBe(true)
  })

  it('hides remove button when only the owner is listed', async () => {
    const wrapper = await mountParticipants({ participants: [owner] })

    expect(wrapper.find('[data-testid="remove-participant"]').exists()).toBe(false)
  })

  it('disables delete button while row is being removed', async () => {
    const wrapper = await mountParticipants({ removingParticipantId: 10 })

    const deleteButton = wrapper.find('[data-testid="remove-participant"]')
    expect(deleteButton.attributes('disabled')).toBeDefined()
    expect(deleteButton.text()).toBe('Even geduld')
  })
})
