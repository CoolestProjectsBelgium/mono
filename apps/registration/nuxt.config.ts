// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  experimental: {
    // Required for ssr:false dev server on Nuxt 3.21.7+ (rollupOptions.input regression).
    viteEnvironmentApi: true,
  },
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/_api',
    },
  },
  i18n: {
    restructureDir: false,
    locales: [
      { code: 'nl', language: 'nl-BE', name: 'Nederlands' },
      { code: 'fr', language: 'fr-BE', name: 'Français' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    defaultLocale: 'nl',
    strategy: 'prefix_except_default',
    vueI18n: './i18n.config.ts',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  vite: {
    server: {
      allowedHosts: ['registration.coolestprojects.localhost'],
      hmr: {
        protocol: 'wss',
        host: 'registration.coolestprojects.localhost',
        clientPort: 8443,
      },
    },
  },
})
