// stores/leaderboardStore.ts
import { defineStore } from 'pinia'

export const useLeaderboardStore = defineStore('leaderboard', {
  state: () => ({
    entries:  [] as Array<{
      rank: number
      user_id: string
      username: string
      full_name: string | null
      score: number
      weekly_xp: number | null
      tier: string
      is_me: boolean
    }>,
    myRank:   null as number | null,
    type:     'global' as 'global' | 'subject' | 'weekly',
    subject:  null as string | null,
    loading:  false,
    error:    null as string | null,
  }),

  getters: {
    displayEntries: (state) => state.entries,
    myEntry:        (state) => state.entries.find(e => e.is_me) ?? null,
  },

  actions: {
    async fetchLeaderboard(
      type:    'global' | 'subject' | 'weekly' = 'global',
      subject: string | null = null
    ) {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()

      this.loading = true
      this.error   = null
      this.type    = type
      this.subject = subject

      try {
        let url = `${config.public.apiBase}/api/leaderboard?type=${type}`
        if (type === 'subject' && subject) url += `&subject=${subject}`

        const data = await $fetch<any>(url, {
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
        })

        if (data.success) {
          this.entries = data.entries
          this.myRank  = data.my_rank
        }

        return data
      } catch (err: any) {
        this.error = err.data?.detail ?? 'Failed to load leaderboard'
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
