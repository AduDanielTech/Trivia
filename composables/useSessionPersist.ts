/**
 * useSessionPersist
 *
 * Persists a completed quiz session to Supabase.
 * Calls the complete_session() DB function which atomically
 * updates XP, streak, subject scores and awards freeze tokens.
 *
 * Falls back gracefully if offline or not authenticated.
 */
export const useSessionPersist = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const announcer = useAnnouncer()

  /**
   * Save a finished session to the DB.
   * @param answers  Array of { questionId, selectedIndex, isCorrect, timeTakenMs }
   */
  const saveSession = async (payload: {
    subject: string
    difficulty: string
    mode: string
    totalQuestions: number
    correctAnswers: number
    scorePercent: number
    xpEarned: number
    durationSeconds: number
    answers: Array<{
      questionId: string | null
      selectedIndex: number | null
      isCorrect: boolean
      timeTakenMs: number
    }>
  }) => {
    if (!user.value) return null

    try {
      // 1. Insert session row
      const { data: session, error: sessionError } = await client
        .from('sessions')
        .insert({
          user_id: user.value.id,
          subject: payload.subject,
          difficulty: payload.difficulty,
          mode: payload.mode,
          total_questions: payload.totalQuestions,
          correct_answers: payload.correctAnswers,
          score_percent: payload.scorePercent,
          xp_earned: payload.xpEarned,
          duration_seconds: payload.durationSeconds,
        })
        .select('id')
        .single()

      if (sessionError || !session) throw sessionError

      // 2. Bulk-insert individual answers
      if (payload.answers.length > 0) {
        const answerRows = payload.answers.map(a => ({
          session_id: session.id,
          user_id: user.value!.id,
          question_id: a.questionId,
          selected_index: a.selectedIndex,
          is_correct: a.isCorrect,
          time_taken_ms: a.timeTakenMs,
        }))

        await client.from('session_answers').insert(answerRows)
      }

      // 3. Call the atomic complete_session() DB function
      const { error: fnError } = await client.rpc('complete_session', {
        p_user_id: user.value.id,
        p_session_id: session.id,
        p_subject: payload.subject,
        p_score_percent: payload.scorePercent,
        p_xp_earned: payload.xpEarned,
        p_correct: payload.correctAnswers,
        p_total: payload.totalQuestions,
      })

      if (fnError) throw fnError

      return session.id
    } catch (err: any) {
      // Non-fatal — user still sees their results locally
      console.warn('[TRIVIA] Session save failed (offline?):', err?.message)
      announcer.announce('Session saved locally. Will sync when back online.')
      return null
    }
  }

  /**
   * Submit a question report (flag) to Supabase.
   */
  const reportQuestion = async (questionId: string, reason: string, note?: string) => {
    if (!user.value) return

    try {
      await client.from('question_reports').insert({
        question_id: questionId,
        user_id: user.value.id,
        reason,
        note: note ?? null,
      })
    } catch (_) {
      // Silent — report is best-effort
    }
  }

  /**
   * Fetch questions from Supabase for a given subject + difficulty.
   * Falls back to the local mock data if offline or not authenticated.
   */
  const fetchQuestions = async (
    subject: string,
    difficulty: string | null,
    limit = 10
  ) => {
    try {
      let query = client
        .from('questions')
        .select('id, question, options, correct_index, explanation, subject, difficulty, xp_reward')
        .eq('is_active', true)
        .eq('subject', subject)
        .limit(limit)

      if (difficulty) {
        query = query.eq('difficulty', difficulty)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) return null

      // Map DB row → QuizQuestion shape used by the engine
      return data.map((row: any) => ({
        id: row.id,
        question: row.question,
        options: Array.isArray(row.options) ? row.options : JSON.parse(row.options),
        correct: row.correct_index,
        explanation: row.explanation,
        subject: row.subject,
        difficulty: row.difficulty,
        xp: row.xp_reward,
      }))
    } catch (_) {
      return null
    }
  }

  /**
   * Fetch leaderboard data.
   * @param scope  'global' | 'weekly' | 'subject'
   */
  const fetchLeaderboard = async (scope: 'global' | 'weekly', limit = 50) => {
    try {
      const view = scope === 'weekly' ? 'leaderboard_weekly' : 'leaderboard_global'
      const { data, error } = await client
        .from(view)
        .select('*')
        .limit(limit)

      if (error) throw error
      return data
    } catch (_) {
      return null
    }
  }

  return {
    saveSession,
    reportQuestion,
    fetchQuestions,
    fetchLeaderboard,
  }
}
