<template>
  <div
    role="alert"
    class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900"
    tabindex="-1"
    ref="bannerRef"
  >
    <p class="font-medium">{{ $t('apiUnavailable.title') }}</p>
    <p class="mt-1 text-sm">{{ $t(messageKey) }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  messageKey?: string
}>()

const messageKey = computed(() => props.messageKey ?? 'apiUnavailable.default')
const bannerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  bannerRef.value?.focus()
})
</script>
