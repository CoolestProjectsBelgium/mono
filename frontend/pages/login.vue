<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold">{{ $t('titleLogin') }}</h1>
    <ApiUnavailableBanner
      v-if="activationFailed"
      message-key="login.linkExpired"
      class="mt-4"
    />
    <form v-else class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="form-label" for="email">{{ $t('emailAddressLabel') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="form-input"
          :placeholder="$t('emailAddressPlaceholder')"
          required
        />
      </div>
      <CtaButton variant="primary" :disabled="loading" type="submit">
        {{ loading ? $t('pleaseWait') : $t('Stuur me een logincode') }}
      </CtaButton>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'not-authenticated' })

const route = useRoute()
const localePath = useLocalePath()
const { requestMagicLink, activateWithToken } = useAuth()

const email = ref('')
const loading = ref(false)
const activationFailed = ref(false)

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) return

  loading.value = true
  const ok = await activateWithToken(token)
  loading.value = false

  if (ok) {
    await navigateTo(localePath('/user'))
  }
  else {
    activationFailed.value = true
  }
})

async function onSubmit() {
  loading.value = true
  await requestMagicLink(email.value)
  loading.value = false
}
</script>
