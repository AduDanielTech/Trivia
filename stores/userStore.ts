// stores/userStore.ts
import { nextTick } from 'vue'
import { defineStore } from 'pinia'

export const TIERS = [
  { id: 'rookie',   name: 'Rookie',   label: 'Rookie',   minXP: 0,    maxXP: 500,   color: '#8A95A8', icon: '◎', ariaDesc: 'Rookie tier. You are just starting your journey.' },
  { id: 'scholar',  name: 'Scholar',  label: 'Scholar',  minXP: 500,  maxXP: 1500,  color: '#00E5A0', icon: '◈', ariaDesc: 'Scholar tier. You have shown solid knowledge.' },
  { id: 'expert',   name: 'Expert',   label: 'Expert',   minXP: 1500, maxXP: 3000,  color: '#7C5CFC', icon: '◆', ariaDesc: 'Expert tier. You are mastering your subjects.' },
  { id: 'champion', name: 'Champion', label: 'Champion', minXP: 3000, maxXP: 6000,  color: '#FF9500', icon: '★', ariaDesc: 'Champion tier. Outstanding performance across sessions.' },
  { id: 'legend',   name: 'Legend',   label: 'Legend',   minXP: 6000, maxXP: 10000, color: '#FFD700', icon: '♛', ariaDesc: 'Legend tier. The highest achievable rank. Elite.' },
]

