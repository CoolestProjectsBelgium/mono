<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleProject') }}</h1>
    <ValidationAlert
      :field-errors="fieldErrors"
      :api-message="formError"
      summary-key="validation_projectIncomplete"
    />
    <template v-if="project?.own_project">
      <OwnProjectForm
        v-model="ownProjectForm"
        :errors="fieldErrors"
        class="mt-6"
        @clear-error="onClearError"
      />
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
import { clearFieldError, mapZodIssuesToFieldErrors, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'
import { createOwnProjectSchema } from '~/utils/validation/user'
import { getApiErrorMessage } from '~/utils/api-response'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const localePath = useLocalePath()
const { fetchProject, updateProject, deleteProject } = useProjectinfo()
const { generateInviteToken, removeParticipant } = useParticipant()
const { notify } = useNotification()

const project = ref<ProjectDto | null>(null)
const inviteUnavailable = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)

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

function onClearError(fieldKey: string) {
  fieldErrors.value = clearFieldError(fieldErrors.value, fieldKey)
}

async function onSave() {
  if (!project.value?.own_project) return

  formError.value = null
  fieldErrors.value = {}

  const result = createOwnProjectSchema().safeParse(ownProjectForm.value)
  if (!result.success) {
    fieldErrors.value = mapZodIssuesToFieldErrors(result.error.issues, t)
    scrollToFirstFieldError(fieldErrors.value)
    return
  }

  try {
    project.value = await updateProject(project.value.own_project)
    notify('success', 'message_successChange')
  }
  catch (error) {
    const apiMessage = getApiErrorMessage(error) ?? ''
    const mapped = mapApiMessageToFieldErrors(apiMessage, t)
    if (Object.keys(mapped.fieldErrors).length > 0) {
      fieldErrors.value = mapped.fieldErrors
      formError.value = null
    }
    else {
      fieldErrors.value = {}
      formError.value = mapped.message
    }
    notify('error', 'error_An error occurred', undefined, mapped.message)
    scrollToFirstFieldError(mapped.fieldErrors)
  }
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
