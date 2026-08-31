<template>
  <div>
    <template v-if="isLoggedInJoin">
      <h1 class="text-3xl font-bold">{{ $t('joinProjectTitle') }}</h1>
      <p class="mt-2 text-gray-600">{{ $t('joinProjectMessage') }}</p>
      <ValidationAlert
        data-testid="join-voucher-panel"
        :field-errors="fieldErrors"
        :api-message="joinError"
        summary-key="validation_tokenRequired"
      />
      <p v-if="joinLoading" class="mt-4 text-gray-500">{{ $t('pleaseWait') }}</p>
      <div v-else-if="joinError" class="mt-6 flex gap-4">
        <CtaButton :to="localePath('/token')" variant="primary">{{ $t('EnterToken') }}</CtaButton>
        <CtaButton :to="localePath('/project')" variant="cta">{{ $t('titleProject') }}</CtaButton>
      </div>
    </template>
    <template v-else>
      <h1 class="text-3xl font-bold">{{ $t('titleReg') }}</h1>
      <ValidationAlert :field-errors="fieldErrors" :api-message="formError" />
      <form class="mt-6 space-y-6" @submit.prevent="onSubmit" @reset.prevent="onReset" @keydown.enter="onFormKeydown">
        <UserForm
          v-model="draft.form.user"
          :tshirt-groups="tshirtGroups ?? []"
          :dojos="dojos ?? []"
          :settings="settings"
          :show-guardian="showGuardian"
          :errors="fieldErrors"
          @clear-error="onClearError"
        />
        <FormSection :title="$t('Project')">
          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2">
              <input v-model="draft.form.isOwnProject" type="radio" :value="true" name="project-type" />
              {{ $t('eigenProject') }}
            </label>
            <label class="flex items-center gap-2">
              <input v-model="draft.form.isOwnProject" type="radio" :value="false" name="project-type" />
              {{ $t('medeProject') }}
            </label>
          </div>
        </FormSection>
        <OwnProjectForm
          v-if="draft.form.isOwnProject"
          v-model="draft.form.ownProject"
          :errors="fieldErrors"
          @clear-error="onClearError"
        />
        <OtherProjectForm
          v-else
          v-model="draft.form.otherProject"
          :errors="fieldErrors"
          @clear-error="onClearError"
        />
        <GeneralQuestions
          v-if="questions?.length"
          v-model="draft.form.user.general_questions"
          :questions="questions"
          :answered-ids="draft.form.answeredGeneralQuestionIds"
          :errors="fieldErrors"
          @answer="onGeneralQuestionAnswered"
          @clear-error="onClearError"
        />
        <MandatoryQuestions
          v-if="approvals"
          v-model="draft.form.mandatoryApprovals"
          :approvals="approvals"
          :error="fieldErrors.mandatory_approvals"
          @clear-error="onClearError('mandatory_approvals')"
        />
        <div class="flex gap-4">
          <CtaButton variant="primary" :disabled="loading" type="button" @click="onSubmit">
            {{ loading ? $t('pleaseWait') : $t('Ik schrijf me in') }}
          </CtaButton>
          <CtaButton type="button" @click="onReset">{{ $t('verwijder alles') }}</CtaButton>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ApprovalDto, DojoDto, QuestionDto, SettingDto, TshirtGroupDto } from '~/types/api'
import { isGuardianRequired } from '~/utils/birth-date'
import { setRegistrationSuccess } from '~/utils/registration-success'
import { clearFieldError, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'
import { mapApiMessageToFieldErrors } from '~/utils/validation/map-api-errors'
import { getApiErrorMessage } from '~/utils/api-response'
import { focusNextOnEnter } from '~/utils/focus-next-on-enter'
import { validateRegistrationForm } from '~/utils/validation/validate-registration'

definePageMeta({ middleware: 'not-authenticated' })

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const authStore = useAuthStore()
const draft = useRegistrationDraftStore()
const { fetchTshirts, fetchQuestions, fetchApprovals, fetchDojos, submitRegistration } = useRegistration()
const { fetchSettings } = useSettings()
const { joinProject } = useParticipant()
const { notify } = useNotification()

const loading = ref(false)
const joinLoading = ref(false)
const formError = ref<string | null>(null)
const joinError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const tshirtGroups = ref<TshirtGroupDto[] | null>(null)
const approvals = ref<ApprovalDto[] | null>(null)
const questions = ref<QuestionDto[] | null>(null)
const dojos = ref<DojoDto[] | null>(null)
const settings = ref<SettingDto | null>(null)

const isLoggedInJoin = computed(() =>
  authStore.isLoggedIn && Boolean(route.query.token),
)

const showGuardian = computed(() => {
  if (!settings.value || !draft.form.user.year || draft.form.user.month < 0) {
    return false
  }
  return isGuardianRequired(settings.value, draft.form.user.year, draft.form.user.month)
})

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (isLoggedInJoin.value && token) {
    await redeemVoucher(token)
    return
  }

  if (token) {
    draft.prefillToken(token)
  }

  await loadCatalogs()
})

