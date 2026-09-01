<template>
  <div class="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
    <NavBar />
    <main class="flex-grow flex items-center justify-center">
      <VoteDetails
        v-if="project && Object.keys(project).length"
        v-model="project"
        @submit="submitResult"
        @next="skipProject"
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
import type { ProjectVote } from '~/types/api'
import { useLanguageStore } from '~/stores/language'
import { useProjectStore } from '~/stores/project'
import { buildProjectsQuery, isFinishedResponse } from '~/utils/projects-query'
import { mapCategoriesToVotes } from '~/utils/vote-mapper'

const languageStore = useLanguageStore()
const projectStore = useProjectStore()
const toast = useToast()
const project = ref<ProjectVote | null>(projectStore.project)

const loadNextProject = async (skipProjectId?: number) => {
  if (!languageStore.languages || languageStore.languages.length === 0) {
    return navigateTo('/language')
  }

  try {
    const data = await useApiFetch('/projects', {
      params: buildProjectsQuery(languageStore.languages, skipProjectId),
    })

    if (isFinishedResponse(data)) {
      projectStore.clearProject()
      project.value = null
      return navigateTo('/finished')
    }

    project.value = data
    projectStore.setProject(data)

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  catch (error) {
    console.error('Failed to load next project:', error)
    toast.add({
      title: 'Failed to load projects',
      description: 'Please make sure your server is online and active.',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle',
    })
  }
}

const submitResult = async (updatedProject: ProjectVote) => {
  const votes = mapCategoriesToVotes(updatedProject.categories)

  try {
    await useApiFetch(`/projects/${updatedProject.project_id}`, {
      method: 'POST',
      body: votes,
    })

    toast.add({
      title: 'Vote Recorded',
      description: 'Your rating was submitted successfully.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
      timeout: 2000,
    })

    await loadNextProject()
  }
  catch (error) {
    console.error('Submission failed:', error)
    toast.add({
      title: 'Submission Error',
      description: 'Unable to submit vote. Please try again.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    })
  }
}

const skipProject = async () => {
  const skipProjectId = project.value?.project_id
  await loadNextProject(skipProjectId)
}

if (!projectStore.project) {
  await loadNextProject()
}
</script>
