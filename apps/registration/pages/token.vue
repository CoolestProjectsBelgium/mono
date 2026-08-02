<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold">{{ $t('EnterToken') }}</h1>
    <p class="mt-2 text-gray-600">{{ $t('description_Geefcode') }}</p>
    <ValidationAlert
      :field-errors="fieldErrors"
      :api-message="formError"
      summary-key="validation_tokenRequired"
    />
    <form class="mt-6" @submit.prevent="onSubmit">
      <FormField field-id="project_code" :label="$t('label_Projectcode:')" :error="fieldErrors.project_code">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="token"
            :class="inputClass"
            required
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="onClearError('project_code')"
          />
        </template>
      </FormField>
      <CtaButton variant="primary" class="mt-4" type="submit" :disabled="loading">
        {{ loading ? $t('pleaseWait') : $t('CreateViaToken') }}
      </CtaButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { clearFieldError } from '~/utils/validation/map-field-errors'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'
import { getApiErrorMessage } from '~/utils/api-response'

definePageMeta({ middleware: 'authenticated' })

const { t } = useI18n()
const localePath = useLocalePath()
const { joinProject } = useParticipant()
const { notify } = useNotification()

const token = ref('')
const loading = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

function onClearError(fieldKey: string) {
  fieldErrors.value = clearFieldError(fieldErrors.value, fieldKey)
}

async function onSubmit() {
  const projectCode = token.value.trim()
  if (!projectCode) {
    fieldErrors.value = { project_code: t('validation_tokenRequired') }
    return
  }

  loading.value = true
  formError.value = null
  fieldErrors.value = {}

  try {
    await joinProject(projectCode)
    notify('success', 'message_successChange')
    await navigateTo(localePath('/project'))
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
  }
  finally {
    loading.value = false
  }
}
</script>
