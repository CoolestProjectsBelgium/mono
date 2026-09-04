<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <AppHeader :event-id="eventId" />
    <main id="main-content" class="min-h-0 flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const eventId = computed(() => {
  const raw = route.params.eventId
  if (raw == null) {
    return undefined
  }
  const parsed = Number.parseInt(String(raw), 10)
  return Number.isFinite(parsed) ? parsed : undefined
})
</script>
