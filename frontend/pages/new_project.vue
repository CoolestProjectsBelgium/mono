<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('createProject') }}</h1>
    <OwnProjectForm v-model="form" class="mt-6" />
    <CtaButton variant="primary" class="mt-6" :disabled="loading" @click="onCreate">
      {{ loading ? $t('pleaseWait') : $t('Create') }}
    </CtaButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'authenticated' })

const localePath = useLocalePath()
const { createProject } = useProjectinfo()

const loading = ref(false)
const form = ref({
  project_name: '',
  project_descr: '',
  project_type: '',
  project_lang: 'nl' as const,
})

async function onCreate() {
  loading.value = true
  const project = await createProject(form.value)
  loading.value = false
  if (project) {
    await navigateTo(localePath('/project'))
  }
}
</script>
