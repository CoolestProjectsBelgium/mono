import type { MaybeRefOrGetter } from 'vue'

export interface ComboboxListboxOptions<T> {
  items: MaybeRefOrGetter<T[]>
  onSelect: (item: T) => void
  onDismiss: () => void
}

export function useComboboxListbox<T>(options: ComboboxListboxOptions<T>) {
  const items = computed(() => toValue(options.items))
  const isOpen = ref(false)
  const highlightedIndex = ref(-1)
  const rootRef = ref<HTMLElement | null>(null)

  function reveal() {
    if (items.value.length > 0) {
      isOpen.value = true
      highlightedIndex.value = 0
      return
    }

    isOpen.value = false
    highlightedIndex.value = -1
  }

  function close() {
    isOpen.value = false
    highlightedIndex.value = -1
  }

  function selectItem(item: T) {
    options.onSelect(item)
    close()
  }

  function dismiss() {
    close()
    options.onDismiss()
  }

  // Selection runs on mousedown, which fires before focus moves, so preventDefault
  // keeps the caret in the input. A touch tap reaches this through the mousedown
  // the browser synthesizes only once it has ruled the gesture out as a scroll.
  function onOptionMouseDown(item: T, event: MouseEvent) {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    selectItem(item)
  }

  // Only reached where no mousedown precedes the click, such as a programmatic
  // click or assistive tech. A pointer tap has already closed the list above.
  function onOptionClick(item: T) {
    if (!isOpen.value) {
      return
    }

    selectItem(item)
  }

  function onInputBlur() {
    // On touch the input blurs before the tap resolves, so closing here would
    // unmount the option and drop the selection. The list stays up until a pick,
    // Escape, or a press outside.
    if (isOpen.value) {
      return
    }

    options.onDismiss()
  }

  function onInputKeydown(event: KeyboardEvent) {
    if (!isOpen.value || items.value.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, items.value.length - 1)
    }
    else if (event.key === 'ArrowUp') {
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
    }
    else if (event.key === 'Enter') {
      event.preventDefault()
      const item = items.value[highlightedIndex.value]
      if (item) {
        selectItem(item)
      }
    }
    else if (event.key === 'Escape') {
      close()
    }
  }

  function onOutsidePress(event: Event) {
    if (!isOpen.value) {
      return
    }

    const root = rootRef.value
    const target = event.target
    if (!root || !(target instanceof Node) || root.contains(target)) {
      return
    }

    dismiss()
  }

  function addDocumentListeners() {
    if (!import.meta.client) {
      return
    }
    // touchend backs up pointerdown for the case where something else in the page
    // cancels the pointer event before it reaches the document.
    document.addEventListener('pointerdown', onOutsidePress, true)
    document.addEventListener('touchend', onOutsidePress, true)
  }

  function removeDocumentListeners() {
    if (!import.meta.client) {
      return
    }
    document.removeEventListener('pointerdown', onOutsidePress, true)
    document.removeEventListener('touchend', onOutsidePress, true)
  }

  watch(isOpen, (open) => {
    if (open) {
      addDocumentListeners()
      return
    }
    removeDocumentListeners()
  })

  onBeforeUnmount(() => {
    removeDocumentListeners()
  })

  return {
    isOpen,
    highlightedIndex,
    rootRef,
    reveal,
    close,
    onOptionMouseDown,
    onOptionClick,
    onInputBlur,
    onInputKeydown,
  }
}
