<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleUser') }}</h1>
    <ValidationAlert :field-errors="fieldErrors" :api-message="formError" />
    <p v-if="loading" data-testid="profile-loading" class="mt-4 text-gray-500">{{ $t('pleaseWait') }}</p>
    <ApiUnavailableBanner
      v-else-if="loadError || profileState === 'unavailable'"
      message-key="apiUnavailable.userinfo"
      class="mt-4"
    />
    <template v-else-if="profile">
      <form class="mt-6" @submit.prevent="onSave" @keydown.enter="onFormKeydown">
        <UserForm
          v-model="profile"
          :tshirts="flatTshirts"
          :settings="settings"
          :errors="fieldErrors"
          @clear-error="onClearError"
        />
        <div class="mt-6 flex gap-4">
          <CtaButton variant="primary" type="button" @click="onSave">
            {{ $t('Aanpassen') }}
          </CtaButton>
          <CtaButton
            v-if="profile.delete_possible"
            variant="cta"
            type="button"
            @click="onDelete"
          >
            {{ $t('Delete') }}
          </CtaButton>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SettingDto, TshirtGroupDto, UserDto } from '~/types/api'
import { clearFieldError, mapZodIssuesToFieldErrors, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'
import { createUserProfileSchema } from '~/utils/validation/user'
import { getApiErrorMessage } from '~/utils/api-response'
import { focusNextOnEnter } from '~/utils/focus-next-on-enter'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const { fetchUser, updateUser, deleteUser, getProfileState } = useUserinfo()
const { fetchSettings } = useSettings()
const { fetchTshirts } = useRegistration()
const { notify } = useNotification()

const profile = ref<UserDto | null>(null)
const settings = ref<SettingDto | null>(null)
const tshirtGroups = ref<TshirtGroupDto[] | null>(null)
const loading = ref(true)
const loadError = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)
const profileState = computed(() => getProfileState(profile.value))
const flatTshirts = computed(() => tshirtGroups.value?.flatMap(g => g.items) ?? [])

onMounted(async () => {
  loading.value = true
  loadError.value = false
  try {
    const [fetchedUser, fetchedSettings, fetchedTshirts] = await Promise.all([
      fetchUser(),
      fetchSettings(),
      fetchTshirts(),
    ])
    profile.value = fetchedUser
    settings.value = fetchedSettings
    tshirtGroups.value = fetchedTshirts
    if (!fetchedUser) {
      loadError.value = true
    }
  }
  catch {
    loadError.value = true
    profile.value = null
  }
  finally {
    loading.value = false
  }
})

function onFormKeydown(event: KeyboardEvent) {
  const root = event.currentTarget
  if (root instanceof HTMLElement) {
    focusNextOnEnter(event, root)
  }
}

function onClearError(fieldKey: string) {
  fieldErrors.value = clearFieldError(fieldErrors.value, fieldKey)
}

async function onSave() {
  if (!profile.value || !settings.value) return

  formError.value = null
  fieldErrors.value = {}

  const result = createUserProfileSchema({
    minAge: settings.value.minAge,
    maxAge: settings.value.maxAge,
    guardianAge: settings.value.guardianAge,
    officialStartDate: settings.value.officialStartDate,
  }).safeParse(profile.value)

  if (!result.success) {
    fieldErrors.value = mapZodIssuesToFieldErrors(result.error.issues, t)
    scrollToFirstFieldError(fieldErrors.value)
    return
  }

  try {
    const updated = await updateUser(profile.value)
    if (updated) {
      profile.value = updated
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
