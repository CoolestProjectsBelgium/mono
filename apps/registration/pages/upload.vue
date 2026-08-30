<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('upload.photoTitle') }}</h1>
    <UploadAttachments
      v-if="settings && isProjectOwner"
      ref="uploadRef"
      :max-upload-size="settings.maxUploadSize"
      :attachment-count="attachments.length"
      :max-attachments="maxAttachments"
      class="mt-6"
      @upload-start="uploading = true"
      @upload-end="uploading = false"
      @upload-success="onUploadSuccess"
    />
    <p v-else-if="!settings" class="mt-6 text-gray-500">{{ $t('pleaseWait') }}</p>
    <p v-if="uploading" class="mt-4 text-amber-700" role="alert">
      {{ $t('upload.leaveWarning') }}
    </p>
    <AttachmentList
      v-if="settings"
      :attachments="attachments"
      :max-attachments="maxAttachments"
      :disabled="uploading"
      :can-delete="isProjectOwner"
      class="mt-6"
      @deleted="refreshAttachments"
    />
  </div>
</template>

<script setup lang="ts">
import type { AttachmentDto, ProjectDto, SettingDto } from '~/types/api'
import { isProjectOwner as checkIsProjectOwner, hasProjectMembership } from '~/utils/project-routing'
import { hydrateAuthStoreFromStorage } from '~/utils/auth-storage'
import { resolveMaxAttachments } from '~/utils/attachment'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const localePath = useLocalePath()
const { fetchSettings } = useSettings()
const { fetchProject } = useProjectinfo()
const { fetchAttachments } = useAttachments()

const uploading = ref(false)
const uploadRef = ref<{ uploading: boolean } | null>(null)
const settings = ref<SettingDto | null>(null)
const project = ref<ProjectDto | null>(null)
const attachments = ref<AttachmentDto[]>([])

async function refreshAttachments() {
  attachments.value = await fetchAttachments()
}

const isProjectOwner = computed(() => checkIsProjectOwner(project.value))
const maxAttachments = computed(() => resolveMaxAttachments(settings.value?.maxAttachments))

onMounted(async () => {
  try {
    const [fetchedProject, fetchedSettings] = await Promise.all([
      fetchProject(),
      fetchSettings(),
    ])
    if (!hydrateAuthStoreFromStorage()) {
      return
    }
    if (!hasProjectMembership(fetchedProject)) {
      await navigateTo(localePath('/project'))
      return
    }
    project.value = fetchedProject
    settings.value = fetchedSettings
    await refreshAttachments()
  }
  catch {
    if (!hydrateAuthStoreFromStorage()) {
      await navigateTo(localePath('/login'))
    }
  }
})

async function onUploadSuccess() {
  await refreshAttachments()
}

onBeforeRouteLeave((_to, _from, next) => {
  if (uploading.value) {
    const leave = window.confirm(t('upload.leaveConfirm'))
    next(leave)
  }
  else {
    next()
  }
})
</script>
