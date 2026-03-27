/**
 * auth.client.ts — replaces supabase.client.ts
 *
 * Cookie as Source of Truth, State as Local Cache strategy:
 * 1. Reads auth_token cookie from the browser
 * 2. Sets authStore.token (makes all stores reactive immediately)
 * 3. Calls GET /api/user/profile → patches userStore with real DB values
 *    (XP, tier, streak, achievements, subject scores)
 *
 * The server middleware (server/middleware/auth.ts) already validated
 * the cookie server-side before this page was sent — so if we get here
 * on a protected route, the cookie is valid.
 */
import { useAuthStore } from '~/stores/authStore'
import { useUserStore  } from '~/stores/userStore'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  // ── 1. Read cookie ────────────────────────────────────────────
  const token = _readCookie('auth_token')
  if (!token) return   // no session — server middleware already redirected

  authStore.setToken(token)

  // ── 2. Hydrate profile from API ───────────────────────────────
  await userStore.fetchProfile()
})

function _readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}
