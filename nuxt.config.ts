// nuxt.config.ts
export default defineNuxtConfig({
  // 1. Register Modules (Crucial for Pinia to work)
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],

  // 2. Global CSS
  css: ['~/assets/css/main.css'],

  // 3. Runtime Config (Connects to your FastAPI)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000'
    }
  },

  // 4. Color Mode Config (Matches your Scholar UI)
  colorMode: {
    classSuffix: ''
  },

  // 5. Tailwind Config
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  devtools: { enabled: true },
  compatibilityDate: '2024-04-03'
})