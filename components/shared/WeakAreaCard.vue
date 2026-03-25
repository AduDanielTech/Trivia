<template>
  <section v-if="userStore.weakSubjects.length > 0" class="rounded-3xl border border-scholar-600/20 bg-white p-7 shadow-sm dark:bg-white/5">
    <div class="mb-6 flex items-start justify-between">
      <div class="space-y-1">
        <h3 class="font-display text-xl font-black tracking-tight">Priority Focus</h3>
        <p class="text-xs font-bold uppercase tracking-widest text-scholar-600">AI Recommendation</p>
      </div>
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-scholar-100 text-scholar-700 dark:bg-scholar-900/40 dark:text-scholar-100">
        <span class="text-lg">⚠️</span>
      </div>
    </div>

    <div class="space-y-5">
      <div v-for="item in userStore.weakSubjects.slice(0, 2)" :key="item.subject" class="space-y-2">
        <div class="flex items-center justify-between text-sm font-bold">
          <span class="text-paper-800 dark:text-paper-100">{{ item.subject }}</span>
          <span class="text-error font-black">{{ item.score }}% Mastery</span>
        </div>
        <div class="h-1.5 w-full rounded-full bg-paper-100 dark:bg-white/10">
          <div 
            class="h-full rounded-full bg-error transition-all duration-1000" 
            :style="{ width: item.score + '%' }" 
          />
        </div>
      </div>
    </div>

    <button 
      @click="router.push('/quiz?mode=targeted')" 
      class="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-paper-900 py-4 text-sm font-black text-white transition hover:bg-black dark:bg-scholar-600 dark:hover:bg-scholar-700"
    >
      Fix Weak Areas
      <span class="text-lg">→</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/index'
const userStore = useUserStore()
const router = useRouter()
</script>