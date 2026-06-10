<template>
  <FormSection :title="$t('medeProject')">
    <div>
      <label class="form-label" for="project_code">{{ $t('label_Projectcode:') }}</label>
      <input
        id="project_code"
        v-model="model.project_code"
        class="form-input"
        :placeholder="$t('description_Geefcode')"
      />
    </div>
  </FormSection>
</template>

<script setup lang="ts">
const model = defineModel<{ project_code: string }>({ required: true })
</script>
