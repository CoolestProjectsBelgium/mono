<template>
  <EventguideListPage :event-id="eventId" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const eventId = computed(() => Number.parseInt(String(route.params.eventId), 10))
</script>
