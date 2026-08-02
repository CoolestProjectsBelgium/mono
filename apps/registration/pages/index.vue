<template>
  <div>
    <HeroSection>
      <h1 class="text-4xl font-bold">{{ $t('rules') }}</h1>
      <p class="mt-4 text-lg opacity-90">{{ $t('intro') }}</p>
      <h2 v-if="viewModel.isActive && viewModel.officialStartDate" class="mt-4 text-2xl font-semibold">
        {{ $t('intro2', { officialStartDate: formatLongDate(viewModel.officialStartDate) }) }}
      </h2>
    </HeroSection>
    <div class="mx-auto max-w-5xl px-4 py-8">
      <p class="mb-4 font-semibold">{{ $t('agree') }}</p>
      <RulesList v-if="settings" :settings="settings" />
      <p class="mt-6">
        <span>{{ $t('problems') }} </span>
        <a href="mailto:info@coolestprojects.be?subject=CoolestProjectsRegistration" class="font-bold text-primary">
          {{ $t('href_text') }}
        </a>
      </p>
      <ApiUnavailableBanner v-if="loadError" class="mt-6" />
      <EventStatusBanner v-else-if="settings" :view-model="viewModel" class="mt-6" />
      <div v-if="viewModel?.showRegistrationCta" class="mt-8">
        <CtaButton :to="localePath('/registration')">{{ $t('start') }}</CtaButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SettingDto } from '~/types/api'
import { mapSettingsToViewModel } from '~/utils/settings'

definePageMeta({ layout: 'fullwidth' })

const localePath = useLocalePath()
const { fetchSettings } = useSettings()
const { formatLongDate } = useLongDate()

const settings = ref<SettingDto | null>(null)
const loadError = ref(false)
const viewModel = computed(() => mapSettingsToViewModel(settings.value))

onMounted(async () => {
  try {
    settings.value = await fetchSettings()
  }
  catch {
    loadError.value = true
  }
})

</script>
