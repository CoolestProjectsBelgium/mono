import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
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
  return mountSuspended(ConfirmDialog, {
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
  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = await mountDialog({ open: true })
    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel and closes when cancel button is clicked', async () => {
    const wrapper = await mountDialog({ open: true })
    const cancelButton = wrapper.findAll('button').find(button => button.text() === 'Cancel')
    await cancelButton!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('does not emit confirm while loading', async () => {
    const wrapper = await mountDialog({ open: true, loading: true })
    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
