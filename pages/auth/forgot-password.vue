<template>
  <AuthCard title="Reset password" subtitle="Enter your email and we'll send you a reset link" heading-id="forgot-heading">
    <div v-if="authStore.successMessage"
      class="flex items-start gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-5"
      role="status" aria-live="polite">
      <span aria-hidden="true">✉</span>{{ authStore.successMessage }}
    </div>
    <div v-if="authStore.error"
      class="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium mb-5"
      role="alert" aria-live="assertive">
      <span aria-hidden="true">⚠</span>{{ authStore.error }}
    </div>

    <form v-if="!authStore.successMessage" novalidate class="flex flex-col gap-4" @submit.prevent="handleReset">
      <AuthField v-model="email" label="Email address" type="email" placeholder="you@example.com"
        autocomplete="email" icon="✉" :required="true" :error="emailError"
        @input="emailError = ''; authStore.clearError()" />
      <button type="submit"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gold-500 text-navy-900 text-[15px] font-bold hover:bg-gold-400 transition-all duration-200 shadow-cta disabled:opacity-60"
        :disabled="authStore.loading" :aria-busy="authStore.loading" aria-label="Send password reset email">
        <span v-if="authStore.loading" class="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin-slow flex-shrink-0" aria-hidden="true" />
        {{ authStore.loading ? 'Sending…' : 'Send Reset Link' }}
      </button>
    </form>

    <template #footer>
      <NuxtLink to="/auth/login" class="text-sm text-navy-400 no-underline hover:text-gold-500 transition-colors">
        ← Back to Sign In
      </NuxtLink>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AuthCard from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Forgot Password — TRIVIA' })

const authStore  = useAuthStore()
authStore.clearError(); authStore.clearSuccess()
const email      = ref('')
const emailError = ref('')

const handleReset = async () => {
  emailError.value = ''
  if (!email.value) { emailError.value = 'Email is required.'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { emailError.value = 'Enter a valid email.'; return }
  await authStore.forgotPassword(email.value)
}
</script>
