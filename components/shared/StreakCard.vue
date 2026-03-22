<template>
  <div class="bg-navy-700 border border-navy-500 rounded-xl p-5" role="region" aria-labelledby="streak-heading">

    <!-- Header -->
    <div class="flex items-center gap-4 mb-5">
      <div class="flex items-center gap-1 flex-shrink-0" aria-hidden="true">
        <span class="text-3xl animate-flame">🔥</span>
        <span class="font-mono text-3xl font-extrabold text-gold-500">{{ userStore.streak }}</span>
      </div>
      <div>
        <h3 id="streak-heading" class="text-sm font-bold text-white">Daily Streak</h3>
        <p class="text-xs mt-0.5 transition-colors"
          :class="userStore.streakAtRisk ? 'text-red-400 font-semibold' : 'text-navy-400'"
          role="status" :aria-label="streakStatusAria">
          {{ userStore.streakAtRisk ? '⚠ Streak at risk today!' : `${userStore.streak} day${userStore.streak !== 1 ? 's' : ''} in a row` }}
        </p>
      </div>
    </div>

    <!-- Freeze tokens -->
    <div class="border-t border-navy-600 pt-4">
      <div class="flex items-center gap-1.5 mb-3">
        <span class="text-xs font-bold uppercase tracking-widest text-navy-400">🛡 Streak Freeze Tokens</span>
        <button
          tabindex="0" role="button"
          class="w-4 h-4 rounded-full bg-navy-500 text-navy-400 text-[10px] flex items-center justify-center cursor-pointer hover:bg-navy-400 hover:text-white transition-colors"
          aria-label="What are streak freeze tokens?"
          @click="showInfo = !showInfo" @keydown.enter="showInfo = !showInfo" @keydown.space.prevent="showInfo = !showInfo"
        >?</button>
      </div>

      <Transition name="info">
        <div v-if="showInfo"
          class="bg-navy-600 rounded-md px-3 py-2 text-[11px] text-navy-400 leading-relaxed mb-3"
          role="note" aria-live="polite">
          Streak freeze tokens protect your streak if you miss a day. You earn one every 7 days.
        </div>
      </Transition>

      <div class="flex gap-2 mb-4" role="list">
        <div
          v-for="i in maxTokens" :key="i"
          class="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border"
          :class="i <= userStore.streakFreezeTokens
            ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
            : 'bg-navy-600 border-navy-500'"
          role="listitem"
          :aria-label="`Token ${i}: ${i <= userStore.streakFreezeTokens ? 'available' : 'used'}`"
        >
          <span aria-hidden="true">{{ i <= userStore.streakFreezeTokens ? '🛡' : '◌' }}</span>
        </div>
      </div>

      <button
        v-if="userStore.streakAtRisk && userStore.streakFreezeTokens > 0"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-navy-500 bg-transparent text-sm font-semibold text-white hover:bg-navy-600 hover:border-navy-400 transition-all duration-200"
        :aria-label="`Use a streak freeze token. You have ${userStore.streakFreezeTokens} remaining.`"
        @click="useFreeze"
      >
        <span aria-hidden="true">🛡</span> Use Freeze Token
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/index'
const userStore = useUserStore()
const sound     = useSound()
const showInfo  = ref(false)
const maxTokens = 3

const streakStatusAria = computed(() =>
  userStore.streakAtRisk
    ? `Warning: your ${userStore.streak}-day streak is at risk. You have ${userStore.streakFreezeTokens} freeze tokens.`
    : `You are on a ${userStore.streak}-day streak.`
)
const useFreeze = () => { userStore.useStreakFreeze(); sound.playSuccess() }
</script>

<style scoped>
.info-enter-active, .info-leave-active { transition: all 0.2s ease; }
.info-enter-from, .info-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
