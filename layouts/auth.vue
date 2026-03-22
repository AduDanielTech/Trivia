<template>
  <div class="min-h-screen flex flex-col bg-navy-950 relative overflow-hidden">
    <a href="#auth-main" class="skip-link">Skip to main content</a>

    <header class="relative z-10 px-8 py-5 border-b border-white/[0.04]" role="banner">
      <NuxtLink to="/auth/login" class="inline-flex items-center gap-2 no-underline" aria-label="TRIVIA home">
        <span class="text-gold-500 text-2xl" aria-hidden="true">⬡</span>
        <span class="text-lg font-extrabold text-white tracking-tight">TRIVIA</span>
        <span class="text-[10px] text-navy-400 uppercase tracking-widest">by Litesigma</span>
      </NuxtLink>
    </header>

    <main id="auth-main" class="flex-1 flex items-center justify-center px-4 py-8 relative z-10 outline-none" tabindex="-1">
      <slot />
    </main>

    <footer class="relative z-10 py-4 text-center" role="contentinfo">
      <p class="text-[11px] text-navy-400">© {{ new Date().getFullYear() }} Litesigma Tech. Built for Nigerian students.</p>
    </footer>

    <!-- Decorative bg -->
    <div class="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/[0.04] rounded-full blur-[80px]" />
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/[0.05] rounded-full blur-[80px]" />
      <div class="absolute inset-0"
        style="background-image: linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:48px 48px" />
    </div>
  </div>
</template>
