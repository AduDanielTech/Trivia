<template>
  <div class="min-h-screen bg-navy-900 pb-24 md:pb-12">
    <div class="max-w-[640px] mx-auto px-6 py-8 flex flex-col gap-5">

      <header class="animate-fade-in">
        <h1 class="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white mb-1">
          <span aria-hidden="true">▲</span> Leaderboard
        </h1>
        <p class="text-sm text-navy-400" aria-live="polite">
          {{ loading ? 'Loading…' : `${displayedEntries.length} students ranked` }}
        </p>
      </header>

      <!-- Tabs -->
      <div class="flex bg-navy-700 border border-navy-500 rounded-xl p-1 gap-1 animate-fade-in"
        style="animation-delay:100ms" role="tablist" aria-label="Leaderboard scope">
        <button v-for="tab in tabs" :key="tab.id"
          class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150"
          :class="activeTab === tab.id ? 'bg-navy-600 text-gold-500' : 'bg-transparent text-navy-400 hover:text-white'"
          role="tab" :aria-selected="activeTab === tab.id"
          :id="`tab-${tab.id}`" :aria-controls="`panel-${tab.id}`"
          @click="activeTab = tab.id; loadLeaderboard()">
          {{ tab.label }}
        </button>
      </div>

      <!-- Opt-out notice -->
      <div v-if="!isOnLeaderboard"
        class="flex items-center gap-3 px-4 py-3 bg-navy-700 border border-navy-500 rounded-xl text-sm text-navy-400"
        role="status" aria-live="polite">
        <span aria-hidden="true">🔒</span>
        <span class="flex-1">You are not on the public leaderboard.</span>
        <button class="px-3 py-1 rounded-full border border-gold-600 text-gold-500 text-xs font-bold bg-transparent hover:bg-gold-500/10 transition-all cursor-pointer"
          @click="optIn">Join</button>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="flex flex-col gap-1.5 animate-fade-in" aria-busy="true" aria-label="Loading leaderboard">
        <div v-for="i in 7" :key="i"
          class="h-[60px] rounded-xl bg-gradient-to-r from-navy-700 via-navy-600 to-navy-700 bg-[length:200%] animate-shimmer" aria-hidden="true" />
      </div>

      <!-- Board -->
      <div v-else :id="`panel-${activeTab}`" role="tabpanel" :aria-labelledby="`tab-${activeTab}`"
        class="animate-fade-in" style="animation-delay:200ms">
        <ol role="list" aria-label="Leaderboard rankings" class="flex flex-col gap-1.5 list-none">
          <li v-for="(entry, i) in displayedEntries" :key="entry.id"
            class="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150"
            :class="entry.isYou
              ? 'bg-gold-500/[0.04] border-gold-500/30'
              : 'bg-navy-700 border-navy-500 hover:bg-navy-600'"
            :aria-current="entry.isYou ? 'true' : undefined"
            :aria-label="`Rank ${i + 1}: ${entry.username}. Score: ${entry.score}%. Tier: ${entry.tier}.${entry.isYou ? ' This is you.' : ''}`"
            :style="{ animationDelay: `${i * 40}ms` }"
          >
            <!-- Rank -->
            <span class="w-8 text-center font-mono text-sm text-navy-400 flex-shrink-0" aria-hidden="true">
              {{ i < 3 ? MEDALS[i] : `#${i + 1}` }}
            </span>

            <!-- Avatar -->
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" aria-hidden="true">
              {{ entry.initials }}
            </div>

            <!-- Name + tier -->
            <div class="flex-1 flex items-center gap-2 flex-wrap min-w-0">
              <span class="text-sm font-semibold text-white truncate">
                {{ entry.username }}
                <span v-if="entry.isYou" class="text-gold-500 text-xs"> (You)</span>
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500">
                {{ entry.tier }}
              </span>
            </div>

            <!-- Score / XP -->
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span class="font-mono text-sm font-bold text-navy-400" aria-hidden="true">{{ entry.score }}%</span>
              <span v-if="activeTab === 'weekly'"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-gold-500/10 text-gold-500 border border-gold-500/30"
                aria-hidden="true">
                +{{ entry.weeklyXp ?? 0 }} XP
              </span>
            </div>
          </li>

          <!-- Empty state -->
          <li v-if="!loading && displayedEntries.length === 0"
            class="flex flex-col items-center gap-3 py-12 text-navy-400" role="listitem">
            <span class="text-4xl" aria-hidden="true">📊</span>
            <p class="text-sm">No rankings yet. Be the first to complete a session!</p>
          </li>
        </ol>
      </div>

      <!-- Your rank if off list -->
      <div v-if="userRank && userRank > displayedEntries.length && isOnLeaderboard"
        class="flex items-center justify-between px-4 py-3.5 bg-gold-500/[0.04] border border-dashed border-gold-500/20 rounded-xl"
        role="status" :aria-label="`Your rank is ${userRank}`">
        <span class="font-mono text-sm font-bold text-gold-500">Your rank: #{{ userRank }}</span>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500">
          Keep practicing to climb!
        </span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/index'

