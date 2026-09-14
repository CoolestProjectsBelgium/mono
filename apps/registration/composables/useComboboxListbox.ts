import type { MaybeRefOrGetter } from 'vue'

export interface ComboboxListboxOptions<T> {
  items: MaybeRefOrGetter<T[]>
  onSelect: (item: T) => void
  onDismiss: () => void
}

type Point = { x: number, y: number }

const TAP_SLOP_PX = 12

function eventPoint(event: PointerEvent | TouchEvent): Point | null {
  if ('changedTouches' in event) {
    const touch = event.changedTouches[0] ?? event.touches[0]
    return touch ? { x: touch.clientX, y: touch.clientY } : null
  }

  return { x: event.clientX, y: event.clientY }
}

export function useComboboxListbox<T>(options: ComboboxListboxOptions<T>) {
  const items = computed(() => toValue(options.items))
  const isOpen = ref(false)
  const highlightedIndex = ref(-1)
  const rootRef = ref<HTMLElement | null>(null)

  let pointerInList = false
  let lastPointerType: string | null = null
  let selectedThisGesture = false
  let pendingItem: T | null = null
  let gestureStart: Point | null = null
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

  function resetGesture() {
    pendingItem = null
    gestureStart = null
    pointerInList = false
  }

  function selectItem(item: T) {
    options.onSelect(item)
    close()
    resetGesture()
  }

  function dismiss() {
    close()
    options.onDismiss()
    resetGesture()
  }

  function isMousePointer(pointerType: string | undefined) {
    return pointerType === 'mouse'
  }

  function isTap(event: PointerEvent | TouchEvent): boolean {
    const point = eventPoint(event)
    if (!point || !gestureStart) {
      return false
    }

    return Math.abs(point.x - gestureStart.x) <= TAP_SLOP_PX
      && Math.abs(point.y - gestureStart.y) <= TAP_SLOP_PX
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

  function beginTouchGesture(item: T, event: PointerEvent | TouchEvent) {
    pointerInList = true
    selectedThisGesture = false
    lastPointerType = 'pointerType' in event ? (event.pointerType || 'touch') : 'touch'
    pendingItem = item
    gestureStart = eventPoint(event)
  }

  function commitTouchTap(item: T, event: PointerEvent | TouchEvent) {
    if (isMousePointer(lastPointerType ?? undefined) || selectedThisGesture) {
      return false
    }

    if (!isTap(event)) {
      return false
    }

    if ('preventDefault' in event) {
      event.preventDefault()
    }
    selectedThisGesture = true
    selectItem(item)
    return true
  }

  function onListPointerDown() {
    pointerInList = true
  }

  function onOptionPointerDown(item: T, event: PointerEvent) {
    if (isMousePointer(event.pointerType)) {
      pointerInList = true
      lastPointerType = 'mouse'
      selectedThisGesture = true
      event.preventDefault()
      selectItem(item)
      return
    }

    beginTouchGesture(item, event)
    capturePointer(event)
  }

  function onOptionPointerUp(item: T, event: PointerEvent) {
    commitTouchTap(item, event)
  }

  function onOptionPointerCancel(item: T, event: PointerEvent) {
    // Keyboard dismiss often turns a tap into pointercancel instead of pointerup.
    commitTouchTap(item, event)
  }

  function onOptionTouchStart(item: T, event: TouchEvent) {
    if (selectedThisGesture || lastPointerType === 'mouse') {
      return
    }
    beginTouchGesture(item, event)
  }

  function onOptionTouchEnd(item: T, event: TouchEvent) {
    commitTouchTap(item, event)
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
    // iOS Safari blurs the input before the tap reaches the option. Closing the
    // list here unmounts the target and drops the selection. Leave the list up
    // until a pick, Escape, or a press outside.
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

  function onDocumentPointerUp(event: PointerEvent) {
    if (pendingItem && commitTouchTap(pendingItem, event)) {
      return
    }

    if (gestureEndTimer) {
      clearTimeout(gestureEndTimer)
    }
    gestureEndTimer = setTimeout(() => {
      pointerInList = false
      if (!selectedThisGesture) {
        pendingItem = null
        gestureStart = null
      }
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
    onOptionPointerCancel,
    onOptionTouchStart,
    onOptionTouchEnd,
    onOptionClick,
    onInputBlur,
    onInputKeydown,
  }
}
