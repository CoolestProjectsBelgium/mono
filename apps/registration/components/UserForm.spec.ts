import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UserForm from './UserForm.vue'
import { activeSettingsFixture } from '~/fixtures/settings'

describe('UserForm', () => {
  it('shows field error under matching input', async () => {
    const model = ref({
      email: '',
      firstname: '',
      lastname: '',
      year: 2008,
      month: 5,
      gsm: '',
      sex: 'm' as const,
      t_size: 0,
      email_guardian: '',
      gsm_guardian: '',
      general_questions: [],
      mandatory_approvals: [],
      language: 'nl',
      address: {
        postalcode: 0,
        street: '',
        house_number: '',
        box_number: '',
        municipality_name: '',
      },
      via: '',
      via_type: '',
      medical: '',
      delete_possible: false,
    })

    const wrapper = await mountSuspended(UserForm, {
      props: {
        modelValue: model.value,
        settings: activeSettingsFixture,
        errors: { email: 'validation_email' },
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.find('#email-error').text()).toBe('validation_email')
    expect((wrapper.find('#email').element as HTMLInputElement).disabled).toBe(false)
    expect(wrapper.find('[data-testid="email-locked-hint"]').exists()).toBe(false)
  })

  it('shows postal code field error', async () => {
    const model = ref({
      email: '',
      firstname: '',
      lastname: '',
      year: 2008,
      month: 5,
      gsm: '',
      sex: 'm' as const,
      t_size: 0,
      email_guardian: '',
      gsm_guardian: '',
      general_questions: [],
      mandatory_approvals: [],
      language: 'nl',
      address: {
        postalcode: 0,
        street: '',
        house_number: '',
        box_number: '',
        municipality_name: '',
      },
      via: '',
      via_type: '',
      medical: '',
      delete_possible: false,
    })

    const wrapper = await mountSuspended(UserForm, {
      props: {
        modelValue: model.value,
        settings: activeSettingsFixture,
        errors: { postalcode: 'validation_postalcode' },
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.find('#postalcode-error').text()).toBe('validation_postalcode')
  })

  it('displays pre-filled postal code from the model', async () => {
    const model = ref({
      email: '',
      firstname: '',
      lastname: '',
      year: 2008,
      month: 5,
      gsm: '',
      sex: 'm' as const,
      t_size: 0,
      email_guardian: '',
      gsm_guardian: '',
      general_questions: [],
      mandatory_approvals: [],
      language: 'nl',
      address: {
        postalcode: 2800,
        street: '',
        house_number: '',
        box_number: '',
        municipality_name: 'Mechelen',
      },
      via: '',
      via_type: '',
      medical: '',
      delete_possible: false,
    })

    const wrapper = await mountSuspended(UserForm, {
      props: {
        modelValue: model.value,
        settings: activeSettingsFixture,
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const input = wrapper.find('#postalcode')
    expect((input.element as HTMLInputElement).value).toContain('2800')
    expect((input.element as HTMLInputElement).value).toContain('Mechelen')
  })

  it('updates month options when birth year changes', async () => {
    const model = ref({
      email: '',
      firstname: '',
      lastname: '',
      year: 2019,
      month: 0,
      gsm: '',
      sex: 'm' as const,
      t_size: 0,
      email_guardian: '',
      gsm_guardian: '',
      general_questions: [],
      mandatory_approvals: [],
      language: 'nl',
      address: {
        postalcode: 0,
        street: '',
        house_number: '',
        box_number: '',
        municipality_name: '',
      },
      via: '',
      via_type: '',
      medical: '',
      delete_possible: false,
    })

    const wrapper = await mountSuspended(UserForm, {
      props: {
        modelValue: model.value,
        settings: activeSettingsFixture,
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const monthSelect = wrapper.find('#month')
    expect(monthSelect.findAll('option')).toHaveLength(7)

    await wrapper.find('#year').setValue('2008')
    await wrapper.vm.$nextTick()

    expect(model.value.month).toBe(-1)
    expect(wrapper.find('#month').findAll('option')).toHaveLength(8)
  })

  it('shows the dojo search field when CoderDojo is selected', async () => {
    const model = ref({
      email: '',
      firstname: '',
      lastname: '',
      year: 2008,
      month: 5,
      gsm: '',
      sex: 'm' as const,
      t_size: 0,
      email_guardian: '',
      gsm_guardian: '',
      general_questions: [],
      mandatory_approvals: [],
      language: 'nl',
      address: {
        postalcode: 0,
        street: '',
        house_number: '',
        box_number: '',
        municipality_name: '',
      },
      via: '',
      via_type: '' as const,
      medical: '',
      delete_possible: false,
    })

    const wrapper = await mountSuspended(UserForm, {
      props: {
        modelValue: model.value,
        settings: activeSettingsFixture,
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.find('#via').exists()).toBe(false)
    await wrapper.get('[data-testid="affiliation"] input[value="dojo"]').setValue(true)
    await wrapper.vm.$nextTick()
    expect(model.value.via_type).toBe('dojo')
    expect(wrapper.find('#via').exists()).toBe(true)
  })

  it('renders t-shirt sizes grouped by API group', async () => {
    const model = ref({
      email: '',
      firstname: '',
      lastname: '',
      year: 2008,
      month: 5,
      gsm: '',
      sex: 'm' as const,
      t_size: 0,
      email_guardian: '',
      gsm_guardian: '',
      general_questions: [],
      mandatory_approvals: [],
      language: 'nl',
      address: {
        postalcode: 0,
        street: '',
        house_number: '',
        box_number: '',
        municipality_name: '',
      },
      via: '',
      via_type: '' as const,
      medical: '',
      delete_possible: false,
    })

    const wrapper = await mountSuspended(UserForm, {
      props: {
        modelValue: model.value,
        settings: activeSettingsFixture,
        tshirtGroups: [
          { group: 'kids', items: [{ id: 1, name: 'kid_3-4' }] },
          { group: 'adults', items: [{ id: 2, name: 'adult_M' }] },
        ],
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const groups = wrapper.findAll('#t_size optgroup')
    expect(groups).toHaveLength(2)
    expect(groups[0]!.attributes('label')).toBe('kids')
    expect(groups[1]!.attributes('label')).toBe('adults')
    expect(wrapper.findAll('#t_size option')).toHaveLength(3)
  })

  it('shows a not-applicable option', async () => {
    const model = ref({
      email: '',
      firstname: '',
      lastname: '',
      year: 2008,
      month: 5,
      gsm: '',
      sex: 'm' as const,
      t_size: 0,
      email_guardian: '',
      gsm_guardian: '',
      general_questions: [],
      mandatory_approvals: [],
      language: 'nl',
      address: {
        postalcode: 0,
        street: '',
        house_number: '',
        box_number: '',
        municipality_name: '',
      },
      via: '',
      via_type: '' as const,
      medical: '',
      delete_possible: false,
    })

    const wrapper = await mountSuspended(UserForm, {
      props: {
        modelValue: model.value,
        settings: activeSettingsFixture,
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const na = wrapper.get('[data-testid="affiliation"] input[value="na"]')
    expect((na.element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.text()).toContain('Niet van toepassing')
    expect(wrapper.text()).not.toContain('Niet verplicht')
  })
})
