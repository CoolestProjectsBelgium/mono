<template>
  <div
    role="alert"
    :class="variantClasses"
    class="rounded-lg px-4 py-3"
    tabindex="-1"
  >
    <slot>{{ message }}</slot>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'info' | 'warning' | 'error' | 'success'
  message?: string
}>(), {
  variant: 'info',
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'warning':
      return 'border border-amber-300 bg-amber-50 text-amber-900'
    case 'error':
      return 'border border-red-300 bg-red-50 text-red-900'
    case 'success':
      return 'border border-green-300 bg-green-50 text-green-900'
    default:
      return 'border border-blue-300 bg-blue-50 text-blue-900'
  }
})
</script>
