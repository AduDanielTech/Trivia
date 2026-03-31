<template>
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <!-- Accessibility: Assertive live region -->
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ sessionStore.liveAnnouncement }}
    </div>

    <!-- Canvas confetti — zero-dependency particle system -->
    <canvas ref="confettiCanvas" class="pointer-events-none fixed inset-0 z-50 h-full w-full" />

    <div class="mx-auto max-w-4xl px-6 py-12">
      <Transition name="screen-fade" mode="out-in">

        <!-- ── PHASE 1: LOBBY ── -->
        <section v-if="phase === 'lobby'" key="lobby" class="flex flex-col items-center" aria-labelledby="lobby-heading">
          <div class="reveal-visible w-full max-w-lg space-y-8 rounded-[2.5rem] border border-paper-200 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-white/5">

            <header class="text-center space-y-2">
              <h1 id="lobby-heading" class="font-display text-3xl font-black tracking-tight md:text-4xl">
                Ready to Practice?
              </h1>
              <p class="text-base font-medium text-sage dark:text-paper-200">
                Sharpen your skills in <span class="text-scholar-600 font-bold">{{ userStore.currentSubject || 'your field' }}</span>.
              </p>
            </header>

            <!-- Field Snapshot -->
            <div class="flex items-center gap-4 rounded-2xl bg-paper-50 px-5 py-4 dark:bg-white/5">
              <span class="text-3xl">🎓</span>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-sage">Subject</p>
                <p class="font-display text-lg font-bold text-scholar-700 dark:text-scholar-100">
                  {{ userStore.currentSubject?.toUpperCase() || 'General' }}
                </p>
              </div>
              <NuxtLink to="/fields" class="ml-auto text-xs font-bold text-scholar-600 no-underline hover:text-scholar-700 transition-colors">Change</NuxtLink>
            </div>

            <!-- Mode Selector -->
            <div role="group" aria-labelledby="mode-label">
              <p id="mode-label" class="mb-3 text-[10px] font-black uppercase tracking-widest text-sage">
                Select Scholar Mode
              </p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="setMode('standard')"
                  :aria-pressed="userStore.studentMode === 'standard'"
                  :class="userStore.studentMode === 'standard'
                    ? 'border-scholar-600 bg-scholar-50 dark:bg-scholar-900/30 ring-2 ring-scholar-600/20'
                    : 'border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-scholar-600/40'"
                  class="flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all"
                >
                  <span class="text-3xl">🖥️</span>
                  <div>
                    <p class="font-display font-black text-sm">Standard Scholar</p>
                    <p class="text-[10px] text-sage mt-0.5">Click to answer questions</p>
                  </div>
                  <div v-if="userStore.studentMode === 'standard'" class="mt-1 h-2 w-2 rounded-full bg-scholar-600" />
                </button>

                <button
                  @click="setMode('blind')"
                  :aria-pressed="userStore.studentMode === 'blind'"
                  :class="userStore.studentMode === 'blind'
                    ? 'border-scholar-600 bg-scholar-50 dark:bg-scholar-900/30 ring-2 ring-scholar-600/20'
                    : 'border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-scholar-600/40'"
                  class="flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all"
                >
                  <span class="text-3xl">🎧</span>
                  <div>
                    <p class="font-display font-black text-sm">Blind Scholar</p>
                    <p class="text-[10px] text-sage mt-0.5">100% hands-free voice</p>
                  </div>
                  <div v-if="userStore.studentMode === 'blind'" class="mt-1 h-2 w-2 rounded-full bg-scholar-600 animate-pulse" />
                </button>
              </div>

              <!-- Blind mode active banner -->
              <Transition name="slide-up">
                <div v-if="userStore.studentMode === 'blind'"
                  class="mt-3 flex items-center gap-3 rounded-xl border border-scholar-600/30 bg-scholar-50 dark:bg-scholar-900/20 px-4 py-3">
                  <span class="relative flex h-3 w-3 flex-shrink-0">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-scholar-400 opacity-75" />
                    <span class="relative inline-flex h-3 w-3 rounded-full bg-scholar-600" />
                  </span>
                  <p class="text-xs font-bold text-scholar-700 dark:text-scholar-300">
                    Blind Mode active. Say <strong>"Start"</strong> to begin.
                  </p>
                  <NuxtLink to="/voice-test" class="ml-auto text-[10px] font-black uppercase tracking-widest text-scholar-600 hover:text-scholar-700 transition-colors whitespace-nowrap">
                    Calibrate →
                  </NuxtLink>
                </div>
              </Transition>
            </div>

            <!-- Session Length -->
            <div class="space-y-6">
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

              <!-- Voice toggle (standard mode only) -->
              <div v-if="userStore.studentMode === 'standard'" role="group" aria-labelledby="voice-label">
                <p id="voice-label" class="mb-3 text-[10px] font-black uppercase tracking-widest text-sage">Voice Accessibility</p>
                <button
                  v-if="speechSupported"
                  @click="toggleVoice"
                  class="group flex w-full items-center justify-between rounded-2xl border-2 border-paper-200 bg-white px-6 py-4 transition-all hover:border-scholar-600/50 dark:border-white/10 dark:bg-white/5"
                  :aria-pressed="voiceEnabled"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{{ voiceEnabled ? '🎤' : '🎙️' }}</span>
                    <div class="text-left">
                      <span class="font-bold text-sm block">{{ voiceEnabled ? 'Voice Mode On' : 'Voice Mode Off' }}</span>
                      <span class="text-[11px] text-sage">Say A, B, C, or D to answer</span>
                    </div>
                  </div>
                  <div :class="voiceEnabled ? 'bg-scholar-600' : 'bg-paper-200 dark:bg-white/10'" class="h-6 w-11 rounded-full relative transition-colors">
                    <div :class="voiceEnabled ? 'translate-x-6' : 'translate-x-1'" class="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-sm" />
                  </div>
                </button>
                <p v-else class="rounded-2xl border-2 border-dashed border-paper-200 px-5 py-4 text-xs font-bold text-sage dark:border-white/10">
                  🚫 Speech recognition unsupported in this browser.
                </p>
              </div>
            </div>

            <div class="pt-4">
              <div v-if="gameStore.loading" class="flex items-center justify-center gap-3 text-sm font-bold text-scholar-600 py-4">
                <div class="h-5 w-5 animate-spin rounded-full border-2 border-scholar-200 border-t-scholar-600" />
                <span>Curating questions…</span>
              </div>
              <button
                v-else
                @click="startSession"
                class="w-full rounded-2xl bg-scholar-600 py-5 font-display text-xl font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 hover:scale-[1.02]"
              >
                Begin Session
              </button>
            </div>
          </div>
        </section>

        <!-- ── PHASE 2: QUIZ ── -->
        <section v-else-if="phase === 'quiz'" key="quiz" class="w-full max-w-3xl mx-auto space-y-6">
          <QuizCard
            v-if="currentQuestion"
            ref="quizCardRef"
            :question="currentQuestion"
            :session-id="gameStore.sessionId"
            :auto-start-timer="userStore.studentMode === 'standard'"
            @answered="onAnswered"
            @next="handleNext"
            @complete="handleComplete"
          />

          <!-- Voice Status Bar -->
          <div v-if="(voiceEnabled || userStore.studentMode === 'blind') && speechSupported"
            class="flex items-center justify-center gap-3">

            <!-- Blind mode: rich status pill -->
            <div v-if="userStore.studentMode === 'blind'"
              class="px-6 py-3 rounded-full border-2 transition-all flex items-center gap-3"
              :class="isConfirming
                ? 'bg-gold-50 border-gold-400 text-gold-700 dark:bg-gold-900/20'
                : isListening
                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/10 animate-pulse'
                : 'bg-white border-paper-200 text-sage dark:bg-white/5 dark:border-white/10'"
            >
              <span class="h-2 w-2 rounded-full flex-shrink-0"
                :class="isConfirming ? 'bg-gold-500' : isListening ? 'bg-red-500' : 'bg-paper-300'" />
              <span class="text-xs font-black uppercase tracking-widest">
                {{ isConfirming ? 'Awaiting confirmation…' : isListening ? 'Listening for command…' : 'A.I. speaking…' }}
              </span>
            </div>

            <!-- Standard voice mode: manual controls -->
            <template v-else>
              <button
                @click="startMic"
                :disabled="isListening || sessionStore.isAnswered"
                class="flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm transition-all"
                :class="isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-scholar-600 text-white shadow-lg shadow-scholar-600/20'"
              >
                {{ isListening ? 'Listening…' : '🎤 Speak Answer' }}
              </button>
              <button
                @click="readQuestionAloud()"
                :disabled="isSpeaking"
                class="flex items-center gap-2 rounded-xl border-2 border-paper-200 px-4 py-3 font-bold text-sm transition-all dark:border-white/10"
              >
                {{ isSpeaking ? 'Reading…' : '🔈 Read Aloud' }}
              </button>
            </template>
          </div>
        </section>

        <!-- ── PHASE 3: RESULTS ── -->
        <section v-else-if="phase === 'results'" key="results" class="flex flex-col items-center">
          <div class="reveal-visible w-full max-w-lg space-y-8 rounded-[3rem] border border-paper-200 bg-white p-12 text-center shadow-2xl dark:border-white/10 dark:bg-white/5">

            <div
              class="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-5xl"
              :class="scorePercent >= 81
                ? 'bg-gold-50 dark:bg-gold-900/20 animate-bounce-slow'
                : scorePercent >= 50
                ? 'bg-scholar-50 dark:bg-scholar-900/20 animate-float'
                : 'bg-paper-100 dark:bg-white/5 opacity-80'"
            >
              {{ scorePercent >= 81 ? '🏆' : scorePercent >= 50 ? '✨' : '📖' }}
            </div>

            <header class="space-y-2">
              <h2 class="font-display text-7xl font-black tracking-tighter text-shimmer">
                {{ scorePercent }}%
              </h2>
              <p class="font-mono text-lg font-bold text-sage">
                {{ sessionStore.score }} / {{ sessionStore.totalQuestions }} Correct
              </p>
              <p class="font-display font-black text-xl"
                :class="scorePercent >= 81 ? 'text-gold-600' : scorePercent >= 50 ? 'text-scholar-600' : 'text-sage'">
                {{ performanceLabel }}
              </p>
            </header>

            <div class="inline-flex items-center gap-3 rounded-2xl bg-scholar-600 px-6 py-3 text-white shadow-lg">
              <span class="text-xl">⬡</span>
              <span class="font-display font-black">+{{ completionResult?.xp_earned ?? sessionStore.sessionXP }} XP Earned</span>
            </div>

            <div v-if="completionResult?.newly_unlocked?.length" class="space-y-2">
              <div v-for="ach in completionResult.newly_unlocked" :key="ach.id"
                class="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-600 dark:text-green-400">
                <span>{{ ach.icon }}</span>
                <span>{{ ach.name }} Unlocked!</span>
              </div>
            </div>

            <!-- Blind mode navigation hint -->
            <div v-if="userStore.studentMode === 'blind'"
              class="rounded-xl border border-scholar-600/20 bg-scholar-50 dark:bg-scholar-900/20 px-4 py-3">
              <p class="text-[10px] font-black uppercase tracking-widest text-scholar-600 mb-1">Voice Control Active</p>
              <p class="text-xs font-bold text-scholar-700 dark:text-scholar-300">
                Say <strong>"Restart"</strong> to try again or <strong>"Dashboard"</strong> to exit
              </p>
            </div>

            <div class="grid gap-3 pt-4 sm:grid-cols-2">
              <button @click="restartSession" class="rounded-2xl bg-scholar-600 py-4 font-bold text-white shadow-lg hover:bg-scholar-700 transition-all">
                Play Again
              </button>
              <NuxtLink to="/dashboard" class="rounded-2xl border-2 border-paper-200 py-4 font-bold text-paper-900 dark:border-white/10 dark:text-white transition-all flex items-center justify-center">
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
useHead({ title: 'Practice Session — MASTERY' })

