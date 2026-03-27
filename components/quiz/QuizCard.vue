<template>
  <div class="bg-navy-700 border rounded-2xl p-7 max-w-[680px] mx-auto w-full transition-colors duration-200" :class="{
    'border-green-500/30 animate-correct': lastResult === 'correct',
    'border-red-500/30 animate-wrong': lastResult === 'wrong',
    'border-navy-500': !lastResult,
  }" role="main" aria-labelledby="question-heading">
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ sessionStore.liveAnnouncement }}
    </div>

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6 flex-wrap">
      <div class="flex gap-1.5">
        <span
          class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/30"
          aria-hidden="true">
          {{ question.subject }}
        </span>
        <span
          class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500"
          aria-hidden="true">
          {{ question.difficulty }}
        </span>
        <span class="sr-only">{{ question.subject }}, {{ question.difficulty }} difficulty</span>
      </div>

      <!-- Progress -->
      <div class="flex-1 min-w-[100px] flex items-center gap-2">
        <span class="font-mono text-xs font-bold text-navy-400 whitespace-nowrap"
          :aria-label="`Question ${sessionStore.currentQuestion + 1} of ${sessionStore.totalQuestions}`">
          {{ sessionStore.currentQuestion + 1 }}<span class="text-navy-500 mx-0.5">/</span>{{
            sessionStore.totalQuestions }}
        </span>
        <div class="flex-1 h-1 bg-navy-600 rounded-full overflow-hidden" role="progressbar"
          :aria-valuenow="sessionStore.progress" aria-valuemin="0" aria-valuemax="100"
          :aria-label="`Quiz progress: ${sessionStore.progress}%`">
          <div class="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500"
            :style="{ width: sessionStore.progress + '%' }" />
        </div>
      </div>

      <!-- Timer -->
      <div
        class="flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold font-mono transition-all duration-200 flex-shrink-0"
        :class="timeRemaining <= 10
          ? 'text-red-500 border-red-500/30 bg-red-500/10 animate-pulse-gold'
          : 'text-navy-400 border-navy-500 bg-navy-600'" role="timer"
        :aria-label="`${timeRemaining} seconds remaining`" :aria-live="timeRemaining <= 10 ? 'assertive' : 'off'">
        <span aria-hidden="true" class="text-xs">⏱</span>
        <span>{{ String(timeRemaining).padStart(2, '0') }}</span>
      </div>

      <!-- Flag button -->
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg border border-navy-500 bg-transparent text-navy-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-150 cursor-pointer flex-shrink-0"
        aria-label="Flag this question as incorrect or inappropriate" title="Report question" @click="openFlagModal">
        <span aria-hidden="true" class="text-sm">⚑</span>
      </button>
    </div>

    <!-- Question -->
    <div class="mb-6">
      <p id="question-heading" ref="questionRef" tabindex="-1"
        class="text-lg font-semibold text-white leading-relaxed tracking-tight mb-3 outline-none">
        {{ question.question_text ?? question.question }}
      </p>
      <span
        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/[0.08] border border-gold-500/20 font-mono text-[11px] font-bold text-gold-500"
        aria-hidden="true">
        +{{ question.xp_reward ?? question.xp ?? 10 }} XP
      </span>
    </div>

    <!-- Options -->
    <fieldset class="border-0 p-0 m-0" :disabled="sessionStore.isAnswered || submitting">
      <legend class="sr-only">Choose your answer for: {{ question.question_text ?? question.question }}</legend>
      <div class="flex flex-col gap-2.5" role="list">
        <button v-for="(option, index) in question.options" :key="index"
          class="relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-left font-sans text-sm transition-all duration-200 overflow-hidden group"
          :class="getOptionClasses(index)" role="listitem" :aria-label="getOptionAriaLabel(index, option)"
          :aria-pressed="sessionStore.selectedOption === index"
          :aria-disabled="(sessionStore.isAnswered || submitting) && sessionStore.selectedOption !== index"
          @click="selectAnswer(index)" @keydown.enter="selectAnswer(index)"
          @keydown.space.prevent="selectAnswer(index)">
          <span
            class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-extrabold border-2 transition-all duration-200"
            :class="getLetterClasses(index)" aria-hidden="true">{{ LETTERS[index] }}</span>
          <span class="flex-1 leading-snug">{{ option }}</span>
          <span class="flex-shrink-0 w-5 text-center font-black text-base" aria-hidden="true">
            <!-- Show spinner on selected option while waiting for API -->
            <span v-if="submitting && index === pendingIndex"
              class="inline-block w-4 h-4 border-2 border-navy-400 border-t-gold-500 rounded-full animate-spin" />
            <span v-else-if="sessionStore.isAnswered && index === correctIndex" class="text-green-500">✓</span>
            <span v-else-if="sessionStore.isAnswered && index === sessionStore.selectedOption && index !== correctIndex"
              class="text-red-500">✗</span>
          </span>
        </button>
      </div>
    </fieldset>

    <!-- Explanation panel -->
    <Transition name="explain">
      <div v-if="sessionStore.isAnswered && sessionStore.showExplanation"
        class="mt-4 bg-purple-500/[0.08] border border-purple-500/25 rounded-xl p-4" role="note"
        aria-label="Answer explanation" aria-live="polite">
        <div class="flex items-center gap-2 mb-2">
          <span aria-hidden="true" class="text-base">💡</span>
          <span class="text-[11px] font-bold uppercase tracking-widest text-purple-400">Explanation</span>
        </div>
        <p class="text-sm text-navy-400 leading-relaxed">{{ serverExplanation ?? question.explanation }}</p>
      </div>
    </Transition>

    <!-- Footer -->
    <div class="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-navy-600">
      <button v-if="sessionStore.isAnswered && !sessionStore.showExplanation"
        class="px-4 py-2 rounded-lg bg-transparent border-0 text-navy-400 text-sm font-semibold hover:text-white hover:bg-navy-600 transition-all duration-150 cursor-pointer"
        aria-label="Show explanation for this answer" @click="showExplanationPanel">
        Why? 💡
      </button>
      <button v-if="sessionStore.isAnswered" ref="nextBtn"
        class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-all duration-200 cursor-pointer"
        :aria-label="isLastQuestion ? 'See your results' : 'Next question'" @click="nextQuestion">
        <span>{{ isLastQuestion ? 'See Results' : 'Next' }}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>

    <!-- ── Flag / Report Modal ── -->
    <Transition name="explain">
      <div v-if="flagModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4" role="dialog"
        aria-modal="true" aria-labelledby="flag-heading" @click.self="flagModalOpen = false">
        <div class="bg-navy-700 border border-navy-500 rounded-2xl p-6 w-full max-w-[400px] flex flex-col gap-4">
          <h2 id="flag-heading" class="text-base font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">⚑</span> Report Question
          </h2>
          <p class="text-xs text-navy-400">Select the reason for flagging this question.</p>

          <div class="flex flex-col gap-2" role="group" aria-label="Report reason">
            <button v-for="reason in reportReasons" :key="reason.value"
              class="flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150 cursor-pointer"
              :class="selectedReason === reason.value
                ? 'bg-red-500/10 border-red-500/40 text-white'
                : 'bg-navy-600 border-navy-500 text-navy-400 hover:border-navy-400 hover:text-white'"
              @click="selectedReason = reason.value">
              <span aria-hidden="true">{{ reason.icon }}</span>
              {{ reason.label }}
            </button>
          </div>

          <div>
            <label for="flag-note"
              class="block text-[11px] font-bold uppercase tracking-widest text-navy-400 mb-1.5">Note (optional)</label>
            <textarea id="flag-note" v-model="flagNote" rows="2" placeholder="Any additional details…"
              class="w-full bg-navy-600 border border-navy-500 rounded-lg px-3 py-2 text-sm text-white placeholder:text-navy-400 focus:outline-none focus:border-red-500/50 transition-colors resize-none" />
          </div>

          <p v-if="flagSuccess" class="text-xs text-green-400" role="status">{{ flagSuccess }}</p>
          <p v-if="flagError" class="text-xs text-red-400" role="alert">{{ flagError }}</p>

          <div class="flex gap-2">
            <button
              class="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-400 transition-all duration-200 disabled:opacity-50 cursor-pointer"
              :disabled="!selectedReason || flagSubmitting" @click="submitFlag">
              {{ flagSubmitting ? 'Submitting…' : 'Submit Report' }}
            </button>
            <button
              class="px-5 py-2.5 rounded-lg border border-navy-500 text-navy-400 font-semibold text-sm hover:bg-navy-600 hover:text-white transition-all duration-200 cursor-pointer bg-transparent"
              @click="flagModalOpen = false">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/sessionStore'
