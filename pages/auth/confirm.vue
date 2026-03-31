<template>
  <div class="min-h-screen bg-paper-50 transition-colors duration-500 dark:bg-ink-900 flex items-center justify-center px-6" role="main">
    
    <div class="w-full max-w-md bg-white border border-paper-200 rounded-[3rem] p-12 text-center shadow-2xl dark:bg-ink-800 dark:border-white/10 animate-reveal">
      
      <!-- State: Loading / Google Callback -->
      <div v-if="status === 'loading'" class="flex flex-col items-center space-y-6" aria-live="polite">
        <div class="relative h-16 w-16">
          <div class="absolute inset-0 animate-ping rounded-full bg-scholar-600/20"></div>
          <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-scholar-600 border-4 border-scholar-100 dark:border-scholar-900">
             <span class="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          </div>
        </div>
        <div class="space-y-2">
          <h1 class="font-display text-2xl font-black text-paper-900 dark:text-white">
            {{ isGoogleCallback ? 'Signing you in...' : 'Verifying Identity' }}
          </h1>
          <p class="text-base font-medium text-sage">
            {{ isGoogleCallback ? 'Syncing your Google profile...' : 'Connecting to the Academy...' }}
          </p>
        </div>
      </div>

      <!-- State: Success -->
      <div v-else-if="status === 'success'" class="flex flex-col items-center space-y-6" aria-live="assertive">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-5xl dark:bg-green-900/30">
          <span class="text-green-600">✓</span>
        </div>
        <div class="space-y-2">
          <h1 class="font-display text-2xl font-black text-paper-900 dark:text-white">Access Granted</h1>
          <p class="text-base font-medium text-sage">Identity verified. Welcome back, Scholar.</p>
        </div>
      </div>

      <!-- State: Email Confirmation Notice (Initial Signup) -->
      <div v-else-if="status === 'email_sent'" class="flex flex-col items-center space-y-6">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-scholar-50 text-5xl dark:bg-scholar-900/30">
          📧
        </div>
        <div class="space-y-2">
          <h1 class="font-display text-2xl font-black text-paper-900 dark:text-white">Check Your Mail</h1>
          <p class="text-base font-medium text-sage leading-relaxed">
            We've sent a magic link to your inbox. Please click it to activate your scholar profile.
          </p>
        </div>
        <NuxtLink to="/auth/login" class="text-sm font-bold text-scholar-600 hover:text-scholar-700">
          Back to Login
        </NuxtLink>
      </div>

      <!-- State: Error -->
      <div v-else class="flex flex-col items-center space-y-6" aria-live="assertive" role="alert">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-5xl dark:bg-red-900/20">
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
import { useAuthStore } from '~/stores/authStore'
import { useUserStore  } from '~/stores/userStore'

definePageMeta({ layout: false })
useHead({ title: 'Verifying — MASTERY' })

const route     = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

const status = ref<'loading'|'success'|'error'|'email_sent'>('loading')
const errorMessage = ref('The verification session expired or was interrupted.')
const isGoogleCallback = computed(() => route.query.provider === 'google')

onMounted(async () => {
  // 1. Handle Google OAuth Callback (FastAPI logic)
  if (isGoogleCallback.value) {
    // Attempt to find the auth_token set by the FastAPI redirect
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/)
    
    if (match) {
      try {
        const token = decodeURIComponent(match[1])
        authStore.setToken(token)
        
        // Hydrate the user profile
        await userStore.fetchProfile()
        
        if (userStore.username) {
          status.value = 'success'
          // Small delay for UX feel
          setTimeout(() => navigateTo('/'), 1500)
        } else {
          throw new Error('Profile fetch failed')
        }
      } catch (e) {
        status.value = 'error'
        errorMessage.value = 'Could not sync your profile. Please try logging in again.'
      }
    } else {
      status.value = 'error'
      errorMessage.value = 'Identity token missing. Please try signing in again.'
    }
    return
  }

  // 2. Handle standard "Check your email" state
  // If the user lands here without a token and it's not a google callback
  status.value = 'email_sent'
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