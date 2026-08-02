<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('createProject') }}</h1>
    <ValidationAlert
      :field-errors="fieldErrors"
      :api-message="formError"
      summary-key="validation_projectIncomplete"
    />
    <form class="mt-6" @submit.prevent="onCreate" @keydown.enter="onFormKeydown">
      <OwnProjectForm
        v-model="form"
        :errors="fieldErrors"
        @clear-error="onClearError"
      />
      <CtaButton variant="primary" class="mt-6" :disabled="loading" type="button" @click="onCreate">
        {{ loading ? $t('pleaseWait') : $t('Create') }}
      </CtaButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { clearFieldError, mapZodIssuesToFieldErrors, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'
import { createOwnProjectSchema } from '~/utils/validation/user'
import { getApiErrorMessage } from '~/utils/api-response'
import { focusNextOnEnter } from '~/utils/focus-next-on-enter'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const localePath = useLocalePath()
const { createProject } = useProjectinfo()
const { notify } = useNotification()

const loading = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const form = ref({
  project_name: '',
  project_descr: '',
  project_type: '',
  project_lang: 'nl' as const,
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

async function onCreate() {
  loading.value = true
  formError.value = null
  fieldErrors.value = {}

  const result = createOwnProjectSchema().safeParse(form.value)
  if (!result.success) {
    fieldErrors.value = mapZodIssuesToFieldErrors(result.error.issues, t)
    scrollToFirstFieldError(fieldErrors.value)
    loading.value = false
    return
  }

  try {
    const project = await createProject(form.value)
    if (project) {
      await navigateTo(localePath('/project'))
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
  finally {
    loading.value = false
  }
}
</script>
