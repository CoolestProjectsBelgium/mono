import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00AEA9',
          dark: '#008f8b',
          light: '#33bfb9',
        },
        hero: {
          DEFAULT: '#f5f7fa',
          dark: '#e8ecf1',
        },
        cta: {
          DEFAULT: '#1a1a2e',
          hover: '#2d2d44',
        },
      },
      fontFamily: {
        display: ['"League Spartan"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
