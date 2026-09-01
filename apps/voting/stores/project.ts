import { defineStore } from 'pinia'
import type { ProjectVote } from '~/types/api'

interface ProjectState {
  project: ProjectVote | null
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    project: null,
  }),
  actions: {
    setProject(project: ProjectVote | null) {
      this.project = project
    },
    clearProject() {
      this.project = null
    },
  },
  persist: true,
})
