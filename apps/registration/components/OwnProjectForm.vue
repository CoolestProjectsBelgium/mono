<template>
  <FormSection :title="$t('eigenProject')">
    <div class="grid gap-4">
      <FormField field-id="project_name" :label="$t('label_Projectnaam:')" :error="errors?.project_name">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.project_name"
            :class="inputClass"
            maxlength="100"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'project_name')"
          />
        </template>
      </FormField>
      <FormField field-id="project_descr" :label="$t('label_Omschrijving:')" :error="errors?.project_descr">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <textarea
            :id="inputId"
            v-model="model.project_descr"
            :class="inputClass"
            rows="4"
            maxlength="4000"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'project_descr')"
          />
        </template>
      </FormField>
      <FormField field-id="project_type" :label="$t('label_Project_Type')" :error="errors?.project_type">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <textarea
            :id="inputId"
            v-model="model.project_type"
            :class="inputClass"
            rows="3"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'project_type')"
          />
        </template>
      </FormField>
      <FormField field-id="project_lang" :label="$t('description_taalJury')" :error="errors?.project_lang">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <select
            :id="inputId"
            v-model="model.project_lang"
            :class="inputClass"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @change="emit('clear-error', 'project_lang')"
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
defineProps<{
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  'clear-error': [fieldKey: string]
}>()

const model = defineModel<{
  project_name: string
  project_descr: string
  project_type: string
  project_lang: 'nl' | 'fr' | 'en'
}>({ required: true })
</script>
