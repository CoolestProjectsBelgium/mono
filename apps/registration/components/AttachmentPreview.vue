<template>
  <div
    class="flex h-20 w-28 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50"
    data-testid="attachment-preview"
  >
    <img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      :alt="name"
      class="max-h-20 max-w-28 object-contain"
      loading="lazy"
      data-testid="attachment-preview-image"
    >
    <span
      v-else-if="!loading"
      class="px-2 text-center text-xs text-gray-500"
      data-testid="attachment-preview-unavailable"
    >
      {{ unavailableLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  attachmentId: string
  name: string
  unavailableLabel: string
}>()

const { fetchThumbnailObjectUrl } = useAttachments()

const thumbnailUrl = ref<string | null>(null)
const loading = ref(true)

async function loadThumbnail() {
  loading.value = true
  thumbnailUrl.value = await fetchThumbnailObjectUrl(props.attachmentId)
  loading.value = false
}

watch(() => props.attachmentId, () => {
  void loadThumbnail()
}, { immediate: true })
</script>
