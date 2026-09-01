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
      apiBaseURL:
        process.env.NUXT_PUBLIC_API_BASE_URL
        || 'https://api.coolestprojects.localhost:8443',
    },
  },

  typescript: {
    strict: true,
    shim: false
  },

  colorMode: {
    preference: 'dark',
  },

  routeRules: {
    '/csrf-token': { proxy: 'http://127.0.0.1:3001/csrf-token' },
    '/auth/**': { proxy: 'http://127.0.0.1:3001/auth/**' },
    '/languages': { proxy: 'http://127.0.0.1:3001/languages' },
    '/projects/**': { proxy: 'http://127.0.0.1:3001/projects/**' },
  },

  vite: {
    server: {
      allowedHosts: ['voting.coolestprojects.localhost'],
      hmr: {
        protocol: 'wss',
        host: 'voting.coolestprojects.localhost',
        clientPort: 8443,
      },
    },
  },
})
