<template>
  <div class="min-h-screen bg-navy-900 pb-24 md:pb-12">
    <div class="max-w-[900px] mx-auto px-6 py-8 flex flex-col gap-6">
      <header class="animate-fade-in">
        <h1 class="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white mb-1.5">
          <span aria-hidden="true">📊</span> Progress &amp; Analytics
        </h1>
        <p class="text-sm text-navy-400">Track your improvement across all subjects</p>
      </header>

      <!-- Stats row -->
      <section class="flex gap-3 flex-wrap animate-fade-in" style="animation-delay:100ms" aria-label="Overall statistics">
        <div v-for="s in overallStats" :key="s.label"
          class="flex-1 min-w-[90px] flex flex-col items-center gap-1 bg-navy-700 border border-navy-500 rounded-xl p-4 text-center"
          :aria-label="`${s.label}: ${s.value}`">
          <span class="text-2xl" aria-hidden="true">{{ s.icon }}</span>
          <span class="font-mono text-xl font-extrabold text-white">{{ s.value }}</span>
          <span class="text-[10px] font-semibold uppercase tracking-widest text-navy-400">{{ s.label }}</span>
        </div>
      </section>

      <!-- Tier progression -->
      <section class="bg-navy-700 border border-navy-500 rounded-xl p-6 animate-fade-in" style="animation-delay:200ms" aria-labelledby="tier-prog-heading">
        <h2 id="tier-prog-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Tier Progression</h2>
        <div class="flex items-center justify-between overflow-x-auto pb-2 mb-4" role="list" aria-label="All tiers">
          <div v-for="(tier, i) in TIERS" :key="tier.id" class="flex flex-col items-center gap-1 relative flex-1" role="listitem" :aria-label="`${tier.name}: ${getTierStatus(tier)}`">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 relative z-10"
              :class="userStore.xp >= tier.maxXP ? 'border-green-600 bg-green-500/10' : userStore.currentTier.id === tier.id ? 'animate-pulse-gold' : 'border-navy-500 bg-navy-600'"
              :style="userStore.currentTier.id === tier.id ? { borderColor: tier.color, color: tier.color, background: tier.color + '15' } : userStore.xp >= tier.maxXP ? {} : { color: '#8A95A8' }"
            >
              <span v-if="userStore.xp >= tier.maxXP" class="text-green-500 font-black text-sm">✓</span>
              <span v-else>{{ tier.icon }}</span>
            </div>
            <div v-if="i < TIERS.length - 1"
              class="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 z-0 transition-colors duration-500"
              :class="userStore.xp >= tier.maxXP ? 'bg-green-600' : 'bg-navy-500'"
              aria-hidden="true" />
            <span class="text-[10px] font-semibold uppercase tracking-wide text-navy-400 whitespace-nowrap mt-1">{{ tier.name }}</span>
          </div>
        </div>
        <div class="h-1.5 bg-navy-600 rounded-full overflow-hidden mb-2"
          role="progressbar" :aria-valuenow="userStore.tierProgress" aria-valuemin="0" aria-valuemax="100"
          :aria-label="`Progress to next tier: ${userStore.tierProgress}%`">
          <div class="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-700" :style="{ width: userStore.tierProgress + '%' }" />
        </div>
        <p class="font-mono text-[11px] text-navy-400 text-right" aria-live="polite">
          <span v-if="userStore.nextTier">{{ (userStore.nextTier.minXP - userStore.xp).toLocaleString() }} XP to {{ userStore.nextTier.name }}</span>
          <span v-else class="text-gold-500">Maximum tier reached ✓</span>
        </p>
      </section>

      <!-- Subject breakdown -->
      <section class="bg-navy-700 border border-navy-500 rounded-xl p-6 animate-fade-in" style="animation-delay:300ms" aria-labelledby="subj-heading">
        <h2 id="subj-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Subject Breakdown</h2>
        <ul role="list" aria-label="Scores by subject" class="flex flex-col gap-4 list-none">
          <li v-for="(score, subject) in userStore.subjectScores" :key="subject">
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-sm font-semibold text-white">{{ subject }}</span>
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm font-bold" :style="{ color: getScoreColor(Number(score)) }">{{ score }}%</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                  :class="Number(score) < 50 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : Number(score) < 70 ? 'bg-navy-600 text-navy-400 border border-navy-500' : 'bg-green-500/10 text-green-500 border border-green-500/20'">
                  {{ Number(score) < 50 ? 'Weak' : Number(score) < 70 ? 'Average' : 'Strong' }}
                </span>
              </div>
            </div>
            <div class="h-2 bg-navy-600 rounded-full overflow-hidden"
              role="progressbar" :aria-valuenow="Number(score)" aria-valuemin="0" aria-valuemax="100" aria-hidden="true">
              <div class="h-full rounded-full transition-all duration-1000"
                :style="{ width: score + '%', background: getScoreColor(Number(score)) }" />
            </div>
          </li>
        </ul>
      </section>

      <!-- Achievements -->
      <section class="bg-navy-700 border border-navy-500 rounded-xl p-6 animate-fade-in" style="animation-delay:400ms" aria-labelledby="ach-heading">
        <h2 id="ach-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Achievements</h2>
        <ul role="list" aria-label="All achievements" class="grid grid-cols-2 sm:grid-cols-4 gap-3 list-none">
          <li v-for="a in userStore.achievements" :key="a.id"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all"
            :class="a.earned ? 'bg-gold-500/[0.04] border-gold-500/20 opacity-100' : 'bg-navy-600 border-navy-500 opacity-50'"
            :aria-label="`${a.name}: ${a.earned ? 'earned' : 'not yet earned'}`">
            <span class="text-3xl" aria-hidden="true">{{ a.icon }}</span>
            <span class="text-[11px] font-semibold text-white leading-tight">{{ a.name }}</span>
            <span v-if="!a.earned" class="text-xs" aria-hidden="true">🔒</span>
          </li>
        </ul>
      </section>

      <!-- Community -->
      <section class="bg-navy-700 border border-navy-500 rounded-xl p-6 animate-fade-in" style="animation-delay:500ms" aria-labelledby="comm-heading">
        <h2 id="comm-heading" class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-5">Community Standing</h2>
        <div class="text-center py-6 border-b border-navy-600 mb-5"
          role="status" aria-label="You are in the top 30% of all JAMB students on TRIVIA">
          <div class="text-5xl font-extrabold tracking-tight text-shimmer mb-1">Top 30%</div>
          <p class="text-sm text-navy-400">of all JAMB students on TRIVIA</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="cs in communityStatItems" :key="cs.label"
            class="text-center bg-navy-600 rounded-lg p-3" :aria-label="`${cs.label}: ${cs.value}`">
            <div class="font-mono text-base font-bold text-white mb-1">{{ cs.value }}</div>
            <div class="text-[10px] font-semibold uppercase tracking-widest text-navy-400">{{ cs.label }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore, TIERS } from '~/stores/index'
