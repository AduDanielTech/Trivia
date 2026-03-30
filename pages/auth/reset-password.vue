<template>
  <div class="min-h-screen bg-navy-900 flex items-center justify-center px-4">
    <AuthCard title="Reset Password" subtitle="Enter your new password below.">

      <div v-if="!tokenFromUrl" class="flex flex-col gap-4 text-center">
        <p class="text-sm text-red-400">Invalid or missing reset link. Please request a new one.</p>
        <NuxtLink to="/auth/forgot-password"
          class="text-gold-500 text-sm font-semibold no-underline hover:underline">
          Request new link
        </NuxtLink>
      </div>

      <template v-else>
        <form class="flex flex-col gap-4" novalidate @submit.prevent="handleReset">

          <AuthField
            id="new-password"
            v-model="newPassword"
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            :disabled="authStore.loading"
            autocomplete="new-password"
          />

          <AuthField
            id="confirm-password"
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Repeat your new password"
            :disabled="authStore.loading"
            autocomplete="new-password"
          />

          <p v-if="localError" class="text-xs text-red-400" role="alert">{{ localError }}</p>
          <p v-if="authStore.error" class="text-xs text-red-400" role="alert">{{ authStore.error }}</p>
          <p v-if="authStore.successMessage" class="text-xs text-green-400" role="status">{{ authStore.successMessage }}</p>

          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Resetting…' : 'Reset Password' }}
          </button>

        </form>

        <div class="mt-4 text-center">
          <NuxtLink to="/auth/login"
            class="text-navy-400 text-xs hover:text-white transition-colors no-underline">
            Back to Sign In
          </NuxtLink>
        </div>
      </template>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import AuthCard  from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Reset Password — TRIVIA' })

const authStore = useAuthStore()
const route     = useRoute()

const tokenFromUrl    = computed(() => route.query.token as string || '')
const newPassword     = ref('')
const confirmPassword = ref('')
const localError      = ref('')

async function handleReset() {
  localError.value = ''
  authStore.clearError()

  if (newPassword.value.length < 8) {
    localError.value = 'Password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match.'
    return
  }

  await authStore.resetPassword(tokenFromUrl.value, newPassword.value)
}
</script>
