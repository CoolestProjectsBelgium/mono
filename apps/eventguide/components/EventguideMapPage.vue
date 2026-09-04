<template>

  <div v-if="pending" class="flex h-full items-center justify-center text-gray-600">

    Loading map...

  </div>

  <div v-else-if="error" class="p-4 text-red-700">

    {{ error }}

  </div>

  <ProjectMap

    v-else-if="data"

    :projects="data.projects"

    :floorplan-path="data.event.floorplanPath"

  />

</template>



<script setup lang="ts">

const props = defineProps<{

  eventId?: number

}>()



const { pending, error, data, fetchProjects } = useEventguideProjects(props.eventId)



void fetchProjects()

</script>


