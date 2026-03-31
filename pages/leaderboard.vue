<template>
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <main class="mx-auto max-w-2xl px-6 py-12 md:py-20">
      
      <!-- Header -->
      <header class="mb-10 space-y-2 animate-reveal">
        <h1 class="font-display text-4xl font-black tracking-tight">Hall of Scholars</h1>
        <p class="text-base font-medium text-sage dark:text-paper-200">
          {{ lbStore.loading ? 'Updating rankings...' : `${lbStore.entries.length} students currently active` }}
        </p>
      </header>

      <!-- Scope Tabs (Laboratory Style) -->
      <div class="mb-8 flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-paper-200 dark:bg-white/5 dark:ring-white/10" role="tablist">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id; loadLeaderboard()"
          class="flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all"
          :class="activeTab === tab.id 
            ? 'bg-scholar-600 text-white shadow-lg' 
            : 'text-sage hover:text-scholar-600 dark:text-paper-400'"
          role="tab"
          :aria-selected="activeTab === tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Private Profile Notice (Logic from HEAD) -->
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
        <div v-if="lbStore.loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-20 w-full animate-pulse rounded-3xl bg-white dark:bg-white/5 border border-paper-100 dark:border-white/5" />
        </div>

        <!-- Entries -->
        <template v-else>
          <ol class="space-y-3" role="list">
            <li 
              v-for="(entry, i) in lbStore.entries" 
              :key="entry.user_id || entry.id"
              class="reveal-visible group flex items-center gap-4 rounded-3xl border px-6 py-5 transition-all"
              :class="entry.is_me || entry.isYou 
                ? 'border-scholar-600 bg-scholar-50 ring-2 ring-scholar-600/20 dark:bg-scholar-900/30' 
                : 'border-paper-200 bg-white hover:border-scholar-600/40 dark:border-white/10 dark:bg-white/5'"
              :style="{ animationDelay: `${i * 50}ms` }"
            >
              <!-- Rank (with Medal support from Remote logic) -->
              <span class="w-8 font-display text-lg font-black text-sage dark:text-paper-400">
                {{ i < 3 ? MEDALS[i] : i + 1 }}
              </span>

              <!-- Avatar -->
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper-100 font-display text-sm font-black text-scholar-700 dark:bg-white/10 dark:text-scholar-100">
                {{ getInitials(entry.full_name || entry.username) }}
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <p class="truncate font-display text-base font-black tracking-tight">
                  {{ entry.username }}
                  <span v-if="entry.is_me || entry.isYou" class="ml-2 text-[10px] uppercase text-scholar-600 font-black tracking-widest">(You)</span>
                </p>
                <span class="text-[10px] font-black uppercase tracking-widest text-sage">
                   {{ entry.tier || 'Scholar' }} Rank
                </span>
              </div>

              <!-- Score -->
              <div class="text-right">
                <p class="font-mono text-lg font-black text-scholar-700 dark:text-scholar-100">
                  {{ activeTab === 'weekly' ? `${entry.weekly_xp ?? 0} XP` : `${Math.round(entry.score || 0)}%` }}
                </p>
              </div>
            </li>
          </ol>

          <!-- Empty State -->
          <div v-if="lbStore.entries.length === 0" class="flex flex-col items-center gap-3 py-12 text-sage">
            <span class="text-4xl">📊</span>
            <p class="text-sm font-bold">No rankings yet. Be the first to complete a session!</p>
          </div>

          <!-- Floating User Rank (If off-board) -->
          <div v-if="lbStore.myRank && lbStore.myRank > lbStore.entries.length" class="mt-8 rounded-3xl border-2 border-dashed border-scholar-600/30 bg-white p-6 dark:bg-white/5">
             <div class="flex items-center justify-between">
                <p class="font-display font-black">Your current standing</p>
                <span class="rounded-xl bg-scholar-600 px-4 py-2 font-mono font-black text-white">#{{ lbStore.myRank }}</span>
             </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLeaderboardStore } from '~/stores/leaderboardStore'
import { useUserStore } from '~/stores/userStore'

definePageMeta({ layout: 'default' })
useHead({ title: 'Leaderboard — MASTERY' })

const lbStore = useLeaderboardStore()
const userStore = useUserStore()

const MEDALS = ['🥇', '🥈', '🥉']
const activeTab = ref<'subject' | 'global' | 'weekly'>('global')
const isOnLeaderboard = ref(true)

const tabs: Array<{ id: 'subject' | 'global' | 'weekly'; label: string }> = [
  { id: 'subject', label: 'Field' },
  { id: 'global', label: 'Global' },
  { id: 'weekly', label: 'Weekly' },
]

const getInitials = (name: string) => {
  if (!name) return 'SC'
  return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')
}

const loadLeaderboard = async () => {
  const subject = activeTab.value === 'subject' ? userStore.currentSubject || undefined : undefined
  await lbStore.fetchLeaderboard(activeTab.value, subject)
}

const optIn = () => { isOnLeaderboard.value = true }

onMounted(loadLeaderboard)
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }
.animate-reveal { animation: reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
@keyframes reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.reveal-visible { animation: reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
</style>