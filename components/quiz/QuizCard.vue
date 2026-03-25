<template>
  <div
    class="mx-auto w-full max-w-2xl transform rounded-[2.5rem] border bg-white p-8 transition-all duration-500 dark:bg-ink-800 sm:p-10"
    :class="[
      lastResult === 'correct' ? 'border-scholar-600/30 ring-4 ring-scholar-600/5 shadow-2xl' : 
      lastResult === 'wrong' ? 'border-error/30 ring-4 ring-error/5 shadow-2xl' : 
      'border-paper-200 shadow-xl dark:border-white/10'
    ]"
    role="main"
    aria-labelledby="question-heading"
  >
    <!-- Accessibility Announcement -->
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ sessionStore.liveAnnouncement }}
    </div>

    <!-- 01. HEADER: Metadata & Progress -->
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="rounded-lg bg-scholar-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-scholar-700 dark:bg-scholar-900/40 dark:text-scholar-100">
          {{ question.subject }}
        </span>
        <span class="rounded-lg bg-paper-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sage dark:bg-white/5">
          {{ question.difficulty }}
        </span>
      </div>

      <!-- Timer: High contrast & Human centric -->
      <div
        class="flex items-center gap-2 rounded-xl border px-4 py-2 font-display text-sm font-black transition-all duration-300"
        :class="timeRemaining <= 10
          ? 'border-error/20 bg-error/5 text-error animate-pulse'
          : 'border-paper-200 bg-white text-paper-900 dark:border-white/10 dark:bg-white/5 dark:text-white'"
        role="timer"
      >
        <span class="text-xs opacity-60">⏱</span>
        <span>{{ String(timeRemaining).padStart(2, '0') }}s</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-10 space-y-2">
      <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-sage">
        <span>Question {{ sessionStore.currentQuestion + 1 }} of {{ sessionStore.totalQuestions }}</span>
        <span>{{ sessionStore.progress }}% Complete</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-paper-100 dark:bg-white/10">
        <div 
          class="h-full rounded-full bg-scholar-600 transition-all duration-700 ease-out"
          :style="{ width: sessionStore.progress + '%' }" 
        />
      </div>
    </div>

    <!-- 02. THE QUESTION -->
    <div class="mb-10 space-y-4 text-center sm:text-left">
      <h2 
        id="question-heading" 
        ref="questionRef" 
        tabindex="-1" 
        class="font-display text-2xl font-extrabold leading-tight tracking-tight text-paper-900 outline-none dark:text-white md:text-3xl"
      >
        {{ question.question }}
      </h2>
      <div class="inline-flex items-center gap-2 rounded-full border border-scholar-600/20 bg-scholar-50 px-3 py-1 text-xs font-bold text-scholar-700 dark:bg-scholar-900/30 dark:text-scholar-100">
        <span class="text-sm">⚡</span> +{{ question.xp }} XP available
      </div>
    </div>

    <!-- 03. OPTIONS GRID -->
    <fieldset class="space-y-3" :disabled="sessionStore.isAnswered">
      <legend class="sr-only">Choose your answer</legend>
      <div class="grid gap-3">
        <button
          v-for="(option, index) in question.options" :key="index"
          class="group relative flex w-full items-center gap-4 rounded-2xl border-2 px-6 py-5 text-left transition-all duration-200"
          :class="getOptionClasses(index)"
          @click="selectAnswer(index)"
        >
          <!-- Letter Indicator -->
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-black border-2 transition-all"
            :class="getLetterClasses(index)"
          >
            {{ LETTERS[index] }}
          </span>

          <span class="flex-1 text-base font-bold leading-snug md:text-lg">
            {{ option }}
          </span>

          <!-- Outcome Icon -->
          <Transition name="fade">
            <span v-if="sessionStore.isAnswered && (index === question.correct || (index === sessionStore.selectedOption && index !== question.correct))" 
                  class="text-xl font-black">
              {{ index === question.correct ? '✓' : '✕' }}
            </span>
          </Transition>
        </button>
      </div>
    </fieldset>

    <!-- 04. SMART INSIGHT (Explanation) -->
    <Transition name="slide-up">
      <div v-if="sessionStore.isAnswered && sessionStore.showExplanation"
        class="mt-6 rounded-[1.5rem] border border-scholar-600/10 bg-scholar-50/50 p-6 dark:bg-scholar-900/20"
        role="note"
      >
        <div class="mb-2 flex items-center gap-2 text-scholar-700 dark:text-scholar-100">
          <span class="text-xl">💡</span>
          <span class="text-xs font-black uppercase tracking-widest">Mastery Insight</span>
        </div>
        <p class="text-base font-medium leading-relaxed text-sage dark:text-paper-200">
          {{ question.explanation }}
        </p>
      </div>
    </Transition>

    <!-- 05. FOOTER: Actions -->
    <footer class="mt-10 flex items-center justify-between border-t border-paper-100 pt-8 dark:border-white/5">
      <button
        v-if="sessionStore.isAnswered && !sessionStore.showExplanation"
        @click="showExplanation"
        class="text-sm font-black text-scholar-600 underline decoration-scholar-600/30 underline-offset-8 transition hover:text-scholar-700"
      >
        View Explanation
      </button>
      <div v-else />

      <button
        v-if="sessionStore.isAnswered"
        ref="nextBtn"
        @click="nextQuestion"
        class="flex min-w-[160px] items-center justify-center gap-2 rounded-2xl bg-scholar-600 px-8 py-4 font-display text-lg font-black text-white shadow-lg transition-all hover:bg-scholar-700 hover:scale-105 active:scale-100"
      >
        {{ sessionStore.currentQuestion + 1 >= sessionStore.totalQuestions ? 'Final Results' : 'Next Question' }}
        <span class="text-xl">→</span>
      </button>
    </footer>
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
let timerInterval: any = null

