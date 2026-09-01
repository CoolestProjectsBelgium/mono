<template>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
    <div class="relative mx-auto max-w-5xl px-4 py-3">
      <div class="relative z-30 flex items-center justify-between gap-3">
        <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center" data-testid="site-logo-link">
          <img
            src="/logo-coolest-projects-belgium.png"
            alt="Coolest Projects Belgium"
            width="189"
            height="141"
            class="h-12 w-auto lg:h-20"
            data-testid="site-logo"
          >
        </NuxtLink>

        <div class="flex items-center gap-2 lg:gap-4" data-testid="header-chrome">
          <nav class="hidden items-center gap-4 lg:flex" aria-label="Main navigation">
            <HeaderNavLinks variant="desktop" />
          </nav>
          <div class="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              class="flex h-11 w-11 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary"
              :aria-label="isOpen ? $t('nav.closeMenu') : $t('nav.openMenu')"
              :aria-expanded="isOpen"
              aria-controls="mobile-nav-panel"
              data-testid="mobile-menu-button"
              @click="toggle"
            >
              <svg
                v-if="!isOpen"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                class="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                class="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <LanguageSwitcher class="hidden lg:flex" />
        </div>
      </div>

      <template v-if="isOpen">
        <button
          type="button"
          class="fixed inset-0 z-20 bg-black/50 lg:hidden"
          :aria-label="$t('nav.closeMenu')"
          data-testid="mobile-nav-backdrop"
          @click="close"
        />
        <nav
          id="mobile-nav-panel"
          class="absolute left-0 right-0 top-full z-30 border-b border-gray-200 bg-white px-4 py-3 shadow-md lg:hidden"
          aria-label="Main navigation"
          data-testid="mobile-nav-panel"
        >
          <div class="flex flex-col gap-1">
            <HeaderNavLinks variant="mobile" :on-navigate="close" />
          </div>
        </nav>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { isOpen, toggle, close } = useHeaderMenu()
</script>
