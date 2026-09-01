import { describe, expect, it, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { callComposable } from '~/tests/composable-utils'

describe('useHeaderMenu', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  it('starts closed and toggles open state', async () => {
    const { isOpen, toggle, open, close } = await callComposable(() => useHeaderMenu())

    expect(isOpen.value).toBe(false)
    open()
    expect(isOpen.value).toBe(true)
    close()
    expect(isOpen.value).toBe(false)
    toggle()
    expect(isOpen.value).toBe(true)
    toggle()
    expect(isOpen.value).toBe(false)
  })

  it('locks body scroll while open', async () => {
    const { isOpen } = await callComposable(() => useHeaderMenu())

    isOpen.value = true
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    isOpen.value = false
    await nextTick()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes on Escape key', async () => {
    const { isOpen, open } = await callComposable(() => useHeaderMenu())

    open()
    expect(isOpen.value).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(isOpen.value).toBe(false)
  })
})
