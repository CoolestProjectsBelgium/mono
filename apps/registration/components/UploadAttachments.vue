<template>
  <FormSection :title="$t('Upload Movie')">
    <div class="space-y-4">
      <p v-if="limitReached" class="text-gray-600" data-testid="upload-limit-reached">
        {{ limitReachedMessage }}
      </p>
      <FormField
        field-id="attachment-display-name"
        :label="$t('attachments.displayNameLabel')"
      >
        <template #default="{ inputId, inputClass }">
          <input
            :id="inputId"
            v-model="displayName"
            type="text"
            maxlength="50"
            :class="inputClass"
            :disabled="uploading || limitReached"
            data-testid="attachment-display-name"
          >
        </template>
      </FormField>
      <FormField
        field-id="movie-file"
        :label="$t('Enter your movie location')"
        :error="fieldError"
      >
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/x-msvideo,video/webm"
            :class="inputClass"
            :disabled="uploading || limitReached"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            data-testid="movie-file-input"
            @change="onFileSelect"
          >
        </template>
      </FormField>
      <div v-if="uploading" role="status" aria-live="polite">
        <p>{{ uploadingLabel }} — {{ progress }}%</p>
        <div class="h-2 w-full rounded bg-gray-200">
          <div class="h-2 rounded bg-primary transition-all" :style="{ width: `${progress}%` }" />
        </div>
      </div>
      <ApiUnavailableBanner v-if="unavailable" message-key="apiUnavailable.attachments" />
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import { isAttachmentLimitReached, resolveMaxAttachments } from '~/utils/attachment'
import { formatFileSize, validateUploadFile } from '~/utils/validation/upload'

const props = defineProps<{
  maxUploadSize: number
  attachmentCount: number
  maxAttachments: number
}>()

const { uploadFile } = useAttachments()
const { notify } = useNotification()
const { t } = useI18n()

const uploading = ref(false)
const converting = ref(false)
const progress = ref(0)
const unavailable = ref(false)
const fieldError = ref<string | null>(null)
const displayName = ref('')

const limitReached = computed(() =>
  isAttachmentLimitReached(props.attachmentCount, effectiveMax.value),
)

const effectiveMax = computed(() => resolveMaxAttachments(props.maxAttachments))

const limitReachedMessage = computed(() =>
  t('attachments.limitReached', {
    count: props.attachmentCount,
    max: effectiveMax.value,
  }),
)

const uploadingLabel = computed(() =>
  converting.value ? t('attachments.converting') : t('pleaseWait'),
)

const emit = defineEmits<{
  'upload-start': []
  'upload-end': []
  'upload-success': []
}>()

function uploadErrorMessage(code: 'tooLarge' | 'invalidType' | 'tooMany'): string {
  if (code === 'invalidType') {
    return t('attachments.invalidType')
  }
  if (code === 'tooMany') {
    return t('attachments.limitReached', {
      count: props.attachmentCount,
      max: effectiveMax.value,
    })
  }
  return t('validation_uploadTooLarge', { maxSize: formatFileSize(props.maxUploadSize) })
}

async function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  fieldError.value = null
  unavailable.value = false

  if (limitReached.value) {
    fieldError.value = uploadErrorMessage('tooMany')
    input.value = ''
    return
  }

  const validation = validateUploadFile(file, { maxUploadSize: props.maxUploadSize })
  if (!validation.ok) {
    fieldError.value = uploadErrorMessage(validation.code)
    input.value = ''
    return
  }

  if (!displayName.value.trim()) {
    displayName.value = file.name
  }

  uploading.value = true
  converting.value = false
  progress.value = 0
  emit('upload-start')

  try {
    const result = await uploadFile(file, {
      displayName: displayName.value,
      onProgress: (p) => { progress.value = p },
      onPhase: (phase) => { converting.value = phase === 'converting' },
    })
    if (!result.ok) {
      if (result.code === 'tooLarge' || result.code === 'invalidType' || result.code === 'tooMany') {
        fieldError.value = uploadErrorMessage(result.code)
      }
      else {
        unavailable.value = true
        notify('error', 'error_An error occurred')
      }
    }
    else {
      notify('success', 'MovieRec')
      emit('upload-success')
    }
  }
  finally {
    uploading.value = false
    converting.value = false
    emit('upload-end')
    input.value = ''
  }
}

defineExpose({ uploading })
</script>
