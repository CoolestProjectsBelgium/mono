<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main id="main-content" class="flex-1">
      <div class="mx-auto max-w-5xl px-4 py-8">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
