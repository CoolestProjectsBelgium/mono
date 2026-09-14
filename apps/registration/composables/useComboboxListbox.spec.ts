import { describe, expect, it, vi, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { callComposable } from '~/tests/composable-utils'

function mouseEvent(type: string, init: MouseEventInit = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, ...init })
}

function pointerEvent(type: string, init: PointerEventInit = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerType: 'mouse',
    ...init,
  })
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

  it('keeps the list closed when there are no items', async () => {
    const { isOpen, highlightedIndex, reveal, list } = await setup()
    list.value = []

    reveal()

    expect(isOpen.value).toBe(false)
    expect(highlightedIndex.value).toBe(-1)
  })

  it('selects on mousedown and prevents the focus shift', async () => {
    const { reveal, onOptionMouseDown, onSelect, isOpen } = await setup()
    reveal()

    const event = mouseEvent('mousedown', { button: 0 })
    onOptionMouseDown('Balen', event)

    expect(event.defaultPrevented).toBe(true)
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith('Balen')
    expect(isOpen.value).toBe(false)
  })

  it('ignores mousedown from a non-primary button', async () => {
    const { reveal, onOptionMouseDown, onSelect, isOpen } = await setup()
    reveal()

    const event = mouseEvent('mousedown', { button: 2 })
    onOptionMouseDown('Balen', event)

    expect(event.defaultPrevented).toBe(false)
    expect(onSelect).not.toHaveBeenCalled()
    expect(isOpen.value).toBe(true)
  })

  it('does not select again on the click that follows mousedown', async () => {
    const { reveal, onOptionMouseDown, onOptionClick, onSelect } = await setup()
    reveal()

    onOptionMouseDown('Balen', mouseEvent('mousedown', { button: 0 }))
    onOptionClick('Balen')

    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('selects on a click that arrives without a mousedown', async () => {
    const { reveal, onOptionClick, onSelect, isOpen } = await setup()
    reveal()

    onOptionClick('Westerlo')

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith('Westerlo')
    expect(isOpen.value).toBe(false)
  })

  it('does not close the list on blur while it is open', async () => {
    const { reveal, onInputBlur, onDismiss, isOpen } = await setup()
    reveal()

    onInputBlur()

    expect(isOpen.value).toBe(true)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('still runs onDismiss on blur when the list is already closed', async () => {
    const { onInputBlur, onDismiss, isOpen } = await setup()

    expect(isOpen.value).toBe(false)
    onInputBlur()

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('dismisses on pointerdown outside the combobox', async () => {
    const { reveal, onDismiss, isOpen } = await setup()
    reveal()
    await nextTick()

    document.dispatchEvent(pointerEvent('pointerdown'))

    expect(isOpen.value).toBe(false)
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('dismisses on touchend outside the combobox', async () => {
    const { reveal, onDismiss, isOpen } = await setup()
    reveal()
    await nextTick()

    document.dispatchEvent(new Event('touchend', { bubbles: true }))

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
