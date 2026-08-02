<template>
  <div class="flex gap-1" role="group" :aria-label="$t('languageSwitcher')">
    <button
      v-for="loc in locales"
      :key="loc.code"
      type="button"
      :class="[
        'rounded px-2 py-1 text-xs font-medium uppercase',
        locale === loc.code ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
      ]"
      :aria-current="locale === loc.code ? 'true' : undefined"
      @click="switchLocale(loc.code)"
    >
      {{ loc.code }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

async function switchLocale(code: string) {
  await setLocale(code)
}
</script>