const route        = useRoute()
const router       = useRouter()
const userStore    = useUserStore()
const sessionStore = useSessionStore()
const gameStore    = useGameStore()
const sound        = useSound()

// ── STATE ──────────────────────────────────────────────────────────────────
const phase                = ref<'lobby' | 'quiz' | 'results'>('lobby')
const selectedLength       = ref(10)
const currentQuestionIndex = ref(0)
const sessionStartTime     = ref(0)
const completionResult     = ref<any>(null)
const quizCardRef          = ref<any>(null)
const confettiCanvas       = ref<HTMLCanvasElement | null>(null)

// Voice state
const voiceEnabled        = ref(false)
const isListening         = ref(false)
const isSpeaking          = ref(false)
const isConfirming        = ref(false)          // Confirmation loop flag (Doc 5)
const pendingAnswerIndex  = ref<number | null>(null) // Pending confirmation index
const speechSupported     = ref(false)
let   recognition: any    = null
let   silenceTimer: ReturnType<typeof setTimeout> | null = null
let   blindRestartCount   = 0

// ── FUZZY INTENT DICTIONARY (Doc 5) ───────────────────────────────────────
const INTENTS = {
  START:     ['start', 'starts', 'started', 'star', 'begin', 'go', 'okay'],
  RESTART:   ['restart', 'reset', 'again', 'play again'],
  DASHBOARD: ['dashboard', 'exit', 'back', 'finish'],
  A:         ['option a', 'choice a', 'hay', 'hey', 'apple', ' a ', 'answer a'],
  B:         ['option b', 'choice b', 'boy', 'bee', 'ball', ' b ', 'answer b'],
  C:         ['option c', 'choice c', 'see', 'sea', 'cat', ' c ', 'answer c'],
  D:         ['option d', 'choice d', 'dee', 'dog', 'door', ' d ', 'answer d'],
  YES:       ['yes', 'yeah', 'yep', 'correct', 'confirm', 'that is correct', 'that one'],
  NO:        ['no', 'wrong', 'change', 'wait', 'cancel'],
  READ:      ['read', 'repeat', 'again', 'say again'],
}

