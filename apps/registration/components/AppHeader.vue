<template>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
      <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center" data-testid="site-logo-link">
        <img
          src="/logo-coolest-projects-belgium.png"
          alt="Coolest Projects Belgium"
          width="189"
          height="141"
          class="h-20 w-auto"
          data-testid="site-logo"
        >
      </NuxtLink>
      <nav class="flex items-center gap-4" aria-label="Main navigation">
        <NuxtLink
          :to="localePath('/')"
          :class="navLinkClass('/')"
          :aria-current="isActive('/') ? 'page' : undefined"
        >
          {{ $t('info') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/rules')"
          :class="navLinkClass('/rules')"
          :aria-current="isActive('/rules') ? 'page' : undefined"
        >
          {{ $t('Rules') }}
        </NuxtLink>
        <template v-if="authStore.isLoggedIn">
          <NuxtLink
            :to="localePath('/user')"
            :class="navLinkClass('/user')"
            :aria-current="isActive('/user') ? 'page' : undefined"
          >
            {{ $t('User') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/project')"
            :class="navLinkClass('/project')"
            :aria-current="isActive('/project') ? 'page' : undefined"
          >
            {{ $t('Project') }}
          </NuxtLink>
          <button type="button" class="text-sm text-gray-600 hover:text-primary" @click="onLogout">
            {{ $t('Logout') }}
          </button>
        </template>
        <NuxtLink
          v-else
          :to="localePath('/login')"
          :class="navLinkClass('/login')"
          :aria-current="isActive('/login') ? 'page' : undefined"
        >
          {{ $t('Login') }}
        </NuxtLink>
        <LanguageSwitcher />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { isHeaderNavActive } from '~/utils/header-nav'

const localePath = useLocalePath()
const route = useRoute()
const authStore = useAuthStore()
const { logout } = useAuth()

function isActive(itemPath: string): boolean {
  return isHeaderNavActive(route.path, itemPath)
}

function navLinkClass(itemPath: string): string {
  return isActive(itemPath)
    ? 'text-sm font-semibold text-primary'
    : 'text-sm text-gray-600 hover:text-primary'
}

async function onLogout() {
  await logout()
  await navigateTo(localePath('/'))
}
</script>
