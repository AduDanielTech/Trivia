<template>
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
          {{ tab.label }}
        </button>
      </div>

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
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500">
                {{ entry.tier }}
              </span>
            </div>

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
  </div>
</template>

<script setup lang="ts">
import { useLeaderboardStore } from '~/stores/leaderboardStore'
import { useUserStore         } from '~/stores/userStore'

definePageMeta({ layout: 'default' })
useHead({ title: 'Leaderboard — TRIVIA' })

const lbStore   = useLeaderboardStore()
const userStore = useUserStore()

const MEDALS    = ['🥇', '🥈', '🥉']
const activeTab = ref<'subject' | 'global' | 'weekly'>('global')

const tabs = [
  { id: 'subject', label: 'My Subject' },
  { id: 'global',  label: 'Global'     },
  { id: 'weekly',  label: 'This Week'  },
]

const displayedEntries = computed(() => lbStore.entries)

const getInitials = (name: string) =>
  (name || 'AN').split(' ').slice(0, 2).map((n: string) => n[0]?.toUpperCase() ?? '').join('')

const loadLeaderboard = async () => {
  const subject = activeTab.value === 'subject' ? userStore.currentSubject || undefined : undefined
  await lbStore.fetchLeaderboard(activeTab.value as any, subject)
}

onMounted(loadLeaderboard)
</script>