import { useAuthStore } from '~/stores/authStore'

const props = defineProps<{
  question: {
    id: string | number
    question_text?: string
    question?: string
    options: string[]
    correct?: number
    correct_index?: number
    difficulty: string
    subject: string
    explanation?: string
    xp_reward?: number
    xp?: number
  }
  sessionId?: string | null
}>()

const emit = defineEmits<{
  answered: [correct: boolean, xp: number]
  next: []
  complete: []
}>()

const sessionStore = useSessionStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const sound = useSound()
const announcer = useAnnouncer()

const LETTERS = ['A', 'B', 'C', 'D']
const questionRef = ref<HTMLElement | null>(null)
const nextBtn = ref<HTMLElement | null>(null)
const timeRemaining = ref(30)
const lastResult = ref<'correct' | 'wrong' | null>(null)
let timerInterval: ReturnType<typeof setInterval> | null = null

// Submitting state while waiting for API response
const submitting = ref(false)
const pendingIndex = ref<number | null>(null)
const serverExplanation = ref<string | null>(null)

// correctIndex: prefer the server's response stored in sessionStore,
// fall back to whatever the question prop has (for local dev / mock data)
const correctIndex = computed(() =>
  sessionStore.lastCorrectIndex ?? props.question.correct_index ?? props.question.correct ?? 0
)

