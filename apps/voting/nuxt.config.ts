// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: false,
  experimental: {
    viteEnvironmentApi: true,
  },
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Coolest Projects Belgium - Jury Voting',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Jury voting application for Coolest Projects Belgium' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
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
    shim: false,
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  components: [
    {
      path: '~/components',
      ignore: ['**/*.spec.ts'],
    },
  ],

  routeRules: {
    '/csrf-token': { proxy: 'http://127.0.0.1:3001/csrf-token' },
    '/auth/**': { proxy: 'http://127.0.0.1:3001/auth/**' },
    '/languages': { proxy: 'http://127.0.0.1:3001/languages' },
    '/projects': { proxy: 'http://127.0.0.1:3001/projects' },
    '/projects/**': { proxy: 'http://127.0.0.1:3001/projects/**' },
    '/sse': { proxy: 'http://127.0.0.1:3001/sse' },
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
