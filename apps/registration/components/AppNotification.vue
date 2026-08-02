<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      role="alert"
      :class="typeClasses(notification.type)"
      class="max-w-sm rounded-lg px-4 py-3 shadow-lg"
    >
      <p>{{ notification.text ?? $t(notification.messageKey, notification.params ?? {}) }}</p>
      <button
        type="button"
        class="mt-1 text-xs underline"
        @click="dismiss(notification.id)"
      >
        {{ $t('Cancel') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationType } from '~/composables/useNotification'

const { notifications, dismiss } = useNotification()

function typeClasses(type: NotificationType): string {
  switch (type) {
    case 'success': return 'bg-green-100 text-green-900 border border-green-300'
    case 'error': return 'bg-red-100 text-red-900 border border-red-300'
    case 'warning': return 'bg-amber-100 text-amber-900 border border-amber-300'
    default: return 'bg-blue-100 text-blue-900 border border-blue-300'
  }
}
</script>
