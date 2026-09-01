<template>
  <div class="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
    <NavBar />
    <main class="flex-grow flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <UCard
          class="border border-gray-800 bg-slate-900/40 backdrop-blur shadow-2xl transition-all duration-300 hover:border-gray-700/80"
        >
          <template #header>
            <div class="text-center">
              <UIcon name="i-heroicons-language" class="h-10 w-10 text-primary-400 mb-2" />
              <h2 class="text-2xl font-bold text-white tracking-tight">
                Preferred Languages
              </h2>
              <p class="text-sm text-gray-400 mt-1">
                Select the languages you would like to filter and review.
              </p>
            </div>
          </template>

          <div v-if="languages.length" class="space-y-3 py-2">
            <label
              v-for="lang in languages"
              :key="lang.id"
              class="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 select-none"
              :class="[
                selected.includes(lang.id)
                  ? 'bg-primary-950/20 border-primary-500/80 shadow-md shadow-primary-950/10'
                  : 'bg-slate-950/40 border-gray-800 hover:border-gray-700/80'
              ]"
            >
              <UCheckbox
                :model-value="selected.includes(lang.id)"
                color="primary"
                class="pointer-events-none"
                @update:model-value="toggleLanguage(lang.id)"
              />
              <div class="flex-grow">
                <p class="font-semibold text-gray-200" :class="{ 'text-primary-400': selected.includes(lang.id) }">
                  {{ lang.text }}
                </p>
              </div>
            </label>
          </div>

          <div v-else class="space-y-3 py-2">
            <USkeleton v-for="i in 3" :key="i" class="h-[60px] w-full bg-slate-800" />
          </div>

          <template #footer>
            <UButton
              color="primary"
              size="lg"
              block
              :disabled="selected.length === 0"
              class="font-bold tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="setLanguages"
            >
              Confirm Selection
            </UButton>
          </template>
        </UCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LanguageOption } from '~/types/api'
import { useLanguageStore } from '~/stores/language'
import { useProjectStore } from '~/stores/project'

const languageStore = useLanguageStore()
const projectStore = useProjectStore()
const toast = useToast()
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
    toast.add({
      title: 'Selection Required',
      description: 'Please select at least one language to continue.',
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
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
  toast.add({
    title: 'Error loading languages',
    description: 'Could not connect to the API server.',
    color: 'red',
    icon: 'i-heroicons-exclamation-circle',
  })
}
</script>
