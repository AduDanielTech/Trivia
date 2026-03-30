/**
 * api.client.ts — client-side app initialization plugin
 * Reads auth_token cookie → calls /api/auth/me → hydrates stores.
 * Uses authStore.setToken() and authStore.setUser() which actually exist.
 */
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const route     = useRoute()
  const config    = useRuntimeConfig()

  // Handle Google OAuth callback: /auth/confirm?token=xxx
  const urlToken = route.query.token as string | undefined
  if (urlToken && import.meta.client) {
    const cookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7, path: '/' })
    cookie.value = urlToken
    await navigateTo(route.path, { replace: true })
    return
  }

  // Read JWT from cookie
  const cookie = useCookie<string | null>('auth_token')
  if (!cookie.value) return

  // Set token immediately so isAuthenticated is reactive
  authStore.setToken(cookie.value)

  try {
    const me = await $fetch<any>(`${config.public.apiBase}/api/auth/me`, {
      headers:     { Authorization: `Bearer ${cookie.value}` },
      credentials: 'include',
    })
    authStore.setUser(me)
    await userStore.fetchProfile()
    if (me) userStore.syncFromAuth(me.full_name || me.username || '', me.email || '')
  } catch (err) {
    console.warn('[api.client] Auth hydration failed — clearing session')
    authStore.setToken(null)
    authStore.setUser(null)
    const c = useCookie('auth_token')
    c.value  = null
  }
})
