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

  let pointerInList = false
  let lastPointerType: string | null = null
  let gestureEndTimer: ReturnType<typeof setTimeout> | undefined

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
    pointerInList = false
  }

  function dismiss() {
    close()
    options.onDismiss()
    pointerInList = false
  }

  function onListPointerDown() {
    pointerInList = true
  }

  function onOptionPointerDown(item: T, event: PointerEvent) {
    pointerInList = true
    lastPointerType = event.pointerType || 'mouse'

    if (lastPointerType === 'mouse') {
      event.preventDefault()
      selectItem(item)
    }
  }

  function onOptionClick(item: T) {
    if (lastPointerType === 'mouse') {
      lastPointerType = null
      return
    }

    selectItem(item)
    lastPointerType = null
  }

  function onInputBlur() {
    window.setTimeout(() => {
      if (pointerInList) {
        return
      }

      if (isOpen.value) {
        dismiss()
        return
      }

      options.onDismiss()
    }, 0)
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

  function onDocumentPointerDown(event: PointerEvent) {
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

  function onDocumentPointerUp() {
    if (gestureEndTimer) {
      clearTimeout(gestureEndTimer)
    }
    gestureEndTimer = setTimeout(() => {
      pointerInList = false
      gestureEndTimer = undefined
    }, 0)
  }

  function addDocumentListeners() {
    if (!import.meta.client) {
      return
    }
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('pointerup', onDocumentPointerUp, true)
    document.addEventListener('pointercancel', onDocumentPointerUp, true)
  }

  function removeDocumentListeners() {
    if (!import.meta.client) {
      return
    }
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    document.removeEventListener('pointerup', onDocumentPointerUp, true)
    document.removeEventListener('pointercancel', onDocumentPointerUp, true)
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
    if (gestureEndTimer) {
      clearTimeout(gestureEndTimer)
    }
  })

  return {
    isOpen,
    highlightedIndex,
    rootRef,
    reveal,
    close,
    onListPointerDown,
    onOptionPointerDown,
    onOptionClick,
    onInputBlur,
    onInputKeydown,
  }
}
