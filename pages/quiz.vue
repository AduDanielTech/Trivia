<template>
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <!-- Accessibility: Assertive for timer/question changes -->
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ sessionStore.liveAnnouncement }}
    </div>

    <div class="mx-auto max-w-4xl px-6 py-12">
      <Transition name="screen-fade" mode="out-in">

        <!-- ── LOBBY PHASE ── -->
        <section v-if="phase === 'lobby'" key="lobby" class="flex flex-col items-center" aria-labelledby="lobby-heading">
          <div class="reveal-visible w-full max-w-lg space-y-8 rounded-[2.5rem] border border-paper-200 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-white/5">
            
            <header class="text-center space-y-2">
              <h1 id="lobby-heading" class="font-display text-3xl font-black tracking-tight md:text-4xl">
                Ready to Practice?
              </h1>
              <p class="text-base font-medium text-sage dark:text-paper-200">
                Sharpen your skills in <span class="text-scholar-600 font-bold">{{ userStore.field }}</span>.
              </p>
            </header>

            <!-- Field Snapshot -->
            <div class="flex items-center gap-4 rounded-2xl bg-paper-50 px-5 py-4 dark:bg-white/5">
              <span class="text-3xl">🎓</span>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-sage">Subject</p>
                <p class="font-display text-lg font-bold text-scholar-700 dark:text-scholar-100">{{ userStore.field }}</p>
              </div>
            </div>

            <div class="space-y-6">
              <!-- Session Length -->
              <div role="group" aria-labelledby="length-label">
                <p id="length-label" class="mb-3 text-[10px] font-black uppercase tracking-widest text-sage">Select session depth</p>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="opt in lengthOptions"
                    :key="opt.value"
                    @click="selectedLength = opt.value"
                    :aria-pressed="selectedLength === opt.value"
                    :class="selectedLength === opt.value 
                      ? 'border-scholar-600 bg-scholar-50 text-scholar-700 ring-2 ring-scholar-600/20 dark:bg-scholar-900/30 dark:text-scholar-100' 
                      : 'border-paper-200 bg-white text-sage hover:border-scholar-600/50 dark:border-white/10 dark:bg-white/5'"
                    class="flex flex-col items-center rounded-2xl border-2 py-4 transition-all"
                  >
                    <span class="text-xl font-black">{{ opt.value }} Questions</span>
                    <span class="text-xs font-bold opacity-60">~{{ opt.minutes }} mins</span>
                  </button>
                </div>
              </div>

              <!-- Audio Toggle -->
              <div role="group" aria-labelledby="audio-label">
                <p id="audio-label" class="mb-3 text-[10px] font-black uppercase tracking-widest text-sage">Audio Environment</p>
                <button
                  @click="sound.toggle"
                  class="group flex w-full items-center justify-between rounded-2xl border-2 border-paper-200 bg-white px-6 py-4 transition-all hover:border-scholar-600/50 dark:border-white/10 dark:bg-white/5"
                  :aria-pressed="sound.isEnabled.value"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{{ sound.isEnabled.value ? '🔊' : '🔇' }}</span>
                    <span class="font-bold text-sm">{{ sound.isEnabled.value ? 'Effects Enabled' : 'Muted Mode' }}</span>
                  </div>
                  <div 
                    :class="sound.isEnabled.value ? 'bg-scholar-600' : 'bg-paper-200 dark:bg-white/10'" 
                    class="h-6 w-11 rounded-full relative transition-colors"
                  >
                    <div 
                      :class="sound.isEnabled.value ? 'translate-x-6' : 'translate-x-1'" 
                      class="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-sm"
                    />
                  </div>
                </button>
              </div>
            </div>

            <!-- Start Logic -->
            <div class="pt-4">
              <div v-if="loadingQuestions" class="flex items-center justify-center gap-3 text-sm font-bold text-scholar-600 py-4">
                <div class="h-5 w-5 animate-spin rounded-full border-2 border-scholar-200 border-t-scholar-600" />
                <span>Curating questions...</span>
              </div>
              <button
                v-else
                @click="startSession"
                class="w-full rounded-2xl bg-scholar-600 py-5 font-display text-xl font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 hover:scale-[1.02] active:scale-100"
              >
                Begin Session
              </button>
            </div>

            <p class="text-center text-[10px] font-black uppercase tracking-widest text-sage opacity-60">
              {{ questionsSource === 'supabase' ? 'Cloud Sync Enabled' : 'Offline Bank Active' }}
            </p>
          </div>
        </section>

        <!-- ── QUIZ PHASE ── -->
        <section v-else-if="phase === 'quiz'" key="quiz" class="w-full max-w-3xl mx-auto">
          <QuizCard
            v-if="currentQuestion"
            :question="currentQuestion"
            @answered="handleAnswered"
            @next="handleNext"
            @complete="handleComplete"
          />
        </section>

        <!-- ── RESULTS PHASE ── -->
        <section v-else-if="phase === 'results'" key="results" class="flex flex-col items-center">
          <div class="reveal-visible w-full max-w-lg space-y-8 rounded-[3rem] border border-paper-200 bg-white p-12 text-center shadow-2xl dark:border-white/10 dark:bg-white/5">
            
            <div class="mx-auto flex h-24 w-24 animate-bounce-slow items-center justify-center rounded-full bg-scholar-50 text-5xl dark:bg-scholar-900/30">
              {{ scorePercent >= 80 ? '🏆' : scorePercent >= 60 ? '✨' : '📖' }}
            </div>

            <header class="space-y-2">
              <h2 id="results-heading" class="font-display text-7xl font-black tracking-tighter text-scholar-700 dark:text-scholar-100">
                {{ scorePercent }}%
              </h2>
              <p class="font-mono text-lg font-bold text-sage">
                {{ sessionStore.score }} / {{ sessionStore.totalQuestions }} Correct
              </p>
            </header>

            <p class="mx-auto max-w-xs text-base font-semibold leading-relaxed text-sage dark:text-paper-200">
              {{ resultMessage }}
            </p>

            <!-- XP Badge -->
            <div class="inline-flex items-center gap-3 rounded-2xl bg-scholar-600 px-6 py-3 text-white shadow-lg">
              <span class="text-xl">⬡</span>
              <span class="font-display font-black">+{{ sessionStore.sessionXP }} XP Earned</span>
            </div>

            <!-- Sync Status -->
            <div class="flex justify-center">
              <div v-if="savedToDb" class="flex items-center gap-2 text-xs font-bold text-scholar-600">
                <span class="h-1.5 w-1.5 rounded-full bg-scholar-600 animate-pulse" />
                Synced to Cloud
              </div>
              <div v-else class="text-xs font-bold text-sage">Saving session...</div>
            </div>

            <!-- Progress Bar -->
            <div class="h-3 w-full overflow-hidden rounded-full bg-paper-100 dark:bg-white/10">
              <div 
                class="h-full rounded-full transition-all duration-1000 ease-out"
                :class="scorePercent >= 70 ? 'bg-scholar-600' : scorePercent >= 50 ? 'bg-orange-500' : 'bg-error'"
                :style="{ width: scorePercent + '%' }"
              />
            </div>

            <!-- Actions -->
            <div class="grid gap-3 pt-4 sm:grid-cols-2">
              <button 
                @click="restartSession" 
                class="rounded-2xl bg-scholar-600 py-4 font-bold text-white shadow-lg hover:bg-scholar-700 transition-all"
              >
                Play Again
              </button>
              <NuxtLink 
                to="/dashboard" 
                class="rounded-2xl border-2 border-paper-200 py-4 font-bold text-paper-900 hover:bg-paper-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5 transition-all"
              >
                Dashboard
              </NuxtLink>
            </div>
          </div>
        </section>

      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore, useSessionStore } from '~/stores/index'
