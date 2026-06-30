<template>
  <section class="mb-8">
    <h2 v-if="title" class="mb-4 text-2xl font-bold text-gray-900">{{ title }}</h2>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
