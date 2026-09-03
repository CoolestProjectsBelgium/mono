<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    data-testid="confirm-dialog"
  >
    <button
      type="button"
      class="absolute inset-0 bg-black/50"
      aria-label="Close dialog"
      :disabled="loading"
      @click="onCancel"
    />
    <div
      class="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      role="alertdialog"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
      @click.stop
    >
      <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
      <p :id="messageId" class="mt-3 text-gray-600">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="btn-secondary"
          :disabled="loading"
          data-testid="confirm-dialog-cancel"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="btn-primary"
          :disabled="loading"
          data-testid="confirm-dialog-confirm"
          @click="onConfirm"
        >
          {{ loading ? pleaseWaitLabel : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
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

const titleId = useId()
const messageId = useId()

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
</script>
