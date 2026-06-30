<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('titleReg') }}</h1>
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
import type { ApprovalDto, SettingDto, TshirtGroupDto } from '~/types/api'
import { isGuardianRequired } from '~/utils/birth-date'

definePageMeta({ middleware: 'not-authenticated' })

const route = useRoute()
const draft = useRegistrationDraftStore()
const { fetchTshirts, fetchApprovals, submitRegistration } = useRegistration()
const { fetchSettings } = useSettings()

const loading = ref(false)
const tshirtGroups = ref<TshirtGroupDto[] | null>(null)
const approvals = ref<ApprovalDto[] | null>(null)
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
  const [tshirtsResult, approvalsResult, settingsResult] = await Promise.allSettled([
    fetchTshirts(),
    fetchApprovals(),
    fetchSettings(),
  ])
  if (tshirtsResult.status === 'fulfilled') {
    tshirtGroups.value = tshirtsResult.value
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
  draft.form.user.mandatory_approvals = [...draft.form.mandatoryApprovals]
  const ok = await submitRegistration(draft.form)
  if (ok) draft.reset()
  loading.value = false
}

function onReset() {
  draft.reset()
}
</script>
