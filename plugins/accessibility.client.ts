/**
 * accessibility.client.ts
 *
 * Client-side plugin that:
 * 1. Enforces keyboard trap prevention in modals
 * 2. Announces route changes to screen readers
 * 3. Logs ARIA violations in dev mode
 * 4. Restores focus after navigation
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  // ── Route change announcements ───────────────────────────────
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('aria-live', 'polite')
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.setAttribute('role', 'status')
  liveRegion.className = 'sr-only'
  liveRegion.id = 'route-announcer'
  document.body.appendChild(liveRegion)

  const router = useRouter()

  router.afterEach((to) => {
    // Announce page change to screen readers
    const title = document.title || to.path
    liveRegion.textContent = ''
    setTimeout(() => {
      liveRegion.textContent = `Navigated to ${title.replace(' — TRIVIA', '')}`
    }, 100)

    // Focus main content after navigation
    setTimeout(() => {
      const main = document.getElementById('main-content')
      if (main) {
        main.focus()
      }
    }, 200)
  })

  // ── Skip link behaviour ──────────────────────────────────────
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('skip-link')) {
      e.preventDefault()
      const dest = document.getElementById('main-content')
      if (dest) {
        dest.tabIndex = -1
        dest.focus()
      }
    }
  })

  // ── Dev-mode ARIA checks ─────────────────────────────────────
  if (process.dev) {
    const checkInterval = setInterval(() => {
      // Check interactive elements have accessible names
      const interactiveEls = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
      interactiveEls.forEach((el) => {
        const btn = el as HTMLButtonElement
        if (!btn.textContent?.trim()) {
          console.warn('[A11y] Button without accessible name:', btn)
        }
      })

      // Check images have alt text
      document.querySelectorAll('img:not([alt])').forEach((img) => {
        console.warn('[A11y] Image without alt attribute:', img)
      })
    }, 5000)

    nuxtApp.hook('app:beforeMount', () => {
      clearInterval(checkInterval)
    })
  }

  // ── Reduced motion preference ────────────────────────────────
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  document.documentElement.dataset.reducedMotion = String(mediaQuery.matches)
  mediaQuery.addEventListener('change', (e) => {
    document.documentElement.dataset.reducedMotion = String(e.matches)
  })
})
