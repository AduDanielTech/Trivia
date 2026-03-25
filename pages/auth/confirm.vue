<template>
  <div class="min-h-screen bg-paper-50 transition-colors duration-500 dark:bg-ink-900 flex items-center justify-center px-6" role="main">
    
    <div class="w-full max-w-md bg-white border border-paper-200 rounded-[3rem] p-12 text-center shadow-2xl dark:bg-ink-800 dark:border-white/10 animate-reveal">
      
      <!-- State: Loading -->
      <div v-if="status === 'loading'" class="flex flex-col items-center space-y-6" aria-live="polite">
        <div class="relative h-16 w-16">
          <div class="absolute inset-0 animate-ping rounded-full bg-scholar-600/20"></div>
          <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-scholar-600 border-4 border-scholar-100 dark:border-scholar-900">
             <span class="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          </div>
        </div>
        <div class="space-y-2">
          <h1 class="font-display text-2xl font-black text-paper-900 dark:text-white">Verifying Identity</h1>
          <p class="text-base font-medium text-sage">Syncing your credentials with the Academy...</p>
        </div>
      </div>

      <!-- State: Success -->
      <div v-else-if="status === 'success'" class="flex flex-col items-center space-y-6" aria-live="assertive">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-scholar-50 text-5xl dark:bg-scholar-900/30">
          ✓
        </div>
        <div class="space-y-2">
          <h1 class="font-display text-2xl font-black text-paper-900 dark:text-white">Access Granted</h1>
          <p class="text-base font-medium text-sage">Welcome to the Hall of Scholars. Redirecting...</p>
        </div>
      </div>

      <!-- State: Error -->
      <div v-else class="flex flex-col items-center space-y-6" aria-live="assertive" role="alert">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-error/5 text-5xl">
          ⚠️
        </div>
        <div class="space-y-2">
          <h1 class="font-display text-2xl font-black text-paper-900 dark:text-white">Identity Mismatch</h1>
          <p class="text-base font-medium text-sage leading-relaxed">{{ errorMessage }}</p>
        </div>
        <NuxtLink to="/auth/login" class="inline-block w-full py-4 bg-scholar-600 text-white font-black rounded-2xl shadow-lg hover:bg-scholar-700 transition-all">
          Return to Portal
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Identity Verification — MASTERY' })

const status = ref<'loading'|'success'|'error'>('loading')
const errorMessage = ref('This verification link is no longer valid or has expired.')

onMounted(async () => {
  const user = useSupabaseUser()
  // Artificial delay for premium feel
  await new Promise(r => setTimeout(r, 2000))
  
  if (user.value) { 
    status.value = 'success'
    setTimeout(() => navigateTo('/dashboard'), 1500) 
  } else { 
    status.value = 'error' 
  }
})
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }
@keyframes reveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-reveal { animation: reveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
</style>