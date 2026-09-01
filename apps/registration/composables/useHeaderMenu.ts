export function useHeaderMenu() {
  const isOpen = ref(false)
  const route = useRoute()

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  watch(isOpen, (open) => {
    if (!import.meta.client) {
      return
    }
    document.body.style.overflow = open ? 'hidden' : ''
  })

  watch(() => route.fullPath, () => {
    close()
  })

  function onEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', onEscape)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', onEscape)
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  })

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
