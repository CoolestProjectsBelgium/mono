import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ConfirmDialog from './ConfirmDialog.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      Cancel: 'Cancel',
      pleaseWait: 'Please wait',
    },
  },
})

async function mountDialog(props: Partial<InstanceType<typeof ConfirmDialog>['$props']> = {}) {
  return mount(ConfirmDialog, {
    props: {
      open: false,
      title: 'Leave this project?',
      message: 'You will leave the project.',
      confirmLabel: 'Leave project',
      cancelLabel: 'Cancel',
      pleaseWaitLabel: 'Please wait',
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('ConfirmDialog', () => {
  it('renders title and message when open', async () => {
    const wrapper = await mountDialog({ open: true })
    expect(wrapper.get('[data-testid="confirm-dialog"]').text()).toContain('Leave this project?')
    expect(wrapper.get('[data-testid="confirm-dialog"]').text()).toContain('You will leave the project.')
  })

  it('emits confirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    const wrapper = mount(defineComponent({
      components: { ConfirmDialog },
      template: `
        <ConfirmDialog
          :open="true"
          title="Leave this project?"
          message="You will leave the project."
          confirm-label="Leave project"
          cancel-label="Cancel"
          @confirm="onConfirm"
        />
      `,
      setup: () => ({ onConfirm }),
    }), { global: { plugins: [i18n] } })

    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('emits cancel and closes when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const wrapper = mount(defineComponent({
      components: { ConfirmDialog },
      template: `
        <ConfirmDialog
          :open="true"
          title="Leave this project?"
          message="You will leave the project."
          confirm-label="Leave project"
          cancel-label="Cancel"
          @cancel="onCancel"
          @update:open="open = $event"
        />
      `,
      setup: () => ({ onCancel, open: true }),
    }), { global: { plugins: [i18n] } })

    await wrapper.get('[data-testid="confirm-dialog-cancel"]').trigger('click')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not emit confirm while loading', async () => {
    const wrapper = await mountDialog({ open: true, loading: true })
    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