import { MOCK_QUESTIONS } from '~/data/questions'
import QuizCard from '~/components/quiz/QuizCard.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'Practice — MASTERY' })

const route = useRoute()
const userStore = useUserStore()
const sessionStore = useSessionStore()
const sound = useSound()
const announcer = useAnnouncer()
const { saveSession, fetchQuestions } = useSessionPersist()

const phase = ref<'lobby' | 'quiz' | 'results'>('lobby')
const selectedLength = ref<5 | 10>(10)
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const loadingQuestions = ref(false)
const questionsSource = ref<'supabase' | 'local'>('local')
const sessionStartTime = ref(0)
const savedToDb = ref(false)
const saveError = ref(false)

const answerLog = ref<any[]>([])

const lengthOptions = [
  { value: 5, minutes: 5 },
  { value: 10, minutes: 10 },
]

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null)
const scorePercent = computed(() => sessionStore.scorePercent)

const resultMessage = computed(() => {
  if (scorePercent.value >= 80) return 'Exceptional work. You are mastering this field.'
  if (scorePercent.value >= 60) return 'Solid progress. Keep focusing on your weak areas.'
  return 'Consistency is the key. Review your mistakes and try again.'
})

const loadQuestions = async () => {
  loadingQuestions.value = true
  const subject = (route.query.subject as string) || userStore.field
  try {
    const live = await fetchQuestions(subject, null, selectedLength.value)
    if (live?.length) {
      questions.value = live
      questionsSource.value = 'supabase'
      loadingQuestions.value = false
      return
    }
  } catch (_) {}
  questions.value = MOCK_QUESTIONS.slice(0, selectedLength.value)
  questionsSource.value = 'local'
  loadingQuestions.value = false
}

onMounted(() => {
  if (route.query.len) selectedLength.value = Number(route.query.len) as 5 | 10
  loadQuestions()
})

const startSession = () => {
  sessionStore.reset()
  sessionStore.totalQuestions = questions.value.length
  sessionStore.subject = userStore.field
  currentQuestionIndex.value = 0
  sessionStartTime.value = Date.now()
  phase.value = 'quiz'
}

const handleAnswered = (correct: boolean) => {
  const q = currentQuestion.value
  answerLog.value.push({
    questionId: q?.id,
    isCorrect: correct,
    timeTakenMs: (30 - sessionStore.timeRemaining) * 1000,
  })
}

const handleNext = () => currentQuestionIndex.value++

const handleComplete = async () => {
  const durationSeconds = Math.round((Date.now() - sessionStartTime.value) / 1000)
  userStore.completeSession(sessionStore.score, sessionStore.totalQuestions, sessionStore.subject, sessionStore.sessionXP)
  phase.value = 'results'
  
  const sessionId = await saveSession({
    subject: sessionStore.subject,
    totalQuestions: sessionStore.totalQuestions,
    correctAnswers: sessionStore.score,
    scorePercent: sessionStore.scorePercent,
    xpEarned: sessionStore.sessionXP,
    durationSeconds,
    answers: answerLog.value,
  })
  if (sessionId) savedToDb.value = true
}

const restartSession = async () => {
  phase.value = 'lobby'
  await loadQuestions()
}
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

.screen-fade-enter-active, .screen-fade-leave-active { 
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
}
.screen-fade-enter-from, .screen-fade-leave-to { 
  opacity: 0; 
  transform: translateY(10px); 
}

.reveal-visible {
  animation: reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
</style>