// ── COMPUTED ───────────────────────────────────────────────────────────────
const currentQuestion = computed(() => {
  if (!gameStore.questions?.length) return null
  return gameStore.questions[currentQuestionIndex.value] || null
})

const scorePercent = computed(() => sessionStore.scorePercent)

const performanceLabel = computed(() => {
  if (scorePercent.value >= 81) return '🏆 Mastery — Outstanding!'
  if (scorePercent.value >= 50) return '⭐ Rising Star — Keep going!'
  return '📖 Study Hard — You\'ll improve!'
})

const lengthOptions = [
  { value: 5,  minutes: 5  },
  { value: 10, minutes: 10 },
  { value: 20, minutes: 20 },
]

// ── SPEECH SYNTHESIS ───────────────────────────────────────────────────────

/** Speak text. Cancels any current speech first (barge-in support). */
const speak = (text: string, onEnd?: () => void) => {
  if (!import.meta.client) return
  window.speechSynthesis.cancel()
  isSpeaking.value = true

  const utt   = new SpeechSynthesisUtterance(text)
  utt.lang    = 'en-NG'
  utt.rate    = 0.95
  utt.onend   = () => { isSpeaking.value = false; onEnd?.() }
  utt.onerror = () => { isSpeaking.value = false; onEnd?.() }
  window.speechSynthesis.speak(utt)
}

