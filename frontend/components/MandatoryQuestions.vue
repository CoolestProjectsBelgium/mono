<template>
  <FormSection :title="$t('Mandatory Approvals')">
    <div v-for="approval in approvals" :key="approval.id" class="mb-4">
      <label class="flex items-start gap-2">
        <input
          type="checkbox"
          :value="String(approval.id)"
          :checked="model.includes(String(approval.id))"
          class="mt-1"
          @change="toggle(String(approval.id), ($event.target as HTMLInputElement).checked)"
        />
        <span>
          <strong>{{ approval.name }}</strong>
          <p class="text-sm text-gray-600">{{ approval.description }}</p>
        </span>
      </label>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import type { ApprovalDto } from '~/types/api'

defineProps<{
  approvals: ApprovalDto[]
}>()

const model = defineModel<string[]>({ required: true })

function toggle(id: string, checked: boolean) {
  if (checked) {
    model.value = [...model.value, id]
  }
  else {
    model.value = model.value.filter(v => v !== id)
  }
}
</script>
