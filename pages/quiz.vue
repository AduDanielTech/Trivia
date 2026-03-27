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

            <div class="flex items-center gap-3 px-4 py-3.5 bg-navy-600 border border-navy-500 rounded-lg"
              role="status" :aria-label="`Current field: ${userStore.currentSubject}`">
              <span aria-hidden="true" class="text-2xl flex-shrink-0">🎓</span>
              <div>
                <div class="text-[10px] uppercase tracking-widest text-navy-400 font-semibold">Field of study</div>
                <div class="text-sm font-bold text-gold-500 mt-0.5">{{ userStore.currentSubject?.toUpperCase() || 'JAMB' }}</div>
              </div>
              <NuxtLink to="/fields" class="ml-auto text-xs text-navy-400 no-underline hover:text-gold-500 transition-colors">Change</NuxtLink>
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
                  <span class="w-8 h-[18px] rounded-full relative transition-colors duration-200 ml-auto flex-shrink-0" aria-hidden="true"
                    :class="sound.isEnabled.value ? 'bg-green-600' : 'bg-navy-500'" />
                </button>
              </div>
            </div>

            <div v-if="gameStore.loading" class="flex items-center justify-center gap-2.5 text-sm text-navy-400 py-1" aria-live="polite" role="status">
              <div class="w-4 h-4 border-2 border-navy-500 border-t-gold-500 rounded-full animate-spin-slow flex-shrink-0" aria-hidden="true" />
              <span>Loading questions…</span>
            </div>
            <p v-if="gameStore.error" class="text-xs text-red-400 text-center" role="alert">{{ gameStore.error }}</p>

            <button
              v-if="!gameStore.loading"
              class="btn btn-gold lobby-start-btn"
              ref="startBtnRef"
              aria-label="Start your practice session"
              @click="startSession"
            >
              <span aria-hidden="true">▶</span>
              Start Session
            </button>

            <p class="flex items-center justify-center gap-1.5 text-[11px] text-navy-400" aria-live="polite">
              <span aria-hidden="true">⚡</span>
              Live questions from database
            </p>
          </div>
        </section>

        <!-- ── Quiz ── -->
        <section v-else-if="phase === 'quiz'" key="quiz" class="w-full" aria-label="Quiz in progress">
          <QuizCard
            v-if="currentQuestion"
            :question="currentQuestion"
            :session-id="gameStore.sessionId"
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

            <h1 id="results-heading" class="text-7xl font-extrabold tracking-tight leading-none"
              :aria-label="`Session complete. You scored ${sessionStore.score} out of ${sessionStore.totalQuestions}, ${scorePercent} percent.`">
              <span class="text-shimmer">{{ scorePercent }}%</span>
            </h1>

            <p class="font-mono text-base text-navy-400">{{ sessionStore.score }} / {{ sessionStore.totalQuestions }} correct</p>
            <p class="text-sm text-navy-400 leading-relaxed max-w-xs" role="status">{{ resultMessage }}</p>

            <!-- XP earned from server -->
            <div
              class="flex items-center gap-2 px-5 py-2 rounded-full bg-gold-500/[0.08] border border-gold-500/20 text-sm font-bold text-gold-500"
              role="status"
            >
              <span aria-hidden="true">⬡</span>
              <span class="font-mono">+{{ completionResult?.xp_earned ?? sessionStore.sessionXP }}</span>
              <span>XP earned</span>
            </div>

            <!-- Tier up announcement -->
            <div v-if="completionResult?.new_tier && completionResult.new_tier !== userStore.currentTier.name"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-bold text-yellow-400"
              role="status" aria-live="polite">
              🎉 Tier Up — Welcome to {{ completionResult.new_tier }}!
            </div>

            <!-- Newly unlocked achievements -->
            <div v-if="completionResult?.newly_unlocked?.length" class="flex flex-col gap-1 w-full">
              <div v-for="ach in completionResult.newly_unlocked" :key="ach.id"
                class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400"
                role="status">
                {{ ach.icon }} Achievement Unlocked: {{ ach.name }}
              </div>
            </div>

            <!-- Save indicator -->
            <div v-if="sessionStore.completing" class="flex items-center gap-1.5 text-xs text-navy-400" role="status">
              <div class="w-3 h-3 border-2 border-navy-500 border-t-gold-500 rounded-full animate-spin" aria-hidden="true" />
              Saving to your account…
            </div>
            <div v-else-if="savedToDb" class="flex items-center gap-1.5 text-xs text-green-400" role="status">
              <span aria-hidden="true">☁</span> Progress saved to your account
            </div>
            <div v-else-if="sessionStore.completionError" class="flex items-center gap-1.5 text-xs text-navy-400" role="status">
              <span aria-hidden="true">⚠</span> {{ sessionStore.completionError }}
            </div>

            <!-- Score bar -->
            <div class="w-full" role="progressbar" :aria-valuenow="scorePercent" aria-valuemin="0" aria-valuemax="100">
              <div class="h-2.5 bg-navy-600 rounded-full overflow-hidden w-full">
                <div class="h-full rounded-full transition-all duration-700"
                  :style="{ width: scorePercent + '%', background: scorePercent >= 70 ? '#00E5A0' : scorePercent >= 50 ? '#FF9500' : '#FF4F6D' }" />
              </div>
            </div>

            <div class="flex gap-3 w-full">
              <button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-all duration-200"
                aria-label="Start another session" @click="restartSession">
                Play Again
              </button>
              <NuxtLink to="/" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-navy-500 bg-transparent text-sm font-semibold text-white hover:bg-navy-600 hover:border-navy-400 transition-all duration-200"
                role="button" aria-label="Go to dashboard">
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
import { useUserStore    } from '~/stores/userStore'
import { useSessionStore } from '~/stores/sessionStore'
import { useGameStore    } from '~/stores/gameStore'
import QuizCard from '~/components/quiz/QuizCard.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'Practice Quiz — TRIVIA' })

