<template>
  <div class="min-h-screen bg-paper-50 text-paper-800 dark:bg-ink-900 dark:text-paper-50">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-paper-900 focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-scholar-600/30"
    >
      Skip to main content
    </a>

    <!-- Landing nav (marketing) -->
    <header class="sticky top-0 z-40 border-b border-paper-200/80 bg-paper-50/80 backdrop-blur dark:border-white/10 dark:bg-ink-900/70">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <NuxtLink to="/" class="group inline-flex items-baseline gap-2 font-display font-extrabold tracking-tight">
          <span class="text-scholar-700 dark:text-scholar-100" aria-hidden="true">⬡</span>
          <span>TRIVIA</span>
          <span class="hidden text-xs font-black uppercase tracking-[0.18em] text-sage sm:inline">by Litesigma</span>
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
            :aria-label="`Switch to ${colorMode.value === 'dark' ? 'light' : 'dark'} mode`"
            @click="toggleTheme"
          >
            <span v-if="colorMode.value === 'dark'" aria-hidden="true">☀️</span>
            <span v-else aria-hidden="true">🌙</span>
          </button>

          <template v-if="isAuthed">
            <NuxtLink
              to="/dashboard"
              class="inline-flex h-10 items-center justify-center rounded-xl border border-paper-200 bg-white px-4 text-sm font-semibold text-paper-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5 dark:text-paper-50"
            >
              Dashboard
            </NuxtLink>
          </template>
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
      <!-- HERO -->
      <section class="relative overflow-hidden rounded-2xl border border-paper-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-10" aria-labelledby="hero-title">
        <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-scholar-600/15 blur-3xl dark:bg-scholar-600/20" aria-hidden="true" />
        <div class="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl dark:bg-gold-500/20" aria-hidden="true" />

        <div class="grid items-center gap-10 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <p
              v-reveal
              class="inline-flex items-center gap-2 rounded-full border border-paper-200 bg-paper-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-paper-800 dark:border-white/10 dark:bg-white/5 dark:text-paper-50"
            >
              <span class="h-2 w-2 animate-float rounded-full bg-scholar-600" aria-hidden="true" />
              Built for daily exam practice
            </p>

            <h1
              id="hero-title"
              v-reveal="80"
              class="mt-5 font-display text-4xl font-extrabold tracking-tight text-paper-900 dark:text-white sm:text-5xl"
            >
              Pass your exams with
              <span class="bg-gradient-to-r from-scholar-600 to-gold-500 bg-clip-text text-transparent">5‑minute</span>
              AI practice.
            </h1>

            <p v-reveal="160" class="mt-4 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Pick a subject, answer AI‑selected questions, and see exactly what to fix next.
              Designed for first‑time onboarding, daily streak practice, and fast revision—without heavy pages.
            </p>

            <div v-reveal="240" class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-scholar-600 px-6 text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-scholar-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/30"
                @click="handleStartPracticing"
                :aria-expanded="showIdentity"
              >
                <span aria-hidden="true">▶</span>
                Start Practicing
              </button>

              <button
                type="button"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-paper-200 bg-white px-6 text-base font-extrabold text-paper-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5 dark:text-paper-50"
                @click="handleTryDemo"
              >
                <span aria-hidden="true">✨</span>
                Try Demo
              </button>
            </div>

            <div v-reveal="320" class="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-paper-200 bg-paper-50 p-4 dark:border-white/10 dark:bg-white/5" aria-label="Quick highlights">
              <div class="text-center">
                <div class="text-lg font-extrabold text-paper-900 dark:text-white">5‑min</div>
                <div class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-sage">Sessions</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-extrabold text-paper-900 dark:text-white">Weak areas</div>
                <div class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-sage">Auto‑detected</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-extrabold text-paper-900 dark:text-white">Streaks</div>
                <div class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-sage">+ Ranks</div>
              </div>
            </div>
          </div>

          <!-- Lite visual (fast-loading) -->
          <div v-reveal="120" class="lg:col-span-5">
            <div class="rounded-2xl border border-paper-200 bg-paper-50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div class="flex items-center justify-between">
                <span class="rounded-full bg-scholar-600/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-scholar-800 dark:text-scholar-100">Pre‑session lobby</span>
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
                <span class="rounded-2xl border border-paper-200 bg-white px-3 py-2 text-xs font-bold text-paper-900 dark:border-white/10 dark:bg-white/5 dark:text-paper-50">📄 Document -> Quiz</span>
                <span class="rounded-2xl border border-paper-200 bg-white px-3 py-2 text-xs font-bold text-paper-900 dark:border-white/10 dark:bg-white/5 dark:text-paper-50">🔊 Audio mode</span>
                <span class="rounded-2xl border border-paper-200 bg-white px-3 py-2 text-xs font-bold text-paper-900 dark:border-white/10 dark:bg-white/5 dark:text-paper-50">🏆 Rank climb</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Identity choice -->
      <Transition name="slide-down">
        <section v-if="showIdentity" class="mt-6 rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5" aria-label="Choose how to continue">
          <h2 class="font-display text-2xl font-extrabold tracking-tight text-paper-900 dark:text-white">How do you want to start?</h2>
          <p class="mt-2 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
            Demo works instantly. Create an account when you want streaks, progress sync, and ranks.
          </p>

          <div class="mt-5 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              class="group rounded-2xl border border-paper-200 bg-paper-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5"
              @click="handleContinueGuest"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl" aria-hidden="true">👤</span>
                <div>
                  <div class="text-base font-extrabold text-paper-900 dark:text-white">Continue as Guest</div>
                  <div class="mt-1 text-sm font-semibold text-paper-800/70 dark:text-paper-50/70">Start practicing right now.</div>
                </div>
              </div>
            </button>

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

      <!-- FEATURE BLOCKS -->
      <section id="features" class="mt-14" aria-labelledby="features-title">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="features-title" v-reveal class="font-display text-3xl font-extrabold tracking-tight text-paper-900 dark:text-white">Features students actually use daily</h2>
            <p v-reveal="80" class="mt-2 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Every feature matches a real journey: onboarding, daily practice, weak‑area fixes, progress tracking, and social comparison.
            </p>
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div v-reveal class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">🔥</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">Daily streaks (with “at‑risk” urgency)</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Makes “just 5 minutes” feel like a win. Streak risk nudges returning users to practice before they lose momentum.
            </p>
          </div>

          <div v-reveal="80" class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">⚠️</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">Weak area detection</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Quickly shows what to practice next (2–3 topics). One tap starts a targeted session.
            </p>
          </div>

          <div v-reveal="160" class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">🧠</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">AI explanations</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Turns mistakes into learning: clear “why” explanations, not just right/wrong.
            </p>
          </div>

          <div v-reveal="240" class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <div class="text-2xl" aria-hidden="true">🏆</div>
            <h3 class="mt-3 text-lg font-extrabold text-paper-900 dark:text-white">Leaderboards (healthy competition)</h3>
            <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
              Social comparison builds motivation. Preview your rank on the dashboard and chase the next spot.
            </p>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS (sticky scroll) -->
      <section id="how" class="mt-14" aria-labelledby="how-title">
        <h2 id="how-title" v-reveal class="font-display text-3xl font-extrabold tracking-tight text-paper-900 dark:text-white">How it works (in real life)</h2>
        <p v-reveal="80" class="mt-2 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
          This mirrors the journeys: subject switching, AI practice, progress review, and weak‑area repair.
        </p>

        <div class="mt-8 grid gap-6 lg:grid-cols-12">
          <!-- Sticky left -->
          <div class="lg:col-span-5">
            <div class="lg:sticky lg:top-28">
              <div class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Step {{ activeStep + 1 }} of {{ howSteps.length }}</p>
                  <span class="text-xs font-bold text-paper-800/70 dark:text-paper-50/70" aria-hidden="true">🧭</span>
                </div>
                <h3 class="mt-3 text-2xl font-extrabold tracking-tight text-paper-900 dark:text-white">
                  {{ howSteps[activeStep]?.leftTitle }}
                </h3>
                <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
                  {{ howSteps[activeStep]?.leftBody }}
                </p>

                <div class="mt-5 flex gap-2">
                  <span
                    v-for="(s, i) in howSteps"
                    :key="s.id"
                    class="h-2 flex-1 rounded-full"
                    :class="i <= activeStep ? 'bg-scholar-600' : 'bg-paper-200 dark:bg-white/10'"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Scrolling right -->
          <div class="lg:col-span-7">
            <div class="space-y-4">
              <article
                v-for="(s, i) in howSteps"
                :key="s.id"
                :ref="el => setStepRef(el, i)"
                class="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
                :aria-label="`How it works: ${s.rightTitle}`"
              >
                <div class="flex items-start gap-4">
                  <div class="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-paper-50 text-2xl dark:bg-white/5" aria-hidden="true">
                    {{ s.icon }}
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-lg font-extrabold text-paper-900 dark:text-white">
                      {{ s.rightTitle }}
                    </h4>
                    <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
                      {{ s.rightBody }}
                    </p>
                    <p class="mt-3 text-sm font-bold text-paper-800/70 dark:text-paper-50/70">
                      {{ s.micro }}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- SOCIAL PROOF / MOTIVATION -->
      <section id="results" class="mt-14" aria-labelledby="results-title">
        <div class="rounded-2xl border border-paper-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-10">
          <h2 id="results-title" v-reveal class="font-display text-3xl font-extrabold tracking-tight text-paper-900 dark:text-white">
            The leaderboard makes practice feel competitive (in a good way).
          </h2>
          <p v-reveal="80" class="mt-3 max-w-prose text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
            Students who practice consistently tend to rise fast. Aim for “Top 30%” by stacking short sessions daily.
          </p>

          <div v-reveal="160" class="mt-7 grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl border border-paper-200 bg-paper-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Motivation</div>
              <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">Top 30% mindset</div>
              <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
                Keep your streak alive and your average score climbs.
              </p>
            </div>
            <div class="rounded-2xl border border-paper-200 bg-paper-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Progress</div>
              <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">You always know what to do next</div>
              <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
                Weak areas surface automatically—no guessing.
              </p>
            </div>
            <div class="rounded-2xl border border-paper-200 bg-paper-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-sage">Consistency</div>
              <div class="mt-2 text-lg font-extrabold text-paper-900 dark:text-white">5 minutes wins</div>
              <p class="mt-2 text-base font-semibold leading-relaxed text-paper-800/80 dark:text-paper-50/80">
                Short sessions remove friction, especially on busy days.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="mt-14" aria-labelledby="final-cta-title">
        <div class="rounded-2xl bg-scholar-600 p-8 text-white shadow-sm sm:p-10">
          <h2 id="final-cta-title" v-reveal class="font-display text-3xl font-extrabold tracking-tight">Start your streak today.</h2>
          <p v-reveal="80" class="mt-3 max-w-prose text-base font-semibold leading-relaxed text-white/85">
            One short session now is better than waiting. Build the habit and watch your weak areas disappear.
          </p>
          <div v-reveal="160" class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-extrabold text-scholar-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-white/40"
              @click="handleStartPracticing"
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
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })
useHead({ title: 'TRIVIA — 5-minute AI exam practice' })

