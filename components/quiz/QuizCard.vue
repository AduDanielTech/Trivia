<template>
  <div
    class="bg-navy-700 border rounded-2xl p-7 max-w-[680px] mx-auto w-full transition-colors duration-200"
    :class="{
      'border-green-500/30 animate-correct': lastResult === 'correct',
      'border-red-500/30 animate-wrong':     lastResult === 'wrong',
      'border-navy-500':                      !lastResult,
    }"
    role="main"
    aria-labelledby="question-heading"
  >
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ sessionStore.liveAnnouncement }}
    </div>

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6 flex-wrap">
      <div class="flex gap-1.5">
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/30" aria-hidden="true">
          {{ question.subject }}
        </span>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-navy-600 text-navy-400 border border-navy-500" aria-hidden="true">
          {{ question.difficulty }}
        </span>
        <span class="sr-only">{{ question.subject }}, {{ question.difficulty }} difficulty</span>
      </div>

      <!-- Progress -->
      <div class="flex-1 min-w-[100px] flex items-center gap-2">
        <span class="font-mono text-xs font-bold text-navy-400 whitespace-nowrap"
          :aria-label="`Question ${sessionStore.currentQuestion + 1} of ${sessionStore.totalQuestions}`">
          {{ sessionStore.currentQuestion + 1 }}<span class="text-navy-500 mx-0.5">/</span>{{ sessionStore.totalQuestions }}
        </span>
        <div class="flex-1 h-1 bg-navy-600 rounded-full overflow-hidden"
          role="progressbar" :aria-valuenow="sessionStore.progress" aria-valuemin="0" aria-valuemax="100"
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
          : 'text-navy-400 border-navy-500 bg-navy-600'"
        role="timer"
        :aria-label="`${timeRemaining} seconds remaining`"
        :aria-live="timeRemaining <= 10 ? 'assertive' : 'off'"
      >
        <span aria-hidden="true" class="text-xs">⏱</span>
        <span>{{ String(timeRemaining).padStart(2, '0') }}</span>
      </div>
    </div>

    <!-- Question -->
    <div class="mb-6">
      <p id="question-heading" ref="questionRef" tabindex="-1" class="text-lg font-semibold text-white leading-relaxed tracking-tight mb-3 outline-none">
        {{ question.question }}
      </p>
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/[0.08] border border-gold-500/20 font-mono text-[11px] font-bold text-gold-500" aria-hidden="true">
        +{{ question.xp }} XP
      </span>
    </div>

    <!-- Options -->
    <fieldset class="border-0 p-0 m-0" :disabled="sessionStore.isAnswered">
      <legend class="sr-only">Choose your answer for: {{ question.question }}</legend>
      <div class="flex flex-col gap-2.5" role="list">
        <button
          v-for="(option, index) in question.options" :key="index"
          class="relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-left font-sans text-sm transition-all duration-200 overflow-hidden group"
          :class="getOptionClasses(index)"
          role="listitem"
          :aria-label="getOptionAriaLabel(index, option)"
          :aria-pressed="sessionStore.selectedOption === index"
          :aria-disabled="sessionStore.isAnswered && sessionStore.selectedOption !== index"
          @click="selectAnswer(index)"
          @keydown.enter="selectAnswer(index)"
          @keydown.space.prevent="selectAnswer(index)"
        >
          <!-- Letter badge -->
          <span
            class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-extrabold border-2 transition-all duration-200"
            :class="getLetterClasses(index)"
            aria-hidden="true"
          >{{ LETTERS[index] }}</span>

          <span class="flex-1 leading-snug">{{ option }}</span>

          <!-- Result indicator -->
          <span class="flex-shrink-0 w-5 text-center font-black text-base" aria-hidden="true">
            <span v-if="sessionStore.isAnswered && index === question.correct" class="text-green-500">✓</span>
            <span v-else-if="sessionStore.isAnswered && index === sessionStore.selectedOption && index !== question.correct" class="text-red-500">✗</span>
          </span>
        </button>
      </div>
    </fieldset>

    <!-- Explanation panel -->
    <Transition name="explain">
      <div v-if="sessionStore.isAnswered && sessionStore.showExplanation"
        class="mt-4 bg-purple-500/[0.08] border border-purple-500/25 rounded-xl p-4"
        role="note" aria-label="Answer explanation" aria-live="polite">
        <div class="flex items-center gap-2 mb-2">
          <span aria-hidden="true" class="text-base">💡</span>
          <span class="text-[11px] font-bold uppercase tracking-widest text-purple-400">Explanation</span>
        </div>
        <p class="text-sm text-navy-400 leading-relaxed">{{ question.explanation }}</p>
      </div>
    </Transition>

    <!-- Footer -->
    <div class="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-navy-600">
      <button
        v-if="sessionStore.isAnswered && !sessionStore.showExplanation"
        class="px-4 py-2 rounded-lg bg-transparent border-0 text-navy-400 text-sm font-semibold hover:text-white hover:bg-navy-600 transition-all duration-150 cursor-pointer"
        aria-label="Show explanation for this answer"
        @click="showExplanation">
        Why? 💡
      </button>
      <button
        v-if="sessionStore.isAnswered"
        ref="nextBtn"
        class="min-w-[140px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all duration-200 shadow-cta animate-scale-in"
        :aria-label="sessionStore.currentQuestion + 1 >= sessionStore.totalQuestions ? 'Finish quiz and see results' : 'Next question'"
        @click="nextQuestion">
        {{ sessionStore.currentQuestion + 1 >= sessionStore.totalQuestions ? 'See Results' : 'Next →' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/index'

const props = defineProps<{
  question: {
    id: number | string
    question: string
    options: string[]
    correct: number
    subject: string
    difficulty: string
    xp: number
    explanation: string
  }
}>()

const emit = defineEmits<{
  answered: [correct: boolean, xp: number]
  next: []
  complete: []
}>()

const sessionStore = useSessionStore()
const sound        = useSound()
const announcer    = useAnnouncer()

const LETTERS      = ['A', 'B', 'C', 'D']
const questionRef  = ref<HTMLElement | null>(null)
const nextBtn      = ref<HTMLElement | null>(null)
const timeRemaining = ref(30)
const lastResult   = ref<'correct' | 'wrong' | null>(null)
let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  questionRef.value?.focus()
  startTimer()
  announcer.announceQuestion(sessionStore.currentQuestion + 1, sessionStore.totalQuestions, props.question.question)
})
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value <= 0) { clearInterval(timerInterval!); if (!sessionStore.isAnswered) autoFail() }
    else timeRemaining.value--
  }, 1000)
}

