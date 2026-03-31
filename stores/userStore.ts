// stores/userStore.ts
import { nextTick } from 'vue'
import { defineStore } from 'pinia'

export const TIERS = [
  { id: 'rookie',   name: 'Rookie',   minXP: 0,    maxXP: 500,   color: '#8A95A8', icon: '◎', ariaDesc: 'Rookie tier. You are just starting your journey.' },
  { id: 'scholar',  name: 'Scholar',  minXP: 500,  maxXP: 1500,  color: '#00E5A0', icon: '◈', ariaDesc: 'Scholar tier. You have shown solid knowledge.' },
  { id: 'expert',   name: 'Expert',   minXP: 1500, maxXP: 3000,  color: '#7C5CFC', icon: '◆', ariaDesc: 'Expert tier. You are mastering your subjects.' },
  { id: 'champion', name: 'Champion', minXP: 3000, maxXP: 6000,  color: '#FF9500', icon: '★', ariaDesc: 'Champion tier. Outstanding performance across sessions.' },
  { id: 'legend',   name: 'Legend',   minXP: 6000, maxXP: 10000, color: '#FFD700', icon: '♛', ariaDesc: 'Legend tier. The highest achievable rank. Elite.' },
]

export const useUserStore = defineStore('user', () => {

  // ── Identity ────────────────────────────────────────────────
  const username  = ref('')
  const full_name = ref('')
  const avatar    = ref('')
  const email     = ref('')

  // ── Study context ────────────────────────────────────────────
  const field    = ref('JAMB Bundle')
  const subjects = ref<string[]>(['English', 'Mathematics', 'Physics', 'Chemistry'])

  // ── Gamification ─────────────────────────────────────────────
  const xp                     = ref(0)
  const level                  = ref(1)
  const streak                 = ref(0)
  const streakFreezeTokens     = ref(0)
  const totalSessions          = ref(0)
  const totalQuestionsAnswered = ref(0)
  const averageScore           = ref(0)

  // ── Performance ──────────────────────────────────────────────
  const subjectScores = ref<Record<string, number>>({})

  // ── Achievements ─────────────────────────────────────────────
  const achievements = ref<Array<{
    id: string
    name: string
    description: string
    icon: string
    xp_reward: number
    category: string
    earned: boolean
    earned_at: string | null
  }>>([])

  // ── Preferences ──────────────────────────────────────────────
  const soundEnabled        = ref(true)
  const audioMode           = ref<'effects' | 'tts' | 'off'>('effects')
  const leaderboardVisible  = ref(true)
  const communityVisible    = ref(true)

  // ── Accessibility Mode ───────────────────────────────────────
  // 'standard' = normal UI interactions
  // 'blind'    = continuous SpeechRecognition + auto TTS on every screen change
  const studentMode = ref<'standard' | 'blind'>('standard')

  // ── Session context ───────────────────────────────────────────
  const currentDifficulty = ref('easy')
  const currentField      = ref('exam_prep')
  const currentSubject    = ref('jamb')

  // ── UI state ─────────────────────────────────────────────────
  const isSessionActive    = ref(false)
  const lastSessionScore   = ref<number | null>(null)
  const lastSessionSubject = ref<string | null>(null)
  const liveAnnouncement   = ref('')
  const profileLoading     = ref(false)

  // ── Getters (computed) ────────────────────────────────────────

  const currentTier = computed(() =>
    TIERS.slice().reverse().find(t => xp.value >= t.minXP) || TIERS[0]
  )

  const nextTier = computed(() => {
    const idx = TIERS.findIndex(t => xp.value < t.maxXP)
    return idx >= 0 ? TIERS[idx] : null
  })

  const xpInCurrentTier = computed(() => {
    const tier = TIERS.slice().reverse().find(t => xp.value >= t.minXP) || TIERS[0]
    return xp.value - tier.minXP
  })

  const xpNeededForNextTier = computed(() => {
    const current = TIERS.slice().reverse().find(t => xp.value >= t.minXP) || TIERS[0]
    const idx = TIERS.indexOf(current)
    if (idx >= TIERS.length - 1) return 0
    return TIERS[idx + 1].minXP - current.minXP
  })

  const tierProgress = computed(() => {
    const current = TIERS.slice().reverse().find(t => xp.value >= t.minXP) || TIERS[0]
    const idx = TIERS.indexOf(current)
    if (idx >= TIERS.length - 1) return 100
    const inTier    = xp.value - current.minXP
    const tierRange = TIERS[idx + 1].minXP - current.minXP
    return Math.round((inTier / tierRange) * 100)
  })

  const weakSubjects = computed(() =>
    Object.entries(subjectScores.value)
      .filter(([, score]) => score < 65)
      .sort(([, a], [, b]) => a - b)
      .map(([subject, score]) => ({ subject, score }))
  )

  const streakAtRisk = computed(() => streak.value > 0 && streakFreezeTokens.value === 0)

  const displayName = computed(() => full_name.value || username.value || 'Student')
  const firstName   = computed(() => (full_name.value || username.value || 'Student').split(' ')[0])

  // ── Actions ───────────────────────────────────────────────────

  // Core: fetch full profile from FastAPI → hydrate store
  async function fetchProfile() {
    const config    = useRuntimeConfig()
    const authStore = useAuthStore()
    if (!authStore.token) return

    profileLoading.value = true
    try {
      const data = await $fetch<any>(`${config.public.apiBase}/api/user/profile`, {
        headers:     { Authorization: `Bearer ${authStore.token}` },
        credentials: 'include',
      })

      if (data.success) {
        const p = data.data

        username.value               = p.username               ?? username.value
        full_name.value              = p.full_name              ?? full_name.value
        email.value                  = p.email                  ?? email.value
        xp.value                     = p.xp                     ?? xp.value
        level.value                  = p.level                  ?? level.value
        streak.value                 = p.streak                 ?? streak.value
        streakFreezeTokens.value     = p.streak_freeze_tokens   ?? streakFreezeTokens.value
        totalSessions.value          = p.total_sessions         ?? totalSessions.value
        totalQuestionsAnswered.value = p.total_questions_answered ?? totalQuestionsAnswered.value
        averageScore.value           = p.average_score          ?? averageScore.value
        subjectScores.value          = p.subject_scores         ?? subjectScores.value
        achievements.value           = p.achievements           ?? achievements.value
        soundEnabled.value           = p.sound_enabled          ?? soundEnabled.value
        audioMode.value              = p.audio_mode             ?? audioMode.value
        leaderboardVisible.value     = p.leaderboard_visible    ?? leaderboardVisible.value
        communityVisible.value       = p.community_visible      ?? communityVisible.value
        currentDifficulty.value      = p.current_difficulty     ?? currentDifficulty.value
        currentField.value           = p.current_field          ?? currentField.value
        currentSubject.value         = p.current_subject        ?? currentSubject.value

        // Derive avatar initials from name
        const name = full_name.value || username.value || ''
        avatar.value = name
          .split(' ')
          .slice(0, 2)
          .map((n: string) => n[0]?.toUpperCase() ?? '')
          .join('')

        // Sync to authStore user if not yet set
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
      profileLoading.value = false
    }
  }

  // Fast hydration from auth data before profile API resolves
  function syncFromAuth(fullName: string, emailAddr: string) {
    const name = fullName || emailAddr.split('@')[0] || 'Student'
    full_name.value = name
    username.value  = username.value || name
    email.value     = emailAddr
    avatar.value    = name
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0]?.toUpperCase() ?? '')
      .join('')
  }

  // Local XP — optimistic update; real value comes from fetchProfile
  function addXP(amount: number) {
    const prevTier = currentTier.value
    xp.value += amount
    const newTier = currentTier.value
    if (prevTier.id !== newTier.id) {
      announce(`Congratulations! You have reached ${newTier.name} tier!`)
    } else {
      announce(`You earned ${amount} XP. Total XP: ${xp.value}`)
    }
  }

  // Use a streak freeze token
  function useStreakFreeze() {
    if (streakFreezeTokens.value > 0) {
      streakFreezeTokens.value--
      announce('Streak freeze token used. Your streak is protected.')
    }
  }

  // Persist settings to FastAPI
  async function updateSettings(settings: {
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
        method:      'PUT',
        headers:     { Authorization: `Bearer ${authStore.token}` },
        credentials: 'include',
        body:        settings,
      })
      // Optimistic local patch
      if (settings.sound_enabled          !== undefined) soundEnabled.value       = settings.sound_enabled
      if (settings.audio_mode)                           audioMode.value          = settings.audio_mode as any
      if (settings.leaderboard_visible    !== undefined) leaderboardVisible.value = settings.leaderboard_visible
      if (settings.community_visible      !== undefined) communityVisible.value   = settings.community_visible
      if (settings.username)                             username.value           = settings.username
      if (settings.full_name)                            full_name.value          = settings.full_name
    } catch (err) {
      console.warn('[userStore] updateSettings failed:', err)
      throw err
    }
  }

  // Persist field/subject selection to FastAPI
  async function updateField(fieldVal: string, subject: string) {
    const config    = useRuntimeConfig()
    const authStore = useAuthStore()
    try {
      await $fetch(`${config.public.apiBase}/api/user/field`, {
        method:      'PUT',
        headers:     { Authorization: `Bearer ${authStore.token}` },
        credentials: 'include',
        body:        { field: fieldVal, subject },
      })
      currentField.value   = fieldVal
      currentSubject.value = subject
    } catch (err) {
      console.warn('[userStore] updateField failed:', err)
      throw err
    }
  }

  // ARIA live region announcer — clears first so screen readers re-fire
  function announce(message: string) {
    liveAnnouncement.value = ''
    nextTick(() => { liveAnnouncement.value = message })
  }

  // ── Expose ────────────────────────────────────────────────────
  return {
    // State
    username,
    full_name,
    avatar,
    email,
    field,
    subjects,
    xp,
    level,
    streak,
    streakFreezeTokens,
    totalSessions,
    totalQuestionsAnswered,
    averageScore,
    subjectScores,
    achievements,
    soundEnabled,
    audioMode,
    leaderboardVisible,
    communityVisible,
    studentMode,
    currentDifficulty,
    currentField,
    currentSubject,
    isSessionActive,
    lastSessionScore,
    lastSessionSubject,
    liveAnnouncement,
    profileLoading,

    // Getters
    currentTier,
    nextTier,
    xpInCurrentTier,
    xpNeededForNextTier,
    tierProgress,
    weakSubjects,
    streakAtRisk,
    displayName,
    firstName,

    // Actions
    fetchProfile,
    syncFromAuth,
    addXP,
    useStreakFreeze,
    updateSettings,
    updateField,
    announce,
  }
})