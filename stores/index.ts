import { nextTick } from 'vue'
import { defineStore } from 'pinia'

// ── Tier definitions ──────────────────────────────────────────────
export const TIERS = [
  {
    id: 'rookie',
    name: 'Rookie',
    label: 'Rookie',
    minXP: 0,
    maxXP: 500,
    color: '#8A95A8',
    icon: '◎',
    ariaDesc: 'Rookie tier. You are just starting your journey.',
  },
  {
    id: 'scholar',
    name: 'Scholar',
    label: 'Scholar',
    minXP: 500,
    maxXP: 1500,
    color: '#00E5A0',
    icon: '◈',
    ariaDesc: 'Scholar tier. You have shown solid knowledge.',
  },
  {
    id: 'expert',
    name: 'Expert',
    label: 'Expert',
    minXP: 1500,
    maxXP: 3000,
    color: '#7C5CFC',
    icon: '◆',
    ariaDesc: 'Expert tier. You are mastering your subjects.',
  },
  {
    id: 'champion',
    name: 'Champion',
    label: 'Champion',
    minXP: 3000,
    maxXP: 6000,
    color: '#FF9500',
    icon: '★',
    ariaDesc: 'Champion tier. Outstanding performance across sessions.',
  },
  {
    id: 'legend',
    name: 'Legend',
    label: 'Legend',
    minXP: 6000,
    maxXP: 10000,
    color: '#FFD700',
    icon: '♛',
    ariaDesc: 'Legend tier. The highest achievable rank. Elite.',
  },
]

