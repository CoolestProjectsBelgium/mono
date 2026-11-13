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
  app: {
    head: {
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
      apiBase:
        process.env.API_BASE_URL
        || 'https://api.coolestprojects.localhost:8443',
    },
  },
  i18n: {
    restructureDir: false,
    bundle: {
      // No `v-t` directives are used; the module recommends disabling this
      // (deprecated in v10) and warns on every start until it is set explicitly.
      optimizeTranslationDirective: false,
    },
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
  components: [
    {
      path: '~/components',
      ignore: ['**/*.spec.ts'],
    },
  ],
  postcss: {
    plugins: {
      // @nuxtjs/tailwindcss adds Tailwind 3's nesting plugin, which Nuxt 4
      // cannot load (NUXT_B7027). No stylesheet here uses CSS nesting.
      'tailwindcss/nesting': false,
    },
  },
  vite: {
    server: {
      allowedHosts: ['registration.coolestprojects.localhost'],
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
        interval: Number(process.env.CHOKIDAR_INTERVAL || 1000),
      },
      // Vite 8 moved these from `server.hmr` to `server.ws`.
      ws: {
        protocol: 'wss',
        host: 'registration.coolestprojects.localhost',
        clientPort: 8443,
      },
    },
  },
})
