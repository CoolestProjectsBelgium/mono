<template>
  <FormSection :title="$t('medeProject')">
    <FormField field-id="project_code" :label="$t('label_Projectcode:')" :error="errors?.project_code">
      <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
        <input
          :id="inputId"
          v-model="model.project_code"
          :class="inputClass"
          :placeholder="$t('description_Geefcode')"
          :aria-invalid="ariaInvalid"
          :aria-describedby="ariaDescribedby"
          @input="emit('clear-error', 'project_code')"
        />
      </template>
    </FormField>
  </FormSection>
</template>

<script setup lang="ts">
defineProps<{
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  'clear-error': [fieldKey: string]
}>()

const model = defineModel<{ project_code: string }>({ required: true })
</script>
