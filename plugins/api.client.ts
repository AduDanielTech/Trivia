/**
 * api.client.ts — replaces plugins/supabase.client.ts
 * 1. Reads auth_token cookie
 * 2. Calls /api/auth/me → hydrates authStore
 * 3. Calls /api/user/profile → hydrates userStore
 * 4. Handles ?token=... from Google OAuth redirect
 */
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const route     = useRoute()

  // Handle Google OAuth callback: /auth/confirm?token=xxx
  const urlToken = route.query.token as string | undefined
  if (urlToken && import.meta.client) {
    const cookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7, path: '/' })
    cookie.value = urlToken
    await navigateTo(route.path, { replace: true })
  }

  // Hydrate from existing cookie
  const cookie = useCookie<string | null>('auth_token')
  if (!cookie.value) return

  const ok = await authStore.initFromToken()
  if (!ok) return

  await userStore.fetchProfile()

  if (authStore.user) {
    userStore.syncFromAuth(
      authStore.user.full_name || authStore.user.username || '',
      authStore.user.email || ''
    )
  }
})
