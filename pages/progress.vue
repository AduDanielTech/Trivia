<template>
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <main class="mx-auto max-w-5xl px-6 py-12 md:py-20">
      
      <!-- Header -->
      <header class="mb-12 space-y-2 animate-reveal">
        <h1 class="font-display text-4xl font-black tracking-tight">Scholarly Analytics</h1>
        <p class="text-base font-medium text-sage dark:text-paper-200">A detailed breakdown of your academic journey.</p>
      </header>

      <!-- 01. OVERALL STATS (Clean Grid) -->
      <section class="mb-12 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div v-for="s in overallStats" :key="s.label" class="rounded-3xl border border-paper-200 bg-white p-6 text-center dark:border-white/10 dark:bg-white/5 shadow-sm">
          <span class="mb-3 block text-2xl" aria-hidden="true">{{ s.icon }}</span>
          <p class="font-display text-2xl font-black tracking-tight">{{ s.value }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-sage">{{ s.label }}</p>
        </div>
      </section>

      <!-- 02. THE SCHOLAR'S PATH (Tier Progression) -->
      <section class="mb-12 rounded-[2.5rem] border border-paper-200 bg-white p-10 dark:border-white/10 dark:bg-white/5">
        <h3 class="mb-8 font-display text-xl font-black italic underline decoration-scholar-600 underline-offset-8">The Scholar's Path</h3>
        
        <div class="relative flex items-center justify-between overflow-x-auto pb-8 pt-4 no-scrollbar">
          <!-- Connector Track -->
          <div class="absolute left-0 top-[2.75rem] h-1 w-full bg-paper-100 dark:bg-white/10" />
          
          <div v-for="(tier, i) in TIERS" :key="tier.id" class="relative z-10 flex flex-col items-center gap-4 px-6 min-w-[120px]">
            <!-- Status Node -->
            <div 
              class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-500"
              :class="[
                userStore.xp >= tier.maxXP ? 'bg-scholar-600 border-scholar-600 text-white' :
                userStore.currentTier.id === tier.id ? 'bg-white border-scholar-600 text-scholar-600 shadow-xl ring-4 ring-scholar-600/10' :
                'bg-white border-paper-200 text-sage dark:bg-ink-800 dark:border-white/10'
              ]"
            >
              <span v-if="userStore.xp >= tier.maxXP" class="font-black">✓</span>
              <span v-else class="text-xl">{{ tier.icon }}</span>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest" :class="userStore.currentTier.id === tier.id ? 'text-scholar-600' : 'text-sage'">
              {{ tier.name }}
            </p>
          </div>
        </div>

        <!-- Next XP Goal -->
        <div class="mt-4 flex flex-col items-end gap-2">
          <div class="h-2 w-full max-w-md overflow-hidden rounded-full bg-paper-100 dark:bg-white/10">
            <div class="h-full bg-scholar-600 transition-all duration-1000" :style="{ width: userStore.tierProgress + '%' }" />
          </div>
          <p class="font-display text-sm font-bold text-scholar-700 dark:text-scholar-100">
             <span v-if="userStore.nextTier">{{ (userStore.nextTier.minXP - userStore.xp).toLocaleString() }} XP to {{ userStore.nextTier.name }}</span>
             <span v-else>Pinnacle Reached 🏆</span>
          </p>
        </div>
      </section>

      <!-- 03. PROFICIENCY MATRIX (Subjects) -->
      <section class="mb-12 grid gap-8 lg:grid-cols-2">
        <div class="rounded-[2.5rem] border border-paper-200 bg-white p-10 dark:border-white/10 dark:bg-white/5">
          <h3 class="mb-8 font-display text-xl font-black tracking-tight">Field Breakdown</h3>
          <div class="space-y-6">
            <div v-for="(score, subject) in userStore.subjectScores" :key="subject" class="space-y-2">
              <div class="flex justify-between font-bold">
                <span class="text-sage uppercase text-[10px] tracking-widest">{{ subject }}</span>
                <span class="text-sm" :class="score >= 70 ? 'text-scholar-600' : 'text-orange-600'">{{ score }}%</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-paper-50 dark:bg-white/5 overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000" 
                  :class="score >= 70 ? 'bg-scholar-600' : 'bg-orange-600'"
                  :style="{ width: score + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Community Comparison -->
        <div class="rounded-[2.5rem] bg-scholar-900 p-10 text-white shadow-2xl">
          <h3 class="mb-4 font-display text-xl font-black">Community Percentile</h3>
          <div class="mb-8 flex items-baseline gap-2">
            <span class="text-6xl font-black text-scholar-500">Top 30%</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="cs in communityStatItems" :key="cs.label" class="rounded-2xl bg-white/5 p-4 border border-white/5">
              <p class="text-lg font-black">{{ cs.value }}</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-scholar-500">{{ cs.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 04. ACHIEVEMENTS (Laboratory Grid) -->
      <section class="rounded-[2.5rem] border border-paper-200 bg-white p-10 dark:border-white/10 dark:bg-white/5">
        <h3 class="mb-8 font-display text-xl font-black tracking-tight">Milestone Inventory</h3>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div 
            v-for="a in userStore.achievements" :key="a.id"
            class="flex flex-col items-center gap-3 rounded-3xl border border-paper-50 p-6 transition-all"
            :class="a.earned ? 'bg-scholar-50/50 border-scholar-200 dark:bg-scholar-900/20' : 'opacity-30 grayscale'"
          >
            <span class="text-4xl">{{ a.icon }}</span>
            <span class="text-center text-[10px] font-black uppercase tracking-widest">{{ a.name }}</span>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { useUserStore, TIERS } from '~/stores/index'

definePageMeta({ layout: 'default' })
useHead({ title: 'Analytics — MASTERY' })

const userStore = useUserStore()

const overallStats = computed(() => [
  { icon: '📚', value: userStore.totalSessions, label: 'Sessions' },
  { icon: '❓', value: userStore.totalQuestionsAnswered, label: 'Answers' },
  { icon: '🎯', value: `${userStore.averageScore}%`, label: 'Accuracy' },
  { icon: '🔥', value: userStore.streak, label: 'Streak' },
  { icon: 'XP', value: userStore.xp.toLocaleString(), label: 'Total' },
])

const communityStatItems = [
  { label: 'Avg Mastery', value: `${userStore.averageScore}%` },
  { label: 'Global Mean', value: '64%' },
  { label: 'Global Rank', value: '#47' },
  { label: 'Population', value: '12k+' },
]

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('reveal-visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }
.animate-reveal { animation: reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
@keyframes reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>