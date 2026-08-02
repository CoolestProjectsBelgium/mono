<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-bold">{{ $t('titleLogin') }}</h1>
    <ApiUnavailableBanner
      v-if="activationError"
      :message-key="activationError === 'unavailable' ? 'apiUnavailable.default' : 'login.linkExpired'"
      class="mt-4"
    />
    <p v-if="activating" class="mt-6 text-gray-600">{{ $t('pleaseWait') }}</p>
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
import type { ActivateLoginResult } from '~/composables/useAuth'

definePageMeta({ middleware: 'not-authenticated' })

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()
const { requestMagicLink, activateWithToken } = useAuth()

const email = ref('')
const loading = ref(false)
const activating = ref(false)
const activationError = ref<Exclude<ActivateLoginResult, 'ok'> | null>(null)

async function activateFromQuery(token: string | undefined) {
  if (!token || activating.value) return

  authStore.clearSession()
  activating.value = true
  activationError.value = null
  try {
    const result = await activateWithToken(token)
    if (result === 'ok') {
      await router.replace(localePath('/user'))
      return
    }
    activationError.value = result
    await router.replace(localePath('/login'))
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
