<template>
  <div
    v-if="open && project"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center md:p-4"
    data-testid="project-detail-sheet"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl md:max-h-[90vh] md:max-w-lg md:rounded-2xl"
      role="dialog"
      aria-modal="true"
      :aria-label="project.name"
    >
      <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <h2 class="min-w-0 text-lg font-semibold text-gray-900">
          <span v-if="project.tableNumber != null" class="text-primary">
            {{ project.tableNumber }}.
          </span>
          {{ project.name }}
        </h2>
        <button
          type="button"
          class="shrink-0 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          data-testid="project-detail-close"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="overflow-y-auto px-4 py-4">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <LanguageBadge :language="project.language" />
          <PhotoConsentIcon :agreed-to-photo="project.agreedToPhoto" />
        </div>

        <img
          v-if="project.thumbnailUrl"
          :src="project.thumbnailUrl"
          :alt="project.name"
          class="mb-4 max-h-[40vh] w-full rounded-md bg-gray-50 object-contain"
          data-testid="project-detail-photo"
        >

        <p
          v-if="project.participants.length"
          class="mb-3 text-sm text-gray-600"
          data-testid="project-detail-participants"
        >
          {{ project.participants.join(', ') }}
        </p>

        <p
          class="whitespace-pre-wrap text-sm text-gray-700"
          data-testid="project-detail-description"
        >
          {{ project.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventguideProject } from '~/types/api'

defineProps<{
  open: boolean
  project: EventguideProject | null
}>()

const emit = defineEmits<{
  close: []
}>()
</script>