async function loadCatalogs() {
  const [tshirtsResult, questionsResult, approvalsResult, settingsResult, dojosResult] = await Promise.allSettled([
    fetchTshirts(),
    fetchQuestions(),
    fetchApprovals(),
    fetchSettings(),
    fetchDojos(),
  ])
  if (tshirtsResult.status === 'fulfilled') {
    tshirtGroups.value = tshirtsResult.value
  }
  if (questionsResult.status === 'fulfilled') {
    questions.value = questionsResult.value
  }
  if (approvalsResult.status === 'fulfilled') {
    approvals.value = approvalsResult.value
  }
  if (settingsResult.status === 'fulfilled') {
    settings.value = settingsResult.value
  }
  if (dojosResult.status === 'fulfilled') {
    dojos.value = dojosResult.value
  }
}

async function redeemVoucher(token: string) {
  const projectCode = token.trim()
  if (!projectCode) {
    joinError.value = t('validation_tokenRequired')
    return
  }

  joinLoading.value = true
  joinError.value = null
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
      joinError.value = mapped.message
    }
    else {
      fieldErrors.value = {}
      joinError.value = mapped.message
    }
    notify('error', 'error_An error occurred', undefined, mapped.message)
  }
  finally {
    joinLoading.value = false
  }
}

function onFormKeydown(event: KeyboardEvent) {
  const root = event.currentTarget
  if (root instanceof HTMLElement) {
    focusNextOnEnter(event, root)
  }
}

function onClearError(fieldKey: string) {
  fieldErrors.value = clearFieldError(fieldErrors.value, fieldKey)
}

function onGeneralQuestionAnswered(id: string) {
  draft.form.answeredGeneralQuestionIds ??= []
  const normalized = String(id)
  if (!draft.form.answeredGeneralQuestionIds.includes(normalized)) {
    draft.form.answeredGeneralQuestionIds.push(normalized)
  }
}

async function onSubmit() {
  loading.value = true
  formError.value = null
  fieldErrors.value = {}
  draft.form.user.mandatory_approvals = [...draft.form.mandatoryApprovals]
  draft.form.user.email_guardian = draft.form.user.email_guardian?.trim() ?? ''
  draft.form.user.gsm_guardian = draft.form.user.gsm_guardian?.trim() ?? ''

  if (!settings.value) {
    formError.value = t('apiUnavailable.default')
    loading.value = false
    return
  }

  const questionIds = questions.value?.map(q => String(q.id)) ?? []
  const errors = validateRegistrationForm(
    draft.form,
    settings.value,
    approvals.value ?? [],
    questionIds,
    t,
    dojos.value ?? [],
  )

  if (errors) {
    fieldErrors.value = errors
    await nextTick()
    scrollToFirstFieldError(errors, { mandatory_approvals: 'mandatory_approvals-error' })
    loading.value = false
    return
  }

  const result = await submitRegistration(draft.form)
  if (result.ok) {
    const email = draft.form.user.email
    setRegistrationSuccess(email)
    draft.reset()
    await navigateTo(localePath('/registration/success'))
  }
  else if (result.error) {
    if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
      fieldErrors.value = result.fieldErrors
      formError.value = null
      scrollToFirstFieldError(result.fieldErrors, { mandatory_approvals: 'mandatory_approvals-error' })
    }
    else {
      fieldErrors.value = {}
      formError.value = result.error
    }
  }
  loading.value = false
}

function onReset() {
  draft.reset()
  fieldErrors.value = {}
  formError.value = null
}
</script>
