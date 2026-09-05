<template>
  <div class="space-y-3" data-testid="project-list">
    <article
      v-for="project in projects"
      :key="project.id"
      class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <button
        type="button"
        class="flex w-full items-start justify-between gap-3 px-4 py-4 text-left hover:bg-gray-50"
        :aria-expanded="expandedId === project.id"
        :data-testid="`project-toggle-${project.id}`"
        @click="toggle(project.id)"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg font-semibold text-gray-900">
              <span v-if="project.tableNumber != null" class="text-primary">
                {{ project.tableNumber }}.
              </span>
              {{ project.name }}
            </h2>
            <LanguageBadge :language="project.language" />
            <PhotoConsentIcon :agreed-to-photo="project.agreedToPhoto" />
          </div>
          <p v-if="project.participants.length" class="mt-1 text-sm text-gray-600">
            {{ project.participants.join(', ') }}
          </p>
        </div>
        <span class="text-sm text-gray-500">{{ expandedId === project.id ? '−' : '+' }}</span>
      </button>

      <div
        v-if="expandedId === project.id"
        class="border-t border-gray-100 px-4 py-4"
        :data-testid="`project-panel-${project.id}`"
      >
        <img
          v-if="project.thumbnailUrl"
          :src="project.thumbnailUrl"
          :alt="project.name"
          class="mb-4 max-h-64 w-full rounded-md object-cover"
        >
        <p class="whitespace-pre-wrap text-sm text-gray-700">
          {{ project.description }}
        </p>
        <button
          v-if="project.tableNumber != null"
          type="button"
          class="btn-secondary mt-4"
          data-testid="show-table-map"
          @click="emit('showTable', project)"
        >
          Show on map
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { EventguideProject } from '~/types/api'

defineProps<{
  projects: EventguideProject[]
}>()

const emit = defineEmits<{
  showTable: [project: EventguideProject]
}>()

const expandedId = ref<number | null>(null)

function toggle(projectId: number) {
  expandedId.value = expandedId.value === projectId ? null : projectId
}
</script>
