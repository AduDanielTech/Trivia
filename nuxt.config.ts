export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback:   'dark',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'TRIVIA — Exam Prep for Nigerian Students',
      meta: [
        { name: 'description', content: 'Gamified exam preparation for JAMB, WAEC and University students in Nigeria.' },
        { name: 'theme-color', content: '#0D0F14' },
        { name: 'viewport',    content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      appName: 'TRIVIA',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },

  // Auto-import stores so components don't need explicit imports
  imports: {
    dirs: ['stores'],
  },
})
