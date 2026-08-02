<template>
  <FormSection :title="$t('Mandatory Approvals')">
    <div v-for="approval in approvals" :key="approval.id" class="mb-4">
      <label class="flex items-start gap-2">
        <input
          type="checkbox"
          :value="String(approval.id)"
          :checked="model.includes(String(approval.id))"
          class="mt-1"
          @change="onToggle(String(approval.id), ($event.target as HTMLInputElement).checked)"
        />
        <span>
          <strong>{{ approval.name }}</strong>
          <p class="text-sm text-gray-600">{{ approval.description }}</p>
        </span>
      </label>
    </div>
    <p v-if="error" id="mandatory_approvals-error" class="form-error-text" role="alert">
      {{ error }}
    </p>
  </FormSection>
</template>

<script setup lang="ts">
import type { ApprovalDto } from '~/types/api'

defineProps<{
  approvals: ApprovalDto[]
  error?: string
}>()

const emit = defineEmits<{
  'clear-error': []
}>()

const model = defineModel<string[]>({ required: true })

function onToggle(id: string, checked: boolean) {
  emit('clear-error')
  if (checked) {
    model.value = [...model.value, id]
  }
  else {
    model.value = model.value.filter(v => v !== id)
  }
}
</script>