const autoFail = () => {
  sessionStore.selectAnswer(-1, false)
  lastResult.value = 'wrong'
  sound.playError()
  announcer.announceAnswer(false, props.question.options[props.question.correct])
}

const selectAnswer = (index: number) => {
  if (sessionStore.isAnswered) return
  if (timerInterval) clearInterval(timerInterval)
  const isCorrect = index === props.question.correct
  sessionStore.selectAnswer(index, isCorrect)
  lastResult.value = isCorrect ? 'correct' : 'wrong'
  isCorrect ? sound.playSuccess() : sound.playError()
  emit('answered', isCorrect, isCorrect ? props.question.xp : 0)
  announcer.announceAnswer(isCorrect, props.question.options[props.question.correct])
  nextTick(() => nextBtn.value?.focus())
}

const showExplanation = () => {
  sessionStore.showExplanation = true
  announcer.announce(`Explanation: ${props.question.explanation}`)
}

const nextQuestion = () => {
  sound.playClick()
  lastResult.value = null
  timeRemaining.value = 30
  if (sessionStore.currentQuestion + 1 >= sessionStore.totalQuestions) {
    emit('complete')
  } else {
    sessionStore.nextQuestion()
    emit('next')
    nextTick(() => { questionRef.value?.focus(); startTimer() })
  }
}

// ── Tailwind class helpers ─────────────────────────────────────────
const getOptionClasses = (index: number) => {
  if (!sessionStore.isAnswered) {
    return 'bg-navy-600 border-navy-500 text-white hover:border-gold-600 hover:bg-gold-500/[0.06] hover:translate-x-0.5 cursor-pointer'
  }
  if (index === props.question.correct)
    return 'bg-green-500/10 border-green-500 text-green-400 cursor-default'
  if (index === sessionStore.selectedOption)
    return 'bg-red-500/10 border-red-500 text-red-400 cursor-default animate-wrong'
  return 'bg-navy-600 border-navy-500 text-white opacity-40 cursor-default'
}

const getLetterClasses = (index: number) => {
  if (!sessionStore.isAnswered)
    return 'bg-navy-700 border-navy-500 text-navy-400'
  if (index === props.question.correct)
    return 'bg-green-600 border-green-500 text-white'
  if (index === sessionStore.selectedOption)
    return 'bg-red-600 border-red-500 text-white'
  return 'bg-navy-700 border-navy-500 text-navy-400'
}

const getOptionAriaLabel = (index: number, text: string) => {
  const l = LETTERS[index]
  if (!sessionStore.isAnswered)           return `Option ${l}: ${text}`
  if (index === props.question.correct)   return `Option ${l}: ${text}. Correct answer.`
  if (index === sessionStore.selectedOption) return `Option ${l}: ${text}. Your answer. Incorrect.`
  return `Option ${l}: ${text}`
}
</script>

<style scoped>
.explain-enter-active, .explain-leave-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.explain-enter-from, .explain-leave-to { opacity: 0; transform: translateY(8px); }
</style>
