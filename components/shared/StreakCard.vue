<template>
  <div 
    class="rounded-3xl border-2 p-7 transition-all duration-500"
    :class="userStore.streakAtRisk ? 'border-error/20 bg-error/5 animate-pulse' : 'border-paper-200 bg-white dark:border-white/10 dark:bg-white/5'"
  >
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-sage">Current Streak</h3>
        <div class="flex items-baseline gap-2">
          <span class="font-display text-5xl font-black text-scholar-700 dark:text-scholar-100">{{ userStore.streak }}</span>
          <span class="text-xl">🔥</span>
        </div>
      </div>
      <div class="text-right">
        <p :class="userStore.streakAtRisk ? 'text-error font-black' : 'text-scholar-600 font-bold'" class="text-xs uppercase tracking-tighter">
          {{ userStore.streakAtRisk ? 'Risk: Practice Now' : 'Keep the flame alive' }}
        </p>
      </div>
    </div>

    <div class="my-6 h-px w-full bg-paper-100 dark:bg-white/5" />

    <!-- Freeze Tokens -->
    <div class="space-y-4">
      <p class="text-[10px] font-black uppercase tracking-widest text-sage">Streak Freezes</p>
      <div class="flex gap-3">
        <div 
          v-for="i in 3" 
          :key="i"
          class="flex h-12 w-full items-center justify-center rounded-2xl border-2 transition-all"
          :class="i <= userStore.streakFreezeTokens ? 'border-scholar-600/20 bg-scholar-50 text-scholar-600 dark:bg-scholar-900/20' : 'border-paper-100 bg-paper-50 opacity-30 dark:border-white/5 dark:bg-white/5'"
        >
          <span class="text-xl">🛡️</span>
        </div>
      </div>
      <p class="text-[10px] font-medium leading-relaxed text-sage">
        Protects your streak if you miss a day. Earn more by reaching new XP milestones.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/index'
const userStore = useUserStore()
</script>