/** Silence all speech immediately. */
const silenceAll = () => {
  if (!import.meta.client) return
  window.speechSynthesis.cancel()
  isSpeaking.value = false
  if (isListening.value) try { recognition?.stop() } catch { /* noop */ }
}

// ── QUESTION READER ────────────────────────────────────────────────────────
const readQuestionAloud = (onEnd?: () => void) => {
  const q = currentQuestion.value
  if (!q || !import.meta.client) return
  const options = q.options
    .map((o: string, i: number) => `Option ${['A', 'B', 'C', 'D'][i]}: ${o}`)
    .join('. ')
  speak(
    `Question ${currentQuestionIndex.value + 1}. ${q.question_text || q.question}. ${options}`,
    onEnd
  )
}

// ── CONFETTI ───────────────────────────────────────────────────────────────
const triggerCelebration = (percent: number) => {
  if (!import.meta.client || percent < 50) return

  // CSS canvas confetti — zero dependencies
  const canvas = confettiCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight

  const colors = percent >= 81
    ? ['#F5C518', '#C49A00', '#FFD700', '#FFF9E6', '#FFFFFF']
    : ['#16a34a', '#86efac', '#e5e7eb', '#a8a29e', '#FFFFFF']

  const particles: Array<{
    x: number; y: number; vx: number; vy: number
    r: number; color: string; angle: number; spin: number; opacity: number
  }> = []

  const count = percent >= 81 ? 220 : 80
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      r: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    })
  }

  let frame = 0
  const maxFrames = percent >= 81 ? 240 : 140
  const animate = () => {
    if (frame >= maxFrames) { ctx.clearRect(0, 0, canvas.width, canvas.height); return }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.vy += 0.12
      p.opacity = Math.max(0, 1 - frame / maxFrames)
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.fillStyle   = p.color
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.4)
      ctx.restore()
    }
    frame++
    requestAnimationFrame(animate)
  }
  animate()
}

