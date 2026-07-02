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
          <th class="py-2">{{ $t('attachments.columnFilename') }}</th>
          <th class="py-2">{{ $t('attachments.columnSize') }}</th>
          <th class="py-2">{{ $t('attachments.columnStatus') }}</th>
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
              :disabled="disabled || !attachment.exists"
              data-testid="attachment-preview-button"
              @click="onPreviewClick(attachment)"
            >
              <AttachmentPreview
                :filename="attachment.filename"
                :url="attachment.url"
                :poster-url="attachment.posterUrl"
                :exists="attachment.exists"
                :unavailable-label="$t('attachments.previewUnavailable')"
              />
            </button>
          </td>
          <td class="py-2">
            <div v-if="editingId === attachment.id" class="flex flex-wrap items-center gap-2">
              <input
                v-model="editingName"
                type="text"
                maxlength="50"
                class="rounded border px-2 py-1"
                data-testid="attachment-rename-input"
              >
              <button
                type="button"
                class="text-blue-600 hover:underline"
                data-testid="attachment-rename-save"
                @click="onRenameSave(attachment)"
              >
                {{ $t('attachments.renameSave') }}
              </button>
              <button
                type="button"
                class="text-gray-600 hover:underline"
                data-testid="attachment-rename-cancel"
                @click="onRenameCancel"
              >
                {{ $t('attachments.renameCancel') }}
              </button>
            </div>
            <button
              v-else
              type="button"
              class="text-left hover:underline disabled:opacity-50"
              data-testid="attachment-rename-start"
              :disabled="disabled"
              @click="onRenameStart(attachment)"
            >
              {{ attachment.name }}
            </button>
          </td>
          <td class="py-2">{{ attachment.filename }}</td>
          <td class="py-2">{{ formatFileSize(attachment.size) }}</td>
          <td class="py-2">
            <span
              v-if="!attachment.exists"
              class="rounded bg-amber-100 px-2 py-0.5 text-amber-900"
              data-testid="attachment-orphaned"
            >
              {{ $t('attachments.statusOrphaned') }}
            </span>
            <span v-else class="text-gray-600">{{ $t('attachments.statusReady') }}</span>
          </td>
          <td class="py-2 text-right">
            <div class="flex flex-wrap justify-end gap-3">
              <button
                v-if="attachment.exists"
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
import { getAttachmentBlobId, resolveMaxAttachments } from '~/utils/attachment'
import { inferAttachmentMediaKind } from '~/utils/attachment-media'
import { formatFileSize } from '~/utils/validation/upload'

const props = defineProps<{
  attachments: AttachmentDto[]
  maxAttachments: number
  disabled?: boolean
}>()

const effectiveMax = computed(() => resolveMaxAttachments(props.maxAttachments))

const emit = defineEmits<{
  deleted: []
  renamed: []
}>()

const { t } = useI18n()
const { deleteAttachment, getDownloadUrl, renameAttachment } = useAttachments()
const { notify } = useNotification()

const deletingId = ref<string | null>(null)
const openingId = ref<string | null>(null)
const editingId = ref<string | null>(null)
const editingName = ref('')
const showDeleteDialog = ref(false)
const pendingDelete = ref<AttachmentDto | null>(null)
const lightboxOpen = ref(false)
const lightboxUrl = ref<string | null>(null)
const lightboxFilename = ref('')
const lightboxMediaKind = ref<'image' | 'video' | 'unknown'>('unknown')

const deleteMessage = computed(() =>
  pendingDelete.value
    ? t('attachments.deleteMessage', { filename: pendingDelete.value.filename })
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

  deletingId.value = getAttachmentBlobId(attachment)
  try {
    const ok = await deleteAttachment(getAttachmentBlobId(attachment))
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
  if (props.disabled || !attachment.exists || openingId.value != null) {
    return
  }

  const mediaKind = inferAttachmentMediaKind(attachment.filename)
  if (mediaKind === 'unknown') {
    return onDownloadExternal(attachment)
  }

  openingId.value = attachment.id
  try {
    const url = await getDownloadUrl(attachment)
    if (!url) {
      notify('error', 'error_An error occurred')
      return
    }
    lightboxUrl.value = url
    lightboxFilename.value = attachment.filename
    lightboxMediaKind.value = mediaKind
    lightboxOpen.value = true
  }
  finally {
    openingId.value = null
  }
}

async function onDownloadExternal(attachment: AttachmentDto) {
  const url = await getDownloadUrl(attachment)
  if (!url) {
    notify('error', 'error_An error occurred')
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

function onPreviewClick(attachment: AttachmentDto) {
  void openLightbox(attachment)
}

function onOpen(attachment: AttachmentDto) {
  void openLightbox(attachment)
}

function onRenameStart(attachment: AttachmentDto) {
  editingId.value = attachment.id
  editingName.value = attachment.name
}

function onRenameCancel() {
  editingId.value = null
  editingName.value = ''
}

async function onRenameSave(attachment: AttachmentDto) {
  const trimmed = editingName.value.trim()
  if (!trimmed) {
    notify('error', 'attachments.renameRequired')
    return
  }
  const ok = await renameAttachment(getAttachmentBlobId(attachment), trimmed)
  if (!ok) {
    notify('error', 'error_An error occurred')
    return
  }
  onRenameCancel()
  emit('renamed')
  notify('success', 'message_successChange')
}
</script>
