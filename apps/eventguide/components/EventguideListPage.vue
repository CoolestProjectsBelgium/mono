<template>

  <div v-if="pending" class="text-center text-gray-600">

    Loading projects...

  </div>

  <div v-else-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">

    {{ error }}

  </div>

  <template v-else-if="data">

    <ProjectList

      v-if="data.projects.length > 0"

      :projects="data.projects"

      @show-table="openTableModal"

    />

    <p v-else class="text-center text-gray-600">

      No projects found for this event.

    </p>

    <ProjectTableModal
      :open="selectedProject != null"
      :table-number="selectedProject?.tableNumber ?? null"
      :project-name="selectedProject?.name ?? ''"
      :floorplan-path="data.event.floorplanPath"
      :floorplan-version="data.event.floorplanVersion"
      @close="selectedProject = null"
    />

  </template>

</template>



<script setup lang="ts">

import type { EventguideProject } from '~/types/api'



const props = defineProps<{

  eventId?: number

}>()



const { pending, error, data, fetchProjects } = useEventguideProjects(props.eventId)

const selectedProject = ref<EventguideProject | null>(null)



function openTableModal(project: EventguideProject) {

  selectedProject.value = project

}



void fetchProjects()

</script>