const isLastQuestion = computed(() =>
  sessionStore.currentQuestion + 1 >= sessionStore.totalQuestions
)

onMounted(() => {
  questionRef.value?.focus()
  startTimer()
  announcer.announceQuestion?.(
    sessionStore.currentQuestion + 1,
    sessionStore.totalQuestions,
    props.question.question_text ?? props.question.question ?? ''
  )
})
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval!)
      if (!sessionStore.isAnswered) autoFail()
    } else {
      timeRemaining.value--
      sessionStore.timeRemaining = timeRemaining.value
    }
  }, 1000)
}

const autoFail = () => {
  // Timer ran out — submit index -1 to backend if we have a session
  if (props.sessionId) {
    submitToBackend(-1).catch(() => { })
  }
  sessionStore.selectAnswer(-1, false)
  lastResult.value = 'wrong'
  sound.playError?.()
  announcer.announceAnswer?.(false, props.question.options[correctIndex.value])
}

// ── Core answer flow ──────────────────────────────────────────────────────
const selectAnswer = async (index: number) => {
  if (sessionStore.isAnswered || submitting.value) return
  if (timerInterval) clearInterval(timerInterval)

  submitting.value = true
  pendingIndex.value = index

  try {
    // Submit to backend and wait for the real correct_index
    const timeTakenMs = (30 - timeRemaining.value) * 1000
    const result = await submitToBackend(index, timeTakenMs)

    const serverCorrectIndex = result?.correct_index ?? props.question.correct_index ?? props.question.correct ?? 0
    const isCorrect = result?.is_correct ?? (index === serverCorrectIndex)

    if (result?.explanation) serverExplanation.value = result.explanation

    // Now update the store with the authoritative correct index from the server
    sessionStore.selectAnswer(index, isCorrect, serverCorrectIndex)
    lastResult.value = isCorrect ? 'correct' : 'wrong'
    isCorrect ? sound.playSuccess?.() : sound.playError?.()
    emit('answered', isCorrect, isCorrect ? (props.question.xp_reward ?? props.question.xp ?? 10) : 0)
    announcer.announceAnswer?.(isCorrect, props.question.options[serverCorrectIndex])
    nextTick(() => nextBtn.value?.focus())
  } catch (err) {
    // Network error fallback: use local correct_index if available
    console.error('[QuizCard] submitAnswer failed:', err)
    const fallbackCorrect = props.question.correct_index ?? props.question.correct ?? 0
    const isCorrect = index === fallbackCorrect
    sessionStore.selectAnswer(index, isCorrect, fallbackCorrect)
    lastResult.value = isCorrect ? 'correct' : 'wrong'
    isCorrect ? sound.playSuccess?.() : sound.playError?.()
    emit('answered', isCorrect, isCorrect ? (props.question.xp_reward ?? props.question.xp ?? 10) : 0)
    nextTick(() => nextBtn.value?.focus())
  } finally {
    submitting.value = false
    pendingIndex.value = null
  }
}

