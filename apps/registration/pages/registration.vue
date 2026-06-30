<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleReg') }}</h1>
    <AlertBanner v-if="formError" variant="error" class="mt-4" :message="formError" />
    <form class="mt-6 space-y-6" @submit.prevent="onSubmit" @reset.prevent="onReset">
      <UserForm
        v-model="draft.form.user"
        :tshirts="flatTshirts"
        :settings="settings"
        :show-guardian="showGuardian"
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
      <OwnProjectForm v-if="draft.form.isOwnProject" v-model="draft.form.ownProject" />
      <OtherProjectForm v-else v-model="draft.form.otherProject" />
      <GeneralQuestions
        v-if="questions?.length"
        v-model="draft.form.user.general_questions"
        :questions="questions"
      />
      <MandatoryQuestions v-if="approvals" v-model="draft.form.mandatoryApprovals" :approvals="approvals" />
      <div class="flex gap-4">
        <CtaButton variant="primary" :disabled="loading" type="submit">
          {{ loading ? $t('pleaseWait') : $t('Ik schrijf me in') }}
        </CtaButton>
        <CtaButton type="reset">{{ $t('verwijder alles') }}</CtaButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ApprovalDto, QuestionDto, SettingDto, TshirtGroupDto } from '~/types/api'
import { isGuardianRequired } from '~/utils/birth-date'
import { createOwnProjectSchema, createOtherProjectSchema, createUserSchema } from '~/utils/validation/user'

definePageMeta({ middleware: 'not-authenticated' })

const route = useRoute()
const { t } = useI18n()
const { notify } = useNotification()
const draft = useRegistrationDraftStore()
const { fetchTshirts, fetchQuestions, fetchApprovals, submitRegistration } = useRegistration()
const { fetchSettings } = useSettings()

const loading = ref(false)
const formError = ref<string | null>(null)
const tshirtGroups = ref<TshirtGroupDto[] | null>(null)
const approvals = ref<ApprovalDto[] | null>(null)
const questions = ref<QuestionDto[] | null>(null)
const settings = ref<SettingDto | null>(null)

const flatTshirts = computed(() =>
  tshirtGroups.value?.flatMap(g => g.tshirts) ?? [],
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

async function onSubmit() {
  loading.value = true
  formError.value = null
  draft.form.user.mandatory_approvals = [...draft.form.mandatoryApprovals]
  draft.form.user.email_guardian = draft.form.user.email_guardian?.trim() ?? ''
  draft.form.user.gsm_guardian = draft.form.user.gsm_guardian?.trim() ?? ''

  const validationError = validateForm()
  if (validationError) {
    formError.value = validationError
    notify('error', 'error_An error occurred', undefined, validationError)
    scrollToGuardianIfNeeded(validationError)
    loading.value = false
    return
  }

  const result = await submitRegistration(draft.form)
  if (result.ok) {
    draft.reset()
  }
  else if (result.error) {
    formError.value = result.error
    scrollToGuardianIfNeeded(result.error)
  }
  loading.value = false
}

function scrollToGuardianIfNeeded(message: string) {
  const guardianHint = t('validation_guardianRequired')
  if (message !== guardianHint && !/guardian|ouders\/voogd|parent|tuteur/i.test(message)) {
    return
  }
  document.getElementById('guardian-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function validateForm(): string | null {
  if (!settings.value) {
    return t('apiUnavailable.default')
  }

  const { year, month } = draft.form.user
  if (isGuardianRequired(settings.value, year, month)) {
    const email = draft.form.user.email_guardian?.trim() ?? ''
    const gsm = draft.form.user.gsm_guardian?.trim() ?? ''
    if (!email || !gsm) {
      return t('validation_guardianRequired')
    }
  }

  const userResult = createUserSchema({
    minAge: settings.value.minAge,
    maxAge: settings.value.maxAge,
    guardianAge: settings.value.guardianAge,
    officialStartDate: settings.value.officialStartDate,
  }).safeParse({
    ...draft.form.user,
    mandatory_approvals: draft.form.mandatoryApprovals,
  })

  if (!userResult.success) {
    const issue = userResult.error.issues[0]
    if (issue?.path[0] === 'email_guardian' || issue?.path[0] === 'gsm_guardian') {
      return t('validation_guardianRequired')
    }
    if (issue?.path[0] === 'month') {
      return t('validation_birthMonth')
    }
    if (issue?.path[0] === 'mandatory_approvals') {
      return t('validation_mandatoryApprovals')
    }
    return t('validation_formIncomplete')
  }

  if (draft.form.isOwnProject) {
    const projectResult = createOwnProjectSchema().safeParse(draft.form.ownProject)
    if (!projectResult.success) {
      return t('validation_projectIncomplete')
    }
  }
  else {
    const projectResult = createOtherProjectSchema().safeParse(draft.form.otherProject)
    if (!projectResult.success) {
      return t('validation_tokenRequired')
    }
  }

  return null
}

function onReset() {
  draft.reset()
}
</script>
