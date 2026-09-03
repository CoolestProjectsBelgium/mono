<template>
  <div>
    <VoteDetails
      v-if="project && Object.keys(project).length"
      v-model="project"
      @submit="submitResult"
      @next="skipProject"
    />
    <div v-else class="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"
        role="status"
        aria-label="Loading"
      />
      <p class="font-medium text-gray-600">Loading next project…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectVote } from '~/types/api'
import { useLanguageStore } from '~/stores/language'
import { useProjectStore } from '~/stores/project'
import { buildProjectsQuery, isFinishedResponse } from '~/utils/projects-query'
import { mapCategoriesToVotes } from '~/utils/vote-mapper'
import { getApiErrorMessage } from '~/utils/api-response'

definePageMeta({
  layout: 'default',
})

const languageStore = useLanguageStore()
const projectStore = useProjectStore()
const { notify } = useNotification()
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
    notify('error', getApiErrorMessage(error) ?? 'Failed to load projects. Please make sure the API is online.')
  }
}

const submitResult = async (updatedProject: ProjectVote) => {
  const votes = mapCategoriesToVotes(updatedProject.categories)

  try {
    await useApiFetch(`/projects/${updatedProject.project_id}`, {
      method: 'POST',
      body: votes,
    })

    notify('success', 'Your rating was submitted successfully.')

    await loadNextProject()
  }
  catch (error) {
    console.error('Submission failed:', error)
    notify('error', getApiErrorMessage(error) ?? 'Unable to submit vote. Please try again.')
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
