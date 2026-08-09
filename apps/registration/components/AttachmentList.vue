<template>
  <FormSection :title="$t('attachments.title')">
    <p class="text-sm text-gray-600" data-testid="attachments-count">
      {{ $t('attachments.count', { count: attachments.length, max: effectiveMax }) }}
    </p>
    <p v-if="!attachments.length" class="text-gray-500" data-testid="attachments-empty">
      {{ $t('attachments.empty') }}
    </p>
    <table v-else class="w-full text-left text-sm" data-testid="attachments-table">
      <thead>
        <tr class="border-b">
          <th class="py-2">{{ $t('attachments.columnPreview') }}</th>
          <th class="py-2">{{ $t('attachments.columnName') }}</th>
          <th class="py-2" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="attachment in attachments"
          :key="attachment.id"
          class="border-b"
          data-testid="attachment-row"
        >
          <td class="py-2">
            <button
              type="button"
              class="disabled:opacity-50"
              :disabled="disabled"
              data-testid="attachment-preview-button"
              @click="onPreviewClick(attachment)"
            >
              <AttachmentPreview
                :attachment-id="attachment.id"
                :name="attachment.name"
                :unavailable-label="$t('attachments.previewUnavailable')"
              />
            </button>
          </td>
          <td class="py-2">{{ attachment.name }}</td>
          <td class="py-2 text-right">
            <div class="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                class="text-blue-600 hover:underline disabled:opacity-50"
                data-testid="attachment-download"
                :disabled="disabled || openingId === attachment.id"
                @click="onOpen(attachment)"
              >
                {{ $t('attachments.download') }}
              </button>
              <button
                type="button"
                class="text-red-600 hover:underline disabled:opacity-50"
                data-testid="attachment-delete"
                :disabled="disabled || deletingId === attachment.id"
                @click="onDeleteClick(attachment)"
              >
                {{ $t('attachments.delete') }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('attachments.deleteTitle')"
      :message="deleteMessage"
      :confirm-label="$t('attachments.deleteConfirm')"
      :cancel-label="$t('Cancel')"
      :please-wait-label="$t('pleaseWait')"
      :loading="deletingId != null"
      @confirm="onDeleteConfirm"
    />
    <AttachmentLightbox
      v-model:open="lightboxOpen"
      :url="lightboxUrl"
      :filename="lightboxFilename"
      :media-kind="lightboxMediaKind"
      :close-label="$t('attachments.lightboxClose')"
    />
  </FormSection>
</template>

<script setup lang="ts">
import type { AttachmentDto } from '~/types/api'
import { resolveMaxAttachments } from '~/utils/attachment'
import { inferAttachmentMediaKind } from '~/utils/attachment-media'

const props = defineProps<{
  attachments: AttachmentDto[]
  maxAttachments: number
  disabled?: boolean
}>()

const effectiveMax = computed(() => resolveMaxAttachments(props.maxAttachments))

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useI18n()
const { deleteAttachment, fetchThumbnailObjectUrl } = useAttachments()
const { notify } = useNotification()

const deletingId = ref<string | null>(null)
const openingId = ref<string | null>(null)
const showDeleteDialog = ref(false)
const pendingDelete = ref<AttachmentDto | null>(null)
const lightboxOpen = ref(false)
const lightboxUrl = ref<string | null>(null)
const lightboxFilename = ref('')
const lightboxMediaKind = ref<'image' | 'video' | 'unknown'>('unknown')

const deleteMessage = computed(() =>
  pendingDelete.value
    ? t('attachments.deleteMessage', { filename: pendingDelete.value.name })
    : '',
)

function onDeleteClick(attachment: AttachmentDto) {
  if (props.disabled || deletingId.value != null) {
    return
  }
  pendingDelete.value = attachment
  showDeleteDialog.value = true
}

async function onDeleteConfirm() {
  const attachment = pendingDelete.value
  if (!attachment || deletingId.value != null) {
    return
  }

  deletingId.value = attachment.id
  try {
    const ok = await deleteAttachment(attachment.id)
    if (!ok) {
      notify('error', 'error_An error occurred')
      return
    }
    showDeleteDialog.value = false
    pendingDelete.value = null
    emit('deleted')
    notify('success', 'message_successChange')
  }
  finally {
    deletingId.value = null
  }
}

async function openLightbox(attachment: AttachmentDto) {
  if (props.disabled || openingId.value != null) {
    return
  }

  const mediaKind = inferAttachmentMediaKind(attachment.name)
  openingId.value = attachment.id
  try {
    const url = await fetchThumbnailObjectUrl(attachment.id)
    if (!url) {
      notify('error', 'error_An error occurred')
      return
    }
    lightboxUrl.value = url
    lightboxFilename.value = attachment.name
    lightboxMediaKind.value = mediaKind
    lightboxOpen.value = true
  }
  finally {
    openingId.value = null
  }
}

function onPreviewClick(attachment: AttachmentDto) {
  void openLightbox(attachment)
}

async function onOpen(attachment: AttachmentDto) {
  const url = await fetchThumbnailObjectUrl(attachment.id)
  if (!url) {
    notify('error', 'error_An error occurred')
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
