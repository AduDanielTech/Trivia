/**
 * server/middleware/auth.ts — server-side auth guard
 *
 * Runs on the Nuxt server before the HTML is sent to the browser.
 * Reads auth_token cookie from the incoming request headers.
 * Protects all routes except /auth/* and public pages.
 * No hydration flicker — redirect happens before the page is rendered.
 */
import { defineEventHandler, getCookie, sendRedirect, getRequestURL } from 'h3'

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/confirm',
  '/auth/reset-password',
]

const AUTH_ONLY_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
]

export default defineEventHandler((event) => {
  const url  = getRequestURL(event)
  const path = url.pathname

  // Skip API routes, static assets, Nuxt internals
  if (
    path.startsWith('/api/')       ||
    path.startsWith('/_nuxt/')     ||
    path.startsWith('/__nuxt_')    ||
    path.startsWith('/favicon')    ||
    path.includes('.')             // static files
  ) {
    return
  }

  const token         = getCookie(event, 'auth_token')
  const isPublicRoute = PUBLIC_ROUTES.some(r => path.startsWith(r))
  const isAuthOnly    = AUTH_ONLY_ROUTES.some(r => path.startsWith(r))

  // Logged-in user visits login/signup → send to dashboard
  if (isAuthOnly && token) {
    return sendRedirect(event, '/', 302)
  }

  // Not logged in, trying to access protected route → login
  if (!isPublicRoute && !token) {
    const redirectParam = encodeURIComponent(path)
    return sendRedirect(event, `/auth/login?redirect=${redirectParam}`, 302)
  }
})
