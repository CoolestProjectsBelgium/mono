<template>
  <FormSection :title="$t('personal_info')">
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="form-label" for="firstname">{{ $t('label_Voornaam:') }}</label>
        <input id="firstname" v-model="model.firstname" class="form-input" :disabled="disabled" />
      </div>
      <div>
        <label class="form-label" for="lastname">{{ $t('label_Achternaam:') }}</label>
        <input id="lastname" v-model="model.lastname" class="form-input" :disabled="disabled" />
      </div>
      <div>
        <label class="form-label" for="email">{{ $t('label_Email adres:') }}</label>
        <input id="email" v-model="model.email" type="email" class="form-input" :disabled="disabled" />
      </div>
      <div>
        <label class="form-label" for="gsm">{{ $t('label_mobiel nummer (+32):') }}</label>
        <input id="gsm" v-model="model.gsm" class="form-input" :disabled="disabled" />
      </div>
      <div class="md:col-span-2">
        <fieldset class="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
          <legend class="px-1 text-sm font-medium text-gray-700">{{ $t('birthDateLegend') }}</legend>
          <div class="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="form-label" for="year">{{ $t('label_Geboortejaar:') }}</label>
              <select
                id="year"
                v-model.number="model.year"
                class="form-input"
                :disabled="disabled || !resolvedSettings"
              >
                <option :value="0" disabled>
                  {{ resolvedSettings ? $t('description_year') : $t('pleaseWait') }}
                </option>
                <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="month">{{ $t('label_Geboortemaand:') }}</label>
              <select
                id="month"
                v-model.number="model.month"
                class="form-input"
                :disabled="disabled || !resolvedSettings || !model.year"
              >
                <option :value="-1" disabled>{{ $t('placeholder_Kiesmaand') }}</option>
                <option v-for="month in monthOptions" :key="month" :value="month">
                  {{ formatBirthMonth(month) }}
                </option>
              </select>
            </div>
          </div>
        </fieldset>
      </div>
      <div>
        <label class="form-label">{{ $t('label_Geslacht:') }}</label>
        <div class="flex gap-4">
          <label><input v-model="model.sex" type="radio" value="m" :disabled="disabled" /> {{ $t('jongen') }}</label>
          <label><input v-model="model.sex" type="radio" value="f" :disabled="disabled" /> {{ $t('meisje') }}</label>
          <label><input v-model="model.sex" type="radio" value="x" :disabled="disabled" /> {{ $t('X') }}</label>
        </div>
      </div>
      <div>
        <label class="form-label" for="t_size">{{ $t('label_T-shirt maat:') }}</label>
        <select id="t_size" v-model.number="model.t_size" class="form-input" :disabled="disabled">
          <option :value="0">{{ $t('MakeChoice') }}</option>
          <option v-for="shirt in tshirts" :key="shirt.id" :value="shirt.id">{{ shirt.name }}</option>
        </select>
      </div>
    </div>
    <div v-if="showGuardianFields" id="guardian-section" class="mt-6 grid gap-4 md:grid-cols-2">
      <h3 class="col-span-full text-lg font-semibold">{{ $t('Informatie van je ouders/voogd') }}</h3>
      <p class="col-span-full text-sm text-amber-800">{{ $t('validation_guardianRequired') }}</p>
      <div>
        <label class="form-label" for="email_guardian">{{ $t('label_Email adres ouders/voogd:') }} *</label>
        <input
          id="email_guardian"
          v-model="model.email_guardian"
          type="email"
          class="form-input"
          :disabled="disabled"
          required
        />
      </div>
      <div>
        <label class="form-label" for="gsm_guardian">{{ $t('label_mobiel nummer ouders/voogd') }} *</label>
        <input
          id="gsm_guardian"
          v-model="model.gsm_guardian"
          class="form-input"
          :disabled="disabled"
          required
        />
      </div>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import type { SettingDto, TshirtDto, UserDto } from '~/types/api'
import {
  formatBirthMonth as formatMonth,
  getAgeBounds,
  getEligibleMonths,
  getEligibleYears,
  isGuardianRequired,
  syncBirthMonth,
} from '~/utils/birth-date'

const model = defineModel<UserDto>({ required: true })

const props = defineProps<{
  tshirts?: TshirtDto[]
  disabled?: boolean
  showGuardian?: boolean
  settings?: SettingDto | null
}>()

const { locale } = useI18n()
const { fetchSettings } = useSettings()
const localSettings = ref<SettingDto | null>(null)

const resolvedSettings = computed(() => props.settings ?? localSettings.value)

const ageBounds = computed(() => (resolvedSettings.value ? getAgeBounds(resolvedSettings.value) : null))

const guardianRequired = computed(() => {
  if (!resolvedSettings.value || !model.value.year || model.value.month < 0) {
    return false
  }
  return isGuardianRequired(resolvedSettings.value, model.value.year, model.value.month)
})

const showGuardianFields = computed(() => props.showGuardian ?? guardianRequired.value)

const yearOptions = computed(() => (ageBounds.value ? getEligibleYears(ageBounds.value) : []))

const monthOptions = computed(() => {
  if (!ageBounds.value || !model.value.year) {
    return []
  }
  return getEligibleMonths(model.value.year, ageBounds.value)
})

function formatBirthMonth(month: number): string {
  return formatMonth(month, locale.value)
}

onMounted(async () => {
  if (props.settings) {
    return
  }
  try {
    localSettings.value = await fetchSettings()
  }
  catch {
    localSettings.value = null
  }
})

watch(
  () => model.value.year,
  (year) => {
    if (!ageBounds.value || !year) {
      model.value.month = -1
      return
    }
    model.value.month = syncBirthMonth(year, model.value.month, ageBounds.value)
  },
)

watch(resolvedSettings, (settings) => {
  if (!settings || !model.value.year) {
    return
  }
  const bounds = getAgeBounds(settings)
  model.value.month = syncBirthMonth(model.value.year, model.value.month, bounds)
})
</script>
