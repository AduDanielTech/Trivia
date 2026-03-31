<template>
  <div class="min-h-screen bg-paper-50 text-paper-800 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-paper-900 focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-scholar-600/30"
    >
      Skip to main content
    </a>

    <header class="sticky top-0 z-40 border-b border-paper-200/80 bg-paper-50/80 backdrop-blur dark:border-white/10 dark:bg-ink-900/70">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <NuxtLink to="/" class="group inline-flex items-baseline gap-2 font-display font-extrabold tracking-tight">
          <span class="text-scholar-700 dark:text-scholar-100" aria-hidden="true">⬡</span>
          <span>TRIVIA</span>
          <span class="hidden text-xs font-black uppercase tracking-[0.18em] text-sage sm:inline">Academy</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-sm font-semibold text-paper-800/80 dark:text-paper-50/80 md:flex" aria-label="Landing navigation">
          <a class="hover:text-paper-900 focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:hover:text-white" href="#features">Features</a>
          <a class="hover:text-paper-900 focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:hover:text-white" href="#how">How it works</a>
          <a class="hover:text-paper-900 focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:hover:text-white" href="#results">Results</a>
        </nav>

        <div class="flex items-center gap-2">
          <button
            class="inline-flex h-10 items-center justify-center rounded-xl border border-paper-200 bg-white px-3 text-sm font-semibold text-paper-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5 dark:text-paper-50"
            type="button"
            :aria-label="`Switch to ${currentColorMode === 'dark' ? 'light' : 'dark'} mode`"
            @click="toggleTheme"
          >
            <span v-if="currentColorMode === 'dark'" aria-hidden="true">☀️</span>
            <span v-else aria-hidden="true">🌙</span>
          </button>

          <NuxtLink
            v-if="isAuthed"
            to="/dashboard"
            class="inline-flex h-10 items-center justify-center rounded-xl border border-paper-200 bg-white px-4 text-sm font-semibold text-paper-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5 dark:text-paper-50"
          >
            Dashboard
          </NuxtLink>

          <template v-else>
            <NuxtLink
              to="/auth/login"
              class="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold text-paper-900/80 transition hover:text-paper-900 focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:text-paper-50/80 dark:hover:text-white"
            >
              Sign in
            </NuxtLink>
            <NuxtLink
              to="/auth/signup"
              class="inline-flex h-10 items-center justify-center rounded-xl bg-scholar-600 px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-scholar-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/30"
            >
              Get started
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main id="main" class="mx-auto w-full max-w-6xl px-5 pb-24 pt-10">
      <section class="relative overflow-hidden rounded-2xl border border-paper-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-10" aria-labelledby="hero-title">
        <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-scholar-600/15 blur-3xl dark:bg-scholar-600/20" aria-hidden="true" />
        <div class="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl dark:bg-gold-500/20" aria-hidden="true" />

        <div class="grid items-center gap-10 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <p class="inline-flex items-center gap-2 rounded-full border border-paper-200 bg-paper-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-paper-800 dark:border-white/10 dark:bg-white/5 dark:text-paper-50">
              <span class="h-2 w-2 rounded-full bg-scholar-600" aria-hidden="true" />
              Built for daily exam practice
            </p>

            <h1 id="hero-title" class="mt-5 font-display text-4xl font-extrabold tracking-tight text-paper-900 dark:text-white sm:text-5xl">
              Pass your exams with <span class="bg-gradient-to-r from-scholar-600 to-gold-500 bg-clip-text text-transparent">5-minute</span> AI practice.
            </h1>

            <p class="mt-4 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Choose a subject, practice in short bursts, and see exactly what to fix next—without heavy pages.
            </p>

            <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-scholar-600 px-6 text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-scholar-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/30"
                @click="handlePrimaryCta"
                :aria-expanded="showIdentity"
              >
                <span aria-hidden="true">▶</span>
                Start Practicing
              </button>

              <button
                type="button"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-paper-200 bg-white px-6 text-base font-extrabold text-paper-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5 dark:text-paper-50"
                @click="scrollToId('features')"
              >
                <span aria-hidden="true">✨</span>
                See Features
              </button>
            </div>

            <div class="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-paper-200 bg-paper-50 p-4 dark:border-white/10 dark:bg-white/5" aria-label="Quick highlights">
              <div class="text-center">
                <div class="text-lg font-extrabold text-paper-900 dark:text-white">5-min</div>
                <div class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-sage">Sessions</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-extrabold text-paper-900 dark:text-white">Weak areas</div>
                <div class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-sage">Auto-detected</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-extrabold text-paper-900 dark:text-white">Streaks</div>
                <div class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-sage">+ Ranks</div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5">
            <div class="rounded-2xl border border-paper-200 bg-paper-50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div class="flex items-center justify-between">
                <span class="rounded-full bg-scholar-600/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-scholar-800 dark:text-scholar-100">Pre-session lobby</span>
                <span class="text-xs font-bold text-paper-800/70 dark:text-paper-50/70">⏱ 5 / 10</span>
              </div>
              <div class="mt-4 rounded-2xl border border-paper-200 bg-white p-4 dark:border-white/10 dark:bg-ink-800/30">
                <div class="text-sm font-extrabold text-paper-900 dark:text-white">Weak area detected</div>
                <div class="mt-1 text-sm font-semibold text-paper-800/70 dark:text-paper-50/70">Mathematics · Algebra</div>
                <div class="mt-3 h-2 w-full rounded-full bg-paper-200 dark:bg-white/10">
                  <div class="h-2 w-2/3 rounded-full bg-gradient-to-r from-gold-500 to-scholar-600" aria-hidden="true" />
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="rounded-2xl border border-paper-200 bg-white px-3 py-2 text-xs font-bold text-paper-900 dark:border-white/10 dark:bg-white/5 dark:text-paper-50">📄 Document → Quiz</span>
                <span class="rounded-2xl border border-paper-200 bg-white px-3 py-2 text-xs font-bold text-paper-900 dark:border-white/10 dark:bg-white/5 dark:text-paper-50">🔊 Audio mode</span>
                <span class="rounded-2xl border border-paper-200 bg-white px-3 py-2 text-xs font-bold text-paper-900 dark:border-white/10 dark:bg-white/5 dark:text-paper-50">🏆 Rank climb</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Transition name="slide-down">
        <section
          v-if="showIdentity"
          class="mt-6 rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
          aria-label="Choose how to continue"
        >
          <h2 class="font-display text-2xl font-extrabold tracking-tight text-paper-900 dark:text-white">Continue to the Academy</h2>
          <p class="mt-2 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
            Sign in to practice, track streaks, and see your progress.
          </p>

          <div class="mt-5 grid gap-3 md:grid-cols-2">
            <NuxtLink
              to="/auth/login"
              class="group rounded-2xl border border-paper-200 bg-paper-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl" aria-hidden="true">👤</span>
                <div>
                  <div class="text-base font-extrabold text-paper-900 dark:text-white">Sign in</div>
                  <div class="mt-1 text-sm font-semibold text-paper-800/70 dark:text-paper-50/70">Continue to your dashboard.</div>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/auth/signup"
              class="group rounded-2xl border border-scholar-600/25 bg-scholar-600 p-5 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-scholar-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/30"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl" aria-hidden="true">⭐</span>
                <div>
                  <div class="text-base font-extrabold">Create free account</div>
                  <div class="mt-1 text-sm font-semibold text-white/85">Sync progress, streaks, and ranks.</div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <button
            class="mt-4 text-sm font-bold text-paper-800/70 underline decoration-paper-200 underline-offset-4 hover:text-paper-900 focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:text-paper-50/70 dark:decoration-white/10 dark:hover:text-white"
            type="button"
            @click="showIdentity = false"
          >
            Close
          </button>
        </section>
      </Transition>

      <section id="features" class="mt-14" aria-labelledby="features-title">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="features-title" class="font-display text-3xl font-extrabold tracking-tight text-paper-900 dark:text-white">Features students actually use daily</h2>
            <p class="mt-2 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Built for onboarding, daily practice, weak-area fixes, progress tracking, and healthy competition.
            </p>
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">🔥</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">Daily streaks</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Build the habit and stay consistent.</p>
          </div>

          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">⚠️</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">Weak area detection</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">See what to practice next in one glance.</p>
          </div>

          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">🧠</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">Clear explanations</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Turn mistakes into learning, fast.</p>
          </div>

          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">🏆</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">Leaderboards</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Compete and climb ranks.</p>
          </div>
        </div>
      </section>

      <section id="how" class="mt-14" aria-labelledby="how-title">
        <h2 id="how-title" class="font-display text-3xl font-extrabold tracking-tight text-paper-900 dark:text-white">How it works</h2>
        <p class="mt-2 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
          A simple loop: pick a subject, practice, review, and repeat.
        </p>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Step 1</div>
            <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Pick a subject</div>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Switch anytime without losing momentum.</p>
          </div>
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Step 2</div>
            <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Practice quickly</div>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">5–10 questions per session, designed to fit busy days.</p>
          </div>
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Step 3</div>
            <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Review explanations</div>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Understand the “why”, not just right/wrong.</p>
          </div>
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Step 4</div>
            <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Track progress</div>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">See streaks, ranks, and weak areas improve.</p>
          </div>
        </div>
      </section>

      <section id="results" class="mt-14" aria-labelledby="results-title">
        <h2 id="results-title" class="font-display text-3xl font-extrabold tracking-tight text-paper-900 dark:text-white">Designed for outcomes</h2>
        <p class="mt-2 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
          You get fast feedback, clear next steps, and a system that rewards consistency.
        </p>

        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Clarity</div>
            <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Know what to fix</div>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Weak areas show up automatically after sessions.</p>
          </div>
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Momentum</div>
            <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Streaks that stick</div>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Short sessions reduce friction—especially on busy days.</p>
          </div>
          <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Motivation</div>
            <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Healthy competition</div>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">Leaderboards add fun pressure to keep improving.</p>
          </div>
        </div>
      </section>

      <section class="mt-14" aria-labelledby="final-cta-title">
        <div class="rounded-2xl bg-scholar-600 p-8 text-white shadow-sm sm:p-10">
          <h2 id="final-cta-title" class="font-display text-3xl font-extrabold tracking-tight">Start your streak today.</h2>
          <p class="mt-3 max-w-prose text-base font-semibold leading-relaxed text-white/85">
            One short session now is better than waiting. Build the habit and watch your weak areas disappear.
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-extrabold text-scholar-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-white/40"
              @click="handlePrimaryCta"
            >
              <span aria-hidden="true">▶</span>
              Start Practicing
            </button>
            <NuxtLink
              v-if="!isAuthed"
              to="/auth/signup"
              class="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-base font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Create free account
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

definePageMeta({ layout: false })
useHead({ title: 'TRIVIA — 5-minute AI exam practice' })

const authStore = useAuthStore()
const colorMode = useColorMode()
const router = useRouter()

const isAuthed = computed(() => authStore.isAuthenticated)
const showIdentity = ref(false)

// SSR-safe: colorMode.value is undefined on the server
const currentColorMode = computed(() => colorMode.value ?? 'light')

const toggleTheme = () => {
  colorMode.preference = currentColorMode.value === 'dark' ? 'light' : 'dark'
}

const handlePrimaryCta = async () => {
  if (isAuthed.value) {
    await router.push('/dashboard')
    return
  }
  showIdentity.value = true
}

const scrollToId = (id: string) => {
  if (!import.meta.client) return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 700px;
}
</style>

