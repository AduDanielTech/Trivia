// stores/authStore.ts
import { defineStore } from 'pinia'
import { useUserStore } from '~/stores/userStore'

export interface User {
  id:        string
  email:     string
  username:  string
  full_name: string
  is_admin:  boolean
}

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()

  // ── STATE ────────────────────────────────────────────────────
  const user           = ref<User | null>(null)
  const token          = ref<string | null>(null)
  const loading        = ref(false)
  const error          = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  // ── PERSISTENT COOKIE ────────────────────────────────────────
  // maxAge: 30 days — survives browser restarts and page reloads.
  // httpOnly: false — we need JS to read it for Authorization headers.
  // sameSite: 'lax' — safe default; prevents CSRF on cross-site POSTs.
  // secure: true in production so the cookie only travels over HTTPS.
  const authCookie = useCookie<string | null>('auth_token', {
    maxAge:   60 * 60 * 24 * 30, // 30 days
    path:     '/',
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: false,
  })

  // Hydrate token from cookie immediately on store creation
  // (runs on both server and client — critical for SSR)
  if (authCookie.value) {
    token.value = authCookie.value
  }

  // ── GETTERS ───────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin         = computed(() => user.value?.is_admin ?? false)
  const userName        = computed(() => user.value?.full_name || user.value?.username || 'Scholar')
  const userEmail       = computed(() => user.value?.email ?? '')

  // ── ACTIONS ───────────────────────────────────────────────────

  /**
   * Persist token to both reactive state and cookie.
   * Pass null to clear the session.
   */
  function setToken(newToken: string | null) {
    token.value        = newToken
    authCookie.value   = newToken
  }

  /**
   * Hydrate the user object from any source (plugin, login, OAuth).
   * Exposed so api.client.ts can call authStore.setUser(me).
   */
  function setUser(newUser: User | null) {
    user.value = newUser
  }

  function clearError()   { error.value = null }
  function clearSuccess() { successMessage.value = null }

  // ── SIGN UP ───────────────────────────────────────────────────
  async function signUp(email: string, pass: string, fullName: string, username: string) {
    loading.value        = true
    error.value          = null
    successMessage.value = null

    try {
      const data = await $fetch<any>(`${config.public.apiBase}/api/auth/register`, {
        method: 'POST',
        body:   { email, password: pass, full_name: fullName, username },
      })

      if (data.token || data.access_token) {
        const activeToken = data.access_token || data.token
        setToken(activeToken)
        setUser(data.user ?? null)

        const userStore = useUserStore()
        await userStore.fetchProfile()
        await navigateTo('/dashboard')
      }
    } catch (err: any) {
      error.value = err.data?.detail || 'Registration failed. Please check your details.'
    } finally {
      loading.value = false
    }
  }

  // ── SIGN IN ───────────────────────────────────────────────────
  async function signIn(email: string, pass: string) {
    loading.value = true
    error.value   = null

    try {
      const data = await $fetch<any>(`${config.public.apiBase}/api/auth/login`, {
        method:      'POST',
        credentials: 'include',
        body:        { email, password: pass },
      })

      const activeToken = data.access_token || data.token
      if (activeToken) {
        setToken(activeToken)
        setUser(data.user ?? null)

        const userStore = useUserStore()
        await userStore.fetchProfile()

        // Honour redirect param if present (set by server middleware)
        const route        = useRoute()
        const redirectPath = (route.query.redirect as string) || '/dashboard'
        await navigateTo(decodeURIComponent(redirectPath))
      }
    } catch (err: any) {
      const detail = err.data?.detail || ''
      error.value  = detail === 'Invalid email or password'
        ? 'Identity mismatch. Please check your credentials.'
        : (detail || 'Login failed. Connection error.')
    } finally {
      loading.value = false
    }
  }

  // ── GOOGLE OAUTH ──────────────────────────────────────────────
  function signInWithGoogle() {
    if (import.meta.client) {
      window.location.href = `${config.public.apiBase}/api/auth/google`
    }
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────────
  async function forgotPassword(email: string) {
    loading.value        = true
    error.value          = null
    successMessage.value = null

    try {
      await $fetch(`${config.public.apiBase}/api/auth/forgot-password`, {
        method: 'POST',
        body:   { email },
      })
      successMessage.value = `Verification link dispatched to ${email}.`
    } catch (err: any) {
      error.value = err.data?.detail || 'Verification request failed.'
    } finally {
      loading.value = false
    }
  }

  // ── RESET PASSWORD ────────────────────────────────────────────
  async function resetPassword(resetToken: string, newPassword: string) {
    loading.value = true
    error.value   = null

    try {
      await $fetch(`${config.public.apiBase}/api/auth/reset-password`, {
        method: 'POST',
        body:   { token: resetToken, new_password: newPassword },
      })
      successMessage.value = 'Identity secured. Please sign in with your new code.'
      await navigateTo('/auth/login')
    } catch (err: any) {
      error.value = err.data?.detail || 'Reset failed. Link may have expired.'
    } finally {
      loading.value = false
    }
  }

  // ── SIGN OUT ──────────────────────────────────────────────────
  async function signOut() {
    loading.value = true
    try {
      await $fetch(`${config.public.apiBase}/api/auth/logout`, {
        method:      'POST',
        headers:     { Authorization: `Bearer ${token.value}` },
        credentials: 'include',
      })
    } catch {
      // Non-blocking — clear local state regardless of server response
    } finally {
      setToken(null)
      setUser(null)

      const userStore = useUserStore()
      userStore.$reset()

      loading.value = false
      await navigateTo('/auth/login')
    }
  }

  // ── EXPOSE ────────────────────────────────────────────────────
  return {
    // State
    user,
    token,
    loading,
    error,
    successMessage,
    // Getters
    isAuthenticated,
    isAdmin,
    userName,
    userEmail,
    // Actions
    setToken,
    setUser,
    signUp,
    signIn,
    signInWithGoogle,
    forgotPassword,
    resetPassword,
    signOut,
    clearError,
    clearSuccess,
  }
})