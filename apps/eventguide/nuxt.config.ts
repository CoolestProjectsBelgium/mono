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
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Coolest Projects Belgium - Event Guide',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Browse projects and find your table at Coolest Projects Belgium' },
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
    '/eventguide/**': { proxy: 'http://127.0.0.1:3001/eventguide/**' },
  },

  vite: {
    server: {
      allowedHosts: ['eventguide.coolestprojects.localhost'],
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
        interval: Number(process.env.CHOKIDAR_INTERVAL || 1000),
      },
      hmr: {
        protocol: 'wss',
        host: 'eventguide.coolestprojects.localhost',
        clientPort: 8443,
      },
    },
  },
})
