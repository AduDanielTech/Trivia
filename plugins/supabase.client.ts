/**
 * supabase.client.ts
 *
 * 1. Reads current session on page load → hydrates authStore + userStore
 * 2. Subscribes to all auth state changes (login, logout, token refresh)
 * 3. Calls userStore.syncFromAuth() so name/avatar are always the real user's
 * 4. Loads Supabase profile row → patches userStore with live DB values
 */
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/index'

export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  const authStore = useAuthStore()
  const userStore = useUserStore()

  // ── 1. Hydrate from existing session ──────────────────────────
  const { data: { session } } = await client.auth.getSession()
  if (session?.user) {
    authStore.setUser(session.user as any)
    // Immediately sync name/avatar from auth metadata (no DB call needed)
    const fullName = session.user.user_metadata?.full_name ?? ''
    const email    = session.user.email ?? ''
    userStore.syncFromAuth(fullName, email)
    // Then load full profile from DB (may take a moment)
    await syncProfile(client, userStore, session.user.id)
  }

  // ── 2. Subscribe to future auth changes ───────────────────────
  client.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      authStore.setUser(session.user as any)
      const fullName = session.user.user_metadata?.full_name ?? ''
      const email    = session.user.email ?? ''
      userStore.syncFromAuth(fullName, email)
      await syncProfile(client, userStore, session.user.id)
    }

    if (event === 'SIGNED_OUT') {
      authStore.setUser(null)
      userStore.$reset()
    }

    if (event === 'TOKEN_REFRESHED' && session?.user) {
      authStore.setUser(session.user as any)
      const fullName = session.user.user_metadata?.full_name ?? ''
      const email    = session.user.email ?? ''
      userStore.syncFromAuth(fullName, email)
    }
  })
})

// ── Load the profiles row and patch userStore ──────────────────
async function syncProfile(
  client: any,
  userStore: ReturnType<typeof useUserStore>,
  userId: string
) {
  try {
    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !profile) return

    // Sync identity from DB (may have a different display name set via Settings)
    if (profile.full_name || profile.username) {
      userStore.syncFromAuth(
        profile.full_name ?? profile.username ?? '',
        ''
      )
    }

    // Patch gamification state from DB
    userStore.$patch({
      field:                   profile.active_field           ?? userStore.field,
      xp:                      profile.xp                     ?? userStore.xp,
      level:                   profile.level                  ?? userStore.level,
      streak:                  profile.streak                 ?? userStore.streak,
      streakFreezeTokens:      profile.streak_freeze_tokens   ?? userStore.streakFreezeTokens,
      totalSessions:           profile.total_sessions         ?? userStore.totalSessions,
      totalQuestionsAnswered:  profile.total_questions_answered ?? userStore.totalQuestionsAnswered,
      averageScore:            profile.average_score          ?? userStore.averageScore,
    })

    // Load subject scores
    const { data: scores } = await client
      .from('subject_scores')
      .select('subject, score')
      .eq('user_id', userId)

    if (scores?.length) {
      const scoreMap: Record<string, number> = { ...userStore.subjectScores }
      scores.forEach((s: { subject: string; score: number }) => {
        scoreMap[s.subject] = Math.round(s.score)
      })
      userStore.subjectScores = scoreMap
    }

    // Load achievements
    const { data: achievements } = await client
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    if (achievements?.length) {
      const earnedIds = new Set(achievements.map((a: any) => a.achievement_id))
      userStore.achievements = userStore.achievements.map(a => ({
        ...a,
        earned: earnedIds.has(a.id),
      }))
    }
  } catch (err) {
    // Non-fatal — app works fine with default state
    console.warn('[TRIVIA] Profile sync failed:', err)
  }
}
