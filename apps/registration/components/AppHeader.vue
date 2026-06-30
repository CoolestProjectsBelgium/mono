<template>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
        <span class="text-xl font-display font-bold text-primary">Coolest Projects</span>
      </NuxtLink>
      <nav class="flex items-center gap-4" aria-label="Main navigation">
        <NuxtLink :to="localePath('/')" class="text-sm hover:text-primary">{{ $t('info') }}</NuxtLink>
        <NuxtLink :to="localePath('/rules')" class="text-sm hover:text-primary">{{ $t('Rules') }}</NuxtLink>
        <template v-if="authStore.isLoggedIn">
          <NuxtLink :to="localePath('/user')" class="text-sm hover:text-primary">{{ $t('User') }}</NuxtLink>
          <NuxtLink :to="localePath('/project')" class="text-sm hover:text-primary">{{ $t('Project') }}</NuxtLink>
          <button type="button" class="text-sm hover:text-primary" @click="onLogout">
            {{ $t('Logout') }}
          </button>
        </template>
        <NuxtLink v-else :to="localePath('/login')" class="text-sm hover:text-primary">{{ $t('Login') }}</NuxtLink>
        <LanguageSwitcher />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const authStore = useAuthStore()
const { logout } = useAuth()

async function onLogout() {
  await logout()
  await navigateTo(localePath('/'))
}
</script>
