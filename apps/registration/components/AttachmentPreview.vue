<template>
  <div
    class="flex h-20 w-28 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50"
    data-testid="attachment-preview"
  >
    <img
      v-if="previewKind === 'image' && previewUrl"
      :src="previewUrl"
      :alt="filename"
      class="max-h-20 max-w-28 object-contain"
      loading="lazy"
      data-testid="attachment-preview-image"
    >
    <img
      v-else-if="previewKind === 'video' && posterUrl"
      :src="posterUrl"
      :alt="filename"
      class="max-h-20 max-w-28 object-contain"
      loading="lazy"
      data-testid="attachment-preview-poster"
    >
    <video
      v-else-if="previewKind === 'video' && previewUrl"
      :src="previewUrl"
      class="max-h-20 max-w-28 object-contain"
      muted
      playsinline
      preload="metadata"
      data-testid="attachment-preview-video"
    />
    <span
      v-else
      class="px-2 text-center text-xs text-gray-500"
      data-testid="attachment-preview-unavailable"
    >
      {{ unavailableLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { inferAttachmentMediaKind } from '~/utils/attachment-media'

const props = defineProps<{
  filename: string
  url?: string | null
  posterUrl?: string | null
  exists: boolean
  unavailableLabel: string
}>()

const previewKind = computed(() => inferAttachmentMediaKind(props.filename))

const previewUrl = computed(() => (props.exists ? props.url ?? null : null))
const posterUrl = computed(() => (props.exists ? props.posterUrl ?? null : null))
</script>
