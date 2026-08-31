<template>
  <FormSection :title="$t('personal_info')">
    <div class="grid gap-4 md:grid-cols-2">
      <FormField field-id="firstname" :label="$t('label_Voornaam:')" :error="errors?.firstname">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.firstname"
            :class="inputClass"
            :disabled="disabled"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'firstname')"
          />
        </template>
      </FormField>
      <FormField field-id="lastname" :label="$t('label_Achternaam:')" :error="errors?.lastname">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.lastname"
            :class="inputClass"
            :disabled="disabled"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'lastname')"
          />
        </template>
      </FormField>
      <FormField field-id="email" :label="$t('label_Email adres:')" :error="errors?.email">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.email"
            type="email"
            :class="inputClass"
            :disabled="disabled || lockEmail"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'email')"
          />
          <p v-if="lockEmail" class="mt-1 text-sm text-gray-500" data-testid="email-locked-hint">
            {{ $t('emailLockedHint') }}
          </p>
        </template>
      </FormField>
      <FormField field-id="gsm" :label="$t('label_mobiel nummer (+32):')" :error="errors?.gsm">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.gsm"
            :class="inputClass"
            :disabled="disabled"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'gsm')"
          />
        </template>
      </FormField>
      <PostalCodeSearchField
        v-model="model.address"
        :label="$t('label_postalcode')"
        :placeholder="$t('placeholder_postalcode')"
        :disabled="disabled"
        :error="errors?.postalcode"
        @clear-error="emit('clear-error', 'postalcode')"
      />
      <div class="md:col-span-2">
        <fieldset class="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
          <legend class="px-1 text-sm font-medium text-gray-700">{{ $t('birthDateLegend') }}</legend>
          <div class="mt-3 grid gap-4 sm:grid-cols-2">
            <FormField field-id="year" :label="$t('label_Geboortejaar:')" :error="errors?.year">
              <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
                <select
                  :id="inputId"
                  v-model.number="model.year"
                  :class="inputClass"
                  :disabled="disabled || !resolvedSettings"
                  :aria-invalid="ariaInvalid"
                  :aria-describedby="ariaDescribedby"
                  @change="onYearChange"
                >
                  <option :value="0" disabled>
                    {{ resolvedSettings ? $t('description_year') : $t('pleaseWait') }}
                  </option>
                  <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
                </select>
              </template>
            </FormField>
            <FormField field-id="month" :label="$t('label_Geboortemaand:')" :error="errors?.month">
              <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
                <select
                  :id="inputId"
                  :key="`month-${model.year}`"
                  v-model.number="model.month"
                  :class="inputClass"
                  :disabled="disabled || !resolvedSettings || !model.year"
                  :aria-invalid="ariaInvalid"
                  :aria-describedby="ariaDescribedby"
                  @change="emit('clear-error', 'month')"
                >
                  <option :value="-1" disabled>{{ $t('placeholder_Kiesmaand') }}</option>
                  <option v-for="month in monthOptions" :key="month" :value="month">
                    {{ formatBirthMonth(month) }}
                  </option>
                </select>
              </template>
            </FormField>
          </div>
        </fieldset>
      </div>
      <FormField field-id="sex" :label="$t('label_Geslacht:')" :error="errors?.sex">
        <template #default="{ inputId, inputClass, ariaDescribedby, ariaInvalid }">
          <div
            :id="inputId"
            class="flex gap-4 rounded-md"
            :class="errors?.sex ? 'ring-1 ring-red-500 ring-offset-1' : ''"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
          >
            <label><input v-model="model.sex" type="radio" value="m" :disabled="disabled" @change="emit('clear-error', 'sex')" /> {{ $t('jongen') }}</label>
            <label><input v-model="model.sex" type="radio" value="f" :disabled="disabled" @change="emit('clear-error', 'sex')" /> {{ $t('meisje') }}</label>
            <label><input v-model="model.sex" type="radio" value="x" :disabled="disabled" @change="emit('clear-error', 'sex')" /> {{ $t('X') }}</label>
          </div>
        </template>
      </FormField>
      <FormField field-id="t_size" :label="$t('label_T-shirt maat:')" :error="errors?.t_size">
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <select
            :id="inputId"
            v-model.number="model.t_size"
            :class="inputClass"
            :disabled="disabled"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @change="emit('clear-error', 't_size')"
          >
            <option :value="0">{{ $t('MakeChoice') }}</option>
            <template v-for="group in tshirtGroupOptions" :key="group.group">
              <optgroup :label="formatTshirtLabel(group.group)">
                <option v-for="shirt in group.items" :key="shirt.id" :value="shirt.id">
                  {{ formatTshirtLabel(shirt.name) }}
                </option>
              </optgroup>
            </template>
          </select>
        </template>
      </FormField>
    </div>
    <fieldset data-testid="affiliation" class="mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
      <legend class="px-1 text-sm font-medium text-gray-700">{{ $t('label_via') }}</legend>
      <div class="mt-3 flex flex-col gap-2">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="via_type"
            value="dojo"
            :checked="model.via_type === 'dojo'"
            :disabled="disabled"
            @change="setViaType('dojo')"
          />
          {{ $t('via_dojo') }}
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="via_type"
            value="other"
            :checked="model.via_type === 'other'"
            :disabled="disabled"
            @change="setViaType('other')"
          />
          {{ $t('via_other') }}
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="via_type"
            value="na"
            :checked="model.via_type === ''"
            :disabled="disabled"
            @change="setViaType('')"
          />
          {{ $t('via_na') }}
        </label>
      </div>
      <div v-if="model.via_type === 'dojo'" class="mt-4">
        <DojoSearchField
          v-model="model.via"
          :dojos="dojoOptions"
          :label="$t('placeholder_via_dojo')"
          :placeholder="$t('placeholder_via_dojo')"
          :disabled="disabled"
          :error="errors?.via"
          @clear-error="emit('clear-error', 'via')"
        />
      </div>
      <FormField
        v-else-if="model.via_type === 'other'"
        class="mt-4"
        field-id="via"
        :label="$t('label_via_other_name')"
        :error="errors?.via"
      >
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.via"
            :class="inputClass"
            :disabled="disabled"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'via')"
          />
        </template>
      </FormField>
    </fieldset>
    <div v-if="showGuardianFields" id="guardian-section" class="mt-6 grid gap-4 md:grid-cols-2">
      <h3 class="col-span-full text-lg font-semibold">{{ $t('Informatie van je ouders/voogd') }}</h3>
      <FormField
        field-id="email_guardian"
        :label="`${$t('label_Email adres ouders/voogd:')} *`"
        :error="errors?.email_guardian"
      >
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.email_guardian"
            type="email"
            :class="inputClass"
            :disabled="disabled"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'email_guardian')"
          />
        </template>
      </FormField>
      <FormField
        field-id="gsm_guardian"
        :label="`${$t('label_mobiel nummer ouders/voogd')} *`"
        :error="errors?.gsm_guardian"
      >
        <template #default="{ inputId, inputClass, ariaInvalid, ariaDescribedby }">
          <input
            :id="inputId"
            v-model="model.gsm_guardian"
            :class="inputClass"
            :disabled="disabled"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            @input="emit('clear-error', 'gsm_guardian')"
          />
        </template>
      </FormField>
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import type { DojoEntry } from '~/utils/dojos/types'
import type { SettingDto, TshirtGroupDto, UserDto } from '~/types/api'
import { createEmptyAddress } from '~/utils/registration-payload'
import type { ViaType } from '~/utils/dojos/types'
import {
  formatBirthMonth as formatMonth,
  getAgeBounds,
  getEligibleMonths,
  getEligibleYears,
  isGuardianRequired,
  syncBirthMonth,
} from '~/utils/birth-date'

