<template>
  <div class="mx-auto max-w-lg text-center">
    <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
      <span class="text-4xl" aria-hidden="true">🏆</span>
    </div>

    <h1 class="text-3xl font-bold sm:text-4xl">Congratulations!</h1>
    <p class="mt-2 text-lg font-medium text-primary">
      You voted on all projects in your selection.
    </p>

    <p class="mx-auto mt-6 max-w-sm text-gray-600">
      Outstanding effort. You have reviewed every project for the languages you selected.
    </p>

    <div class="mx-auto mt-8 max-w-sm rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
        Help needed
      </p>
      <p class="mt-1 text-sm text-amber-900">
        Select other project languages to help review more jury projects.
      </p>
    </div>

    <div class="mx-auto mt-8 flex max-w-sm flex-col gap-3">
      <CtaButton to="/language" variant="primary" class="w-full justify-center">
        Change project languages
      </CtaButton>
      <CtaButton to="/" variant="secondary" class="w-full justify-center">
        Back to voting
      </CtaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>
