<template>
  <div class="min-h-screen bg-paper-50 text-paper-800 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <!-- Accessibility: Skip Link -->
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-paper-900 focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-scholar-600/30">
      Skip to main content
    </a>

    <!-- Navigation -->
    <header class="sticky top-0 z-40 border-b border-paper-200/80 bg-paper-50/80 backdrop-blur dark:border-white/10 dark:bg-ink-900/70">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <NuxtLink to="/" class="group inline-flex items-baseline gap-2 font-display font-extrabold tracking-tight">
          <span class="text-scholar-700 dark:text-scholar-100" aria-hidden="true">⬡</span>
          <span class="text-xl">MASTERY</span>
          <span class="hidden text-[10px] font-black uppercase tracking-[0.18em] text-sage sm:inline">Academy</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-xs font-black uppercase tracking-widest text-sage dark:text-paper-400 md:flex">
          <a class="hover:text-scholar-600 transition-colors" href="#features">Features</a>
          <a class="hover:text-scholar-600 transition-colors" href="#how">How it works</a>
          <a class="hover:text-scholar-600 transition-colors" href="#results">Results</a>
        </nav>

        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-paper-200 bg-white text-lg shadow-sm transition hover:bg-paper-50 dark:border-white/10 dark:bg-white/5"
            :aria-label="`Switch to ${currentColorMode === 'dark' ? 'light' : 'dark'} mode`"
          >
            {{ currentColorMode === 'dark' ? '☀️' : '🌙' }}
          </button>

          <!-- Auth States -->
          <template v-if="authStore.isAuthenticated">
            <NuxtLink to="/dashboard" class="inline-flex h-10 items-center justify-center rounded-xl bg-scholar-600 px-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-scholar-600/20 hover:bg-scholar-700 transition-all">
              Dashboard
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="hidden text-xs font-black uppercase tracking-widest text-sage hover:text-scholar-600 sm:block">
              Sign In
            </NuxtLink>
            <NuxtLink to="/auth/signup" class="inline-flex h-10 items-center justify-center rounded-xl bg-scholar-600 px-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-scholar-600/20 hover:bg-scholar-700 transition-all">
              Join Now
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main id="main">
      <!-- HERO SECTION -->
      <section class="mx-auto w-full max-w-6xl px-5 py-12 md:py-24">
        <div class="relative overflow-hidden rounded-[3rem] border border-paper-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-16">
          <div class="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-scholar-600/10 blur-3xl" aria-hidden="true"></div>
          
          <div class="relative z-10 grid gap-12 lg:grid-cols-12">
            <div class="lg:col-span-7">
              <span class="inline-flex items-center gap-2 rounded-full bg-scholar-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-scholar-700 dark:bg-scholar-900/30 dark:text-scholar-100">
                <span class="h-2 w-2 animate-pulse rounded-full bg-scholar-600"></span>
                The Future of Exam Prep
              </span>
              
              <h1 class="mt-6 font-display text-5xl font-black tracking-tight text-paper-900 dark:text-white md:text-7xl">
                Master your exams in 
                <span class="text-scholar-600">5 minutes</span> 
                a day.
              </h1>
              
              <p class="mt-6 max-w-lg text-lg font-medium leading-relaxed text-sage dark:text-paper-300">
                AI-powered trivia and practice sessions designed to find your weak spots and fix them before exam day. No clutter, just mastery.
              </p>

              <div class="mt-10 flex flex-col gap-4 sm:flex-row">
                <button @click="handleStart" class="inline-flex h-14 items-center justify-center rounded-2xl bg-scholar-600 px-8 font-display text-lg font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 hover:scale-[1.02]">
                  Begin Journey
                </button>
                <button @click="handleDemo" class="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-paper-100 bg-white px-8 font-display text-lg font-black text-paper-900 transition-all hover:bg-paper-50 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  Try Demo Session
                </button>
              </div>

              <!-- Quick Perks -->
              <div class="mt-12 grid grid-cols-3 gap-6 border-t border-paper-100 pt-8 dark:border-white/10">
                <div>
                  <p class="font-display text-xl font-black">5-Min</p>
                  <p class="text-[10px] font-black uppercase tracking-widest text-sage">Rapid Drill</p>
                </div>
                <div>
                  <p class="font-display text-xl font-black">Adaptive</p>
                  <p class="text-[10px] font-black uppercase tracking-widest text-sage">AI Questions</p>
                </div>
                <div>
                  <p class="font-display text-xl font-black">Global</p>
                  <p class="text-[10px] font-black uppercase tracking-widest text-sage">Rankings</p>
                </div>
              </div>
            </div>

            <!-- Visual Preview -->
            <div class="hidden items-center justify-center lg:flex lg:col-span-5">
              <div class="w-full rounded-[2.5rem] border border-paper-200 bg-paper-50 p-6 shadow-2xl dark:border-white/10 dark:bg-ink-800/50">
                 <div class="flex items-center justify-between mb-8">
                    <div class="h-3 w-24 rounded-full bg-paper-200 dark:bg-white/10"></div>
                    <div class="h-3 w-12 rounded-full bg-scholar-600"></div>
                 </div>
                 <div class="space-y-4">
                    <div v-for="i in 3" :key="i" class="h-12 w-full rounded-2xl bg-white dark:bg-white/5 border border-paper-100 dark:border-white/10"></div>
                 </div>
                 <div class="mt-8 h-2 w-full rounded-full bg-paper-200 dark:bg-white/10">
                    <div class="h-full w-2/3 rounded-full bg-scholar-600"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Identity Choice Modal/Section -->
      <Transition name="slide-down">
        <section v-if="showIdentity" class="mx-auto max-w-4xl px-5 mb-12">
          <div class="rounded-[2.5rem] bg-paper-900 p-10 text-white shadow-2xl">
            <h2 class="font-display text-3xl font-black">How would you like to start?</h2>
            <div class="mt-8 grid gap-4 md:grid-cols-2">
              <button @click="handleGuest" class="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white/10">
                <span class="text-4xl">👤</span>
                <div>
                  <p class="font-bold">Guest Entry</p>
                  <p class="text-xs text-paper-400">Play instantly. No progress saved.</p>
                </div>
              </button>
              <NuxtLink to="/auth/signup" class="flex items-center gap-5 rounded-2xl bg-scholar-600 p-6 text-left transition hover:bg-scholar-700">
                <span class="text-4xl">⭐</span>
                <div>
                  <p class="font-bold text-white">Full Enrollment</p>
                  <p class="text-xs text-scholar-100">Sync scores, ranks, and streaks.</p>
                </div>
              </NuxtLink>
            </div>
            <button @click="showIdentity = false" class="mt-6 text-xs font-black uppercase tracking-widest text-paper-400 hover:text-white">Cancel</button>
          </div>
        </section>
      </Transition>

      <!-- FEATURES -->
      <section id="features" class="mx-auto max-w-6xl px-5 py-24 space-y-16">
        <div class="text-center space-y-4">
          <h2 class="font-display text-4xl font-black">Built for Academic Rigor</h2>
          <p class="text-lg text-sage font-medium">Tools designed for real focus, not just distraction.</p>
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="feat in features" :key="feat.title" class="p-8 rounded-[2rem] border border-paper-100 bg-white dark:bg-white/5 dark:border-white/10">
            <div class="text-3xl mb-4">{{ feat.icon }}</div>
            <h3 class="font-display text-lg font-black mb-2">{{ feat.title }}</h3>
            <p class="text-sm font-medium text-sage leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

definePageMeta({ layout: false })
useHead({ title: 'MASTERY — 5-Minute AI Exam Practice' })

const authStore = useAuthStore()
const colorMode = useColorMode()
const currentColorMode = computed(() => colorMode.value ?? 'light')

const router = useRouter()

const showIdentity = ref(false)

const toggleTheme = () => {
  colorMode.preference = currentColorMode.value === 'dark' ? 'light' : 'dark'
}

const handleStart = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    showIdentity.value = true
  }
}

const handleDemo = () => {
  router.push('/quiz?demo=true')
}

const handleGuest = () => {
  router.push('/quiz')
}

const features = [
  { icon: '🔥', title: 'Daily Streaks', desc: 'Build the habit of daily learning with visual commitment cues.' },
  { icon: '⚠️', title: 'Weak Spot AI', desc: 'Automatically detects topics where you struggle and adapts your sessions.' },
  { icon: '🔊', title: 'Audio Mode', desc: 'Listen to questions and explanations for hands-free studying.' },
  { icon: '🏆', title: 'Global Hall', desc: 'Compete for the top spot in your field with healthy social pressure.' }
]
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
}
</style>