const route        = useRoute()
const userStore    = useUserStore()
const sessionStore = useSessionStore()
const gameStore    = useGameStore()
const sound        = useSound()
const announcer    = useAnnouncer()

const startBtnRef      = ref<HTMLElement | null>(null)
const phase            = ref<'lobby' | 'quiz' | 'results'>('lobby')
const selectedLength   = ref(10)
const currentQuestionIndex = ref(0)
const sessionStartTime = ref(0)
const savedToDb        = ref(false)
const completionResult = ref<any>(null)

const lengthOptions = [
  { value: 5, minutes: 5 },
  { value: 10, minutes: 10 },
  { value: 20, minutes: 20 },
]

const currentQuestion = computed(() => gameStore.questions[currentQuestionIndex.value] || null)
const scorePercent    = computed(() => sessionStore.scorePercent)

const resultMessage = computed(() => {
  if (scorePercent.value >= 80) return '🔥 Excellent! You are on fire!'
  if (scorePercent.value >= 60) return '⭐ Good work! Keep pushing for excellence.'
  return '📚 Keep practicing — consistency is the key to improvement.'
})

// Pre-load questions when component mounts
onMounted(loadQuestions)
watch(selectedLength, loadQuestions)

async function loadQuestions() {
  const subject = (route.query.subject as string) || userStore.currentSubject || 'jamb'
  await gameStore.startSession(subject, selectedLength.value)
}

// ── Session flow ──────────────────────────────────────────────────────────
async function startSession() {
  if (!gameStore.hasQuestions) {
    await loadQuestions()
    if (!gameStore.hasQuestions) return
  }
  sound.playClick?.()
  sessionStore.reset()
  sessionStore.totalQuestions = gameStore.questions.length
  sessionStore.subject        = userStore.currentSubject || 'jamb'
  currentQuestionIndex.value  = 0
  sessionStartTime.value      = Date.now()
  phase.value = 'quiz'
  announcer.announce?.(`Session started. ${gameStore.questions.length} questions. Good luck!`)
}

// AFTER
function handleAnswered(_correct: boolean) {
  // Answer submission is now handled inside QuizCard directly,
  // which waits for the backend's correct_index before revealing the result.
}

function handleNext() {
  currentQuestionIndex.value++
}

async function handleComplete() {
  const durationSeconds = Math.round((Date.now() - sessionStartTime.value) / 1000)
  phase.value = 'results'
  sound.playLevelUp?.()
  announcer.announceScore?.(sessionStore.score, sessionStore.totalQuestions)

  savedToDb.value        = false
  completionResult.value = null

  // Call the PostgreSQL complete_session() function via sessionStore
  const result = await sessionStore.finishSession(durationSeconds)
  if (result?.success) {
    savedToDb.value        = true
    completionResult.value = result
  }
}

async function restartSession() {
  phase.value = 'lobby'
  sessionStore.reset()
  gameStore.reset()
  currentQuestionIndex.value = 0
  savedToDb.value            = false
  completionResult.value     = null
  await loadQuestions()
  nextTick(() => startBtnRef.value?.focus())
}
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
.screen-fade-enter-active, .screen-fade-leave-active { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
.screen-fade-enter-from, .screen-fade-leave-to { opacity: 0; transform: translateY(12px); }
</style>
