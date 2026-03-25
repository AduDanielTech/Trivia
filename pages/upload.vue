<template>
  <div class="min-h-screen bg-paper-50 font-sans text-scholar-900 transition-colors duration-500 dark:bg-ink-900 dark:text-paper-50">
    <div class="mx-auto max-w-3xl px-6 py-12 md:py-20">
      
      <!-- Laboratory Header -->
      <header class="mb-10 flex items-center justify-between animate-reveal">
        <NuxtLink 
          to="/dashboard" 
          class="group flex items-center gap-2 text-sm font-bold text-sage transition-colors hover:text-scholar-600 dark:text-paper-400 dark:hover:text-scholar-100"
        >
          <span class="transition-transform group-hover:-translate-x-1">←</span> 
          Return to Dashboard
        </NuxtLink>
        
        <div class="flex gap-2">
          <span class="rounded-lg bg-scholar-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-scholar-700 dark:bg-scholar-900/40 dark:text-scholar-100">
            AI Engine
          </span>
          <span class="rounded-lg bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
            Beta
          </span>
        </div>
      </header>

      <!-- Main Upload Canvas -->
      <div class="reveal-visible">
        <DocumentUpload />
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import DocumentUpload from '~/components/upload/DocumentUpload.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'AI Study Sync — MASTERY' })
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

@keyframes reveal {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-reveal { animation: reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
</style>