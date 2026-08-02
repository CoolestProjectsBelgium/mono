<template>
  <div>
    <HeroSection>
      <h1 class="text-4xl font-bold">{{ $t('Rules') }}</h1>
    </HeroSection>
    <div class="mx-auto max-w-5xl px-4 py-8">
      <RulesList v-if="settings" :settings="settings" />
      <p class="mt-8">
        <NuxtLink :to="localePath('/')" class="text-primary hover:underline">
          {{ $t('Back to homepage') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SettingDto } from '~/types/api'

definePageMeta({ layout: 'fullwidth' })

const localePath = useLocalePath()
const { fetchSettings } = useSettings()
const settings = ref<SettingDto | null>(null)

onMounted(async () => {
  settings.value = await fetchSettings()
})
</script>
