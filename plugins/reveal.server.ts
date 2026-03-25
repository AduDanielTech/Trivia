export default defineNuxtPlugin((nuxtApp) => {
  // Register a no-op SSR directive so Vue SSR doesn't crash when it sees `v-reveal`.
  // The real IntersectionObserver behavior is client-only (see `plugins/reveal.client.ts`).
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps() {
      return {}
    },
  })
})

