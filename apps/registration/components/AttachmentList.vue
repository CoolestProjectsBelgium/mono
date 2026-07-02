<template>
  <FormSection :title="$t('attachments.title')">
    <p v-if="!attachments.length" class="text-gray-500" data-testid="attachments-empty">
      {{ $t('attachments.empty') }}
    </p>
    <table v-else class="w-full text-left text-sm" data-testid="attachments-table">
      <thead>
        <tr class="border-b">
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
          <td class="py-2">{{ attachment.name }}</td>
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
                @click="onDownload(attachment)"
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
  </FormSection>
</template>

<script setup lang="ts">
import type { AttachmentDto } from '~/types/api'
import { getAttachmentBlobId } from '~/utils/attachment'
import { formatFileSize } from '~/utils/validation/upload'

const props = defineProps<{
  attachments: AttachmentDto[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useI18n()
const { deleteAttachment, getDownloadUrl } = useAttachments()
const { notify } = useNotification()

const deletingId = ref<string | null>(null)
const openingId = ref<string | null>(null)
const showDeleteDialog = ref(false)
const pendingDelete = ref<AttachmentDto | null>(null)

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

async function onDownload(attachment: AttachmentDto) {
  if (props.disabled || !attachment.exists || openingId.value != null) {
    return
  }

  openingId.value = attachment.id
  try {
    const url = await getDownloadUrl(attachment)
    if (!url) {
      notify('error', 'error_An error occurred')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  finally {
    openingId.value = null
  }
}
</script>
