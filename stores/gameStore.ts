// stores/gameStore.ts
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    questions:   [] as any[],
    sessionId:   null as string | null,
    subject:     '',
    difficulty:  'easy',
    mode:        'standard',
    source:      'api' as 'api' | 'document' | 'local',
    loading:     false,
    error:       null as string | null,
  }),

  getters: {
    hasQuestions:   (state) => state.questions.length > 0,
    questionCount:  (state) => state.questions.length,
  },

  actions: {
    // ── POST /api/trivia/session/start ────────────────────────────
    async startSession(
      subject:       string,
      sessionLength: number = 10,
      mode:          string = 'standard'
    ) {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()

      this.loading = true
      this.error   = null

      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/trivia/session/start`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
          body: { subject, session_length: sessionLength, mode },
        })

        if (data.success) {
          this.questions  = data.questions
          this.sessionId  = data.session_id
          this.subject    = data.subject
          this.difficulty = data.difficulty
          this.mode       = data.mode
          this.source     = 'api'

          // Sync session ID to sessionStore
          const sessionStore = useSessionStore()
          sessionStore.setSessionId(data.session_id)

          return data
        }
        return null
      } catch (err: any) {
        this.error = err.data?.detail ?? 'Failed to load questions'
        return null
      } finally {
        this.loading = false
      }
    },

    // ── POST /api/trivia/session/answer ───────────────────────────
    async submitAnswer(
      questionId:    string,
      selectedIndex: number,
      timeTakenMs:   number = 0
    ) {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()
      if (!this.sessionId) return null

      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/trivia/session/answer`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
          body: {
            session_id:     this.sessionId,
            question_id:    questionId,
            selected_index: selectedIndex,
            time_taken_ms:  timeTakenMs,
          },
        })
        return data
      } catch (err) {
        console.warn('[gameStore] submitAnswer failed:', err)
        return null
      }
    },

    // ── Load document-generated questions (from uploadStore) ──────
    loadDocumentQuestions(questions: any[], _documentId?: string) {
      this.questions = questions
      this.source    = 'document'
      this.sessionId = null  // no server session for doc-only preview
    },

    reset() {
      this.questions  = []
      this.sessionId  = null
      this.subject    = ''
      this.difficulty = 'easy'
      this.mode       = 'standard'
      this.source     = 'api'
      this.error      = null
    },
  },
})
