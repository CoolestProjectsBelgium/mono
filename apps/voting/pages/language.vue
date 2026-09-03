<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold">Project languages</h1>
    <p class="mt-2 text-gray-600">
      Select the languages you want to review and score.
    </p>

    <div v-if="languages.length" class="mt-6 space-y-3">
      <label
        v-for="lang in languages"
        :key="lang.id"
        class="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition select-none"
        :class="selected.includes(lang.id)
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'"
      >
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          :checked="selected.includes(lang.id)"
          @change="toggleLanguage(lang.id)"
        >
        <span
          class="font-semibold"
          :class="selected.includes(lang.id) ? 'text-primary' : 'text-gray-800'"
        >
          {{ lang.text }}
        </span>
      </label>
    </div>

    <div v-else class="mt-6 space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="h-16 animate-pulse rounded-lg bg-gray-200"
      />
    </div>

    <CtaButton
      variant="primary"
      class="mt-8 w-full justify-center"
      :disabled="selected.length === 0"
      @click="setLanguages"
    >
      Confirm selection
    </CtaButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LanguageOption } from '~/types/api'
import { useLanguageStore } from '~/stores/language'
import { useProjectStore } from '~/stores/project'

definePageMeta({
  layout: 'default',
})

const languageStore = useLanguageStore()
const projectStore = useProjectStore()
const { notify } = useNotification()
const languages = ref<LanguageOption[]>([])
const selected = ref<string[]>([...languageStore.languages])

const toggleLanguage = (id: string) => {
  const index = selected.value.indexOf(id)
  if (index === -1) {
    selected.value.push(id)
  }
  else {
    selected.value.splice(index, 1)
  }
}

const setLanguages = () => {
  if (selected.value.length === 0) {
    notify('warning', 'Please select at least one language to continue.')
    return
  }

  languageStore.updateLanguages(selected.value)
  projectStore.clearProject()
  navigateTo('/')
}

try {
  languages.value = await useApiFetch<LanguageOption[]>('/languages')
}
catch (error) {
  console.error('Failed to load languages:', error)
  notify('error', 'Could not connect to the API server.')
}
</script>
