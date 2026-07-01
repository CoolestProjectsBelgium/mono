<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleUser') }}</h1>
    <ValidationAlert :field-errors="fieldErrors" :api-message="formError" />
    <ApiUnavailableBanner
      v-if="profileState === 'unavailable'"
      message-key="apiUnavailable.userinfo"
      class="mt-4"
    />
    <template v-else-if="user">
      <UserForm
        v-model="user"
        :settings="settings"
        :disabled="profileState === 'unavailable'"
        :errors="fieldErrors"
        class="mt-6"
        @clear-error="onClearError"
      />
      <div class="mt-6 flex gap-4">
        <CtaButton variant="primary" :disabled="profileState === 'unavailable'" @click="onSave">
          {{ $t('Aanpassen') }}
        </CtaButton>
        <CtaButton
          v-if="user.delete_possible"
          variant="cta"
          :disabled="profileState === 'unavailable'"
          @click="onDelete"
        >
          {{ $t('Delete') }}
        </CtaButton>
      </div>
    </template>
    <p v-else class="mt-4 text-gray-500">{{ $t('pleaseWait') }}</p>
  </div>
</template>

<script setup lang="ts">
import type { SettingDto, UserDto } from '~/types/api'
import { clearFieldError, mapZodIssuesToFieldErrors, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'
import { createUserProfileSchema } from '~/utils/validation/user'
import { getApiErrorMessage } from '~/utils/api-response'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const { fetchUser, updateUser, deleteUser, getProfileState } = useUserinfo()
const { fetchSettings } = useSettings()
const { notify } = useNotification()

const user = ref<UserDto | null>(null)
const settings = ref<SettingDto | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)
const profileState = computed(() => getProfileState(user.value))

onMounted(async () => {
  ;[user.value, settings.value] = await Promise.all([fetchUser(), fetchSettings()])
})

function onClearError(fieldKey: string) {
  fieldErrors.value = clearFieldError(fieldErrors.value, fieldKey)
}

async function onSave() {
  if (!user.value || !settings.value) return

  formError.value = null
  fieldErrors.value = {}

  const result = createUserProfileSchema({
    minAge: settings.value.minAge,
    maxAge: settings.value.maxAge,
    guardianAge: settings.value.guardianAge,
    officialStartDate: settings.value.officialStartDate,
  }).safeParse(user.value)

  if (!result.success) {
    fieldErrors.value = mapZodIssuesToFieldErrors(result.error.issues, t)
    scrollToFirstFieldError(fieldErrors.value)
    return
  }

  try {
    const updated = await updateUser(user.value)
    if (updated) {
      user.value = updated
      notify('success', 'message_successChange')
    }
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
  await deleteUser()
  await navigateTo('/')
}
</script>
