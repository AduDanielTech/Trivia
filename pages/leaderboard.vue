<template>
<<<<<<< HEAD
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <main class="mx-auto max-w-2xl px-6 py-12 md:py-20">
      
      <!-- Header -->
      <header class="mb-10 space-y-2 animate-reveal">
        <h1 class="font-display text-4xl font-black tracking-tight">Hall of Scholars</h1>
        <p class="text-base font-medium text-sage dark:text-paper-200">
          {{ loading ? 'Updating rankings...' : `${displayedEntries.length} students currently active` }}
        </p>
      </header>

      <!-- Scope Tabs (Laboratory Style) -->
      <div class="mb-8 flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-paper-200 dark:bg-white/5 dark:ring-white/10">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id; loadLeaderboard()"
          class="flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all"
          :class="activeTab === tab.id 
            ? 'bg-scholar-600 text-white shadow-lg' 
            : 'text-sage hover:text-scholar-600'"
        >
=======
  <div class="min-h-screen bg-navy-900 pb-24 md:pb-12">
    <div class="max-w-[640px] mx-auto px-6 py-8 flex flex-col gap-5">

      <header class="animate-fade-in">
        <h1 class="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white mb-1">
          <span aria-hidden="true">▲</span> Leaderboard
        </h1>
        <p class="text-sm text-navy-400" aria-live="polite">
          {{ lbStore.loading ? 'Loading…' : `${lbStore.entries.length} students ranked` }}
        </p>
      </header>

      <!-- Tabs -->
      <div class="flex bg-navy-700 border border-navy-500 rounded-xl p-1 gap-1 animate-fade-in"
        style="animation-delay:100ms" role="tablist" aria-label="Leaderboard scope">
        <button v-for="tab in tabs" :key="tab.id"
          class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150"
          :class="activeTab === tab.id ? 'bg-navy-600 text-gold-500' : 'bg-transparent text-navy-400 hover:text-white'"
          role="tab" :aria-selected="activeTab === tab.id"
          @click="activeTab = tab.id; loadLeaderboard()">
>>>>>>> 528f624ee02fab2114845861a921f71a194dabf7
          {{ tab.label }}
        </button>
      </div>

<<<<<<< HEAD
      <!-- Private Profile Notice -->
      <Transition name="slide-up">
        <div v-if="!isOnLeaderboard" class="mb-8 flex items-center justify-between rounded-3xl border border-scholar-600/20 bg-scholar-50 p-6 dark:bg-scholar-900/20">
          <div class="flex items-center gap-4">
            <span class="text-2xl">🔒</span>
            <p class="text-sm font-bold text-scholar-800 dark:text-scholar-100">Your profile is currently private.</p>
          </div>
          <button @click="optIn" class="rounded-xl bg-scholar-600 px-4 py-2 text-xs font-black text-white hover:bg-scholar-700">Join Board</button>
        </div>
      </Transition>

      <!-- Rankings List -->
      <div class="space-y-3">
        <!-- Loading State -->
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="h-20 w-full animate-pulse rounded-3xl bg-white dark:bg-white/5" />
        </template>

        <!-- Entries -->
        <template v-else>
          <ol class="space-y-3">
            <li 
              v-for="(entry, i) in displayedEntries" 
              :key="entry.id"
              class="reveal-visible group flex items-center gap-4 rounded-3xl border px-6 py-5 transition-all"
              :class="entry.isYou 
                ? 'border-scholar-600 bg-scholar-50 ring-2 ring-scholar-600/20 dark:bg-scholar-900/30' 
                : 'border-paper-200 bg-white hover:border-scholar-600/40 dark:border-white/10 dark:bg-white/5'"
              :style="{ animationDelay: `${i * 50}ms` }"
            >
              <!-- Rank -->
              <span class="w-8 font-display text-lg font-black text-sage dark:text-paper-400">
                {{ i + 1 }}
=======
      <!-- Loading skeletons -->
      <div v-if="lbStore.loading" class="flex flex-col gap-1.5 animate-fade-in" aria-busy="true" aria-label="Loading leaderboard">
        <div v-for="i in 7" :key="i"
          class="h-[60px] rounded-xl bg-gradient-to-r from-navy-700 via-navy-600 to-navy-700 bg-[length:200%] animate-shimmer" aria-hidden="true" />
      </div>

      <!-- Board -->
      <div v-else role="tabpanel" class="animate-fade-in" style="animation-delay:200ms">
        <ol role="list" aria-label="Leaderboard rankings" class="flex flex-col gap-1.5 list-none">
          <li v-for="(entry, i) in displayedEntries" :key="entry.user_id"
            class="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150"
            :class="entry.is_me
              ? 'bg-gold-500/[0.04] border-gold-500/30'
              : 'bg-navy-700 border-navy-500 hover:bg-navy-600'"
            :aria-current="entry.is_me ? 'true' : undefined"
          >
            <span class="w-8 text-center font-mono text-sm text-navy-400 flex-shrink-0" aria-hidden="true">
              {{ i < 3 ? MEDALS[i] : `#${i + 1}` }}
            </span>

            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" aria-hidden="true">
              {{ getInitials(entry.full_name || entry.username) }}
            </div>

            <div class="flex-1 flex items-center gap-2 flex-wrap min-w-0">
              <span class="text-sm font-semibold text-white truncate">
                {{ entry.username }}<span v-if="entry.is_me" class="text-gold-500 text-xs"> (You)</span>
>>>>>>> 528f624ee02fab2114845861a921f71a194dabf7
              </span>

