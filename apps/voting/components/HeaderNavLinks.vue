<template>
  <template v-if="authStore.loggedIn">
    <NuxtLink
      to="/language"
      :class="linkClass('/language')"
      :aria-current="isActive('/language') ? 'page' : undefined"
      @click="onNavigate"
    >
      Project languages
    </NuxtLink>
    <NuxtLink
      to="/"
      :class="linkClass('/')"
      :aria-current="isActive('/') ? 'page' : undefined"
      @click="onNavigate"
    >
      Vote
    </NuxtLink>
    <span class="hidden text-sm text-gray-500 sm:inline" data-testid="user-email">
      {{ authStore.user?.email || 'Jury member' }}
    </span>
    <button
      type="button"
      :class="logoutClass"
      data-testid="logout-button"
      @click="onLogout"
    >
      Log out
    </button>
  </template>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant: 'desktop' | 'mobile'
  onNavigate?: () => void
}>()

const route = useRoute()
const authStore = useAuthStore()
const { logout } = useAuth()

function isActive(itemPath: string): boolean {
  if (itemPath === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(itemPath)
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

function onNavigate() {
  props.onNavigate?.()
}

async function onLogout() {
  onNavigate()
  await logout()
  await navigateTo('/login')
}
</script>
