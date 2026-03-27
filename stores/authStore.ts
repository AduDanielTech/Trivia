// stores/authStore.ts
import { defineStore } from 'pinia'
import { useUserStore } from '~/stores/userStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | {
      id: string
      email: string
      username: string
      full_name: string
      is_admin: boolean
    },
    token: null as string | null,
    loading: false,
    error: null as string | null,
    successMessage: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userEmail:       (state) => state.user?.email ?? '',
    userName:        (state) => state.user?.full_name ?? state.user?.username ?? 'Student',
    isAdmin:         (state) => state.user?.is_admin ?? false,
  },

  actions: {
    // ── Called by auth.client.ts plugin after cookie hydration ────
    setUser(user: typeof this.user) {
      this.user = user
    },

    setToken(token: string | null) {
      this.token = token
    },

    clearError() { this.error = null },
    clearSuccess() { this.successMessage = null },

    _readCookie(): string | null {
      if (import.meta.server) return null
      const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/)
      return match ? decodeURIComponent(match[1]) : null
    },

    // ── Sign Up ──────────────────────────────────────────────────
    async signUp(email: string, password: string, fullName: string, username: string) {
      const config = useRuntimeConfig()
      this.loading = true
      this.error   = null
      this.successMessage = null

      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/auth/register`, {
          method: 'POST',
          credentials: 'include',
          body: { email, password, full_name: fullName, username },
        })

        if (data.success) {
          this.token = data.token
          this.user  = data.user
          // Hydrate userStore from profile
          const userStore = useUserStore()
          await userStore.fetchProfile()
          await navigateTo('/')
        }
      } catch (err: any) {
        this.error = err.data?.detail ?? 'Sign up failed. Please try again.'
      } finally {
        this.loading = false
      }
    },

    // ── Sign In ──────────────────────────────────────────────────
    async signIn(email: string, password: string) {
      const config = useRuntimeConfig()
      this.loading = true
      this.error   = null

      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/auth/login`, {
          method: 'POST',
          credentials: 'include',
          body: { email, password },
        })

        if (data.success) {
          this.token = data.token
          this.user  = data.user
          const userStore = useUserStore()
          await userStore.fetchProfile()
          await navigateTo('/')
        }
      } catch (err: any) {
        const detail = err.data?.detail ?? ''
        this.error = detail === 'Invalid email or password'
          ? 'Incorrect email or password. Please try again.'
          : (detail || 'Sign in failed. Please try again.')
      } finally {
        this.loading = false
      }
    },

    // ── Google OAuth ─────────────────────────────────────────────
    signInWithGoogle() {
      const config = useRuntimeConfig()
      window.location.href = `${config.public.apiBase}/api/auth/google`
    },

    // ── Forgot Password ──────────────────────────────────────────
    async forgotPassword(email: string) {
      const config = useRuntimeConfig()
      this.loading = true
      this.error   = null
      this.successMessage = null

      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/auth/forgot-password`, {
          method: 'POST',
          body: { email },
        })
        if (data.success) {
          this.successMessage = `Password reset link sent to ${email}. Check your inbox.`
        }
      } catch (err: any) {
        this.error = err.data?.detail ?? 'Failed to send reset email.'
      } finally {
        this.loading = false
      }
    },

    // ── Reset Password ───────────────────────────────────────────
    async resetPassword(token: string, newPassword: string) {
      const config = useRuntimeConfig()
      this.loading = true
      this.error   = null

      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/auth/reset-password`, {
          method: 'POST',
          body: { token, new_password: newPassword },
        })
        if (data.success) {
          this.successMessage = 'Password reset successful. You can now sign in.'
          await navigateTo('/auth/login')
        }
      } catch (err: any) {
        this.error = err.data?.detail ?? 'Reset failed. The link may have expired.'
      } finally {
        this.loading = false
      }
    },

    // ── Sign Out ─────────────────────────────────────────────────
    async signOut() {
      const config = useRuntimeConfig()
      this.loading = true
      try {
        await $fetch(`${config.public.apiBase}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch {}
      // Clear cookie client-side too
      document.cookie = 'auth_token=; Max-Age=0; path=/'
      this.token = null
      this.user  = null
      const userStore = useUserStore()
      userStore.$reset()
      this.loading = false
      await navigateTo('/auth/login')
    },
  },
})

// Import here to avoid circular dep issue at top of file

