export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: number
  type: NotificationType
  messageKey: string
  params?: Record<string, string>
}

const notifications = ref<Notification[]>([])
let nextId = 1

export function useNotification() {
  function notify(type: NotificationType, messageKey: string, params?: Record<string, string>) {
    const id = nextId++
    notifications.value.push({ id, type, messageKey, params })
    if (import.meta.client) {
      setTimeout(() => dismiss(id), 8000)
    }
  }

  function dismiss(id: number) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications: readonly(notifications),
    notify,
    dismiss,
  }
}
