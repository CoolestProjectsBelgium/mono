<template>
  <dialog
    ref="dialogEl"
    class="w-full max-w-md rounded-lg border-0 p-0 shadow-xl backdrop:bg-black/50"
    role="alertdialog"
    :aria-labelledby="titleId"
    :aria-describedby="messageId"
    @cancel.prevent="onCancel"
    @close="onDialogClose"
  >
    <div class="p-6">
      <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
      <p :id="messageId" class="mt-3 text-gray-600">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="btn-primary"
          :disabled="loading"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="btn-cta"
          :disabled="loading"
          data-testid="confirm-dialog-confirm"
          @click="onConfirm"
        >
          {{ loading ? pleaseWaitLabel : confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  pleaseWaitLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:open': [value: boolean]
}>()

const dialogEl = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const messageId = useId()

watch(() => props.open, (isOpen) => {
  if (!import.meta.client || !dialogEl.value) {
    return
  }
  if (isOpen && !dialogEl.value.open) {
    dialogEl.value.showModal()
  }
  else if (!isOpen && dialogEl.value.open) {
    dialogEl.value.close()
  }
})

function onConfirm() {
  if (props.loading) {
    return
  }
  emit('confirm')
}

function onCancel() {
  if (props.loading) {
    return
  }
  emit('update:open', false)
  emit('cancel')
}

function onDialogClose() {
  if (props.open) {
    emit('update:open', false)
  }
}
</script>
