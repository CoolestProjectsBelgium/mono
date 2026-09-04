<template>
  <span
    class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase"
    :class="languageClass"
  >
    {{ language }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  language: string
}>()

const languageClass = computed(() => {
  switch (props.language) {
    case 'nl':
      return 'bg-primary/10 text-primary'
    case 'fr':
      return 'bg-gray-200 text-gray-700'
    default:
      return 'bg-amber-100 text-amber-800'
  }
})
</script>
