<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleReg') }}</h1>
    <ValidationAlert :field-errors="fieldErrors" :api-message="formError" />
    <form class="mt-6 space-y-6" @submit.prevent="onSubmit" @reset.prevent="onReset" @keydown.enter="onFormKeydown">
      <UserForm
        v-model="draft.form.user"
        :tshirts="flatTshirts"
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
  </div>
</template>

<script setup lang="ts">
import type { ApprovalDto, QuestionDto, SettingDto, TshirtGroupDto } from '~/types/api'
import { isGuardianRequired } from '~/utils/birth-date'
import { setRegistrationSuccess } from '~/utils/registration-success'
import { clearFieldError, scrollToFirstFieldError } from '~/utils/validation/map-field-errors'
import { focusNextOnEnter } from '~/utils/focus-next-on-enter'
import { validateRegistrationForm } from '~/utils/validation/validate-registration'

definePageMeta({ middleware: 'not-authenticated' })

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const draft = useRegistrationDraftStore()
const { fetchTshirts, fetchQuestions, fetchApprovals, submitRegistration } = useRegistration()
const { fetchSettings } = useSettings()

const loading = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const tshirtGroups = ref<TshirtGroupDto[] | null>(null)
const approvals = ref<ApprovalDto[] | null>(null)
const questions = ref<QuestionDto[] | null>(null)
const settings = ref<SettingDto | null>(null)

const flatTshirts = computed(() =>
  tshirtGroups.value?.flatMap(g => g.items) ?? [],
)

const showGuardian = computed(() => {
  if (!settings.value || !draft.form.user.year || draft.form.user.month < 0) {
    return false
  }
  return isGuardianRequired(settings.value, draft.form.user.year, draft.form.user.month)
})

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (token) {
    draft.prefillToken(token)
  }
  const [tshirtsResult, questionsResult, approvalsResult, settingsResult] = await Promise.allSettled([
    fetchTshirts(),
    fetchQuestions(),
    fetchApprovals(),
    fetchSettings(),
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
