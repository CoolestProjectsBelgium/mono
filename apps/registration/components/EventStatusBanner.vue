<template>
  <div class="space-y-3" role="status">
    <AlertBanner
      v-if="viewModel.showInactiveAlert"
      variant="warning"
      :message="$t('No Event is active please come again later')"
    />
    <AlertBanner
      v-if="viewModel.showRegistrationClosedAlert"
      variant="warning"
    >
      {{ $t('Registration opens on', {
        registrationOpenDate: formatLongDate(viewModel.registrationOpenDate),
        registrationClosedDate: formatLongDate(viewModel.registrationClosedDate),
      }) }}
    </AlertBanner>
    <AlertBanner
      v-if="viewModel.showWaitingListAlert"
      variant="warning"
      :message="$t('Waiting list is active')"
    />
  </div>
</template>

<script setup lang="ts">
import type { SettingsViewModel } from '~/utils/settings'

defineProps<{
  viewModel: SettingsViewModel
}>()

const { formatLongDate } = useLongDate()
</script>
