import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PostalCodeSearchField from './PostalCodeSearchField.vue'

const formFieldStub = {
  template: '<div><slot :input-id="\'postalcode\'" :input-class="\'form-input\'" :aria-invalid="undefined" :aria-describedby="undefined" /></div>',
}

async function waitForSearch() {
  await new Promise(resolve => setTimeout(resolve, 250))
  await nextTick()
}

describe('PostalCodeSearchField', () => {
  it('shows search results when typing a municipality name', async () => {
    const model = ref({ postalcode: 0, municipality_name: '' })

    const wrapper = await mountSuspended(PostalCodeSearchField, {
      props: {
        modelValue: model.value,
        label: 'Postcode / gemeente',
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    await wrapper.find('#postalcode').setValue('meche')
    await waitForSearch()

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('2800')
    expect(wrapper.text()).toContain('Mechelen')
  })

  it('updates the model when a result is selected', async () => {
    const model = ref({ postalcode: 0, municipality_name: '' })

    const wrapper = await mountSuspended(PostalCodeSearchField, {
      props: {
        modelValue: model.value,
        label: 'Postcode / gemeente',
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    await wrapper.find('#postalcode').setValue('2800')
    await waitForSearch()

    const option = wrapper.findAll('[role="option"]').find(item => item.text().includes('Mechelen'))
    expect(option).toBeDefined()
    await option!.trigger('mousedown')
    await nextTick()

    expect(model.value.postalcode).toBe(2800)
    expect(model.value.municipality_name).toBe('Mechelen')
  })

  it('displays the selected value from the model', async () => {
    const model = ref({
      postalcode: 2800,
      municipality_name: 'Mechelen',
      street: '',
      house_number: '',
      box_number: '',
    })

    const wrapper = await mountSuspended(PostalCodeSearchField, {
      props: {
        modelValue: model.value,
        label: 'Postcode / gemeente',
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    await nextTick()

    expect((wrapper.find('#postalcode').element as HTMLInputElement).value).toContain('2800')
    expect((wrapper.find('#postalcode').element as HTMLInputElement).value).toContain('Mechelen')
  })

  it('keeps typed text while searching', async () => {
    const model = ref({ postalcode: 0, municipality_name: '', street: '', house_number: '', box_number: '' })

    const wrapper = await mountSuspended(PostalCodeSearchField, {
      props: {
        modelValue: model.value,
        label: 'Postcode / gemeente',
        'onUpdate:modelValue': (value: typeof model.value) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    await wrapper.find('#postalcode').setValue('m')
    await nextTick()

    expect((wrapper.find('#postalcode').element as HTMLInputElement).value).toBe('m')
    expect(model.value.postalcode).toBe(0)
  })
})
