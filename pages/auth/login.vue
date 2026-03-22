<template>
  <AuthCard title="Welcome back" subtitle="Sign in to continue your exam preparation journey" heading-id="login-heading">
    <div v-if="authStore.error"
      class="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium mb-5"
      role="alert" aria-live="assertive">
      <span aria-hidden="true">⚠</span>{{ authStore.error }}
    </div>

    <form novalidate class="flex flex-col gap-4" aria-labelledby="login-heading" @submit.prevent="handleLogin">
      <AuthField v-model="form.email" label="Email address" type="email" placeholder="you@example.com"
        autocomplete="email" icon="✉" :required="true" :error="errors.email"
        @input="clearFieldError('email')" />

      <AuthField v-model="form.password" label="Password" type="password" placeholder="Enter your password"
        autocomplete="current-password" icon="🔒" :required="true" :error="errors.password"
        @input="clearFieldError('password')" />

      <div class="flex justify-end -mt-1">
        <NuxtLink to="/auth/forgot-password"
          class="text-xs text-navy-400 no-underline hover:text-gold-500 transition-colors"
          aria-label="Forgot your password? Reset it here">
          Forgot password?
        </NuxtLink>
      </div>

      <button type="submit"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gold-500 text-navy-900 text-[15px] font-bold hover:bg-gold-400 transition-all duration-200 shadow-cta mt-1 disabled:opacity-60"
        :disabled="authStore.loading" :aria-busy="authStore.loading" aria-label="Sign in to TRIVIA">
        <span v-if="authStore.loading" class="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin-slow flex-shrink-0" aria-hidden="true" />
        {{ authStore.loading ? 'Signing in…' : 'Sign In' }}
      </button>

      <div class="flex items-center gap-3 text-navy-400 text-xs" role="separator" aria-label="or">
        <div class="flex-1 h-px bg-navy-500" />
        <span>or continue with</span>
        <div class="flex-1 h-px bg-navy-500" />
      </div>

      <button type="button"
        class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-navy-500 bg-transparent text-sm font-semibold text-white hover:bg-navy-600 hover:border-navy-400 transition-all duration-200 disabled:opacity-60"
        :disabled="authStore.loading" aria-label="Sign in with Google" @click="authStore.signInWithGoogle()">
        <span aria-hidden="true" class="w-5 h-5 bg-white text-[#4285F4] rounded-sm flex items-center justify-center text-xs font-black flex-shrink-0">G</span>
        Sign in with Google
      </button>
    </form>

    <template #footer>
      <p class="text-sm text-navy-400">
        Don't have an account?
        <NuxtLink to="/auth/signup" class="text-gold-500 no-underline font-semibold hover:text-gold-300 hover:underline transition-colors">
          Create one — it's free
        </NuxtLink>
      </p>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AuthCard from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign In — TRIVIA' })

const authStore = useAuthStore()
authStore.clearError()

const form   = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

const clearFieldError = (field: keyof typeof errors) => { errors[field] = ''; authStore.clearError() }

const validate = () => {
  errors.email = ''; errors.password = ''
  let ok = true
  if (!form.email) { errors.email = 'Email address is required.'; ok = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Please enter a valid email.'; ok = false }
  if (!form.password) { errors.password = 'Password is required.'; ok = false }
  return ok
}

const handleLogin = async () => { if (validate()) await authStore.signIn(form.email, form.password) }
</script>
