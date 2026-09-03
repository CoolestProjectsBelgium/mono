<template>
  <div class="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
    <div class="w-full">
      <h1 class="text-3xl font-bold">Jury voting</h1>
      <p class="mt-2 text-gray-600">
        Sign in to score projects for Coolest Projects Belgium.
      </p>

      <AlertBanner
        v-if="errorMessage"
        variant="error"
        :message="errorMessage"
        class="mt-6"
      />

      <form class="mt-6 space-y-4" @submit.prevent="userLogin">
        <FormField label="Username" field-id="username">
          <template #default="{ inputId, inputClass }">
            <input
              :id="inputId"
              v-model="loginData.username"
              type="text"
              :class="inputClass"
              placeholder="Enter your username"
              autocomplete="username"
              required
            >
          </template>
        </FormField>

        <FormField label="Password" field-id="password">
          <template #default="{ inputId, inputClass }">
            <input
              :id="inputId"
              v-model="loginData.password"
              type="password"
              :class="inputClass"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            >
          </template>
        </FormField>

        <CtaButton variant="primary" type="submit" :disabled="loading" class="w-full justify-center">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </CtaButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { formatLoginError } from '~/utils/login-error'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'fullwidth',
})

const authStore = useAuthStore()
const { login } = useAuth()
const { notify } = useNotification()

const loginData = reactive({
  username: '',
  password: '',
})
const loading = ref(false)
const errorMessage = ref('')

onMounted(() => {
  authStore.clearSession()
  clearCsrfToken()
})

const userLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await login(loginData)
    notify('success', 'You have signed in successfully.')
  }
  catch (error) {
    console.error(error)
    const description = formatLoginError(error)
    errorMessage.value = description
    notify('error', description)
  }
  finally {
    loading.value = false
  }
}
</script>
