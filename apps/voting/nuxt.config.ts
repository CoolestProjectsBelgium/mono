// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: false, // SPA mode for voting application
  experimental: {
    // Required for ssr:false dev server on Nuxt 3.21.7+ (rollupOptions.input regression).
    viteEnvironmentApi: true,
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt'
  ],

  app: {
    head: {
      title: 'Coolest Projects Belgium - Voting',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Voting application for Coolest Projects Belgium' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    }
  },

  typescript: {
    strict: true,
    shim: false
  },

  colorMode: {
    preference: 'dark'
  }
})