onMounted(() => {
  questionRef.value?.focus()
  startTimer()
})
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value <= 0) { 
      clearInterval(timerInterval); 
      if (!sessionStore.isAnswered) autoFail() 
    } else {
      timeRemaining.value--
    }
  }, 1000)
}

const autoFail = () => {
  sessionStore.selectAnswer(-1, false)
  lastResult.value = 'wrong'
  sound.playError()
}

const selectAnswer = (index: number) => {
  if (sessionStore.isAnswered) return
  if (timerInterval) clearInterval(timerInterval)
  
  const isCorrect = index === props.question.correct
  sessionStore.selectAnswer(index, isCorrect)
  lastResult.value = isCorrect ? 'correct' : 'wrong'
  
  isCorrect ? sound.playSuccess() : sound.playError()
  emit('answered', isCorrect, isCorrect ? props.question.xp : 0)
  
  nextTick(() => nextBtn.value?.focus())
}

const showExplanation = () => {
  sessionStore.showExplanation = true
}

const nextQuestion = () => {
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

// ── Scholar System Dynamic Classes ───────────────────────────────
const getOptionClasses = (index: number) => {
  if (!sessionStore.isAnswered) {
    return 'border-paper-200 bg-white text-paper-900 hover:border-scholar-600 hover:scale-[1.01] hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white'
  }
  if (index === props.question.correct) {
    return 'border-scholar-600 bg-scholar-50 text-scholar-700 dark:bg-scholar-900/40 dark:text-scholar-100 ring-2 ring-scholar-600/20'
  }
  if (index === sessionStore.selectedOption) {
    return 'border-error bg-error/5 text-error animate-shake'
  }
  return 'border-paper-100 bg-paper-50 opacity-40 grayscale-[0.5] dark:border-white/5 dark:bg-white/5 dark:text-paper-500'
}

const getLetterClasses = (index: number) => {
  if (!sessionStore.isAnswered) return 'border-paper-200 bg-paper-50 text-sage'
  if (index === props.question.correct) return 'border-scholar-600 bg-scholar-600 text-white'
  if (index === sessionStore.selectedOption) return 'border-error bg-error text-white'
  return 'border-paper-100 bg-paper-100 text-sage'
}
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake { animation: shake 0.3s ease-in-out; }

.fade-enter-active { transition: opacity 0.5s ease; }
.fade-enter-from { opacity: 0; }
</style>