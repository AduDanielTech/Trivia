<template>
  <div class="rounded-3xl border border-paper-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
    <!-- Header -->
    <div class="mb-8 flex items-end justify-between border-b border-paper-100 pb-6 dark:border-white/5">
      <div class="space-y-1">
        <h3 class="font-display text-xl font-black text-paper-900 dark:text-white">Rank Progression</h3>
        <p class="text-sm font-bold text-paper-600 dark:text-paper-300">
          XP to next rank: <span class="text-scholar-600 dark:text-scholar-400">{{ xpToNext }}</span>
        </p>
      </div>
      <div class="text-right">
        <span class="text-3xl font-black text-scholar-700 dark:text-scholar-100">{{ userStore.xp.toLocaleString() }}</span>
        <p class="text-[10px] font-black uppercase tracking-widest text-paper-500 dark:text-paper-400">Total XP</p>
      </div>
    </div>

    <!-- The Progress Track -->
    <div class="space-y-6">
      <div 
        v-for="tier in reversedTiers" 
        :key="tier.id"
        class="relative flex items-center gap-6"
        :class="{ 'opacity-100': !isTierLocked(tier), 'opacity-50': isTierLocked(tier) }"
      >
        <!-- Connector Line -->
        <div 
          v-if="tier.id !== 'rookie'" 
          class="absolute bottom-[-1.5rem] left-[1.2rem] h-6 w-0.5 bg-paper-200 dark:bg-white/10"
        />

        <!-- Rank Icon -->
        <div 
          class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all"
          :class="tier.id === currentTier.id 
            ? 'border-scholar-600 bg-scholar-50 text-scholar-700 shadow-sm dark:bg-scholar-900/30 dark:text-scholar-100' 
            : 'border-paper-200 bg-paper-50 text-paper-500 dark:border-white/10 dark:bg-white/5 dark:text-paper-400'"
        >
          <span class="text-lg">{{ tier.icon }}</span>
          <!-- "You are here" Indicator -->
          <div v-if="tier.id === currentTier.id" class="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-scholar-600" />
        </div>

        <!-- Rank Info -->
        <div class="flex flex-1 items-center justify-between">
          <div class="space-y-0.5">
            <p 
              class="text-sm font-black tracking-tight" 
              :class="tier.id === currentTier.id ? 'text-scholar-700 dark:text-scholar-100' : 'text-paper-900 dark:text-paper-200'"
            >
              {{ tier.name }}
            </p>
            <p class="text-[10px] font-bold text-paper-500 dark:text-paper-400">
              {{ tier.minXP.toLocaleString() }} XP Required
            </p>
          </div>
          <span v-if="isTierCompleted(tier)" class="text-scholar-600 font-bold">✓</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore, TIERS } from '~/stores/index'

const userStore = useUserStore()
const currentTier = computed(() => userStore.currentTier)
const nextTier = computed(() => userStore.nextTier)
const reversedTiers = computed(() => [...TIERS].reverse())

const xpToNext = computed(() => nextTier.value ? nextTier.value.minXP - userStore.xp : 0)
const isTierCompleted = (tier: any) => userStore.xp >= tier.maxXP
const isTierLocked = (tier: any) => userStore.xp < tier.minXP
</script>