const colorMode = useColorMode()
const router = useRouter()
const authStore = useAuthStore()
const { user, continueAsGuest } = useAuth()

const isAuthed = computed(() => !!user.value || authStore.isAuthenticated)
const showIdentity = ref(false)

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const handleTryDemo = async () => {
  if (!isAuthed.value) await continueAsGuest()
  await router.push('/quiz?demo=1')
}

const handleContinueGuest = async () => {
  await continueAsGuest()
  showIdentity.value = false
  await router.push('/quiz')
}

const handleStartPracticing = () => {
  if (isAuthed.value) {
    router.push('/dashboard')
    return
  }
  showIdentity.value = true
}

// Sticky scroll interaction: update left panel based on which right step is visible
const howSteps = [
  {
    id: 'pick',
    icon: '🎯',
    leftTitle: 'Pick your subject in seconds',
    leftBody: 'Switch subjects anytime. Your dashboard remembers what you’re focusing on today.',
    rightTitle: '1) Pick your subject',
    rightBody: 'Choose what you are studying right now (and switch later without losing momentum).',
    micro: 'Journey: Field/subject switching + onboarding.',
  },
  {
    id: 'ai',
    icon: '⚡',
    leftTitle: 'Practice with AI-selected questions',
    leftBody: 'Short sessions remove friction. AI adapts difficulty and highlights your weak areas.',
    rightTitle: '2) Practice with AI questions',
    rightBody: 'Take a 5 or 10 question session. Audio mode supports accessibility and focus.',
    micro: 'Journey: Pre-session lobby + accessibility (audio).',
  },
  {
    id: 'track',
    icon: '📈',
    leftTitle: 'Track progress without clutter',
    leftBody: 'You instantly see last session, average score, sessions completed, and questions answered.',
    rightTitle: '3) Track your progress',
    rightBody: 'Progress snapshots keep returning users oriented in 3 seconds: what happened, what changed, what’s next.',
    micro: 'Journey: Returning users + progress tracking.',
  },
  {
    id: 'weak',
    icon: '⚠️',
    leftTitle: 'Improve weak areas with one tap',
    leftBody: 'Weak topics appear automatically (2–3). Start targeted practice immediately.',
    rightTitle: '4) Improve weak areas',
    rightBody: 'When the app detects weak topics, it prompts targeted sessions so weaknesses become strengths.',
    micro: 'Journey: Weak area spotlight + habit building.',
  },
] as const

const activeStep = ref(0)
const stepEls = ref<Array<HTMLElement | null>>([])
const setStepRef = (el: Element | null, idx: number) => {
  stepEls.value[idx] = (el as HTMLElement) ?? null
}

let stepObserver: IntersectionObserver | null = null
onMounted(() => {
  stepObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]
      if (!visible) return
      const idx = stepEls.value.findIndex(el => el === visible.target)
      if (idx >= 0) activeStep.value = idx
    },
    { threshold: [0.2, 0.35, 0.5, 0.65] }
  )
  stepEls.value.forEach(el => el && stepObserver?.observe(el))
})

onBeforeUnmount(() => {
  stepObserver?.disconnect()
  stepObserver = null
})
</script>

<style scoped>
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
