<template>
  <div class="quiz-page">
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ sessionStore.liveAnnouncement }}
    </div>

    <div class="quiz-inner">
      <Transition name="screen-fade" mode="out-in">

        <!-- ── Lobby ── -->
        <section v-if="phase === 'lobby'" key="lobby" class="flex justify-center" aria-labelledby="lobby-heading">
          <div class="bg-navy-700 border border-navy-500 rounded-2xl p-8 w-full max-w-[480px] flex flex-col gap-6 animate-scale-in">
            <h1 id="lobby-heading" class="flex items-center gap-2.5 text-2xl font-extrabold text-white tracking-tight">
              <span aria-hidden="true">⚡</span>
              Ready to Practice?
            </h1>

            <div class="flex items-center gap-3 px-4 py-3.5 bg-navy-600 border border-navy-500 rounded-lg" role="status" :aria-label="`Current field: ${userStore.field}`">
              <span aria-hidden="true" class="text-2xl flex-shrink-0">🎓</span>
              <div>
                <div class="text-[10px] uppercase tracking-widest text-navy-400 font-semibold">Field of study</div>
                <div class="text-sm font-bold text-gold-500 mt-0.5">{{ userStore.field }}</div>
              </div>
            </div>

            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-2" role="group" aria-labelledby="length-label">
                <div id="length-label" class="text-[11px] font-bold uppercase tracking-widest text-navy-400">Session length</div>
                <div class="flex gap-2">
                  <button
                    v-for="opt in lengthOptions"
                    :key="opt.value"
                    class="flex-1 flex flex-col items-center gap-0.5 py-3 bg-navy-600 border border-navy-500 rounded-lg font-sans text-xs text-navy-400 cursor-pointer transition-all duration-150"
                    :class="selectedLength === opt.value ? 'bg-gold-500/[0.08] border-yellow-600 text-yellow-500' : 'hover:bg-navy-500'"
                    :aria-pressed="selectedLength === opt.value"
                    :aria-label="`${opt.value} questions, about ${opt.minutes} minutes`"
                    @click="selectedLength = opt.value"
                  >
                    <span class="font-mono">{{ opt.value }}</span>
                    <span>questions</span>
                    <span class="hint">~{{ opt.minutes }}min</span>
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-2" role="group" aria-labelledby="audio-label">
                <div id="audio-label" class="text-[11px] font-bold uppercase tracking-widest text-navy-400">Sound effects</div>
                <button
                  class="flex items-center gap-3 px-4 py-3 bg-navy-600 border border-navy-500 rounded-lg font-sans text-sm text-navy-400 cursor-pointer transition-all duration-200 hover:bg-navy-500 w-full"
                  :aria-pressed="sound.isEnabled.value"
                  :aria-label="sound.isEnabled.value ? 'Sound on. Press to mute.' : 'Sound off. Press to enable.'"
                  @click="sound.toggle"
                >
                  <span aria-hidden="true" class="text-lg flex-shrink-0">{{ sound.isEnabled.value ? '🔊' : '🔇' }}</span>
                  <span>{{ sound.isEnabled.value ? 'Sound On' : 'Sound Off' }}</span>
                  <span class="w-8 h-[18px] rounded-full relative transition-colors duration-200 ml-auto flex-shrink-0" aria-hidden="true" :class="sound.isEnabled.value ? 'bg-green-600' : 'bg-navy-500'" />
                </button>
              </div>
            </div>

            <!-- Loading questions indicator -->
            <div v-if="loadingQuestions" class="flex items-center justify-center gap-2.5 text-sm text-navy-400 py-1" aria-live="polite" role="status">
              <div class="w-4 h-4 border-2 border-navy-500 border-t-gold-500 rounded-full animate-spin-slow flex-shrink-0" aria-hidden="true" />
              <span>Loading questions…</span>
            </div>

            <button
              v-else
              class="btn btn-gold lobby-start-btn"
              ref="startBtnRef"
              :disabled="loadingQuestions"
              aria-label="Start your practice session"
              @click="startSession"
            >
              <span aria-hidden="true">▶</span>
              Start Session
            </button>

            <!-- Source badge -->
            <p class="flex items-center justify-center gap-1.5 text-[11px] text-navy-400" aria-live="polite">
              <span aria-hidden="true">{{ questionsSource === 'supabase' ? '☁' : '📦' }}</span>
              {{ questionsSource === 'supabase' ? 'Live questions from database' : 'Offline question bank' }}
            </p>
          </div>
        </section>

        <!-- ── Quiz ── -->
        <section v-else-if="phase === 'quiz'" key="quiz" class="w-full" aria-label="Quiz in progress">
          <QuizCard
            v-if="currentQuestion"
            :question="currentQuestion"
            @answered="handleAnswered"
            @next="handleNext"
            @complete="handleComplete"
          />
        </section>

        <!-- ── Results ── -->
        <section
          v-else-if="phase === 'results'"
          key="results"
          class="flex justify-center animate-scale-in"
          aria-labelledby="results-heading"
          aria-live="polite"
        >
          <div class="bg-navy-700 border border-navy-500 rounded-2xl px-8 py-10 w-full max-w-[440px] flex flex-col items-center gap-4 text-center">
            <div class="text-5xl animate-scale-in" aria-hidden="true">
              {{ scorePercent >= 80 ? '🏆' : scorePercent >= 60 ? '⭐' : '📚' }}
            </div>

            <h1
              id="results-heading"
              class="text-7xl font-extrabold tracking-tight leading-none"
              :aria-label="`Session complete. You scored ${sessionStore.score} out of ${sessionStore.totalQuestions}, ${scorePercent} percent.`"
            >
              <span class="text-shimmer">{{ scorePercent }}%</span>
            </h1>

            <p class="font-mono text-base text-navy-400">
              {{ sessionStore.score }} / {{ sessionStore.totalQuestions }} correct
            </p>

            <p class="text-sm text-navy-400 leading-relaxed max-w-xs" role="status">{{ resultMessage }}</p>

            <!-- XP earned -->
            <div
              class="flex items-center gap-2 px-5 py-2 rounded-full bg-gold-500/[0.08] border border-gold-500/20 text-sm font-bold text-gold-500"
              role="status"
              :aria-label="`You earned ${sessionStore.sessionXP} XP this session`"
            >
              <span aria-hidden="true">⬡</span>
              <span class="font-mono">+{{ sessionStore.sessionXP }}</span>
              <span>XP earned</span>
            </div>

            <!-- Saved indicator -->
            <div v-if="savedToDb" class="flex items-center gap-1.5 text-xs text-green-400" role="status" aria-live="polite">
              <span aria-hidden="true">☁</span>
              Progress saved to your account
            </div>
            <div v-else-if="saveError" class="flex items-center gap-1.5 text-xs text-navy-400" role="status" aria-live="polite">
              <span aria-hidden="true">⚠</span>
              Saved locally — will sync when online
            </div>

            <!-- Score bar -->
            <div
              class="w-full"
              role="progressbar"
              :aria-valuenow="scorePercent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Final score: ${scorePercent}%`"
            >
              <div class="h-2.5 bg-navy-600 rounded-full overflow-hidden w-full">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{
                    width: scorePercent + '%',
                    background: scorePercent >= 70 ? 'var(--green-500)' : scorePercent >= 50 ? '#FF9500' : 'var(--red-500)',
                  }"
                />
              </div>
            </div>

            <div class="flex gap-3 w-full">
              <button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-all duration-200" aria-label="Start another session" @click="restartSession">
                Play Again
              </button>
              <NuxtLink to="/" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-navy-500 bg-transparent text-sm font-semibold text-white hover:bg-navy-600 hover:border-navy-400 transition-all duration-200" role="button" aria-label="Go to dashboard">
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
useHead({ title: 'Practice Quiz — TRIVIA' })

