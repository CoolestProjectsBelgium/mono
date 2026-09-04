<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader :event-id="eventId" />
    <main id="main-content" class="flex-1">
      <div class="mx-auto max-w-5xl px-4 py-8">
        <slot />
      </div>
    </main>
    <AppFooter />
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
