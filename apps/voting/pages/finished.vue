<template>
  <div class="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
    <NavBar />
    <main class="flex-grow flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <UCard
          class="border border-gray-800 bg-slate-900/40 backdrop-blur shadow-2xl transition-all duration-300 hover:border-gray-700/80 text-center py-6"
        >
          <div class="flex flex-col items-center">
            <!-- Trophy Animation / Icon -->
            <div class="h-20 w-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 animate-bounce">
              <UIcon name="i-heroicons-trophy-solid" class="h-10 w-10 text-yellow-400" />
            </div>

            <h1 class="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Congratulations!
            </h1>
            <p class="text-lg text-primary-400 font-medium mt-2">
              You voted on all projects!
            </p>

            <p class="text-sm text-gray-400 mt-6 max-w-sm mx-auto leading-relaxed">
              Outstanding effort. You've successfully reviewed every project in your current selection.
            </p>

            <div class="mt-8 p-4 rounded-xl border border-gray-800 bg-slate-950/40 max-w-sm mx-auto">
              <p class="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">
                Help needed!
              </p>
              <p class="text-xs text-gray-300">
                You can select other languages to help review and vote on other jury projects.
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col gap-3 max-w-sm mx-auto">
              <UButton
                to="/language"
                color="primary"
                size="lg"
                icon="i-heroicons-language"
                class="font-bold justify-center hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                Change Languages
              </UButton>
              <UButton
                to="/"
                color="gray"
                variant="ghost"
                size="md"
                icon="i-heroicons-home"
                class="font-semibold justify-center"
              >
                Home
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Page does not require complex logic, but standard imports are self-contained
</script>
