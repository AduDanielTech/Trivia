<template>
  <AuthCard title="Credential Recovery" subtitle="Provide your scholar email to receive a secure access link." heading-id="forgot-heading">
    
    <!-- Status Messaging -->
    <div v-if="authStore.successMessage"
      class="mb-6 flex items-start gap-3 px-5 py-4 rounded-2xl bg-scholar-50 border border-scholar-600/20 text-scholar-700 dark:bg-scholar-900/30 dark:text-scholar-100 animate-reveal"
      role="status">
      <span class="text-xl">✉</span>
      <div class="text-sm font-bold leading-relaxed">
        Transmission Sent. <br/>
        <span class="text-xs font-medium opacity-80">Check your inbox for recovery instructions.</span>
      </div>
    </div>

    <div v-if="authStore.error"
      class="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-error/5 border border-error/20 text-error text-sm font-bold animate-reveal"
      role="alert">
      <span>⚠️</span>{{ authStore.error }}
    </div>

    <form v-if="!authStore.successMessage" @submit.prevent="handleReset" class="space-y-6" novalidate>
      <AuthField 
        v-model="email" 
        label="Scholar Email" 
        type="email" 
        placeholder="you@academy.com"
        icon="✉" 
        :required="true" 
        :error="emailError"
        @input="emailError = ''; authStore.clearError()" 
      />

      <button type="submit" :disabled="authStore.loading"
        class="w-full rounded-2xl bg-scholar-600 py-4 font-display text-lg font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 hover:scale-[1.02] active:scale-100 disabled:opacity-50">
        <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          Processing...
        </span>
        <span v-else>Request Recovery Link</span>
      </button>
    </form>

    <template #footer>
      <NuxtLink to="/auth/login" class="text-sm font-bold text-sage hover:text-scholar-600 transition-colors">
        ← Return to Portal Entry
      </NuxtLink>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AuthCard from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Recover Credentials — MASTERY' })

const authStore  = useAuthStore()
authStore.clearError(); authStore.clearSuccess()
const email      = ref('')
const emailError = ref('')

const handleReset = async () => {
  emailError.value = ''
  if (!email.value) { emailError.value = 'Email required.'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { emailError.value = 'Invalid address format.'; return }
  await authStore.forgotPassword(email.value)
}
</script>