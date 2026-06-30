<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleProject') }}</h1>
    <template v-if="project?.own_project">
      <OwnProjectForm v-model="ownProjectForm" class="mt-6" />
      <OwnParticipants
        :participants="project.own_project.participants ?? []"
        :invite-unavailable="inviteUnavailable"
        class="mt-6"
        @add="onAddParticipant"
        @remove="onRemoveParticipant"
      />
      <div class="mt-6 flex gap-4">
        <CtaButton variant="primary" @click="onSave">{{ $t('Aanpassen') }}</CtaButton>
        <NuxtLink :to="localePath('/upload')" class="btn-primary">{{ $t('Upload Movie') }}</NuxtLink>
        <CtaButton v-if="project.own_project.delete_possible" variant="cta" @click="onDelete">
          {{ $t('Project wordt verwijderd') }}
        </CtaButton>
      </div>
    </template>
    <template v-else-if="project?.other_project">
      <p class="mt-4">{{ $t('medeProject') }}: {{ project.other_project.project_code }}</p>
    </template>
    <p v-else class="mt-4">{{ $t('pleaseWait') }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ProjectDto } from '~/types/api'

definePageMeta({ middleware: 'authenticated' })

const localePath = useLocalePath()
const { fetchProject, updateProject, deleteProject } = useProjectinfo()
const { generateInviteToken, removeParticipant } = useParticipant()

const project = ref<ProjectDto | null>(null)
const inviteUnavailable = ref(false)

const ownProjectForm = computed({
  get: () => ({
    project_name: project.value?.own_project?.project_name ?? '',
    project_descr: project.value?.own_project?.project_descr ?? '',
    project_type: project.value?.own_project?.project_type ?? '',
    project_lang: project.value?.own_project?.project_lang ?? 'nl' as const,
  }),
  set: (val) => {
    if (project.value?.own_project) {
      Object.assign(project.value.own_project, val)
    }
  },
})

onMounted(async () => {
  project.value = await fetchProject()
  if (!project.value?.own_project && !project.value?.other_project) {
    await navigateTo(localePath('/no_project'))
  }
})

async function onSave() {
  if (!project.value?.own_project) return
  project.value = await updateProject(project.value.own_project)
}

async function onDelete() {
  await deleteProject()
  await navigateTo(localePath('/no_project'))
}

async function onAddParticipant() {
  const token = await generateInviteToken()
  if (!token) {
    inviteUnavailable.value = true
    return
  }
  project.value = await fetchProject()
}

async function onRemoveParticipant(id: number) {
  await removeParticipant(id)
  project.value = await fetchProject()
}
</script>
