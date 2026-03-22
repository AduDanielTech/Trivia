import { defineStore } from 'pinia'

export type AuthView = 'login' | 'signup' | 'forgot'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Supabase session user (set by plugin after auth)
    user: null as null | {
      id: string
      email: string
      user_metadata?: { full_name?: string; avatar_url?: string }
    },
    loading: false,
    error: null as string | null,
    successMessage: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email ?? '',
    userName: (state) =>
      state.user?.user_metadata?.full_name ??
      state.user?.email?.split('@')[0] ??
      'Student',
  },

  actions: {
    setUser(user: typeof this.user) {
      this.user = user
    },

    clearError() {
      this.error = null
    },

    clearSuccess() {
      this.successMessage = null
    },

    // ── Sign Up ──────────────────────────────────────────
    async signUp(email: string, password: string, fullName: string) {
      const client = useSupabaseClient()
      this.loading = true
      this.error = null
      this.successMessage = null

      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            // emailRedirectTo sets the URL Supabase redirects to after email verify
            emailRedirectTo: `${useRequestURL().origin}/auth/confirm`,
          },
        })

        if (error) throw error

        // If email confirmation is disabled in Supabase, user is logged in immediately
        if (data.session) {
          this.user = data.user as typeof this.user
          await navigateTo('/')
        } else {
          // Email confirmation required
          this.successMessage = `Check your inbox at ${email} to confirm your account.`
        }
      } catch (err: any) {
        this.error = err.message ?? 'Sign up failed. Please try again.'
      } finally {
        this.loading = false
      }
    },

    // ── Sign In ──────────────────────────────────────────
    async signIn(email: string, password: string) {
      const client = useSupabaseClient()
      this.loading = true
      this.error = null

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        this.user = data.user as typeof this.user
        await navigateTo('/')
      } catch (err: any) {
        this.error =
          err.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Please try again.'
            : (err.message ?? 'Sign in failed. Please try again.')
      } finally {
        this.loading = false
      }
    },

    // ── Google OAuth ─────────────────────────────────────
    async signInWithGoogle() {
      const client = useSupabaseClient()
      this.loading = true
      this.error = null

      try {
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${useRequestURL().origin}/auth/confirm`,
          },
        })
        if (error) throw error
        // Redirect handled by Supabase OAuth flow
      } catch (err: any) {
        this.error = err.message ?? 'Google sign in failed.'
        this.loading = false
      }
    },

    // ── Forgot Password ──────────────────────────────────
    async forgotPassword(email: string) {
      const client = useSupabaseClient()
      this.loading = true
      this.error = null
      this.successMessage = null

      try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${useRequestURL().origin}/auth/reset-password`,
        })
        if (error) throw error
        this.successMessage = `Password reset link sent to ${email}. Check your inbox.`
      } catch (err: any) {
        this.error = err.message ?? 'Failed to send reset email.'
      } finally {
        this.loading = false
      }
    },

    // ── Sign Out ─────────────────────────────────────────
    async signOut() {
      const client = useSupabaseClient()
      this.loading = true
      await client.auth.signOut()
      this.user = null
      this.loading = false
      await navigateTo('/auth/login')
    },
  },
})
