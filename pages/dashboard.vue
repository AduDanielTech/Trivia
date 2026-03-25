<template>
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <!-- Screen Reader Announcement -->
    <div aria-live="polite" class="sr-only">{{ userStore.liveAnnouncement }}</div>

    <main class="mx-auto max-w-6xl px-5 pb-24 pt-10">
      
      <!-- 01. HEADER: Greeting & Context -->
      <header class="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div class="space-y-2">
          <p class="inline-flex items-center gap-2 rounded-full bg-scholar-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-scholar-700 dark:bg-scholar-900/30 dark:text-scholar-100">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-scholar-600" />
            Control Center
          </p>
          <h1 class="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Focus, <span class="text-scholar-600">{{ firstName }}.</span>
          </h1>
          <p class="max-w-prose text-base font-semibold text-sage dark:text-paper-200">
            {{ userStore.field }} • Level {{ userStore.level }} • 
            <span class="text-scholar-700 dark:text-scholar-100">{{ userStore.currentTier.name }}</span>
          </p>
        </div>

        <!-- Quick Settings Lobby -->
        <div class="flex items-center gap-3 rounded-2xl border border-paper-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div class="flex items-center px-4">
            <span class="mr-3 text-[10px] font-black uppercase tracking-widest text-sage">Duration</span>
            <select v-model="selectedLen" class="bg-transparent font-display text-sm font-bold text-scholar-600 outline-none">
              <option :value="5">5 Mins</option>
              <option :value="10">10 Mins</option>
            </select>
          </div>
          <div class="h-6 w-px bg-paper-200 dark:bg-white/10" />
          <button 
            @click="sound.toggle" 
            class="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-paper-50 dark:hover:bg-white/5"
            :aria-label="sound.isEnabled.value ? 'Mute' : 'Unmute'"
          >
            <span class="text-xl">{{ sound.isEnabled.value ? '🔊' : '🔇' }}</span>
          </button>
        </div>
      </header>

      <!-- 02. DASHBOARD GRID -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        <!-- LEFT WING (Cols 1-8): Primary Progress -->
        <div class="space-y-8 lg:col-span-8">
          
          <!-- Recaps & CTA -->
          <div class="grid gap-6 md:grid-cols-3">
            <!-- Last Session Recap -->
            <div class="group rounded-3xl border border-paper-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5">
              <p class="text-[10px] font-black uppercase tracking-widest text-sage">Last Session</p>
              <div class="mt-2 flex items-baseline gap-2">
                <span class="text-3xl font-black">{{ userStore.lastSessionScore || 0 }}%</span>
                <span class="text-xs font-bold text-scholar-600">+4% Improvement</span>
              </div>
            </div>

            <!-- START CTA -->
            <NuxtLink 
              :to="startHref" 
              class="group relative flex flex-col justify-center overflow-hidden rounded-3xl bg-scholar-600 p-6 text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-scholar-700 md:col-span-2"
            >
              <div class="relative z-10 flex items-center justify-between">
                <div class="space-y-1">
                  <h2 class="font-display text-2xl font-black">Begin Practice</h2>
                  <p class="text-sm font-medium opacity-80">{{ selectedLen }} questions selected.</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white/30">
                  <span class="ml-1 text-xl">▶</span>
                </div>
              </div>
              <div class="absolute -right-4 -top-4 h-24 w-24 animate-float rounded-full bg-white/10 blur-2xl" />
            </NuxtLink>
          </div>

          <!-- Millionaire Ladder Section -->
          <section class="reveal">
            <MillionaireLadder />
          </section>

          <!-- Performance Snapshot Grid -->
          <div class="grid gap-6 md:grid-cols-2">
            <div v-for="(score, subject) in userStore.subjectScores" :key="subject" 
                 class="reveal rounded-3xl border border-paper-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
              <div class="flex items-center justify-between mb-4">
                <span class="font-display text-sm font-bold">{{ subject }}</span>
                <span class="text-sm font-black text-scholar-600">{{ score }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-paper-100 dark:bg-white/10">
                <div 
                  class="h-full rounded-full bg-scholar-600 transition-all duration-1000" 
                  :style="{ width: score + '%' }" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT WING (Cols 9-12): Maintenance & Social -->
        <aside class="space-y-8 lg:col-span-4">
          <!-- Streak Card -->
          <div class="reveal">
            <StreakCard />
          </div>

          <!-- Weak Area Spotlight -->
          <div class="reveal">
            <WeakAreaSpotlight />
          </div>

          <!-- Achievements Sidebar -->
          <section class="reveal rounded-3xl border border-paper-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <h3 class="mb-5 text-[10px] font-black uppercase tracking-widest text-sage">Milestones</h3>
            <div class="space-y-4">
              <div v-for="a in userStore.achievements.slice(0, 3)" :key="a.id" 
                   class="flex items-center gap-4 transition hover:translate-x-1" 
                   :class="a.earned ? 'opacity-100' : 'opacity-40'">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-50 text-xl dark:bg-white/5">
                  {{ a.icon }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold">{{ a.name }}</p>
                  <p class="text-[10px] font-medium text-sage">{{ a.earned ? 'Earned' : 'Locked' }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Sync Notes CTA -->
          <NuxtLink to="/upload" class="reveal group block rounded-3xl border-2 border-dashed border-paper-200 p-6 transition hover:border-scholar-600 hover:bg-scholar-50 dark:border-white/10 dark:hover:bg-white/5">
            <div class="flex items-center gap-4">
              <span class="text-3xl transition group-hover:rotate-12">📄</span>
              <div class="space-y-1">
                <p class="text-sm font-black tracking-tight">AI Note Sync</p>
                <p class="text-xs font-medium text-sage">Generate quizzes from notes</p>
              </div>
            </div>
          </NuxtLink>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/index'
import MillionaireLadder from '~/components/ladder/MillionaireLadder.vue'
import StreakCard from '~/components/shared/StreakCard.vue'
import WeakAreaSpotlight from '~/components/shared/WeakAreaCard.vue'

const userStore = useUserStore()
const sound = useSound()

const selectedLen = ref(10)
const firstName = computed(() => (userStore.firstName || 'Student').split(' ')[0])

const startHref = computed(() => {
  const sub = encodeURIComponent(userStore.field || 'Mathematics')
  return `/quiz?subject=${sub}&len=${selectedLen.value}`
})

// Simple Intersection Observer for scroll animations
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('reveal-visible')
    })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2316a34a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 0.8rem;
  padding-right: 1.2rem;
}
</style>