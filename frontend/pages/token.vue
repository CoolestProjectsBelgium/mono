<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold">{{ $t('EnterToken') }}</h1>
    <p class="mt-2 text-gray-600">{{ $t('description_Geefcode') }}</p>
    <form class="mt-6" @submit.prevent="onSubmit">
      <label class="form-label" for="token">{{ $t('label_Projectcode:') }}</label>
      <input id="token" v-model="token" class="form-input" required />
      <CtaButton variant="primary" class="mt-4" type="submit">{{ $t('CreateViaToken') }}</CtaButton>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'authenticated' })

const localePath = useLocalePath()
const token = ref('')

async function onSubmit() {
  await navigateTo(localePath({ path: '/registration', query: { token: token.value } }))
}
</script>
