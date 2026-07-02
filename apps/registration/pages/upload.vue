<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('Upload Movie') }}</h1>
    <UploadAttachments
      v-if="settings"
      ref="uploadRef"
      :max-upload-size="settings.maxUploadSize"
      class="mt-6"
      @upload-start="uploading = true"
      @upload-end="uploading = false"
    />
    <p v-else class="mt-6 text-gray-500">{{ $t('pleaseWait') }}</p>
    <p v-if="uploading" class="mt-4 text-amber-700" role="alert">
      {{ $t('upload.leaveWarning') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { SettingDto } from '~/types/api'
import { isProjectOwner as checkIsProjectOwner } from '~/utils/project-routing'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const localePath = useLocalePath()
const { fetchSettings } = useSettings()
const { fetchProject } = useProjectinfo()

const uploading = ref(false)
const uploadRef = ref<{ uploading: boolean } | null>(null)
const settings = ref<SettingDto | null>(null)

onMounted(async () => {
  const [fetchedProject, fetchedSettings] = await Promise.all([
    fetchProject(),
    fetchSettings(),
  ])
  if (!checkIsProjectOwner(fetchedProject)) {
    await navigateTo(localePath('/project'))
    return
  }
  settings.value = fetchedSettings
})

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
