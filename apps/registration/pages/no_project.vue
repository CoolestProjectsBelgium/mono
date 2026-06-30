<template>
  <div class="text-center">
    <h1 class="text-3xl font-bold">{{ $t('Project') }}</h1>
    <p class="mt-4 text-gray-600">{{ $t('noProject.message') }}</p>
    <div class="mt-8 flex justify-center gap-4">
      <CtaButton :to="localePath('/new_project')" variant="primary">{{ $t('createProject') }}</CtaButton>
      <CtaButton :to="localePath('/token')" variant="cta">{{ $t('CreateViaToken') }}</CtaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'authenticated' })

const localePath = useLocalePath()
</script>