export const useUserStore = defineStore('user', {
  state: () => ({
    // ── Identity — synced from authStore / Supabase profile ──────
    // username and avatar are derived at runtime from authStore.
    // They are kept here too so components only need one store import.
    // syncFromAuth() is called by the Supabase plugin after login.
    username: '',   // e.g. "Adaeze Obi" — real name from auth
    avatar: '',     // e.g. "AO"          — initials derived from name

    field: 'JAMB Bundle',
    subjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],

    // ── Progress (mock defaults — overwritten by Supabase on login) ─
    xp: 0,
    level: 1,
    streak: 0,
    streakFreezeTokens: 0,
    totalSessions: 0,
    totalQuestionsAnswered: 0,

    // ── Performance ──────────────────────────────────────────────
    averageScore: 0,
    subjectScores: {
      English: 85,
      Mathematics: 58,
      Physics: 67,
      Chemistry: 44,
    } as Record<string, number>,

    // ── Milestones ───────────────────────────────────────────────
    achievements: [
      { id: 'first_session', name: 'First Steps',       earned: false, icon: '🎯' },
      { id: 'streak_7',      name: '7-Day Streak',      earned: false, icon: '🔥' },
      { id: 'perfect_score', name: 'Perfect Score',     earned: false, icon: '💯' },
      { id: 'hard_mode',     name: 'Hard Mode Unlock',  earned: false, icon: '⚡' },
    ],

    // ── Session state ────────────────────────────────────────────
    isSessionActive: false,
    lastSessionScore: null as number | null,
    lastSessionSubject: null as string | null,

    // ── Screen reader announcements ──────────────────────────────
    liveAnnouncement: '',
  }),

  getters: {
    currentTier: (state) => {
      return TIERS.slice().reverse().find(t => state.xp >= t.minXP) || TIERS[0]
    },

    nextTier: (state) => {
      const idx = TIERS.findIndex(t => state.xp < t.maxXP)
      return idx >= 0 ? TIERS[idx] : null
    },

    xpInCurrentTier: (state) => {
      const tier = TIERS.slice().reverse().find(t => state.xp >= t.minXP) || TIERS[0]
      return state.xp - tier.minXP
    },

    xpNeededForNextTier: (state) => {
      const current = TIERS.slice().reverse().find(t => state.xp >= t.minXP) || TIERS[0]
      const idx = TIERS.indexOf(current)
      if (idx >= TIERS.length - 1) return 0
      return TIERS[idx + 1].minXP - current.minXP
    },

    tierProgress: (state) => {
      const current = TIERS.slice().reverse().find(t => state.xp >= t.minXP) || TIERS[0]
      const idx = TIERS.indexOf(current)
      if (idx >= TIERS.length - 1) return 100
      const inTier = state.xp - current.minXP
      const tierRange = TIERS[idx + 1].minXP - current.minXP
      return Math.round((inTier / tierRange) * 100)
    },

    weakSubjects: (state) => {
      return Object.entries(state.subjectScores)
        .filter(([, score]) => score < 65)
        .sort(([, a], [, b]) => (a as number) - (b as number))
        .map(([subject, score]) => ({ subject, score: score as number }))
    },

    streakAtRisk: (state) => state.streak > 0 && state.streakFreezeTokens === 0,

    // Display name — falls back gracefully before auth loads
    displayName: (state) => state.username || 'Student',

    // First name only (for greeting)
    firstName: (state) => (state.username || 'Student').split(' ')[0],
  },

  actions: {
    // ── Called by supabase.client.ts plugin after login ───────────
    syncFromAuth(fullName: string, email: string) {
      const name = fullName || email.split('@')[0] || 'Student'
      this.username = name
      this.avatar = name
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase() ?? '')
        .join('')
    },

    // ── XP ────────────────────────────────────────────────────────
    addXP(amount: number) {
      const prevTier = this.currentTier
      this.xp += amount
      const newTier = this.currentTier
      if (prevTier.id !== newTier.id) {
        this.announce(`Congratulations! You have reached ${newTier.name} tier! ${newTier.ariaDesc}`)
      } else {
        this.announce(`You earned ${amount} XP. Total XP: ${this.xp}`)
      }
    },

    // ── Streak ────────────────────────────────────────────────────
    useStreakFreeze() {
      if (this.streakFreezeTokens > 0) {
        this.streakFreezeTokens--
        this.announce('Streak freeze token used. Your streak is protected for today.')
      }
    },

    incrementStreak() {
      this.streak++
      // Award a freeze token every 7 days (max 3)
      if (this.streak % 7 === 0 && this.streakFreezeTokens < 3) {
        this.streakFreezeTokens = Math.min(this.streakFreezeTokens + 1, 3)
      }
      if ([7, 30, 100].includes(this.streak)) {
        this.announce(`Milestone! You have reached a ${this.streak}-day streak!`)
      } else {
        this.announce(`Streak updated. You are now on a ${this.streak}-day streak.`)
      }
    },

    // ── Screen reader announcer ───────────────────────────────────
    announce(message: string) {
      this.liveAnnouncement = ''
      nextTick(() => {
        this.liveAnnouncement = message
      })
    },

    // ── Session completion — increments ALL stats ─────────────────
    // score        = number of correct answers (e.g. 7)
    // totalQs      = total questions in session (e.g. 10)
    // subject      = subject string (e.g. "Mathematics")
    // xpEarned     = XP to award
    completeSession(score: number, totalQs: number, subject: string, xpEarned: number) {
      const scorePercent = totalQs > 0 ? Math.round((score / totalQs) * 100) : 0

      this.lastSessionScore = scorePercent
      this.lastSessionSubject = subject

      // Increment session + question counters
      this.totalSessions++
      this.totalQuestionsAnswered += totalQs

      // Rolling average score: new_avg = (old_avg * old_count + new_score) / new_count
      const oldCount = this.totalSessions - 1
      this.averageScore = oldCount === 0
        ? scorePercent
        : Math.round((this.averageScore * oldCount + scorePercent) / this.totalSessions)

      // XP (triggers tier-up check)
      this.addXP(xpEarned)

      // Streak
      this.incrementStreak()

      // Subject score — weighted moving average (70% history, 30% new session)
      if (subject) {
        if (this.subjectScores[subject] !== undefined) {
          this.subjectScores[subject] = Math.round(
            this.subjectScores[subject] * 0.7 + scorePercent * 0.3
          )
        } else {
          // First time playing this subject
          this.subjectScores[subject] = scorePercent
        }
      }

      // Unlock first_session achievement
      const firstSession = this.achievements.find(a => a.id === 'first_session')
      if (firstSession && !firstSession.earned && this.totalSessions === 1) {
        firstSession.earned = true
        this.announce('Achievement unlocked: First Steps!')
      }

      // Unlock streak achievements
      if (this.streak === 7) {
        const a = this.achievements.find(a => a.id === 'streak_7')
        if (a && !a.earned) { a.earned = true; this.announce('Achievement unlocked: 7-Day Streak!') }
      }

      // Unlock perfect score
      if (scorePercent === 100) {
        const a = this.achievements.find(a => a.id === 'perfect_score')
        if (a && !a.earned) { a.earned = true; this.announce('Achievement unlocked: Perfect Score!') }
      }
    },
  },
})