definePageMeta({ layout: 'default' })
useHead({ title: 'Progress — TRIVIA' })
const userStore = useUserStore()
const overallStats = computed(() => [
  { icon: '📚', value: userStore.totalSessions, label: 'Sessions' },
  { icon: '❓', value: userStore.totalQuestionsAnswered, label: 'Questions' },
  { icon: '🎯', value: `${userStore.averageScore}%`, label: 'Avg Score' },
  { icon: '🔥', value: userStore.streak, label: 'Streak' },
  { icon: '⬡', value: userStore.xp.toLocaleString(), label: 'Total XP' },
])
const communityStatItems = [
  { label: 'Your avg',   value: `${userStore.averageScore}%` },
  { label: 'Comm. avg',  value: '64%' },
  { label: 'Your rank',  value: '#47' },
  { label: 'Students',   value: '12,034' },
]
const getScoreColor = (s: number) => s < 50 ? '#FF4F6D' : s < 70 ? '#FF9500' : '#00E5A0'
const getTierStatus = (tier: typeof TIERS[0]) => {
  if (userStore.xp >= tier.maxXP) return 'Completed'
  if (userStore.currentTier.id === tier.id) return 'Current tier'
  return `Locked — requires ${tier.minXP} XP`
}
</script>
<style scoped>
.text-shimmer {
  background: linear-gradient(90deg,#D4B000 0%,#FFEA66 40%,#D4B000 60%,#FFEA66 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shimmer 3s linear infinite;
}
</style>
