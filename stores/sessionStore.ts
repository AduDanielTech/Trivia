// stores/sessionStore.ts
import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', {
  state: () => ({
    currentQuestion: 0,
    totalQuestions: 10,
    answers: [] as any[],
    score: 0,
    timeRemaining: 30,
    isAnswered: false,
    selectedOption: null as number | null,
    lastCorrectIndex: null as number | null,   // ← NEW
    showExplanation: false,
    subject: 'Mathematics',
    difficulty: 'Medium',
    sessionXP: 0,
    sessionId: null as string | null,
    liveAnnouncement: '',

    // Completion state
    completionResult: null as null | {
      xp_earned: number
      new_xp: number
      new_tier: string
      new_streak: number
      score_percentage: number
      newly_unlocked: any[]
      freeze_token_used: boolean
    },
    completing: false,
    completionError: null as string | null,
  }),

  getters: {
    progress: (state) => Math.round((state.currentQuestion / state.totalQuestions) * 100),
    isComplete: (state) => state.currentQuestion >= state.totalQuestions,
    scorePercent: (state) => Math.round((state.score / state.totalQuestions) * 100),
  },

  actions: {
    setSessionId(id: string) {
      this.sessionId = id
    },

    selectAnswer(optionIndex: number, isCorrect: boolean, correctIdx?: number) {  // ← updated signature
      if (this.isAnswered) return
      this.selectedOption = optionIndex
      this.isAnswered = true
      if (correctIdx !== undefined) this.lastCorrectIndex = correctIdx  // ← NEW
      if (isCorrect) {
        this.score++
        this.sessionXP += 10
        this.liveAnnouncement = 'Correct! Well done. Plus 10 XP.'
      } else {
        this.liveAnnouncement = 'Incorrect. Review the explanation below.'
      }
    },

    nextQuestion() {
      this.currentQuestion++
      this.selectedOption = null
      this.isAnswered = false
      this.showExplanation = false
      this.timeRemaining = 30
      this.lastCorrectIndex = null  // ← NEW
      if (!this.isComplete) {
        this.liveAnnouncement = `Question ${this.currentQuestion + 1} of ${this.totalQuestions}.`
      }
    },

    async finishSession(durationSeconds: number = 0) {
      if (!this.sessionId) return null
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const userStore = useUserStore()

      this.completing = true
      this.completionError = null

      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/trivia/session/complete`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
          body: {
            session_id: this.sessionId,
            duration_seconds: durationSeconds,
          },
        })

        if (data.success) {
          this.completionResult = data
          if (data.newly_unlocked?.length) {
            const names = data.newly_unlocked.map((a: any) => a.name).join(', ')
            userStore.announce(`Achievement unlocked: ${names}!`)
          }
          await userStore.fetchProfile()
          return data
        }
        return null
      } catch (err: any) {
        this.completionError = err.data?.detail ?? 'Failed to save session results.'
        console.error('[sessionStore] finishSession error:', err)
        return null
      } finally {
        this.completing = false
      }
    },

    reset() {
      this.currentQuestion = 0
      this.answers = []
      this.score = 0
      this.timeRemaining = 30
      this.isAnswered = false
      this.selectedOption = null
      this.lastCorrectIndex = null  // ← NEW
      this.showExplanation = false
      this.sessionXP = 0
      this.sessionId = null
      this.completionResult = null
      this.completionError = null
      this.liveAnnouncement = ''
    },
  },
})