// ── QUIZ FLOW ──────────────────────────────────────────────────────────────
async function loadQuestions() {
  const subject = (route.query.subject as string) || userStore.currentSubject || 'jamb'
  await gameStore.startSession(subject, selectedLength.value)
}

async function startSession() {
  silenceAll()
  if (!gameStore.hasQuestions) await loadQuestions()
  if (!gameStore.hasQuestions) return

  sessionStore.reset()
  sessionStore.totalQuestions = gameStore.questions.length
  sessionStore.subject        = userStore.currentSubject || 'jamb'
  currentQuestionIndex.value  = 0
  sessionStartTime.value      = Date.now()
  phase.value = 'quiz'
  sound.playClick?.()

  if (userStore.studentMode === 'blind') {
    // Read question first, start mic + timer only AFTER reading is done (Doc 5 sequencing)
    nextTick(() => setTimeout(() => readQuestionAloud(() => {
      quizCardRef.value?.startTimer()
      startMic()
    }), 300))
  }
}

/** Called by QuizCard @answered — correct: boolean */
function onAnswered(correct: boolean) {
  silenceAll() // Shut Up Rule
  stopMic()
  isConfirming.value       = false
  pendingAnswerIndex.value = null

  if (userStore.studentMode === 'blind') {
    const feedback = correct ? 'Correct! Well done.' : 'Incorrect. The answer has been revealed.'
    speak(feedback, () => setTimeout(() => nextQuestion(), 1200))
  }
}

/** Called by QuizCard @next (standard mode manual next) */
function handleNext() {
  currentQuestionIndex.value++
  if (userStore.studentMode === 'blind') {
    nextTick(() => readQuestionAloud(() => {
      quizCardRef.value?.startTimer()
      startMic()
    }))
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value + 1 >= gameStore.questions.length) {
    handleComplete()
  } else {
    currentQuestionIndex.value++
    sessionStore.nextQuestion?.()
    if (userStore.studentMode === 'blind') {
      readQuestionAloud(() => {
        quizCardRef.value?.startTimer()
        startMic()
      })
    }
  }
}

