<template>
  <div class="relative min-h-screen bg-slate-950 text-gray-100 flex items-center justify-center p-4 overflow-hidden">
    <!-- Rich ambient background glowing blobs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-10 animate-pulse"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10 animate-pulse"></div>

    <div class="w-full max-w-md z-10">
      <UCard
        class="border border-gray-800 bg-slate-900/40 backdrop-blur shadow-2xl transition-all duration-300 hover:border-gray-700/80"
      >
        <template #header>
          <div class="text-center">
            <div class="mx-auto h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 border border-primary-500/20">
              <UIcon name="i-heroicons-lock-closed" class="h-6 w-6 text-primary-400" />
            </div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">
              Sign In
            </h1>
            <p class="text-sm text-gray-400 mt-2">
              Coolest Projects Belgium — Jury Portal
            </p>
          </div>
        </template>

        <form class="space-y-6" @submit.prevent="userLogin">
          <!-- Username Group -->
          <UFormGroup label="Username" size="lg" name="username" class="text-gray-300">
            <UInput
              v-model="loginData.username"
              type="text"
              placeholder="Enter your username"
              icon="i-heroicons-user"
              color="gray"
              class="w-full"
              required
            />
          </UFormGroup>

          <!-- Password Group -->
          <UFormGroup label="Password" size="lg" name="password" class="text-gray-300">
            <UInput
              v-model="loginData.password"
              type="password"
              placeholder="Enter your password"
              icon="i-heroicons-key-value"
              color="gray"
              class="w-full"
              required
            />
          </UFormGroup>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="loading"
            class="font-bold tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            Authenticate
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  layout: false // If using layouts
})

const { login } = useAuth()
const toast = useToast()

const loginData = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

const userLogin = async () => {
  loading.value = true
  try {
    await login(loginData)
    toast.add({
      title: 'Welcome Back!',
      description: 'You have logged in successfully.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
      timeout: 3000
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Authentication Failed',
      description: 'Please check your credentials and try again.',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    loading.value = false
  }
}
</script>
