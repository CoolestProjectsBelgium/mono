<template>
  <header class="sticky top-0 z-50 w-full border-b border-gray-800 bg-slate-900/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Left side: Brand/Logo and quick actions -->
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400 text-xl tracking-wider">
          <UIcon name="i-heroicons-check-badge-solid" class="h-6 w-6 text-primary-400 animate-pulse" />
          CP-VOTE
        </NuxtLink>
        <UButton
          to="/language"
          icon="i-heroicons-language"
          size="sm"
          color="gray"
          variant="ghost"
          class="hidden sm:inline-flex hover:bg-slate-800 text-gray-300"
        >
          Change Languages
        </UButton>
      </div>

      <!-- Right side: User information & actions -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3 border-r border-gray-800 pr-4">
          <div class="hidden md:block text-right">
            <p class="text-xs text-gray-500 font-medium">Logged in as</p>
            <p class="text-sm text-gray-200 font-semibold">{{ user?.name || 'Jury Member' }}</p>
          </div>
          <UAvatar
            :alt="user?.name || 'Jury'"
            size="sm"
            class="bg-gradient-to-r from-primary-500 to-indigo-500 text-white"
          />
        </div>

        <UButton
          to="/language"
          icon="i-heroicons-language"
          size="sm"
          color="gray"
          variant="ghost"
          class="sm:hidden text-gray-300 hover:bg-slate-800"
        />

        <UButton
          icon="i-heroicons-arrow-left-on-rectangle"
          size="sm"
          color="red"
          variant="soft"
          class="hover:scale-105 transition-transform"
          @click="logout"
        >
          Logout
        </UButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
</script>