const route = useRoute()
const userStore = useUserStore()
const sessionStore = useSessionStore()
const sound = useSound()
const announcer = useAnnouncer()
const { saveSession, fetchQuestions } = useSessionPersist()

const startBtnRef = ref<HTMLElement | null>(null)
const phase = ref<'lobby' | 'quiz' | 'results'>('lobby')
const selectedLength = ref(10)
const questions = ref<typeof MOCK_QUESTIONS>([])
const currentQuestionIndex = ref(0)
const loadingQuestions = ref(false)
const questionsSource = ref<'supabase' | 'local'>('local')
const sessionStartTime = ref(0)
const savedToDb = ref(false)
const saveError = ref(false)

// Per-question answer tracking for DB persistence
const answerLog = ref<Array<{
  questionId: string | null
  selectedIndex: number | null
  isCorrect: boolean
  timeTakenMs: number
}>>([])

const lengthOptions = [
  { value: 5, minutes: 5 },
  { value: 10, minutes: 10 },
]

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null)
const scorePercent = computed(() => sessionStore.scorePercent)

const resultMessage = computed(() => {
  if (scorePercent.value >= 80) return '🔥 Excellent! You are on fire!'
  if (scorePercent.value >= 60) return '⭐ Good work! Keep pushing for excellence.'
  return '📚 Keep practicing — consistency is the key to improvement.'
})