const model = defineModel<UserDto>({ required: true })

if (!model.value.address) {
  model.value.address = createEmptyAddress()
}

if (model.value.via_type !== 'dojo' && model.value.via_type !== 'other') {
  model.value.via_type = ''
}

const props = defineProps<{
  tshirtGroups?: TshirtGroupDto[]
  dojos?: DojoEntry[]
  disabled?: boolean
  showGuardian?: boolean
  settings?: SettingDto | null
  errors?: Record<string, string>
  /** Profile editing: the email address is the login identity and stays fixed. */
  lockEmail?: boolean
}>()

const emit = defineEmits<{
  'clear-error': [fieldKey: string]
}>()

const { locale, t, te } = useI18n()
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

const tshirtGroupOptions = computed(() => props.tshirtGroups ?? [])
const dojoOptions = computed(() => props.dojos ?? [])

function formatTshirtLabel(name: string): string {
  return te(name) ? t(name) : name
}

function setViaType(type: ViaType) {
  model.value.via_type = type
  model.value.via = ''
  emit('clear-error', 'via')
}

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

function onYearChange() {
  emit('clear-error', 'year')
  if (!ageBounds.value || !model.value.year) {
    model.value.month = -1
    return
  }
  model.value.month = syncBirthMonth(model.value.year, model.value.month, ageBounds.value)
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

watch(resolvedSettings, (settings) => {
  if (!settings || !model.value.year) {
    return
  }
  const bounds = getAgeBounds(settings)
  model.value.month = syncBirthMonth(model.value.year, model.value.month, bounds)
})
</script>
