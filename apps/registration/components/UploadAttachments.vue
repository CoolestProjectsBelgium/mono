<template>
  <FormSection :title="$t('Upload Movie')">
    <div class="space-y-4">
      <FormField
        field-id="movie-file"
        :label="$t('Enter your movie location')"
        :error="fieldError"
      >
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            type="file"
            accept="video/*,image/*"
            :class="inputClass"
            :disabled="uploading"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @change="onFileSelect"
          />
        </template>
      </FormField>
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
import { formatFileSize, validateUploadFile } from '~/utils/validation/upload'

const props = defineProps<{
  maxUploadSize: number
}>()

const { uploadFile } = useAttachments()
const { notify } = useNotification()
const { t } = useI18n()

const uploading = ref(false)
const progress = ref(0)
const unavailable = ref(false)
const fieldError = ref<string | null>(null)

const emit = defineEmits<{
  'upload-start': []
  'upload-end': []
}>()

function uploadErrorMessage(code: 'tooLarge' | 'invalidType'): string {
  if (code === 'invalidType') {
    return t('validation_uploadInvalidType')
  }
  return t('validation_uploadTooLarge', { maxSize: formatFileSize(props.maxUploadSize) })
}

async function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  fieldError.value = null
  unavailable.value = false

  const validation = validateUploadFile(file, { maxUploadSize: props.maxUploadSize })
  if (!validation.ok) {
    fieldError.value = uploadErrorMessage(validation.code)
    input.value = ''
    return
  }

  uploading.value = true
  progress.value = 0
  emit('upload-start')

  try {
    const result = await uploadFile(file, (p) => { progress.value = p })
    if (!result.ok) {
      if (result.code === 'tooLarge' || result.code === 'invalidType') {
        fieldError.value = uploadErrorMessage(result.code)
      }
      else {
        unavailable.value = true
        notify('error', 'error_An error occurred')
      }
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