// ── Load questions (Supabase first, fallback to mock) ─────────────
const loadQuestions = async () => {
  loadingQuestions.value = true

  // Detect subject from route query or user store
  const subject = (route.query.subject as string) || userStore.field

  try {
    const live = await fetchQuestions(subject, null, selectedLength.value)
    if (live && live.length >= selectedLength.value) {
      questions.value = live as any
      questionsSource.value = 'supabase'
      loadingQuestions.value = false
      return
    }
  } catch (_) {}

  // Fallback to local mock questions
  questions.value = MOCK_QUESTIONS.slice(0, selectedLength.value)
  questionsSource.value = 'local'
  loadingQuestions.value = false
}

// Pre-load questions when the component mounts
onMounted(loadQuestions)
watch(selectedLength, loadQuestions)

// ── Session flow ──────────────────────────────────────────────────
const startSession = () => {
  sound.playClick()
  sessionStore.reset()
  sessionStore.totalQuestions = questions.value.length
  sessionStore.subject = userStore.field
  currentQuestionIndex.value = 0
  answerLog.value = []
  sessionStartTime.value = Date.now()
  phase.value = 'quiz'
  announcer.announce(`Session started. ${questions.value.length} questions. Good luck!`)
}

const handleAnswered = (correct: boolean, xp: number) => {
  // Log this answer for DB persistence
  const q = currentQuestion.value
  answerLog.value.push({
    questionId: q ? String(q.id) : null,
    selectedIndex: sessionStore.selectedOption,
    isCorrect: correct,
    timeTakenMs: (30 - sessionStore.timeRemaining) * 1000,
  })
}

const handleNext = () => {
  currentQuestionIndex.value++
}

const handleComplete = async () => {
  const durationSeconds = Math.round((Date.now() - sessionStartTime.value) / 1000)

  // Update local Pinia state immediately (instant UI feedback)
  // Signature: completeSession(score, totalQs, subject, xpEarned)
  userStore.completeSession(
    sessionStore.score,
    sessionStore.totalQuestions,
    sessionStore.subject,
    sessionStore.sessionXP
  )

  phase.value = 'results'
  sound.playLevelUp()
  announcer.announceScore(sessionStore.score, sessionStore.totalQuestions)

  // Persist to Supabase in the background
  savedToDb.value = false
  saveError.value = false

  const sessionId = await saveSession({
    subject: sessionStore.subject,
    difficulty: 'Mixed',
    mode: (route.query.mode as string) || 'standard',
    totalQuestions: sessionStore.totalQuestions,
    correctAnswers: sessionStore.score,
    scorePercent: sessionStore.scorePercent,
    xpEarned: sessionStore.sessionXP,
    durationSeconds,
    answers: answerLog.value,
  })

  if (sessionId) {
    savedToDb.value = true
  } else {
    saveError.value = true
  }
}

const restartSession = async () => {
  phase.value = 'lobby'
  sessionStore.reset()
  currentQuestionIndex.value = 0
  answerLog.value = []
  await loadQuestions()
  nextTick(() => startBtnRef.value?.focus())
}
</script>

<style scoped>
.screen-fade-enter-active, .screen-fade-leave-active { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
.screen-fade-enter-from, .screen-fade-leave-to { opacity: 0; transform: translateY(12px); }
</style>
