import { describe, expect, it, vi, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { callComposable } from '~/tests/composable-utils'

function pointerEvent(type: string, init: PointerEventInit = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerType: 'mouse',
    ...init,
  })
}

async function flushBlur() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('useComboboxListbox', () => {
  const items = ['Balen', 'Westerlo', 'Gent']
  let root: HTMLDivElement | undefined

  afterEach(() => {
    root?.remove()
    root = undefined
  })

  async function setup() {
    const onSelect = vi.fn()
    const onDismiss = vi.fn()
    const list = ref(items)

    const box = await callComposable(() => useComboboxListbox({
      items: list,
      onSelect,
      onDismiss,
    }))

    root = document.createElement('div')
    document.body.appendChild(root)
    box.rootRef.value = root

    return { ...box, onSelect, onDismiss, list }
  }

  it('reveals the list when items exist', async () => {
    const { isOpen, highlightedIndex, reveal } = await setup()

    reveal()

    expect(isOpen.value).toBe(true)
    expect(highlightedIndex.value).toBe(0)
  })

  it('selects on mouse pointerdown and prevents default', async () => {
    const { reveal, onOptionPointerDown, onSelect, isOpen } = await setup()
    reveal()

    const event = pointerEvent('pointerdown', { pointerType: 'mouse' })
    onOptionPointerDown('Balen', event)

    expect(event.defaultPrevented).toBe(true)
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith('Balen')
    expect(isOpen.value).toBe(false)
  })

  it('does not select on touch pointerdown', async () => {
    const { reveal, onOptionPointerDown, onSelect, isOpen } = await setup()
    reveal()

    onOptionPointerDown('Balen', pointerEvent('pointerdown', { pointerType: 'touch' }))

    expect(onSelect).not.toHaveBeenCalled()
    expect(isOpen.value).toBe(true)
  })

  it('selects on click after a touch press', async () => {
    const { reveal, onOptionPointerDown, onOptionClick, onSelect, isOpen } = await setup()
    reveal()

    onOptionPointerDown('Balen', pointerEvent('pointerdown', { pointerType: 'touch' }))
    onOptionClick('Balen')

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith('Balen')
    expect(isOpen.value).toBe(false)
  })

  it('does not select twice when mouse click follows pointerdown', async () => {
    const { reveal, onOptionPointerDown, onOptionClick, onSelect } = await setup()
    reveal()

    onOptionPointerDown('Balen', pointerEvent('pointerdown', { pointerType: 'mouse' }))
    onOptionClick('Balen')

    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('dismisses on blur when the pointer is not in the list', async () => {
    const { reveal, onInputBlur, onDismiss, isOpen } = await setup()
    reveal()

    onInputBlur()
    await flushBlur()

    expect(isOpen.value).toBe(false)
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does not dismiss on blur while the pointer is in the list', async () => {
    const { reveal, onListPointerDown, onInputBlur, onDismiss, isOpen } = await setup()
    reveal()
    onListPointerDown()

    onInputBlur()
    await flushBlur()

    expect(isOpen.value).toBe(true)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses on pointerdown outside the combobox', async () => {
    const { reveal, onDismiss, isOpen } = await setup()
    reveal()
    await nextTick()

    document.dispatchEvent(pointerEvent('pointerdown'))

    expect(isOpen.value).toBe(false)
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does not dismiss on pointerdown inside the combobox', async () => {
    const { reveal, onDismiss, isOpen } = await setup()
    reveal()
    await nextTick()

    const inside = document.createElement('button')
    root!.appendChild(inside)
    inside.dispatchEvent(pointerEvent('pointerdown'))

    expect(isOpen.value).toBe(true)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('closes on Escape without dismissing', async () => {
    const { reveal, onInputKeydown, onDismiss, isOpen } = await setup()
    reveal()

    onInputKeydown(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(isOpen.value).toBe(false)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('selects the highlighted item on Enter', async () => {
    const { reveal, onInputKeydown, onSelect, highlightedIndex, isOpen } = await setup()
    reveal()
    highlightedIndex.value = 1

    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
    onInputKeydown(event)

    expect(event.defaultPrevented).toBe(true)
    expect(onSelect).toHaveBeenCalledWith('Westerlo')
    expect(isOpen.value).toBe(false)
  })

  it('moves the highlight with arrow keys', async () => {
    const { reveal, onInputKeydown, highlightedIndex } = await setup()
    reveal()

    onInputKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }))
    expect(highlightedIndex.value).toBe(1)

    onInputKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }))
    expect(highlightedIndex.value).toBe(0)
  })
})
