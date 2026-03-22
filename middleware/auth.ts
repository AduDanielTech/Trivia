/**
 * auth.ts — Global route middleware
 *
 * @nuxtjs/supabase handles the redirect automatically,
 * but this middleware also gates the /auth/* routes so
 * already-logged-in users are sent to the dashboard.
 */
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/confirm']
  const isAuthRoute = authRoutes.some(r => to.path.startsWith(r))

  // Logged-in user tries to visit login/signup → send to dashboard
  if (isAuthRoute && user.value) {
    return navigateTo('/')
  }

  // Not logged in and trying to access a protected route
  if (!isAuthRoute && !user.value) {
    return navigateTo('/auth/login')
  }
})
