<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    data-testid="attachment-lightbox"
  >
    <button
      type="button"
      class="absolute inset-0 bg-black/80"
      :aria-label="closeLabel"
      @click="closeLightbox"
    />
    <div
      class="relative z-10 flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-4"
      @click.stop
    >
      <p class="max-w-full truncate text-sm text-white">{{ filename }}</p>
      <img
        v-if="mediaKind === 'image' && url"
        :src="url"
        :alt="filename"
        class="max-h-[80vh] max-w-[90vw] object-contain"
        data-testid="attachment-lightbox-image"
      >
      <video
        v-else-if="mediaKind === 'video' && url"
        :src="url"
        class="max-h-[80vh] max-w-[90vw] object-contain"
        controls
        autoplay
        playsinline
        data-testid="attachment-lightbox-video"
      />
      <button
        type="button"
        class="btn-primary"
        data-testid="attachment-lightbox-close"
        @click="closeLightbox"
      >
        {{ closeLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttachmentMediaKind } from '~/utils/attachment-media'

const props = defineProps<{
  open: boolean
  url: string | null
  filename: string
  mediaKind: AttachmentMediaKind
  closeLabel: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function closeLightbox() {
  emit('update:open', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    closeLightbox()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
