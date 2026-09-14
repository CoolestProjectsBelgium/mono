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

  const TAP_SLOP_PX = 12

  let pointerInList = false
  let lastPointerType: string | null = null
  let selectedThisGesture = false
  let gestureStartX = 0
  let gestureStartY = 0
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

  function capturePointer(event: PointerEvent) {
    const target = event.currentTarget
    if (!(target instanceof Element) || event.pointerId == null) {
      return
    }
    try {
      target.setPointerCapture(event.pointerId)
    }
    catch {
      // iOS Safari can throw if the node is not an active pointer target.
    }
  }

  function isTap(event: PointerEvent): boolean {
    return Math.abs(event.clientX - gestureStartX) <= TAP_SLOP_PX
      && Math.abs(event.clientY - gestureStartY) <= TAP_SLOP_PX
  }

  function onOptionPointerDown(item: T, event: PointerEvent) {
    pointerInList = true
    selectedThisGesture = false
    lastPointerType = event.pointerType || 'mouse'
    gestureStartX = event.clientX
    gestureStartY = event.clientY

    if (lastPointerType === 'mouse') {
      event.preventDefault()
      selectedThisGesture = true
      selectItem(item)
      return
    }

    // Keep pointerup on this option even if the keyboard dismisses and the list moves.
    capturePointer(event)
  }

  function onOptionPointerUp(item: T, event: PointerEvent) {
    if (lastPointerType === 'mouse' || selectedThisGesture) {
      return
    }

    if (!isTap(event)) {
      return
    }

    event.preventDefault()
    selectedThisGesture = true
    selectItem(item)
  }

  function onOptionClick(item: T) {
    if (lastPointerType === 'mouse' || selectedThisGesture) {
      lastPointerType = null
      selectedThisGesture = false
      return
    }

    selectItem(item)
    lastPointerType = null
  }

  function onInputBlur() {
    window.setTimeout(() => {
      if (pointerInList || selectedThisGesture) {
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
    onOptionPointerUp,
    onOptionClick,
    onInputBlur,
    onInputKeydown,
  }
}
