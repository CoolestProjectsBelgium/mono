<template>
  <div class="mx-auto max-w-2xl px-4 py-16 text-center">
    <h1 class="text-3xl font-bold text-gray-900">{{ $t('NoEventHeader') }}</h1>
    <p class="mt-4 text-lg text-gray-600">{{ $t('No Event is active please come again later') }}</p>
    <p class="mt-6">
      <a
        href="https://coderdojobelgium.be"
        target="_blank"
        rel="noopener"
        class="text-primary hover:underline"
      >
        CoderDojo Belgium
      </a>
    </p>
    <CtaButton :to="localePath('/')" class="mt-8">{{ $t('Back to homepage') }}</CtaButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'fullwidth' })

const localePath = useLocalePath()
</script>
