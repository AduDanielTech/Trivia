export default defineNuxtConfig({
<<<<<<< HEAD
  // Workaround for Windows setups where creating `.nuxt/dev` can fail.
  // Keeping this out of a dot-directory also plays nicer with some AV/sync tools.
  buildDir: 'nuxt-build',
  compatibilityDate: '2024-11-01',
=======
  compatibilityDate: '2025-01-01',
>>>>>>> 528f624ee02fab2114845861a921f71a194dabf7
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
  ],

<<<<<<< HEAD
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      // Only protect these routes; everything else is public unless gated by app middleware.
      include: ['/dashboard*', '/quiz*', '/upload*', '/leaderboard*'],
      exclude: ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/confirm'],
    },
  },

=======
>>>>>>> 528f624ee02fab2114845861a921f71a194dabf7
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
          href: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Lexend:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
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
