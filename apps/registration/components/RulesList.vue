<template>
  <ol class="list-decimal space-y-3 pl-6">
    <li>
      {{ $t('rule1', {
        registrationOpenDate: formatLongDate(settings.registrationOpenDate),
        registrationClosedDate: formatLongDate(settings.registrationClosedDate),
        maxRegistration: settings.maxRegistration,
      }) }}
    </li>
    <li>{{ $t('rule2', { minAge: settings.minAge, maxAge: settings.maxAge }) }}</li>
    <li>{{ $t('rule3') }}</li>
    <li>{{ $t('rule4') }}</li>
    <li>{{ $t('rule5', { maxParticipants: settings.maxParticipants + 1 }) }}</li>
    <li>{{ $t('rule6', { projectClosedDate: formatLongDate(settings.projectClosedDate) }) }}</li>
    <li>{{ $t('rule7', { projectClosedDate: formatLongDate(settings.projectClosedDate) }) }}</li>
    <li>{{ $t('rule8', { officialStartDate: formatLongDate(settings.officialStartDate) }) }}</li>
    <li>{{ $t('rule9', { officialStartDate: formatLongDate(settings.officialStartDate) }) }}</li>
    <li>{{ $t('rule10') }}</li>
    {{ $t('rule10a') }}
    <br>{{ $t('rule10b') }}
    <br>{{ $t('rule10c') }}
    <i18n-t keypath="rule10d" tag="span">
      <template #privacy_link>
        <b>
          <a target="privacy" :href="privacyLink">{{ $t('privacy_text') }}</a>
        </b>
      </template>
    </i18n-t>
  </ol>
</template>

<script setup lang="ts">
import type { SettingDto } from '~/types/api'

defineProps<{
  settings: SettingDto
}>()

const { locale } = useI18n()
const { formatLongDate } = useLongDate()

const privacyLink = computed(() => {
  const links: Record<string, string> = {
    nl: 'https://coderdojobelgium.be/privacy',
    fr: 'https://coderdojobelgium.be/fr/confidentialité',
    en: 'https://coderdojobelgium.be/privacy',
  }
  return links[locale.value] ?? links.nl
})
</script>