<<<<<<< HEAD
              <!-- Avatar -->
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper-100 font-display text-sm font-black text-scholar-700 dark:bg-white/10 dark:text-scholar-100">
                {{ entry.initials }}
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <p class="truncate font-display text-base font-black tracking-tight">
                  {{ entry.username }}
                  <span v-if="entry.isYou" class="ml-2 text-[10px] uppercase text-scholar-600 font-black tracking-widest">(You)</span>
                </p>
                <span class="text-[10px] font-black uppercase tracking-widest text-sage">{{ entry.tier }} Rank</span>
              </div>

              <!-- Score -->
              <div class="text-right">
                <p class="font-mono text-lg font-black text-scholar-700 dark:text-scholar-100">{{ entry.score }}%</p>
                <p v-if="activeTab === 'weekly'" class="text-[9px] font-bold text-scholar-600">+{{ entry.weeklyXp }} XP</p>
              </div>
            </li>
          </ol>

          <!-- Floating User Rank (If off-board) -->
          <div v-if="userRank && userRank > displayedEntries.length" class="mt-8 rounded-3xl border-2 border-dashed border-scholar-600/30 bg-white p-6 dark:bg-white/5">
             <div class="flex items-center justify-between">
                <p class="font-display font-black">Your current standing</p>
                <span class="rounded-xl bg-scholar-600 px-4 py-2 font-mono font-black text-white">#{{ userRank }}</span>
             </div>
          </div>
        </template>
      </div>

    </main>
=======
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span class="font-mono text-sm font-bold text-navy-400">
                {{ activeTab === 'weekly' ? `${entry.weekly_xp ?? 0} XP` : `${Math.round(entry.score)}%` }}
              </span>
            </div>
          </li>

          <li v-if="!lbStore.loading && displayedEntries.length === 0"
            class="flex flex-col items-center gap-3 py-12 text-navy-400">
            <span class="text-4xl" aria-hidden="true">📊</span>
            <p class="text-sm">No rankings yet. Be the first to complete a session!</p>
          </li>
        </ol>
      </div>

      <!-- Your rank if off list -->
      <div v-if="lbStore.myRank && lbStore.myRank > displayedEntries.length"
        class="flex items-center justify-between px-4 py-3.5 bg-gold-500/[0.04] border border-dashed border-gold-500/20 rounded-xl"
        role="status">
        <span class="font-mono text-sm font-bold text-gold-500">Your rank: #{{ lbStore.myRank }}</span>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500">
          Keep practicing!
        </span>
      </div>

    </div>
>>>>>>> 528f624ee02fab2114845861a921f71a194dabf7
  </div>
</template>

<script setup lang="ts">
import { useLeaderboardStore } from '~/stores/leaderboardStore'
import { useUserStore         } from '~/stores/userStore'

definePageMeta({ layout: 'default' })
useHead({ title: 'Leaderboard — MASTERY' })

const lbStore   = useLeaderboardStore()
const userStore = useUserStore()

<<<<<<< HEAD
const activeTab = ref<'subject' | 'global' | 'weekly'>('subject')
const loading = ref(true)
const isOnLeaderboard = ref(true)
const userRank = ref<number | null>(null)
=======
const MEDALS    = ['🥇', '🥈', '🥉']
const activeTab = ref<'subject' | 'global' | 'weekly'>('global')
>>>>>>> 528f624ee02fab2114845861a921f71a194dabf7

const tabs = [
  { id: 'subject', label: 'Field' },
  { id: 'global', label: 'Global' },
  { id: 'weekly', label: 'Weekly' },
]

<<<<<<< HEAD
const buildMockEntries = () => {
  const realName = userStore.username || authStore.userName || 'Scholar'
  return [
    { id: '1', username: 'Adaeze Obi', initials: 'AO', score: 94, tier: 'Legend', isYou: false, weeklyXp: 820 },
    { id: '2', username: 'Emeka Nwosu', initials: 'EN', score: 91, tier: 'Legend', isYou: false, weeklyXp: 750 },
    { id: 'you', username: realName, initials: 'YO', score: userStore.averageScore || 72, tier: userStore.currentTier.name, isYou: true, weeklyXp: 420 },
  ]
}

const displayedEntries = ref(buildMockEntries())

const loadLeaderboard = async () => {
  loading.value = true
  const scope = activeTab.value === 'weekly' ? 'weekly' : 'global'
  try {
    const data = await fetchLeaderboard(scope, 20)
    if (data?.length) {
      displayedEntries.value = data.map((row: any, i: number) => ({
        id: row.id,
        username: row.id === authStore.user?.id ? 'You' : (row.username || 'Scholar'),
        initials: (row.username || 'SC').slice(0, 2).toUpperCase(),
        score: Math.round(row.average_score || 0),
        tier: row.tier || 'Rookie',
        isYou: row.id === authStore.user?.id,
        weeklyXp: row.weekly_xp || 0
      }))
    }
  } finally {
    loading.value = false
  }
}

const optIn = () => { isOnLeaderboard.value = true }
=======
const displayedEntries = computed(() => lbStore.entries)

const getInitials = (name: string) =>
  (name || 'AN').split(' ').slice(0, 2).map((n: string) => n[0]?.toUpperCase() ?? '').join('')

const loadLeaderboard = async () => {
  const subject = activeTab.value === 'subject' ? userStore.currentSubject || undefined : undefined
  await lbStore.fetchLeaderboard(activeTab.value as any, subject)
}

>>>>>>> 528f624ee02fab2114845861a921f71a194dabf7
onMounted(loadLeaderboard)
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }
.animate-reveal { animation: reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
@keyframes reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.reveal-visible { animation: reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
</style>