/** Called by QuizCard @complete (standard mode) */
async function handleComplete() {
  silenceAll()
  stopMic()
  if (recognition) try { recognition.abort() } catch { /* noop */ }

  const durationSeconds = Math.round((Date.now() - sessionStartTime.value) / 1000)
  phase.value = 'results'
  sound.playLevelUp?.()

  nextTick(() => triggerCelebration(scorePercent.value))

  if (userStore.studentMode === 'blind') {
    const mastery = scorePercent.value >= 81 ? 'Mastery'
                  : scorePercent.value >= 50 ? 'Rising Star'
                  : 'Study Hard'
    setTimeout(() => {
      speak(
        `Session complete. You scored ${sessionStore.score} out of ${sessionStore.totalQuestions}. Your performance is ${mastery}. Say Restart to play again, or Dashboard to exit.`,
        () => startMic()
      )
    }, 800)
  }

  const result = await sessionStore.finishSession(durationSeconds)
  if (result?.success) completionResult.value = result
}

async function restartSession() {
  silenceAll()
  stopMic()
  isConfirming.value       = false
  pendingAnswerIndex.value = null
  phase.value = 'lobby'
  sessionStore.reset()
  gameStore.reset()
  currentQuestionIndex.value = 0
  await loadQuestions()
}

// ── VOICE / MIC CONTROL ────────────────────────────────────────────────────

/** Standard mode voice toggle */
function toggleVoice() {
  voiceEnabled.value = !voiceEnabled.value
  if (!voiceEnabled.value) {
    recognition?.abort()
    silenceAll()
    isListening.value = false
  }
}

/** Set mode from lobby selector — Doc 5's setMode */
function setMode(mode: 'standard' | 'blind') {
  if (!import.meta.client) return
  userStore.studentMode = mode

  if (mode === 'blind') {
    voiceEnabled.value = true
    if (!recognition) buildRecognition()
    setTimeout(() =>
      speak('Blind mode activated. Hands-free control enabled. Say Start to begin.'), 200)
  } else {
    silenceAll()
    stopMic()
    voiceEnabled.value = false
  }
}

const startMic = () => {
  if (!speechSupported.value || isListening.value) return
  isListening.value = true
  blindRestartCount++
  try { recognition?.start() } catch { isListening.value = false }
}

const stopMic = () => {
  isListening.value = false
  try { recognition?.stop() } catch { /* noop */ }
}

// ── RECOGNITION ENGINE ─────────────────────────────────────────────────────
function buildRecognition() {
  if (!import.meta.client) return
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRec) return

  recognition                = new SpeechRec()
  recognition.continuous     = true
  recognition.interimResults = true  // Keep for silence-probability guard
  recognition.lang           = 'en-NG'

  recognition.onresult = (e: any) => {
    if (silenceTimer) clearTimeout(silenceTimer)
    let interim = ''

    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        const text = e.results[i][0].transcript.toLowerCase().trim()
        silenceAll() // Barge-in: user spoke → AI stops
        handleFuzzyCommand(text)
      } else {
        interim += e.results[i][0].transcript
      }
    }

    // Silence-probability guard: commit interim after 1s of silence
    if (interim.trim()) {
      silenceTimer = setTimeout(() => {
        const text = interim.trim().toLowerCase()
        if (text) handleFuzzyCommand(text)
      }, 1000)
    }
  }

  recognition.onend = () => {
    isListening.value = false
    // Auto-restart in Blind Mode unless we deliberately stopped
    if (userStore.studentMode === 'blind' && phase.value !== 'lobby' && !isSpeaking.value && blindRestartCount < 500) {
      setTimeout(() => startMic(), 300)
    }
  }

  recognition.onerror = (e: any) => {
    const ignorable = ['no-speech', 'aborted']
    isListening.value = false
    if (userStore.studentMode === 'blind' && !ignorable.includes(e.error)) {
      setTimeout(() => startMic(), 600)
    }
  }
}

