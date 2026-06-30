<template>
  <FormSection :title="$t('Upload Movie')">
    <div class="space-y-4">
      <div>
        <label class="form-label" for="movie-file">{{ $t('Enter your movie location') }}</label>
        <input
          id="movie-file"
          type="file"
          accept="video/*,image/*"
          class="form-input"
          :disabled="uploading"
          @change="onFileSelect"
        />
      </div>
      <div v-if="uploading" role="status" aria-live="polite">
        <p>{{ $t('pleaseWait') }} — {{ progress }}%</p>
        <div class="h-2 w-full rounded bg-gray-200">
          <div class="h-2 rounded bg-primary transition-all" :style="{ width: `${progress}%` }" />
        </div>
      </div>
      <ApiUnavailableBanner v-if="unavailable" message-key="apiUnavailable.attachments" />
    </div>
  </FormSection>
</template>

<script setup lang="ts">
const { uploadFile } = useAttachments()
const { notify } = useNotification()

const uploading = ref(false)
const progress = ref(0)
const unavailable = ref(false)

const emit = defineEmits<{
  'upload-start': []
  'upload-end': []
}>()

async function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  progress.value = 0
  unavailable.value = false
  emit('upload-start')

  try {
    const ok = await uploadFile(file, (p) => { progress.value = p })
    if (!ok) {
      unavailable.value = true
      notify('error', 'error_An error occurred')
    }
    else {
      notify('success', 'MovieRec')
    }
  }
  finally {
    uploading.value = false
    emit('upload-end')
    input.value = ''
  }
}

defineExpose({ uploading })
</script>