// ── Session store ─────────────────────────────────────────────────
export const useSessionStore = defineStore('session', {
  state: () => ({
    currentQuestion: 0,
    totalQuestions: 10,
    answers: [] as any[],
    score: 0,
    timeRemaining: 30,
    isAnswered: false,
    selectedOption: null as number | null,
    showExplanation: false,
    subject: 'Mathematics',
    difficulty: 'Medium',
    sessionXP: 0,
    liveAnnouncement: '',
  }),

  getters: {
    progress: (state) => Math.round((state.currentQuestion / state.totalQuestions) * 100),
    isComplete: (state) => state.currentQuestion >= state.totalQuestions,
    scorePercent: (state) => Math.round((state.score / state.totalQuestions) * 100),
  },

  actions: {
    selectAnswer(optionIndex: number, isCorrect: boolean) {
      if (this.isAnswered) return
      this.selectedOption = optionIndex
      this.isAnswered = true
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
      if (!this.isComplete) {
        this.liveAnnouncement = `Question ${this.currentQuestion + 1} of ${this.totalQuestions}.`
      }
    },

    reset() {
      this.currentQuestion = 0
      this.answers = []
      this.score = 0
      this.timeRemaining = 30
      this.isAnswered = false
      this.selectedOption = null
      this.showExplanation = false
      this.sessionXP = 0
      this.liveAnnouncement = ''
    },
  },
})

// ── Upload store ──────────────────────────────────────────────────
export const useUploadStore = defineStore('upload', {
  state: () => ({
    files: [] as any[],
    isProcessing: false,
    progress: 0,
    generatedQuestions: [] as any[],
    error: null as string | null,
    liveAnnouncement: '',
  }),

  actions: {
    addFile(file: File) {
      const entry = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
      }
      this.files.push(entry)
      this.liveAnnouncement = `File ${file.name} added. Ready to process.`
      return entry
    },

    removeFile(id: string) {
      const file = this.files.find(f => f.id === id)
      this.files = this.files.filter(f => f.id !== id)
      if (file) this.liveAnnouncement = `File ${file.name} removed.`
    },

    async processFiles() {
      if (this.files.length === 0) return
      this.isProcessing = true
      this.progress = 0
      this.error = null
      this.liveAnnouncement = 'Processing your documents. Please wait.'

      for (let i = 0; i <= 100; i += 5) {
        await new Promise(r => setTimeout(r, 80))
        this.progress = i
        if (i === 50) this.liveAnnouncement = 'Halfway through. Extracting questions.'
      }

      this.generatedQuestions = [
        {
          id: 1,
          question: 'What is the speed of light in a vacuum?',
          options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
          correct: 0,
          subject: 'Physics',
          explanation: 'The speed of light in a vacuum is approximately 3 × 10⁸ m/s.',
        },
        {
          id: 2,
          question: 'What is the chemical symbol for Gold?',
          options: ['Go', 'Gd', 'Au', 'Ag'],
          correct: 2,
          subject: 'Chemistry',
          explanation: "Gold's symbol is Au, from the Latin word Aurum.",
        },
        {
          id: 3,
          question: 'Solve: 2x + 5 = 13. What is x?',
          options: ['3', '4', '5', '6'],
          correct: 1,
          subject: 'Mathematics',
          explanation: 'Subtract 5 from both sides: 2x = 8. Then divide by 2: x = 4.',
        },
      ]

      this.isProcessing = false
      this.liveAnnouncement = `Done. ${this.generatedQuestions.length} questions generated.`
      this.files.forEach(f => (f.status = 'done'))
    },
  },
})
