<template>
  <FormSection :title="$t('eigenProject')">
    <div class="grid gap-4">
      <FormField field-id="project_name" :label="$t('label_Projectnaam:')" :error="errors?.project_name">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            :value="modelValue.project_name"
            :class="inputClass"
            maxlength="100"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="onTextInput('project_name', $event)"
          />
        </template>
      </FormField>
      <FormField field-id="project_descr" :label="$t('label_Omschrijving:')" :error="errors?.project_descr">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <textarea
            :id="inputId"
            :value="modelValue.project_descr"
            :class="inputClass"
            rows="4"
            maxlength="4000"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="onTextInput('project_descr', $event)"
          />
        </template>
      </FormField>
      <FormField field-id="project_type" :label="$t('label_Project_Type')" :error="errors?.project_type">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <textarea
            :id="inputId"
            :value="modelValue.project_type"
            :class="inputClass"
            rows="3"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="onTextInput('project_type', $event)"
          />
        </template>
      </FormField>
      <FormField field-id="project_lang" :label="$t('description_taalJury')" :error="errors?.project_lang">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <select
            :id="inputId"
            :value="modelValue.project_lang"
            :class="inputClass"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @change="onLangChange($event)"
          >
            <option value="nl">{{ $t('Nederlands') }}</option>
            <option value="fr">{{ $t('Frans') }}</option>
            <option value="en">{{ $t('Engels') }}</option>
          </select>
        </template>
      </FormField>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
export type OwnProjectFormModel = {
  project_name: string
  project_descr: string
  project_type: string
  project_lang: 'nl' | 'fr' | 'en'
}

const props = defineProps<{
  modelValue: OwnProjectFormModel
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: OwnProjectFormModel]
  'clear-error': [fieldKey: string]
}>()

function patchModel<K extends keyof OwnProjectFormModel>(
  key: K,
  value: OwnProjectFormModel[K],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
  emit('clear-error', key)
}

function onTextInput(
  key: 'project_name' | 'project_descr' | 'project_type',
  event: Event,
) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  patchModel(key, target?.value ?? '')
}

function onLangChange(event: Event) {
  const target = event.target as HTMLSelectElement | null
  const value = target?.value
  if (value === 'nl' || value === 'fr' || value === 'en') {
    patchModel('project_lang', value)
  }
}
</script>
