<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold">{{ $t('titleLogin') }}</h1>
    <ApiUnavailableBanner
      v-if="activationFailed"
      message-key="login.linkExpired"
      class="mt-4"
    />
    <p v-else-if="activating" class="mt-6 text-gray-600">{{ $t('pleaseWait') }}</p>
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
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()
const { requestMagicLink, activateWithToken } = useAuth()

const email = ref('')
const loading = ref(false)
const activating = ref(false)
const activationFailed = ref(false)

async function activateFromQuery(token: string | undefined) {
  if (!token || activating.value) return

  authStore.clearSession()
  activating.value = true
  activationFailed.value = false
  try {
    const ok = await activateWithToken(token)
    if (ok) {
      await router.replace(localePath('/user'))
    }
    else {
      activationFailed.value = true
    }
  }
  finally {
    activating.value = false
  }
}

watch(
  () => route.query.token,
  token => activateFromQuery(typeof token === 'string' ? token : undefined),
  { immediate: true },
)

async function onSubmit() {
  loading.value = true
  try {
    await requestMagicLink(email.value)
  }
  finally {
    loading.value = false
  }
}
</script>