// Calls POST /api/trivia/session/answer and returns the response
const submitToBackend = async (index: number, timeTakenMs = 0) => {
  if (!props.sessionId) return null
  return await $fetch<any>(`${config.public.apiBase}/api/trivia/session/answer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authStore.token}` },
    credentials: 'include',
    body: {
      session_id: props.sessionId,
      question_id: String(props.question.id),
      selected_index: index,
      time_taken_ms: timeTakenMs,
    },
  })
}

const showExplanationPanel = () => {
  sessionStore.showExplanation = true
  announcer.announce?.(`Explanation: ${serverExplanation.value ?? props.question.explanation}`)
}

const nextQuestion = () => {
  sound.playClick?.()
  lastResult.value = null
  timeRemaining.value = 30
  serverExplanation.value = null
  if (sessionStore.currentQuestion + 1 >= sessionStore.totalQuestions) {
    emit('complete')
  } else {
    sessionStore.nextQuestion()
    emit('next')
    nextTick(() => { questionRef.value?.focus(); startTimer() })
  }
}

// ── Flag / Report ────────────────────────────────────────────────────────────
const flagModalOpen = ref(false)
const selectedReason = ref('')
const flagNote = ref('')
const flagSubmitting = ref(false)
const flagSuccess = ref('')
const flagError = ref('')

const reportReasons = [
  { value: 'wrong_answer', label: 'Wrong correct answer', icon: '❌' },
  { value: 'unclear', label: 'Question is unclear/confusing', icon: '❓' },
  { value: 'outdated', label: 'Information is outdated', icon: '📅' },
  { value: 'duplicate', label: 'Duplicate question', icon: '🔁' },
  { value: 'inappropriate', label: 'Inappropriate content', icon: '🚫' },
]

const openFlagModal = () => {
  flagModalOpen.value = true
  selectedReason.value = ''
  flagNote.value = ''
  flagSuccess.value = ''
  flagError.value = ''
}

const submitFlag = async () => {
  if (!selectedReason.value) return
  flagSubmitting.value = true
  flagError.value = ''
  try {
    await $fetch(`${config.public.apiBase}/api/trivia/report`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      credentials: 'include',
      body: {
        question_id: String(props.question.id),
        reason: selectedReason.value,
        note: flagNote.value || undefined,
      },
    })
    flagSuccess.value = 'Report submitted — thank you!'
    setTimeout(() => { flagModalOpen.value = false }, 1500)
  } catch (err: any) {
    flagError.value = err.data?.detail ?? 'Failed to submit report.'
  } finally {
    flagSubmitting.value = false
  }
}

// ── Tailwind class helpers ───────────────────────────────────────────────────
const getOptionClasses = (index: number) => {
  if (!sessionStore.isAnswered) {
    return submitting.value && index === pendingIndex.value
      ? 'bg-navy-600 border-gold-500/50 text-white cursor-wait opacity-80'
      : 'bg-navy-600 border-navy-500 text-white hover:border-gold-600 hover:bg-gold-500/[0.06] hover:translate-x-0.5 cursor-pointer'
  }
  if (index === correctIndex.value)
    return 'bg-green-500/10 border-green-500 text-green-400 cursor-default'
  if (index === sessionStore.selectedOption)
    return 'bg-red-500/10 border-red-500 text-red-400 cursor-default animate-wrong'
  return 'bg-navy-600 border-navy-500 text-white opacity-40 cursor-default'
}

const getLetterClasses = (index: number) => {
  if (!sessionStore.isAnswered)
    return 'bg-navy-700 border-navy-500 text-navy-400'
  if (index === correctIndex.value)
    return 'bg-green-600 border-green-500 text-white'
  if (index === sessionStore.selectedOption)
    return 'bg-red-600 border-red-500 text-white'
  return 'bg-navy-700 border-navy-500 text-navy-400'
}

const getOptionAriaLabel = (index: number, text: string) => {
  const l = LETTERS[index]
  if (!sessionStore.isAnswered) return `Option ${l}: ${text}`
  if (index === correctIndex.value) return `Option ${l}: ${text}. Correct answer.`
  if (index === sessionStore.selectedOption) return `Option ${l}: ${text}. Your answer. Incorrect.`
  return `Option ${l}: ${text}`
}
</script>

<style scoped>
.explain-enter-active,
.explain-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.explain-enter-from,
.explain-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>