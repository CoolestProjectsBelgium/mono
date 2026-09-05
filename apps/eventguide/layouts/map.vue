<template>
  <div class="map-layout">
    <AppHeader :event-id="eventId" />
    <main id="main-content" class="h-full min-h-0 overflow-hidden">
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
