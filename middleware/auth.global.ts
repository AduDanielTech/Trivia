/**
 * auth.global.ts — Global route middleware
 *
 * Rules:
 * - Public: `/` and `/auth/confirm`
 * - Authed redirect: logged-in user visiting `/auth/login` or `/auth/signup` → `/dashboard`
 * - Protected: logged-out user visiting `/dashboard`, `/quiz`, `/upload`, `/leaderboard` (incl. nested) → `/auth/login`
 */
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const isLoggedIn = !!user.value

  // Public routes
  if (to.path === '/' || to.path === '/auth/confirm') return

  // Logged-in user tries to visit login/signup → send to dashboard
  if (isLoggedIn && (to.path === '/auth/login' || to.path === '/auth/signup')) {
    return navigateTo('/dashboard')
  }

  // Protected routes (including nested paths)
  const protectedPrefixes = ['/dashboard', '/quiz', '/upload', '/leaderboard']
  const isProtectedRoute = protectedPrefixes.some(
    (p) => to.path === p || to.path.startsWith(`${p}/`),
  )

  if (!isLoggedIn && isProtectedRoute) {
    return navigateTo('/auth/login')
  }
})
