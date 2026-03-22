<template>
  <section
    v-if="userStore.weakSubjects.length > 0"
    class="bg-navy-700 border border-red-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(255,79,109,0.05)]"
    role="region" aria-labelledby="weak-area-heading"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-5">
      <div class="flex items-start gap-2.5">
        <span aria-hidden="true" class="text-red-500 text-xl mt-0.5 flex-shrink-0">⚠</span>
        <div>
          <h3 id="weak-area-heading" class="text-sm font-bold text-white tracking-tight">Weak Area Spotlight</h3>
          <p class="text-[11px] text-navy-400 mt-0.5">AI-identified gaps in your knowledge</p>
        </div>
      </div>
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-red-500/10 text-red-500 border border-red-500/25 flex-shrink-0">
        Fix now
      </span>
    </div>

    <!-- Subject list -->
    <ul class="flex flex-col gap-3 mb-5" role="list" aria-label="Your weak subjects">
      <li
        v-for="(item, index) in displayedWeakSubjects"
        :key="item.subject"
        class="flex items-center gap-3 animate-fade-in"
        :style="{ animationDelay: `${index * 80}ms` }"
      >
        <div class="flex-1 min-w-0">
          <span :id="`weak-s-${index}`" class="block text-[13px] font-semibold text-white mb-1.5">
            {{ item.subject }}
          </span>
          <div class="h-1.5 bg-navy-600 rounded-full overflow-hidden"
            role="progressbar" :aria-valuenow="item.score" aria-valuemin="0" aria-valuemax="100"
            :aria-labelledby="`weak-s-${index}`"
          >
            <div class="h-full rounded-full transition-all duration-1000"
              :style="{ width: item.score + '%', background: getScoreColor(item.score) }" />
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 flex-shrink-0">
          <span class="font-mono text-xs font-bold" :style="{ color: getScoreColor(item.score) }"
            :aria-label="`${item.subject}: ${item.score}%`">
            {{ item.score }}%
          </span>
          <button
            class="text-[11px] font-semibold text-navy-400 hover:text-gold-500 transition-colors bg-transparent border-none cursor-pointer p-0 whitespace-nowrap"
            :aria-label="`Start targeted practice for ${item.subject}. Current score: ${item.score}%`"
            @click="startTargetedSession(item.subject)"
          >Fix it →</button>
        </div>
      </li>
    </ul>

    <!-- CTA -->
    <div class="border-t border-navy-600 pt-4">
      <button
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all duration-200 shadow-cta"
        aria-label="Start a session focusing on all weak areas"
        @click="startAllWeakSession"
      >
        <span aria-hidden="true">🎯</span>
        Practice All Weak Areas
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/index'
const userStore = useUserStore()
const router    = useRouter()
const sound     = useSound()

const displayedWeakSubjects = computed(() => userStore.weakSubjects.slice(0, 3))
const getScoreColor = (score: number) =>
  score < 40 ? 'var(--red-500, #FF4F6D)'
  : score < 65 ? '#FF9500'
  : 'var(--green-500, #00E5A0)'

const startTargetedSession = (subject: string) => {
  sound.playClick()
  router.push(`/quiz?subject=${encodeURIComponent(subject)}&mode=targeted`)
}
const startAllWeakSession = () => {
  sound.playClick()
  router.push('/quiz?mode=weak-areas')
}
</script>
