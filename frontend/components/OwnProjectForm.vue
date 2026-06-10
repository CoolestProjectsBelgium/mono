<template>
  <FormSection :title="$t('eigenProject')">
    <div class="grid gap-4">
      <div>
        <label class="form-label" for="project_name">{{ $t('label_Projectnaam:') }}</label>
        <input id="project_name" v-model="model.project_name" class="form-input" maxlength="100" />
      </div>
      <div>
        <label class="form-label" for="project_descr">{{ $t('label_Omschrijving:') }}</label>
        <textarea id="project_descr" v-model="model.project_descr" class="form-input" rows="4" maxlength="4000" />
      </div>
      <div>
        <label class="form-label" for="project_type">{{ $t('label_Project_Type') }}</label>
        <textarea id="project_type" v-model="model.project_type" class="form-input" rows="3" />
      </div>
      <div>
        <label class="form-label" for="project_lang">{{ $t('description_taalJury') }}</label>
        <select id="project_lang" v-model="model.project_lang" class="form-input">
          <option value="nl">{{ $t('Nederlands') }}</option>
          <option value="fr">{{ $t('Frans') }}</option>
          <option value="en">{{ $t('Engels') }}</option>
        </select>
      </div>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
const model = defineModel<{
  project_name: string
  project_descr: string
  project_type: string
  project_lang: 'nl' | 'fr' | 'en'
}>({ required: true })
</script>
