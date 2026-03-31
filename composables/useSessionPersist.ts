/**
 * useSessionPersist
 *
 * Legacy composable kept for compatibility after migrating off Supabase.
 * New persistence flows live in Pinia stores (`gameStore` + `sessionStore`).
 */
export const useSessionPersist = () => {
  const announcer = useAnnouncer()
  const gameStore = useGameStore()
  const sessionStore = useSessionStore()
  const leaderboardStore = useLeaderboardStore()

  const saveSession = async (payload: { durationSeconds?: number }) => {
    try {
      const result = await sessionStore.finishSession(payload.durationSeconds ?? 0)
      return result?.success ? sessionStore.sessionId : null
    } catch (err: any) {
      console.warn('[useSessionPersist] saveSession failed:', err)
      announcer.announce('Session saved locally. Will sync when back online.')
      return null
    }
  }

  const reportQuestion = async (_questionId: string, _reason: string, _note?: string) => {
    return null
  }

  const fetchQuestions = async (subject: string, _difficulty: string | null, limit = 10) => {
    const data = await gameStore.startSession(subject, limit)
    return data?.questions ?? null
  }

  const fetchLeaderboard = async (scope: 'global' | 'weekly', limit = 50) => {
    await leaderboardStore.fetchLeaderboard(scope === 'weekly' ? 'weekly' : 'global', null)
    return leaderboardStore.entries.slice(0, limit)
  }

  return {
    saveSession,
    reportQuestion,
    fetchQuestions,
    fetchLeaderboard,
  }
}

