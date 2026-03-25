export default defineNuxtConfig({
  // Workaround for Windows setups where creating `.nuxt/dev` can fail.
  // Keeping this out of a dot-directory also plays nicer with some AV/sync tools.
  buildDir: 'nuxt-build',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
  ],

  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      // Only protect these routes; everything else is public unless gated by app middleware.
      include: ['/dashboard*', '/quiz*', '/upload*', '/leaderboard*'],
      exclude: ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/confirm'],
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

  // main.css still loads: it holds CSS custom properties (design tokens)
  // that Tailwind classes reference via var(--...) in components
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'TRIVIA — Exam Prep for Nigerian Students',
      meta: [
        { name: 'description', content: 'Gamified exam preparation for JAMB, WAEC and University students in Nigeria.' },
        { name: 'theme-color', content: '#0D0F14' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Lexend:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      appName: 'TRIVIA',
    },
  },
})
