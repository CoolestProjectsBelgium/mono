<template>
  <span
    class="inline-flex items-center gap-1 text-xs font-medium"
    :class="agreedToPhoto ? 'text-green-700' : 'text-red-700'"
    :title="agreedToPhoto ? 'Photo consent given' : 'No photo consent'"
    data-testid="photo-consent-icon"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 7h2l2-3h8l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm8 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
    </svg>
    <span class="sr-only">{{ agreedToPhoto ? 'Photo consent given' : 'No photo consent' }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  agreedToPhoto: boolean
}>()
</script>
