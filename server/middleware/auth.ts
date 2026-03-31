// server/middleware/auth.ts
import { defineEventHandler, getCookie, sendRedirect, getRequestURL } from 'h3'

// Routes anyone can visit without a token
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/confirm',
  '/auth/reset-password',
  '/leaderboard',
]

// Routes that logged-in users should be bounced away from
const AUTH_ONLY_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
]

export default defineEventHandler((event) => {
  const url  = getRequestURL(event)
  const path = url.pathname

  // ── Skip non-page requests ────────────────────────────────────
  // API routes, Nuxt internals, static assets, and any path with a
  // file extension (.js, .css, .png, .ico, etc.) bypass auth entirely.
  if (
    path.startsWith('/api/')    ||
    path.startsWith('/_nuxt/')  ||
    path.startsWith('/__nuxt')  ||
    path.startsWith('/favicon') ||
    path.startsWith('/static/') ||
    /\.\w{1,5}$/.test(path)     // has a file extension
  ) {
    return
  }

  const token      = getCookie(event, 'auth_token')
  const isPublic   = PUBLIC_ROUTES.some(r => path === r || path.startsWith(`${r}/`))
  const isAuthOnly = AUTH_ONLY_ROUTES.some(r => path === r || path.startsWith(`${r}/`))

  // Logged-in user visits login/signup → bounce to dashboard
  if (isAuthOnly && token) {
    return sendRedirect(event, '/dashboard', 302)
  }

  // Unauthenticated user tries to access a protected route → login
  // Preserve the attempted path as ?redirect= so we can send them
  // back after a successful sign-in.
  if (!isPublic && !token) {
    const redirectParam = encodeURIComponent(path)
    return sendRedirect(event, `/auth/login?redirect=${redirectParam}`, 302)
  }
})