export const useUserStore = defineStore('user', {
  state: () => ({
    // Identity
    username: '',
    full_name: '',
    avatar: '',
    email: '',

    // Study context
    field:    'JAMB Bundle',
    subjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],

    // Gamification
    xp:                    0,
    level:                 1,
    streak:                0,
    streakFreezeTokens:    0,
    totalSessions:         0,
    totalQuestionsAnswered: 0,
    averageScore:          0,

    // Performance
    subjectScores: {} as Record<string, number>,

    // Achievements
    achievements: [] as Array<{
      id: string
      name: string
      description: string
      icon: string
      xp_reward: number
      category: string
      earned: boolean
      earned_at: string | null
    }>,

    // Preferences
    soundEnabled: true,
    audioMode:    'effects' as 'effects' | 'tts' | 'off',
    leaderboardVisible: true,
    communityVisible:   true,

    // Current session context
    currentDifficulty: 'easy',
    currentField:      'exam_prep',
    currentSubject:    'jamb',

    // UI
    isSessionActive:    false,
    lastSessionScore:   null as number | null,
    lastSessionSubject: null as string | null,
    liveAnnouncement:   '',

    // Loading state
    profileLoading: false,
  }),

  getters: {
    currentTier: (state) =>
      TIERS.slice().reverse().find(t => state.xp >= t.minXP) || TIERS[0],

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
      const inTier    = state.xp - current.minXP
      const tierRange = TIERS[idx + 1].minXP - current.minXP
      return Math.round((inTier / tierRange) * 100)
    },

    weakSubjects: (state) =>
      Object.entries(state.subjectScores)
        .filter(([, score]) => (score as number) < 65)
        .sort(([, a], [, b]) => (a as number) - (b as number))
        .map(([subject, score]) => ({ subject, score: score as number })),

    streakAtRisk: (state) => state.streak > 0 && state.streakFreezeTokens === 0,

    displayName: (state) => state.full_name || state.username || 'Student',
    firstName:   (state) => (state.full_name || state.username || 'Student').split(' ')[0],
  },

  actions: {
    // ── Core: fetch full profile from FastAPI → patch entire store ─
    async fetchProfile() {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()
      if (!authStore.token) return

      this.profileLoading = true
      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/user/profile`, {
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
        })

        if (data.success) {
          const p = data.data
          this.$patch({
            username:               p.username          ?? this.username,
            full_name:              p.full_name         ?? this.full_name,
            email:                  p.email             ?? this.email,
            xp:                     p.xp                ?? this.xp,
            level:                  p.level             ?? this.level,
            streak:                 p.streak            ?? this.streak,
            streakFreezeTokens:     p.streak_freeze_tokens ?? this.streakFreezeTokens,
            totalSessions:          p.total_sessions    ?? this.totalSessions,
            totalQuestionsAnswered: p.total_questions_answered ?? this.totalQuestionsAnswered,
            averageScore:           p.average_score     ?? this.averageScore,
            subjectScores:          p.subject_scores    ?? this.subjectScores,
            achievements:           p.achievements      ?? this.achievements,
            soundEnabled:           p.sound_enabled     ?? this.soundEnabled,
            audioMode:              p.audio_mode        ?? this.audioMode,
            leaderboardVisible:     p.leaderboard_visible ?? this.leaderboardVisible,
            communityVisible:       p.community_visible ?? this.communityVisible,
            currentDifficulty:      p.current_difficulty ?? this.currentDifficulty,
            currentField:           p.current_field     ?? this.currentField,
            currentSubject:         p.current_subject   ?? this.currentSubject,
          })

          // Derive avatar from name
          const name = this.full_name || this.username || ''
          this.avatar = name
            .split(' ')
            .slice(0, 2)
            .map((n: string) => n[0]?.toUpperCase() ?? '')
            .join('')

          // Sync to authStore user if not set
          if (!authStore.user && p.id) {
            authStore.setUser({
              id:        p.id,
              email:     p.email,
              username:  p.username,
              full_name: p.full_name,
              is_admin:  p.is_admin,
            })
          }
        }
      } catch (err) {
        console.warn('[userStore] fetchProfile failed:', err)
      } finally {
        this.profileLoading = false
      }
    },

    // ── Sync from auth data (fast hydration before profile loads) ─
    syncFromAuth(fullName: string, email: string) {
      const name = fullName || email.split('@')[0] || 'Student'
      this.full_name = name
      this.username  = this.username || name
      this.email     = email
      this.avatar    = name
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase() ?? '')
        .join('')
    },

    // ── Local XP (optimistic update — real value comes from fetchProfile) ─
    addXP(amount: number) {
      const prevTier = this.currentTier
      this.xp += amount
      const newTier = this.currentTier
      if (prevTier.id !== newTier.id) {
        this.announce(`Congratulations! You have reached ${newTier.name} tier!`)
      } else {
        this.announce(`You earned ${amount} XP. Total XP: ${this.xp}`)
      }
    },

    // ── Streak freeze ─────────────────────────────────────────────
    useStreakFreeze() {
      if (this.streakFreezeTokens > 0) {
        this.streakFreezeTokens--
        this.announce('Streak freeze token used. Your streak is protected.')
      }
    },

    // ── Settings ──────────────────────────────────────────────────
    async updateSettings(settings: {
      sound_enabled?: boolean
      audio_mode?: string
      leaderboard_visible?: boolean
      community_visible?: boolean
      username?: string
      full_name?: string
    }) {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()
      try {
        await $fetch(`${config.public.apiBase}/api/user/settings`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
          body: settings,
        })
        // Patch local state optimistically
        if (settings.sound_enabled !== undefined) this.soundEnabled = settings.sound_enabled
        if (settings.audio_mode)                  this.audioMode   = settings.audio_mode as any
        if (settings.leaderboard_visible !== undefined) this.leaderboardVisible = settings.leaderboard_visible
        if (settings.community_visible   !== undefined) this.communityVisible   = settings.community_visible
        if (settings.username)   this.username  = settings.username
        if (settings.full_name)  this.full_name = settings.full_name
      } catch (err) {
        console.warn('[userStore] updateSettings failed:', err)
        throw err
      }
    },

    // ── Field update ──────────────────────────────────────────────
    async updateField(field: string, subject: string) {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()
      try {
        await $fetch(`${config.public.apiBase}/api/user/field`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
          body: { field, subject },
        })
        this.currentField   = field
        this.currentSubject = subject
      } catch (err) {
        console.warn('[userStore] updateField failed:', err)
        throw err
      }
    },

    // ── Screen reader announcer ───────────────────────────────────
    announce(message: string) {
      this.liveAnnouncement = ''
      nextTick(() => { this.liveAnnouncement = message })
    },
  },
})
