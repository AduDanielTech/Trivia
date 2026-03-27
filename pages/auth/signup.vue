<template>
  <AuthCard title="Join TRIVIA" subtitle="Create your free account and start preparing for JAMB, WAEC and more" heading-id="signup-heading">
    <div v-if="authStore.successMessage"
      class="flex flex-col gap-1.5 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-5"
      role="status" aria-live="polite">
      <span>✓ {{ authStore.successMessage }}</span>
      <span class="text-xs opacity-80 font-normal">Check your inbox (and spam) then click the link to activate.</span>
    </div>
    <div v-if="authStore.error"
      class="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium mb-5"
      role="alert" aria-live="assertive">
      <span aria-hidden="true">⚠</span>{{ authStore.error }}
    </div>

    <form v-if="!authStore.successMessage" novalidate class="flex flex-col gap-4" aria-labelledby="signup-heading" @submit.prevent="handleSignup">
      <AuthField v-model="form.fullName" label="Full name" type="text" placeholder="e.g. Adaeze Obi"
        autocomplete="name" icon="👤" :required="true" :error="errors.fullName" @input="clearFieldError('fullName')" />
      <AuthField v-model="form.email" label="Email address" type="email" placeholder="you@example.com"
        autocomplete="email" icon="✉" :required="true" :error="errors.email" @input="clearFieldError('email')" />
      <AuthField v-model="form.password" label="Password" type="password" placeholder="At least 8 characters"
        autocomplete="new-password" icon="🔒" :required="true" :error="errors.password"
        hint="Minimum 8 characters. Add a number for extra security." @input="clearFieldError('password')" />

      <!-- Password strength -->
      <div v-if="form.password" class="flex items-center gap-2 -mt-2"
        role="meter" :aria-valuenow="passwordStrength.score" aria-valuemin="0" aria-valuemax="4"
        :aria-label="`Password strength: ${passwordStrength.label}`">
        <div class="flex gap-1 flex-1">
          <div v-for="i in 4" :key="i" class="flex-1 h-1 rounded-full transition-all duration-200"
            :class="i <= passwordStrength.score ? '' : 'bg-navy-600'"
            :style="i <= passwordStrength.score ? { background: passwordStrength.color } : {}" />
        </div>
        <span class="font-mono text-[11px] font-bold min-w-[40px] text-right" :style="{ color: passwordStrength.color }">
          {{ passwordStrength.label }}
        </span>
      </div>

      <!-- Terms -->
      <label class="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" v-model="form.agreedToTerms" class="sr-only"
          :aria-describedby="errors.terms ? 'terms-err' : undefined" :aria-invalid="!!errors.terms"
          @change="clearFieldError('terms')" />
        <span class="w-[18px] h-[18px] mt-0.5 flex-shrink-0 rounded border-[1.5px] transition-all duration-150 flex items-center justify-center text-[11px] font-black"
          :class="form.agreedToTerms ? 'bg-gold-500 border-gold-500 text-navy-900' : 'bg-navy-800 border-navy-400'"
          aria-hidden="true">{{ form.agreedToTerms ? '✓' : '' }}</span>
        <span class="text-xs text-navy-400 leading-relaxed">
          I agree to the <a href="#" class="text-gold-500 no-underline hover:underline" target="_blank">Terms</a> and
          <a href="#" class="text-gold-500 no-underline hover:underline" target="_blank">Privacy Policy</a>
        </span>
      </label>
      <p v-if="errors.terms" id="terms-err" class="flex items-center gap-1.5 text-xs text-red-400 font-medium -mt-2" role="alert">
        <span aria-hidden="true">⚠</span>{{ errors.terms }}
      </p>

      <button type="submit"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gold-500 text-navy-900 text-[15px] font-bold hover:bg-gold-400 transition-all duration-200 shadow-cta mt-1 disabled:opacity-60"
        :disabled="authStore.loading" :aria-busy="authStore.loading" aria-label="Create your TRIVIA account">
        <span v-if="authStore.loading" class="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin-slow flex-shrink-0" aria-hidden="true" />
        {{ authStore.loading ? 'Creating account…' : 'Create Free Account' }}
      </button>

      <div class="flex items-center gap-3 text-navy-400 text-xs" role="separator" aria-label="or">
        <div class="flex-1 h-px bg-navy-500" /><span>or</span><div class="flex-1 h-px bg-navy-500" />
      </div>

      <button type="button"
        class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-navy-500 bg-transparent text-sm font-semibold text-white hover:bg-navy-600 transition-all duration-200 disabled:opacity-60"
        :disabled="authStore.loading" aria-label="Sign up with Google" @click="authStore.signInWithGoogle()">
        <span aria-hidden="true" class="w-5 h-5 bg-white text-[#4285F4] rounded-sm flex items-center justify-center text-xs font-black flex-shrink-0">G</span>
        Continue with Google
      </button>
    </form>

    <template #footer>
      <p class="text-sm text-navy-400">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-gold-500 no-underline font-semibold hover:text-gold-300 hover:underline transition-colors">Sign in</NuxtLink>
      </p>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import AuthCard  from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Create Account — TRIVIA' })

const authStore = useAuthStore()
authStore.clearError(); authStore.clearSuccess()

const form   = reactive({ fullName: '', email: '', password: '', agreedToTerms: false })
const errors = reactive({ fullName: '', email: '', password: '', terms: '' })

const clearFieldError = (field: keyof typeof errors) => { (errors as any)[field] = ''; authStore.clearError() }

const passwordStrength = computed(() => {
  const p = form.password; let s = 0
  if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++
  return {
    score: s,
    label: ['', 'Weak', 'Fair', 'Good', 'Strong'][s] ?? '',
    color: ['', '#FF4F6D', '#FF9500', '#FFD700', '#00E5A0'][s] ?? '#8A95A8',
  }
})

const validate = () => {
  Object.keys(errors).forEach(k => { (errors as any)[k] = '' }); let ok = true
  if (!form.fullName.trim()) { errors.fullName = 'Full name is required.'; ok = false }
  if (!form.email)           { errors.email    = 'Email is required.'; ok = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Enter a valid email.'; ok = false }
  if (!form.password)        { errors.password = 'Password is required.'; ok = false }
  else if (form.password.length < 8) { errors.password = 'Must be at least 8 characters.'; ok = false }
  if (!form.agreedToTerms)   { errors.terms    = 'You must agree to the Terms to continue.'; ok = false }
  return ok
}

const handleSignup = async () => {
  if (validate()) {
    const username = form.email.split('@')[0]
    await authStore.signUp(form.email, form.password, form.fullName, username)
  }
}
</script>
