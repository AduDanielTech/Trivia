<template>
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <!-- Accessibility: Hidden announcer -->
    <div aria-live="polite" class="sr-only">{{ userStore.liveAnnouncement }}</div>

    <main class="mx-auto max-w-6xl px-6 pb-24 pt-12 md:pt-20">
      
      <!-- 01. DASHBOARD HEADER: Identity & Quick Settings -->
      <header class="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end animate-reveal">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full bg-scholar-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-scholar-700 dark:bg-scholar-600/20 dark:text-scholar-100">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-scholar-600" />
            Scholar Profile
          </div>
          <h1 class="font-display text-4xl font-black tracking-tight md:text-6xl">
            Focus, <span class="text-scholar-600">{{ firstName }}.</span>
          </h1>
          <p class="text-lg font-medium text-sage dark:text-paper-400">
            {{ userStore.currentSubject?.toUpperCase() || 'GENERAL STUDIES' }} • 
            Level {{ userStore.profile?.level || 1 }} • 
            <span class="text-scholar-700 dark:text-paper-100">{{ userStore.profile?.tier || 'Rookie' }}</span>
          </p>
        </div>

        <!-- Quick Session Settings -->
        <div class="flex items-center gap-4 rounded-[2rem] border border-paper-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div class="flex items-center px-4">
            <label for="len-select" class="mr-3 text-[10px] font-black uppercase tracking-widest text-sage">Depth</label>
            <select id="len-select" v-model="selectedLen" class="bg-transparent font-display text-sm font-black text-scholar-600 outline-none cursor-pointer">
              <option :value="5">5 Qs</option>
              <option :value="10">10 Qs</option>
              <option :value="20">20 Qs</option>
            </select>
          </div>
          <div class="h-8 w-px bg-paper-100 dark:bg-white/10" />
          <button 
            @click="sound.toggle" 
            class="flex h-11 w-11 items-center justify-center rounded-2xl transition hover:bg-paper-50 dark:hover:bg-white/5"
            :aria-label="sound.isEnabled ? 'Mute' : 'Unmute'"
          >
            <span class="text-xl">{{ sound.isEnabled ? '🔊' : '🔇' }}</span>
          </button>
        </div>
      </header>

      <!-- 02. PRIMARY CONTENT GRID -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        <!-- LEFT WING: Progress & Training -->
        <div class="space-y-8 lg:col-span-8">
          
          <!-- Quick Actions & Stats -->
          <div class="grid gap-6 md:grid-cols-3">
            <!-- Last Session Score Card -->
            <div class="reveal rounded-[2.5rem] border border-paper-200 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5">
              <p class="text-[10px] font-black uppercase tracking-widest text-sage">Latest Score</p>
              <div class="mt-2 flex items-baseline gap-2">
                <span class="text-4xl font-black tracking-tighter">{{ userStore.profile?.last_score || 0 }}%</span>
              </div>
              <p class="mt-4 text-[11px] font-bold text-scholar-600">Avg: {{ userStore.profile?.average_score || 0 }}%</p>
            </div>

            <!-- MAIN CALL TO ACTION -->
            <button 
              @click="startSession"
              class="group relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] bg-scholar-600 p-8 text-white shadow-xl shadow-scholar-600/20 transition-all hover:scale-[1.02] hover:bg-scholar-700 md:col-span-2"
            >
              <div class="relative z-10 flex items-center justify-between w-full">
                <div class="text-left space-y-1">
                  <h2 class="font-display text-3xl font-black">Begin Drill</h2>
                  <p class="text-sm font-medium opacity-90">Start your {{ selectedLen }}-question session</p>
                </div>
                <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white/40">
                  <span class="ml-1 text-2xl">▶</span>
                </div>
              </div>
              <!-- Visual background decoration -->
              <div class="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl animate-float" />
            </button>
          </div>

          <!-- Millionaire Ladder (Visual Gamification) -->
          <section class="reveal">
            <MillionaireLadder />
          </section>

          <!-- Subject Performance Breakdown -->
          <section class="space-y-6">
            <div class="flex items-center justify-between px-2">
              <h3 class="font-display text-xl font-black tracking-tight">Subject Mastery</h3>
              <NuxtLink to="/fields" class="text-[10px] font-black uppercase tracking-widest text-scholar-600 hover:underline">Manage Fields</NuxtLink>
            </div>
            
            <div class="grid gap-4 sm:grid-cols-2">
              <div v-for="(score, subject) in userStore.subjectScores" :key="subject" 
                   class="reveal rounded-3xl border border-paper-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                <div class="flex items-center justify-between mb-4">
                  <span class="font-display text-sm font-bold capitalize">{{ subject }}</span>
                  <span class="font-mono text-sm font-black" :class="getScoreColor(Number(score))">{{ score }}%</span>
                </div>
                <div class="h-2 w-full rounded-full bg-paper-100 dark:bg-white/10 overflow-hidden">
                  <div 
                    class="h-full rounded-full bg-scholar-600 transition-all duration-1000" 
                    :style="{ width: score + '%' }" 
                  />
                </div>
              </div>
              <!-- Empty state for subjects -->
              <div v-if="!Object.keys(userStore.subjectScores || {}).length" class="sm:col-span-2 text-center py-10 rounded-3xl border-2 border-dashed border-paper-200 text-sage text-sm font-medium">
                No session data yet. Complete a drill to see mastery scores.
              </div>
            </div>
          </section>
        </div>

        <!-- RIGHT WING: Sidebar stats -->
        <aside class="space-y-8 lg:col-span-4">
          <!-- Streak Visual -->
          <div class="reveal">
            <StreakCard />
          </div>

          <!-- Weak Area Auto-Detection -->
          <div class="reveal">
            <WeakAreaSpotlight />
          </div>

          <!-- Achievement Trophies -->
          <section class="reveal rounded-[2.5rem] border border-paper-200 bg-white p-8 dark:border-white/10 dark:bg-white/5">
            <h3 class="mb-6 text-[10px] font-black uppercase tracking-widest text-sage">Scholar Milestones</h3>
            <div class="space-y-5">
              <div v-for="a in userStore.achievements.slice(0, 4)" :key="a.id" 
                   class="flex items-center gap-4 transition-all" 
                   :class="a.earned ? 'opacity-100' : 'opacity-30 grayscale'">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper-50 text-2xl dark:bg-white/10">
                  {{ a.icon }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-black tracking-tight">{{ a.name }}</p>
                  <p class="text-[10px] font-bold text-scholar-600 uppercase tracking-tighter">
                    {{ a.earned ? 'Unlocked' : 'Locked' }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Note Sync CTA -->
          <NuxtLink to="/upload" class="reveal group block rounded-[2.5rem] border-2 border-dashed border-paper-200 p-8 transition-all hover:border-scholar-600 hover:bg-scholar-50 dark:border-white/10 dark:hover:bg-white/5">
            <div class="flex items-center gap-5">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition group-hover:rotate-12 dark:bg-white/5">
                📄
              </div>
              <div class="space-y-1">
                <p class="font-display text-base font-black leading-none">AI Note Sync</p>
                <p class="text-xs font-medium text-sage">Turn notes into drills</p>
              </div>
            </div>
          </NuxtLink>
        </aside>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'
import MillionaireLadder from '~/components/ladder/MillionaireLadder.vue'
import StreakCard from '~/components/shared/StreakCard.vue'
import WeakAreaSpotlight from '~/components/shared/WeakAreaCard.vue'

// Senior Note: Middleware ensures only authenticated scholars see this
definePageMeta({ 
  layout: 'default' 
})

useHead({ title: 'Dashboard — MASTERY ACADEMY' })

const userStore = useUserStore()
const sound = useSound() // Custom sound utility (assumed)
const router = useRouter()

// Local UI State
const selectedLen = ref(10)
const loading = ref(false)

// Logic: Compute first name for the greeting
const firstName = computed(() => {
  const name = userStore.profile?.full_name || userStore.username || 'Scholar'
  return name.split(' ')[0]
})

// Logic: Build the dynamic link to the quiz
const startHref = computed(() => {
  const sub = encodeURIComponent(userStore.currentSubject || 'general')
  return `/quiz?subject=${sub}&len=${selectedLen.value}`
})

// Action: Handle starting a session with feedback
const startSession = async () => {
  sound.playClick?.()
  await router.push(startHref.value)
}

// Logic: Intersection Observer for premium entrance animations
const revealRef = ref<HTMLElement[]>([])
onMounted(async () => {
  loading.value = true
  // Hydrate user data from FastAPI
  await userStore.fetchProfile()
  loading.value = false

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-visible')
      }
    })
  }, { threshold: 0.1 })
  
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})

// Helper: Score coloring logic
const getScoreColor = (s: number) => {
  if (s >= 80) return 'text-green-600 dark:text-green-400'
  if (s >= 50) return 'text-orange-500'
  return 'text-red-500'
}
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

/* Custom select styling for the header */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234f46e5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 0.75rem;
  padding-right: 1rem;
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-reveal { animation: reveal 0.6s ease-out forwards; }
</style>