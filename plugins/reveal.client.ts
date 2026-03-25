export default defineNuxtPlugin((nuxtApp) => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

  const revealClass = 'animate-reveal'
  const initClasses = ['opacity-0', 'translate-y-5']

  const revealed = new WeakSet<HTMLElement>()

  const observer = prefersReducedMotion
    ? null
    : new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const el = entry.target as HTMLElement
            if (revealed.has(el)) continue
            revealed.add(el)
            el.classList.remove(...initClasses)
            el.classList.add(revealClass)
            observer?.unobserve(el)
          }
        },
        { threshold: 0.14 }
      )

  nuxtApp.vueApp.directive('reveal', {
    mounted(el, binding) {
      const node = el as HTMLElement
      if (prefersReducedMotion) return

      node.classList.add(...initClasses)
      node.style.willChange = 'transform,opacity'

      const delayMs = typeof binding.value === 'number' ? binding.value : 0
      if (delayMs > 0) node.style.animationDelay = `${delayMs}ms`

      observer?.observe(node)
    },
    unmounted(el) {
      observer?.unobserve(el as HTMLElement)
    },
  })
})