definePageMeta({ layout: 'default' })
useHead({ title: 'Leaderboard — TRIVIA' })

const authStore = useAuthStore()
const userStore = useUserStore()
const { fetchLeaderboard } = useSessionPersist()

const MEDALS      = ['🥇', '🥈', '🥉']
const activeTab   = ref<'subject' | 'global' | 'weekly'>('subject')
const loading     = ref(true)
const isOnLeaderboard = ref(true)
const userRank    = ref<number | null>(null)

const tabs = [
  { id: 'subject', label: 'My Subject' },
  { id: 'global',  label: 'Global'     },
  { id: 'weekly',  label: 'This Week'  },
]

// Build mock entries — "You" row always uses the real logged-in user
const buildMockEntries = () => {
  const realName     = userStore.username || authStore.userName || 'You'
  const realInitials = userStore.avatar || realName.split(' ').slice(0, 2).map((n: string) => n[0]?.toUpperCase() ?? '').join('')
  const realTier     = userStore.currentTier.name
  const realScore    = userStore.averageScore || 72
  return [
    { id: '1',   username: 'Adaeze Obi',    initials: 'AO', score: 94, tier: 'Legend',   isYou: false, weeklyXp: 820 },
    { id: '2',   username: 'Emeka Nwosu',   initials: 'EN', score: 91, tier: 'Legend',   isYou: false, weeklyXp: 750 },
    { id: '3',   username: 'Fatima Bello',  initials: 'FB', score: 88, tier: 'Champion', isYou: false, weeklyXp: 680 },
    { id: 'you', username: realName,        initials: realInitials, score: realScore, tier: realTier, isYou: true, weeklyXp: 420 },
    { id: '5',   username: 'Ngozi Eze',     initials: 'NE', score: 68, tier: 'Expert',   isYou: false, weeklyXp: 380 },
    { id: '6',   username: 'Tunde Adeyemi', initials: 'TA', score: 61, tier: 'Scholar',  isYou: false, weeklyXp: 310 },
    { id: '7',   username: 'Kemi Williams', initials: 'KW', score: 55, tier: 'Scholar',  isYou: false, weeklyXp: 260 },
  ]
}

const displayedEntries = ref<ReturnType<typeof buildMockEntries>>(buildMockEntries())

const loadLeaderboard = async () => {
  loading.value = true
  const scope = activeTab.value === 'weekly' ? 'weekly' : 'global'
  const data  = await fetchLeaderboard(scope, 50)

  if (data && data.length > 0) {
    displayedEntries.value = data.map((row: any, i: number) => {
      const isYou = row.id === authStore.user?.id
      if (isYou) userRank.value = i + 1
      return {
        id:        row.id,
        username:  isYou ? (userStore.username || row.username || 'You') : (row.username ?? 'Anonymous'),
        initials:  isYou
          ? (userStore.avatar || (row.full_name ?? row.username ?? 'AN').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2))
          : (row.full_name ?? row.username ?? 'AN').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        score:     Math.round(row.average_score ?? 0),
        tier:      row.tier ?? 'Rookie',
        isYou,
        weeklyXp:  row.weekly_xp ?? 0,
      }
    })
  } else {
    displayedEntries.value = buildMockEntries()
  }
  loading.value = false
}

const optIn = () => { isOnLeaderboard.value = true }

onMounted(loadLeaderboard)
</script>
