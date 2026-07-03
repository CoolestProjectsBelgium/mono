<template>
  <div class="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
    <NavBar />
    <main class="flex-grow flex items-center justify-center">
      <VoteDetails
        v-if="project && Object.keys(project).length"
        v-model="project"
        @submit="submitResult"
        @next="submitNext"
      />
      <div v-else class="flex flex-col items-center justify-center p-8 gap-4 text-center">
        <UIcon name="i-heroicons-arrow-path" class="h-10 w-10 text-primary-500 animate-spin" />
        <p class="text-gray-400 font-medium">Loading next project details...</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLanguageStore } from '~/stores/language'

const languageStore = useLanguageStore()
const toast = useToast()
const project = ref<any>({})

const submitNext = async () => {
  if (!languageStore.languages || languageStore.languages.length === 0) {
    return navigateTo('/language')
  }

  try {
    const data = await useApiFetch<any>('/voting/projects', {
      params: { languages: JSON.stringify(languageStore.languages) }
    })
    
    project.value = data
    
    if (project.value && project.value.message === 'finished') {
      return navigateTo('/finished')
    }
    
    // Smooth scroll to top on next project
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (error) {
    console.error('Failed to load next project:', error)
    toast.add({
      title: 'Failed to load projects',
      description: 'Please make sure your server is online and active.',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle'
    })
  }
}

const submitResult = async (updatedProject: any) => {
  const votes = updatedProject.categories.map((vote: any) => ({
    id: vote.id,
    value: vote.value
  }))

  try {
    await useApiFetch(`/voting/projects/${updatedProject.project_id}`, {
      method: 'POST',
      body: votes
    })

    toast.add({
      title: 'Vote Recorded',
      description: 'Your rating was submitted successfully.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
      timeout: 2000
    })

    await submitNext()
  } catch (error) {
    console.error('Submission failed:', error)
    toast.add({
      title: 'Submission Error',
      description: 'Unable to submit vote. Please try again.',
      color: 'red',
      icon: 'i-heroicons-x-circle'
    })
  }
}

// Initial fetch on setup (Server and Client safe)
await submitNext()
</script>
