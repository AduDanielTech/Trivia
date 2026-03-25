<template>
  <div class="min-h-screen flex flex-col bg-paper-50 transition-colors duration-500 dark:bg-ink-900 relative overflow-hidden font-sans">
    
    <!-- Background Dimmer (Shadow) for Dark Mode Visibility -->
    <div class="absolute inset-0 z-[1] pointer-events-none transition-opacity duration-500 opacity-0 dark:opacity-100 bg-black/40" aria-hidden="true" />

    <header class="relative z-20 px-8 py-5 border-b border-paper-200 dark:border-white/[0.04] flex justify-between items-center" role="banner">
      <NuxtLink to="/" class="inline-flex items-center gap-2 no-underline group" aria-label="Home">
        <span class="text-scholar-600 text-2xl transition-transform group-hover:scale-110" aria-hidden="true">⬡</span>
        <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span class="text-lg font-display font-black text-paper-900 dark:text-white tracking-tight">TRIVIA</span>
          <span class="text-[10px] text-sage dark:text-paper-400 uppercase tracking-widest font-bold">by Litesigma</span>
        </div>
      </NuxtLink>

      <button @click="toggleTheme" 
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-paper-200 bg-white shadow-sm transition-all hover:border-scholar-600 dark:border-white/10 dark:bg-white/5 dark:text-paper-50"
        aria-label="Toggle visual mode">
        <span v-if="colorMode.value === 'dark'">☀️</span>
        <span v-else>🌙</span>
      </button>
    </header>

    <main id="auth-main" class="flex-1 flex items-center justify-center px-4 py-8 relative z-10 outline-none" tabindex="-1">
      <slot />
    </main>

    <footer class="relative z-20 py-6 text-center" role="contentinfo">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-sage dark:text-paper-500 opacity-70">
        © {{ new Date().getFullYear() }} Litesigma Tech &bull; Built for Nigerian Scholars
      </p>
    </footer>

    <!-- Decorative Background blobs -->
    <div class="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-scholar-600/[0.08] dark:bg-scholar-600/[0.15] rounded-full blur-[80px]" />
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-sage/[0.1] dark:bg-purple-500/[0.1] rounded-full blur-[80px]" />
      <div class="absolute inset-0 opacity-[0.4] dark:opacity-[0.1]"
        style="background-image: linear-gradient(#16a34a 0.5px, transparent 0.5px), linear-gradient(90deg, #16a34a 0.5px, transparent 0.5px); background-size: 48px 48px;" />
    </div>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const toggleTheme = () => { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }
</script>