import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DojoSearchField from './DojoSearchField.vue'
import { dojoFixture } from '~/fixtures/dojos'

const formFieldStub = {
  template: '<div><slot :input-id="\'via\'" :input-class="\'form-input\'" :aria-invalid="undefined" :aria-describedby="undefined" /></div>',
}

async function waitForSearch() {
  await new Promise(resolve => setTimeout(resolve, 250))
  await nextTick()
}

describe('DojoSearchField', () => {
  it('does not show suggestions on focus when the input is empty', async () => {
    const model = ref('')

    const wrapper = await mountSuspended(DojoSearchField, {
      props: {
        modelValue: model.value,
        dojos: dojoFixture,
        label: 'Zoek een Dojo',
        'onUpdate:modelValue': (value: string) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    await wrapper.find('#via').trigger('focus')
    await nextTick()

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('shows search results when typing a dojo name', async () => {
    const model = ref('')

    const wrapper = await mountSuspended(DojoSearchField, {
      props: {
        modelValue: model.value,
        dojos: dojoFixture,
        label: 'Zoek een Dojo',
        'onUpdate:modelValue': (value: string) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    await wrapper.find('#via').setValue('bal')
    await waitForSearch()

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Balen')
  })

  it('updates the model when a result is selected', async () => {
    const model = ref('')

    const wrapper = await mountSuspended(DojoSearchField, {
      props: {
        modelValue: model.value,
        dojos: dojoFixture,
        label: 'Zoek een Dojo',
        'onUpdate:modelValue': (value: string) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    await wrapper.find('#via').setValue('bal')
    await waitForSearch()

    const option = wrapper.findAll('[role="option"]').find(item => item.text() === 'Balen')
    expect(option).toBeDefined()
    await option!.find('button').trigger('mousedown', { button: 0 })
    await nextTick()

    expect(model.value).toBe('Balen')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('shows search results while the keyboard holds an open composition', async () => {
    const model = ref('')

    const wrapper = await mountSuspended(DojoSearchField, {
      props: {
        modelValue: model.value,
        dojos: dojoFixture,
        label: 'Zoek een Dojo',
        'onUpdate:modelValue': (value: string) => {
          model.value = value
        },
      },
      global: {
        stubs: { FormField: formFieldStub },
      },
    })

    // Android keyboards compose the whole word, which stops v-model from syncing.
    const input = wrapper.find('#via')
    await input.trigger('compositionstart')
    ;(input.element as HTMLInputElement).value = 'bal'
    await input.trigger('input')
    await waitForSearch()

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Balen')
  })
})
