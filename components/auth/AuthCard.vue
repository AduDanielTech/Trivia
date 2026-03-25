<template>
  <!-- Reduced max-width from 460px to 420px for a tighter feel -->
  <div 
    class="w-full max-w-[420px] bg-white dark:bg-ink-800 border border-paper-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative z-10 animate-reveal"
    role="region" 
    :aria-labelledby="headingId"
  >
    <!-- Tightened padding from px-10 to px-8 -->
    <div class="px-8 pt-8 pb-1 text-center">
      <h1 
        :id="headingId" 
        class="text-2xl font-display font-black text-paper-900 dark:text-white tracking-tight mb-1"
      >
        {{ title }}
      </h1>
      <p 
        v-if="subtitle" 
        class="text-sm font-bold text-sage dark:text-paper-400 leading-relaxed px-2"
      >
        {{ subtitle }}
      </p>
    </div>

    <div class="px-8 py-6">
      <slot />
    </div>

    <div 
      v-if="$slots.footer" 
      class="px-8 pb-8 pt-5 border-t border-paper-100 dark:border-white/5 text-center bg-paper-50/50 dark:bg-white/[0.02]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; subtitle?: string; headingId?: string }>()
const headingId = computed(() => props.headingId ?? 'auth-heading')
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }
@keyframes reveal {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-reveal { animation: reveal 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
</style>