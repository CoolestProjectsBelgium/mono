<template>
  <NuxtLink
    :to="localePath('/')"
    :class="linkClass('/')"
    :aria-current="isActive('/') ? 'page' : undefined"
    @click="onLinkClick"
  >
    {{ $t('info') }}
  </NuxtLink>
  <NuxtLink
    :to="localePath('/rules')"
    :class="linkClass('/rules')"
    :aria-current="isActive('/rules') ? 'page' : undefined"
    @click="onLinkClick"
  >
    {{ $t('Rules') }}
  </NuxtLink>
  <template v-if="authStore.isLoggedIn">
    <NuxtLink
      :to="localePath('/user')"
      :class="linkClass('/user')"
      :aria-current="isActive('/user') ? 'page' : undefined"
      @click="onLinkClick"
    >
      {{ $t('User') }}
    </NuxtLink>
    <NuxtLink
      :to="localePath('/project')"
      :class="linkClass('/project')"
      :aria-current="isActive('/project') ? 'page' : undefined"
      @click="onLinkClick"
    >
      {{ $t('Project') }}
    </NuxtLink>
    <button
      type="button"
      :class="logoutClass"
      @click="onLogoutClick"
    >
      {{ $t('Logout') }}
    </button>
  </template>
  <NuxtLink
    v-else
    :to="localePath('/login')"
    :class="linkClass('/login')"
    :aria-current="isActive('/login') ? 'page' : undefined"
    @click="onLinkClick"
  >
    {{ $t('Login') }}
  </NuxtLink>
</template>

<script setup lang="ts">
import { isHeaderNavActive } from '~/utils/header-nav'

const props = defineProps<{
  variant: 'desktop' | 'mobile'
  onNavigate?: () => void
}>()

const localePath = useLocalePath()
const route = useRoute()
const authStore = useAuthStore()
const { logout } = useAuth()

function isActive(itemPath: string): boolean {
  return isHeaderNavActive(route.path, itemPath)
}

function linkClass(itemPath: string): string {
  const active = isActive(itemPath)
  if (props.variant === 'mobile') {
    return active
      ? 'block rounded-md px-3 py-2 text-base font-semibold text-primary'
      : 'block rounded-md px-3 py-2 text-base text-gray-700 hover:bg-gray-50 hover:text-primary'
  }
  return active
    ? 'text-sm font-semibold text-primary'
    : 'text-sm text-gray-600 hover:text-primary'
}

const logoutClass = computed(() => {
  if (props.variant === 'mobile') {
    return 'block w-full rounded-md px-3 py-2 text-left text-base text-gray-700 hover:bg-gray-50 hover:text-primary'
  }
  return 'text-sm text-gray-600 hover:text-primary'
})

function onLinkClick() {
  props.onNavigate?.()
}

async function onLogoutClick() {
  props.onNavigate?.()
  await logout()
  await navigateTo(localePath('/'))
}
</script>
