<template>
  <section
    class="bg-navy-700 border border-navy-500 rounded-xl p-6 shadow-card"
    aria-labelledby="ladder-heading"
    role="region"
  >
    <div class="mb-5">
      <h2 id="ladder-heading" class="flex items-center gap-2 text-base font-bold text-white tracking-tight">
        <span aria-hidden="true" class="text-gold-500 text-lg">♛</span>
        Millionaire Ladder
      </h2>
      <p id="ladder-desc" class="text-xs text-navy-400 mt-1">Your progression from Rookie to Legend</p>
    </div>

    <!-- Current tier banner -->
    <div
      class="flex items-center justify-between gap-4 rounded-lg p-4 mb-4 bg-black/20 border"
      :style="{ borderLeftWidth: '3px', borderLeftColor: currentTier.color, borderColor: currentTier.color + '40' }"
      role="status"
      :aria-label="`Current tier: ${currentTier.name}. ${currentTier.ariaDesc}`"
    >
      <div class="flex items-center gap-3">
        <span class="text-4xl" aria-hidden="true">{{ currentTier.icon }}</span>
        <div>
          <div class="text-[10px] uppercase tracking-widest text-navy-400 font-semibold">Current Tier</div>
          <div class="text-2xl font-extrabold tracking-tight text-shimmer mt-0.5">{{ currentTier.name }}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="flex items-baseline gap-1 justify-end">
          <span class="font-mono text-2xl font-bold text-white">{{ userStore.xp.toLocaleString() }}</span>
          <span class="font-mono text-[10px] uppercase tracking-widest text-navy-400">XP</span>
        </div>
        <div v-if="nextTier" class="text-[11px] text-navy-400 font-mono mt-1">
          {{ xpToNext.toLocaleString() }} XP to {{ nextTier.name }}
        </div>
        <div v-else class="text-[11px] text-gold-500 font-mono mt-1">Maximum tier reached</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="nextTier" class="mb-5"
      role="progressbar" :aria-valuenow="userStore.tierProgress" aria-valuemin="0" aria-valuemax="100"
      :aria-label="`Progress to ${nextTier.name}: ${userStore.tierProgress}%`"
    >
      <div class="flex justify-between items-center mb-1.5">
        <span class="font-mono text-[11px] text-navy-400">{{ currentTier.name }}</span>
        <span class="font-mono text-xs font-bold text-gold-500">{{ userStore.tierProgress }}%</span>
        <span class="font-mono text-[11px] text-navy-400">{{ nextTier.name }}</span>
      </div>
      <div class="h-2 bg-navy-600 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-700"
          :style="{ width: userStore.tierProgress + '%' }" />
      </div>
    </div>

    <!-- Ladder steps -->
    <ol class="flex flex-col gap-0 relative mb-3" aria-label="Rank progression ladder">
      <li
        v-for="(tier, index) in reversedTiers"
        :key="tier.id"
        class="flex items-stretch relative animate-fade-in"
        :class="isTierLocked(tier) ? 'opacity-40' : 'opacity-100'"
        :style="{ animationDelay: `${index * 60}ms` }"
        :aria-current="tier.id === currentTier.id ? 'true' : undefined"
        :aria-label="getLadderStepAriaLabel(tier)"
      >
        <div v-if="index < reversedTiers.length - 1"
          class="absolute left-[18px] top-10 bottom-[-4px] w-0.5 bg-navy-500 z-0" aria-hidden="true" />

        <div class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mb-1 z-10 transition-colors duration-200"
          :class="tier.id === currentTier.id ? 'bg-gold-500/[0.06] border border-gold-500/20' : ''"
        >
          <!-- Step icon -->
          <div class="flex-shrink-0">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all duration-200"
              :class="tier.id === currentTier.id
                ? 'border-yellow-400 bg-yellow-400/10 animate-pulse-gold'
                : isTierCompleted(tier)
                ? 'border-green-600 bg-green-500/10'
                : 'border-navy-500 bg-navy-600'"
              :style="tier.id === currentTier.id ? { color: tier.color } : isTierCompleted(tier) ? { color: '#00E5A0' } : { color: '#8A95A8' }"
            >
              <span v-if="isTierCompleted(tier)" class="text-sm font-black">✓</span>
              <span v-else>{{ tier.icon }}</span>
            </div>
          </div>

          <!-- Step info -->
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold"
              :style="tier.id === currentTier.id ? { color: tier.color } : { color: '#F5F0E8' }">
              {{ tier.name }}
            </div>
            <div class="font-mono text-[11px] text-navy-400 mt-0.5">
              {{ tier.minXP.toLocaleString() }} – {{ tier.maxXP.toLocaleString() }} XP
            </div>
          </div>

          <!-- Badge -->
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            <span v-if="isTierCompleted(tier)"
              class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-500/10 text-green-500 border border-green-500/20">
              Completed
            </span>
            <span v-else-if="tier.id === currentTier.id"
              class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-gold-500/10 text-gold-500 border border-gold-500/30">
              You are here
            </span>
            <span v-else
              class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500">
              Locked
            </span>
            <span v-if="tier.id === currentTier.id"
              class="w-2 h-2 rounded-full bg-gold-500 animate-pulse-gold block" aria-hidden="true" />
          </div>
        </div>
      </li>
    </ol>

    <!-- Footer -->
    <div class="border-t border-navy-600 pt-3" aria-live="polite" role="status">
      <p class="text-xs text-navy-400 flex items-center gap-1.5 leading-relaxed">
        <span aria-hidden="true">⚡</span>
        {{ motivationMessage }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useUserStore, TIERS } from '~/stores/index'

const userStore     = useUserStore()
const currentTier   = computed(() => userStore.currentTier)
const nextTier      = computed(() => userStore.nextTier)
const xpToNext      = computed(() => nextTier.value ? nextTier.value.minXP - userStore.xp : 0)
const reversedTiers = computed(() => [...TIERS].reverse())

const isTierCompleted = (tier: typeof TIERS[0]) => userStore.xp >= tier.maxXP
const isTierLocked    = (tier: typeof TIERS[0]) => userStore.xp < tier.minXP

const getLadderStepAriaLabel = (tier: typeof TIERS[0]) => {
  if (tier.id === currentTier.value.id)
    return `${tier.name} — Current tier. ${tier.ariaDesc} Range: ${tier.minXP} to ${tier.maxXP} XP.`
  if (isTierCompleted(tier))
    return `${tier.name} — Completed. Range: ${tier.minXP} to ${tier.maxXP} XP.`
  return `${tier.name} — Locked. Requires ${tier.minXP} XP.`
}

const motivationMessage = computed(() => {
  if (currentTier.value.id === 'legend') return 'You have reached the pinnacle. You are a Legend!'
  const xp = xpToNext.value
  if (xp <= 100) return `Just ${xp} XP away from ${nextTier.value?.name}! Almost there!`
  if (xp <= 300) return `${xp} XP to ${nextTier.value?.name}. Keep pushing!`
  return `${xp} XP to your next tier. Stay consistent.`
})
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
