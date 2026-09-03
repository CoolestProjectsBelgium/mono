<template>
  <div>
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow"
    >
      Skip to content
    </a>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppNotification />
  </div>
</template>
