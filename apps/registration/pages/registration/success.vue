<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold">{{ $t('registrationSuccess.title') }}</h1>
    <p class="mt-4">{{ $t('registrationSuccess.body', { email }) }}</p>
    <div class="mt-6 flex flex-wrap gap-4">
      <CtaButton variant="primary" :to="localePath('/login')">
        {{ $t('registrationSuccess.loginCta') }}
      </CtaButton>
      <CtaButton :to="localePath('/')">
        {{ $t('registrationSuccess.homeCta') }}
      </CtaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { consumeRegistrationSuccess } from '~/utils/registration-success'

definePageMeta({ middleware: 'not-authenticated' })

const localePath = useLocalePath()
const email = ref('')

onMounted(async () => {
  const flash = consumeRegistrationSuccess()
  if (!flash) {
    await navigateTo(localePath('/registration'))
    return
  }
  email.value = flash.email
})
</script>
