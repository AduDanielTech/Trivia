
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const route     = useRoute()
  const config    = useRuntimeConfig()

  const urlToken = route.query.token as string | undefined
  if (urlToken) {
    authStore.setToken(urlToken)
    await navigateTo(route.path, { replace: true })
  }

  const authCookie = useCookie<string | null>('auth_token')
  const activeToken = authCookie.value

  if (!activeToken) return

  authStore.setToken(activeToken)

  try {
    const me = await $fetch<any>(`${config.public.apiBase}/api/auth/me`, {
      headers:     { Authorization: `Bearer ${activeToken}` },
      credentials: 'include',
    })

    authStore.setUser({
      id:        me.id        ?? me.user_id ?? '',
      email:     me.email     ?? '',
      username:  me.username  ?? '',
      full_name: me.full_name ?? '',
      is_admin:  me.is_admin  ?? false,
    })

    userStore.syncFromAuth(me.full_name || me.username || '', me.email || '')

    await userStore.fetchProfile()

  } catch (err: any) {
    console.warn('[api.client] Session verification failed:', err?.status ?? err)

    authStore.setToken(null)
    authStore.setUser(null)

    const publicRoutes = ['/', '/auth/', '/leaderboard']
    const isPublic     = publicRoutes.some(p => route.path.startsWith(p))
    if (!isPublic) {
      await navigateTo(`/auth/login?redirect=${encodeURIComponent(route.path)}`)
    }
  }
})