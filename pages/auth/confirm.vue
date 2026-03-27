<template>
  <div class="min-h-screen bg-navy-900 flex items-center justify-center px-4">
    <div class="text-center flex flex-col items-center gap-4">
      <span class="text-5xl" aria-hidden="true">
        {{ isError ? '❌' : isGoogleCallback ? '🔗' : '📧' }}
      </span>
      <h1 class="text-2xl font-extrabold text-white">
        {{ isError ? 'Something went wrong' : isGoogleCallback ? 'Signing you in…' : 'Check your email' }}
      </h1>
      <p class="text-sm text-navy-400 max-w-xs">
        <span v-if="isError">An error occurred. Please try again.</span>
        <span v-else-if="isGoogleCallback">Completing Google sign-in…</span>
        <span v-else>We sent a confirmation link to your email. Click it to activate your account.</span>
      </p>

      <div v-if="isGoogleCallback && !isError" class="flex items-center gap-2 text-xs text-navy-400" role="status">
        <div class="w-4 h-4 border-2 border-navy-500 border-t-gold-500 rounded-full animate-spin" aria-hidden="true" />
        Loading your profile…
      </div>

      <NuxtLink v-if="isError" to="/auth/login"
        class="px-5 py-2.5 rounded-lg bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-all no-underline">
        Back to Sign In
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import { useUserStore  } from '~/stores/userStore'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Confirming… — TRIVIA' })

const route     = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

const isGoogleCallback = computed(() => route.query.provider === 'google')
const isError          = ref(false)

onMounted(async () => {
  if (isGoogleCallback.value) {
    // Cookie was set by FastAPI redirect — just read it and hydrate
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/)
    if (match) {
      const token = decodeURIComponent(match[1])
      authStore.setToken(token)
      await userStore.fetchProfile()
      if (userStore.username) {
        await navigateTo('/')
      } else {
        isError.value = true
      }
    } else {
      isError.value = true
    }
  }
})
</script>
