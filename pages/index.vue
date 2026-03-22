<template>
  <div class="min-h-screen bg-navy-900 pb-24 md:pb-12">
    <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">{{ userStore.liveAnnouncement }}</div>
    <div class="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6">

      <!-- Hero -->
      <header class="flex items-center justify-between gap-6 animate-fade-in" role="banner" aria-label="Welcome header">
        <div>
          <p class="text-xs text-navy-400 flex items-center gap-1.5 mb-3">
            <span aria-hidden="true">👋</span>
            Good {{ timeOfDay }}, <span class="text-white font-semibold">{{ firstName }}</span>
          </p>
          <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3">
            Ready to level up<br />
            <span class="text-shimmer">your score?</span>
          </h1>
          <p class="text-sm text-navy-400">
            {{ userStore.field }} · Level {{ userStore.level }} ·
            <span class="font-mono text-gold-500">{{ userStore.currentTier.name }}</span>
          </p>
        </div>
        <div class="hidden md:flex items-center justify-center relative flex-shrink-0" aria-hidden="true">
          <svg viewBox="0 0 100 100" width="110" height="110">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#1E2535" stroke-width="8" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#FFD700" stroke-width="8"
              stroke-linecap="round" stroke-dasharray="276.5"
              :stroke-dashoffset="276.5 - (276.5 * userStore.averageScore / 100)"
              transform="rotate(-90 50 50)" style="transition:stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-mono text-lg font-extrabold text-gold-500">{{ userStore.averageScore }}%</span>
            <span class="text-[10px] text-navy-400 uppercase tracking-widest">avg</span>
          </div>
        </div>
      </header>

      <!-- Quick stats -->
      <section class="flex gap-3 flex-wrap animate-fade-in" style="animation-delay:100ms" aria-label="Quick statistics">
        <div v-for="stat in quickStats" :key="stat.label"
          class="flex-1 min-w-[110px] flex items-center gap-3 bg-navy-700 border border-navy-500 rounded-xl px-4 py-3"
          :aria-label="`${stat.label}: ${stat.value}`">
          <span aria-hidden="true" class="text-2xl">{{ stat.icon }}</span>
          <div>
            <div class="font-mono text-xl font-extrabold text-white leading-none">{{ stat.value }}</div>
            <div class="text-[10px] text-navy-400 uppercase tracking-widest mt-1 font-semibold">{{ stat.label }}</div>
          </div>
        </div>
      </section>

      <!-- CTA start session -->
      <section class="animate-fade-in" style="animation-delay:200ms" aria-label="Start a new practice session">
        <div class="bg-gradient-to-br from-navy-700 to-navy-600 border border-gold-500/20 rounded-2xl px-7 py-5 flex items-center justify-between gap-6 flex-wrap shadow-cta">
          <div>
            <h2 class="text-lg font-bold text-white tracking-tight mb-1">Start Today's Session</h2>
            <p class="text-xs text-navy-400">
              {{ userStore.field }} ·
              <span class="font-mono">{{ sessionConfig.questions }} questions</span> ·
              <span class="font-mono">~{{ sessionConfig.minutes }} min</span>
            </p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex bg-navy-800 border border-navy-500 rounded-lg p-1 gap-1" role="group" aria-label="Session length">
              <button v-for="opt in lengthOptions" :key="opt.value"
                class="px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all duration-150"
                :class="sessionConfig.questions === opt.value
                  ? 'bg-navy-600 text-gold-500'
                  : 'bg-transparent text-navy-400 hover:text-white'"
                :aria-pressed="sessionConfig.questions === opt.value"
                :aria-label="`${opt.value} question session`"
                @click="sessionConfig.questions = opt.value; sessionConfig.minutes = opt.minutes">
                {{ opt.value }}Q
              </button>
            </div>
            <NuxtLink to="/quiz"
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 text-navy-900 text-sm font-bold no-underline hover:bg-gold-400 transition-all duration-200 whitespace-nowrap"
              role="button" aria-label="Start your practice session">
              <span aria-hidden="true">▶</span> Start Session
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Main grid -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <!-- Left -->
        <div class="flex flex-col gap-5">
          <div class="animate-fade-in" style="animation-delay:300ms"><WeakAreaCard /></div>

          <!-- Subject scores -->
          <section class="bg-navy-700 border border-navy-500 rounded-xl p-5 animate-fade-in" style="animation-delay:400ms" aria-labelledby="subjects-heading">
            <h2 id="subjects-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-4">Subject Scores</h2>
            <ul role="list" aria-label="Scores by subject" class="flex flex-col gap-4 list-none">
              <li v-for="(score, subject) in userStore.subjectScores" :key="subject" :aria-label="`${subject}: ${score}%`">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="text-sm font-semibold text-white">{{ subject }}</span>
                  <span class="font-mono text-sm font-bold" :style="{ color: getScoreColor(Number(score)) }">{{ score }}%</span>
                </div>
                <div class="h-1.5 bg-navy-600 rounded-full overflow-hidden"
                  role="progressbar" :aria-valuenow="Number(score)" aria-valuemin="0" aria-valuemax="100" aria-hidden="true">
                  <div class="h-full rounded-full transition-all duration-700"
                    :style="{ width: score + '%', background: getScoreColor(Number(score)) }" />
                </div>
              </li>
            </ul>
          </section>

          <!-- Achievements -->
          <section class="bg-navy-700 border border-navy-500 rounded-xl p-5 animate-fade-in" style="animation-delay:500ms" aria-labelledby="ach-heading">
            <h2 id="ach-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-4">Achievements</h2>
            <ul role="list" aria-label="Your achievements" class="flex flex-col gap-0 list-none">
              <li v-for="a in userStore.achievements" :key="a.id"
                class="flex items-center gap-3 py-2.5 border-b border-navy-600 last:border-0 transition-opacity"
                :class="a.earned ? 'opacity-100' : 'opacity-50'"
                :aria-label="`${a.name}: ${a.earned ? 'earned' : 'not yet earned'}`">
                <span class="text-xl" aria-hidden="true">{{ a.icon }}</span>
                <span class="flex-1 text-sm font-semibold text-white">{{ a.name }}</span>
                <span v-if="a.earned" class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-500/10 text-green-500 border border-green-500/20" aria-hidden="true">Earned</span>
                <span v-else class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500" aria-hidden="true">Locked</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- Right sidebar -->
        <div class="flex flex-col gap-5">
          <div class="animate-fade-in" style="animation-delay:200ms"><MillionaireLadder /></div>
          <div class="animate-fade-in" style="animation-delay:300ms"><StreakCard /></div>

          <NuxtLink to="/upload"
            class="flex items-center gap-3 px-5 py-4 bg-navy-700 border border-dashed border-navy-400 rounded-xl no-underline hover:border-gold-600 hover:bg-gold-500/[0.04] transition-all duration-200 group animate-fade-in"
            style="animation-delay:400ms" aria-label="Upload documents to generate quiz questions">
            <span class="text-2xl" aria-hidden="true">📄</span>
            <div class="flex-1">
              <div class="text-sm font-semibold text-white mb-0.5">Upload Study Notes</div>
              <div class="text-xs text-navy-400">Generate questions from your documents</div>
            </div>
            <span class="text-navy-400 group-hover:text-gold-500 group-hover:translate-x-0.5 transition-all duration-150" aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/index'
import MillionaireLadder from '~/components/ladder/MillionaireLadder.vue'
import StreakCard from '~/components/shared/StreakCard.vue'
import WeakAreaCard from '~/components/shared/WeakAreaCard.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'Dashboard — TRIVIA' })

const userStore = useUserStore()
const firstName = computed(() => userStore.firstName)
const timeOfDay = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})
const sessionConfig = reactive({ questions: 10, minutes: 10 })
const lengthOptions = [{ value: 5, minutes: 5 }, { value: 10, minutes: 10 }]
const quickStats = computed(() => [
  { icon: '🔥', value: userStore.streak,                  label: 'Day streak' },
  { icon: '📚', value: userStore.totalSessions,            label: 'Sessions'   },
  { icon: '❓', value: userStore.totalQuestionsAnswered,   label: 'Questions'  },
  { icon: '⭐', value: `${userStore.averageScore}%`,       label: 'Avg score'  },
])
const getScoreColor = (s: number) => s < 50 ? '#FF4F6D' : s < 70 ? '#FF9500' : '#00E5A0'
</script>

<style scoped>
.text-shimmer {
  background: linear-gradient(90deg,#D4B000 0%,#FFEA66 40%,#D4B000 60%,#FFEA66 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}
</style>
