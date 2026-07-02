<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleProject') }}</h1>
    <ValidationAlert
      :field-errors="fieldErrors"
      :api-message="formError"
      summary-key="validation_projectIncomplete"
    />
    <p v-if="loading" data-testid="project-loading" class="mt-4 text-gray-500">{{ $t('pleaseWait') }}</p>
    <ApiUnavailableBanner
      v-else-if="loadError"
      message-key="apiUnavailable.default"
      class="mt-4"
    />
    <template v-else-if="isProjectOwner" data-testid="project-owner-view">
      <OwnProjectForm
        v-model="ownProjectForm"
        :errors="fieldErrors"
        class="mt-6"
        @clear-error="onClearError"
      />
      <OwnParticipants
        :participants="project.own_project.participants ?? []"
        :invite-unavailable="inviteUnavailable"
        :adding="addingParticipant"
        :add-disabled="addParticipantDisabled"
        :removing-participant-id="removingParticipantId"
        class="mt-6"
        @add="onAddParticipant"
        @remove="onRemoveParticipant"
        @copy="onCopyInvite"
        @mail="onMailInvite"
      />
      <div class="mt-6 flex gap-4">
        <CtaButton variant="primary" @click="onSave">{{ $t('Aanpassen') }}</CtaButton>
        <NuxtLink :to="localePath('/upload')" class="btn-primary">{{ $t('Upload Movie') }}</NuxtLink>
        <CtaButton v-if="project.own_project.delete_possible" variant="cta" @click="onDelete">
          {{ $t('Project wordt verwijderd') }}
        </CtaButton>
      </div>
    </template>
    <template v-else-if="project?.own_project" data-testid="project-coworker-view">
      <p class="mt-4 text-gray-600">{{ $t('medeProject') }}</p>
      <dl class="mt-6 grid gap-4">
        <div>
          <dt class="form-label">{{ $t('label_Projectnaam:') }}</dt>
          <dd class="mt-1">{{ project.own_project.project_name }}</dd>
        </div>
        <div>
          <dt class="form-label">{{ $t('label_Omschrijving:') }}</dt>
          <dd class="mt-1 whitespace-pre-wrap">{{ project.own_project.project_descr }}</dd>
        </div>
        <div>
          <dt class="form-label">{{ $t('label_Project_Type') }}</dt>
          <dd class="mt-1 whitespace-pre-wrap">{{ project.own_project.project_type }}</dd>
        </div>
        <div>
          <dt class="form-label">{{ $t('description_taalJury') }}</dt>
          <dd class="mt-1">{{ $t(languageLabelKey(project.own_project.project_lang)) }}</dd>
        </div>
      </dl>
      <div class="mt-6">
        <CtaButton
          variant="cta"
          data-testid="leave-project-button"
          :disabled="leavingProject"
          @click="showLeaveDialog = true"
        >
          {{ $t('leaveProject.button') }}
        </CtaButton>
      </div>
      <ConfirmDialog
        v-model:open="showLeaveDialog"
        :title="$t('leaveProject.title')"
        :message="$t('leaveProject.confirm', { projectName: project.own_project.project_name })"
        :confirm-label="$t('leaveProject.confirmButton')"
        :cancel-label="$t('Cancel')"
        :please-wait-label="$t('pleaseWait')"
        :loading="leavingProject"
        @confirm="onLeaveProject"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProjectDto, SettingDto, ParticipantDto } from '~/types/api'
import { clearFieldError, mapZodIssuesToFieldErrors, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'
import { createOwnProjectSchema } from '~/utils/validation/user'
import { getApiErrorMessage } from '~/utils/api-response'
import { getParticipantRemoveConfirm } from '~/utils/participant-remove'
import { isProjectOwner as checkIsProjectOwner } from '~/utils/project-routing'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const localePath = useLocalePath()
const { fetchProject, updateProject, deleteProject } = useProjectinfo()
const { generateInviteToken, removeParticipant, leaveProject, copyInviteUrl, openInviteMailto } = useParticipant()
const { fetchSettings } = useSettings()
const { notify } = useNotification()

const project = ref<ProjectDto | null>(null)
const settings = ref<SettingDto | null>(null)
const loading = ref(true)
const loadError = ref(false)
const inviteUnavailable = ref(false)
const addingParticipant = ref(false)
const removingParticipantId = ref<number | null>(null)
const showLeaveDialog = ref(false)
const leavingProject = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)

const coParticipantCount = computed(() =>
  (project.value?.own_project?.participants ?? []).filter(participant => !participant.self).length,
)

const isProjectOwner = computed(() => checkIsProjectOwner(project.value))

function languageLabelKey(lang: 'nl' | 'fr' | 'en') {
  return ({ nl: 'Nederlands', fr: 'Frans', en: 'Engels' } as const)[lang]
}

const addParticipantDisabled = computed(() =>
  settings.value != null && coParticipantCount.value >= settings.value.maxParticipants,
)

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
  loading.value = true
  loadError.value = false
  try {
    const [fetchedProject, fetchedSettings] = await Promise.all([
      fetchProject(),
      fetchSettings(),
    ])
    project.value = fetchedProject
    settings.value = fetchedSettings
    if (!fetchedProject?.own_project && !fetchedProject?.other_project) {
      await navigateTo(localePath('/no_project'))
    }
  }
  catch {
    loadError.value = true
    project.value = null
  }
  finally {
    loading.value = false
  }
})

function onClearError(fieldKey: string) {
  fieldErrors.value = clearFieldError(fieldErrors.value, fieldKey)
}

async function onSave() {
  if (!isProjectOwner.value || !project.value?.own_project) return

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
  if (addingParticipant.value || addParticipantDisabled.value) {
    return
  }

  addingParticipant.value = true
  inviteUnavailable.value = false
  try {
    const participant = await generateInviteToken()
    if (!participant) {
      inviteUnavailable.value = true
      return
    }
    project.value = await fetchProject()
    notify('success', 'participantAdded')
  }
  catch (error) {
    const message = getApiErrorMessage(error) ?? t('error_An error occurred')
    notify('error', 'error_An error occurred', undefined, message)
  }
  finally {
    addingParticipant.value = false
  }
}

async function onRemoveParticipant(participant: ParticipantDto) {
  if (removingParticipantId.value != null) {
    return
  }

  if (import.meta.client) {
    const { key, params } = getParticipantRemoveConfirm(participant)
    if (!window.confirm(t(key, params))) {
      return
    }
  }

  removingParticipantId.value = participant.id
  try {
    await removeParticipant(participant.id)
    project.value = await fetchProject()
    notify('success', 'message_successChange')
  }
  catch (error) {
    const message = getApiErrorMessage(error) ?? t('error_An error occurred')
    notify('error', 'error_An error occurred', undefined, message)
  }
  finally {
    removingParticipantId.value = null
  }
}

async function onCopyInvite(token: string) {
  await copyInviteUrl(token)
}

function onMailInvite(token: string) {
  openInviteMailto(token, project.value?.own_project?.project_name)
}

async function onLeaveProject() {
  if (leavingProject.value) {
    return
  }

  leavingProject.value = true
  try {
    await leaveProject()
    showLeaveDialog.value = false
    notify('success', 'message_successChange')
    await navigateTo(localePath('/no_project'))
  }
  catch (error) {
    const message = getApiErrorMessage(error) ?? t('error_An error occurred')
    notify('error', 'error_An error occurred', undefined, message)
  }
  finally {
    leavingProject.value = false
  }
}
</script>