// ── FUZZY COMMAND INTERPRETER (Doc 5) ─────────────────────────────────────
const fuzzyMatch = (text: string, keys: string[]) =>
  keys.some(k => text.includes(k))

function handleFuzzyCommand(text: string) {
  if (!text) return

  // ── Lobby ──
  if (phase.value === 'lobby') {
    if (fuzzyMatch(text, INTENTS.START)) startSession()
    return
  }

  // ── Confirmation loop (Doc 5's two-step safety) ──
  if (isConfirming.value) {
    if (fuzzyMatch(text, INTENTS.YES)) {
      isConfirming.value = false
      if (pendingAnswerIndex.value !== null) {
        quizCardRef.value?.selectVoiceAnswer(pendingAnswerIndex.value)
      }
    } else if (fuzzyMatch(text, INTENTS.NO)) {
      isConfirming.value       = false
      pendingAnswerIndex.value = null
      speak('No problem. Please say your answer again.')
    }
    return
  }

  // ── Quiz ──
  if (phase.value === 'quiz') {
    // Read / repeat request
    if (fuzzyMatch(text, INTENTS.READ)) {
      readQuestionAloud()
      return
    }

    // Answer detection — fuzzy match + confirmation loop
    let index = -1
    if      (fuzzyMatch(` ${text} `, INTENTS.A) || text === 'a') index = 0
    else if (fuzzyMatch(` ${text} `, INTENTS.B) || text === 'b') index = 1
    else if (fuzzyMatch(` ${text} `, INTENTS.C) || text === 'c') index = 2
    else if (fuzzyMatch(` ${text} `, INTENTS.D) || text === 'd') index = 3

    if (index !== -1) {
      stopMic()
      pendingAnswerIndex.value = index
      isConfirming.value       = true
      speak(
        `You chose option ${['A', 'B', 'C', 'D'][index]}: ${currentQuestion.value?.options[index]}. Is that correct? Say yes to confirm or no to change.`,
        () => startMic()
      )
    }
    return
  }

  // ── Results ──
  if (phase.value === 'results') {
    if (fuzzyMatch(text, INTENTS.RESTART))   restartSession()
    if (fuzzyMatch(text, INTENTS.DASHBOARD)) router.push('/dashboard')
  }
}

// ── LIFECYCLE ──────────────────────────────────────────────────────────────
onMounted(() => {
  loadQuestions()
  if (import.meta.client) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    speechSupported.value = !!SpeechRec
    if (SpeechRec) buildRecognition()
  }
})

onUnmounted(() => {
  silenceAll()
  stopMic()
  if (silenceTimer) clearTimeout(silenceTimer)
  if (recognition) try { recognition.abort() } catch { /* noop */ }
})

// Re-read question when it changes in voice modes
watch(currentQuestion, (newQ) => {
  if ((voiceEnabled.value || userStore.studentMode === 'blind') && newQ && phase.value === 'quiz') {
    if (userStore.studentMode === 'standard') nextTick(() => readQuestionAloud())
    // Blind mode reading is sequenced through readQuestionAloud() callbacks, not this watcher
  }
})

watch(selectedLength, loadQuestions)

// Rebuild recognition engine when mode switches
watch(() => userStore.studentMode, () => {
  if (!import.meta.client || !speechSupported.value) return
  if (recognition) { try { recognition.abort() } catch { /* noop */ }; recognition = null }
  buildRecognition()
})
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

.text-shimmer {
  background: linear-gradient(90deg, #4f46e5 0%, #9333ea 40%, #4f46e5 60%, #9333ea 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer { to { background-position: 200% center; } }

.screen-fade-enter-active, .screen-fade-leave-active { transition: all 0.4s ease; }
.screen-fade-enter-from,  .screen-fade-leave-to      { opacity: 0; transform: translateY(10px); }

.slide-up-enter-active { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.slide-up-enter-from   { opacity: 0; transform: translateY(8px); }
.slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-leave-to     { opacity: 0; }

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
.animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
</style>