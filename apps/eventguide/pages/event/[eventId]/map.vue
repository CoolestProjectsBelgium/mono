<template>
  <EventguideMapPage :event-id="eventId" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'map',
})

const route = useRoute()
const eventId = computed(() => Number.parseInt(String(route.params.eventId), 10))
</script>
