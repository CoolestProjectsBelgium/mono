<template>
  <div
    role="alert"
    :class="bannerClass"
    tabindex="-1"
    ref="bannerRef"
  >
    <p v-if="!hideTitle" class="font-medium">{{ $t('apiUnavailable.title') }}</p>
    <p :class="hideTitle ? '' : 'mt-1 text-sm'">{{ $t(messageKey) }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  messageKey?: string
  hideTitle?: boolean
  variant?: 'warning' | 'info'
}>(), {
  variant: 'warning',
})

const messageKey = computed(() => props.messageKey ?? 'apiUnavailable.default')
const bannerClass = computed(() =>
  props.variant === 'info'
    ? 'rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-blue-900'
    : 'rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900',
)
const bannerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  bannerRef.value?.focus()
})
</script>
