<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import AuthCard  from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth'})
useHead({ title: 'Join the Academy — MASTERY' })

const authStore = useAuthStore()

// Reset store states on entry
onMounted(() => {
  authStore.clearError()
  authStore.clearSuccess()
})

const form = reactive({ 
  fullName: '', 
  email: '', 
  password: '', 
  agreedToTerms: false 
})

const errors = reactive({ 
  fullName: '', 
  email: '', 
  password: '', 
  terms: '' 
})

// Validation Helper
const clearFieldError = (f: keyof typeof errors) => { 
  errors[f] = ''
  authStore.clearError() 
}

// Password Strength Logic (Merged)
const passwordStrength = computed(() => {
  const p = form.password
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  
  return {
    score: s,
    label: ['', 'Weak', 'Fair', 'High', 'Optimal'][s] || 'Minimal',
    color: ['', '#BE123C', '#CA8A04', '#16a34a', '#059669'][s] || '#9ca3af'
  }
})

const validate = () => {
  let ok = true
  // Reset errors
  Object.keys(errors).forEach(k => (errors as any)[k] = '')

  if (!form.fullName.trim()) { 
    errors.fullName = 'Identity (Full Name) is required.'
    ok = false 
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { 
    errors.email = 'Valid academic email required.'
    ok = false 
  }
  
  if (form.password.length < 8) { 
    errors.password = 'Security code must be 8+ characters.'
    ok = false 
  }
  
  if (!form.agreedToTerms) { 
    errors.terms = 'You must agree to the Scholar Terms.'
    ok = false 
  }
  
  return ok
}

const handleSignup = async () => {
  if (validate()) {
    // Backend requires a username: extracting it from email prefix
    const username = form.email.split('@')[0]
    await authStore.signUp(form.email, form.password, form.fullName, username)
  }
}
</script>

<template>
  <AuthCard title="Join the Hall" subtitle="Embark on your academic journey." heading-id="signup-heading">
    
    <!-- Success Message -->
    <div v-if="authStore.successMessage" class="mb-4 rounded-xl border border-scholar-600/20 bg-scholar-50 dark:bg-scholar-900/30 p-3 text-xs font-bold text-scholar-700 dark:text-scholar-100 animate-reveal">
      <p class="flex items-center gap-2"><span>✓</span> {{ authStore.successMessage }}</p>
    </div>

    <!-- Error Message -->
    <div v-if="authStore.error" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600 animate-reveal">
      <p class="flex items-center gap-2"><span>⚠️</span> {{ authStore.error }}</p>
    </div>

    <form @submit.prevent="handleSignup" class="space-y-4" novalidate>
      <!-- Identity Field -->
      <AuthField 
        v-model="form.fullName" 
        label="Full Name" 
        type="text" 
        placeholder="Adaeze Obi" 
        icon="👤" 
        :required="true" 
        :error="errors.fullName" 
      />

      <!-- Email Field -->
      <AuthField 
        v-model="form.email" 
        label="Email" 
        type="email" 
        placeholder="you@academy.com" 
        icon="✉" 
        :required="true" 
        :error="errors.email" 
      />

      <!-- Password Field -->
      <div class="space-y-2">
        <AuthField 
          v-model="form.password" 
          label="Password" 
          type="password" 
          placeholder="8+ characters" 
          icon="🔒" 
          :required="true" 
          :error="errors.password" 
        />

        <!-- Strength Meter -->
        <div v-if="form.password" class="space-y-1.5 px-1">
          <div class="flex gap-1">
            <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full bg-paper-100 dark:bg-white/10 overflow-hidden">
              <div v-if="i <= passwordStrength.score" 
                   class="h-full transition-all duration-500"
                   :style="{ backgroundColor: passwordStrength.color }"></div>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[9px] font-black uppercase tracking-widest text-sage">Security Strength</span>
            <span class="font-mono text-[10px] font-bold" :style="{ color: passwordStrength.color }">
              {{ passwordStrength.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Terms & Conditions -->
      <div class="space-y-2">
        <label class="flex cursor-pointer items-start gap-3 group">
          <input 
            type="checkbox" 
            v-model="form.agreedToTerms" 
            class="sr-only" 
            @change="clearFieldError('terms')"
          />
          <div class="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-paper-200 transition-all group-hover:border-scholar-600"
               :class="form.agreedToTerms ? 'bg-scholar-600 border-scholar-600' : 'bg-white dark:bg-white/5'">
            <span v-if="form.agreedToTerms" class="flex h-full w-full items-center justify-center text-[10px] text-white">✓</span>
          </div>
          <span class="text-[11px] font-medium leading-tight text-sage dark:text-paper-400">
            I agree to the <span class="font-bold text-scholar-600 dark:text-scholar-400 underline">Scholar Terms</span> and 
            the <span class="font-bold text-scholar-600 dark:text-scholar-400 underline">Code of Conduct</span>.
          </span>
        </label>
        <p v-if="errors.terms" class="text-[10px] font-bold text-red-500 px-1 animate-reveal" role="alert">
          ⚠️ {{ errors.terms }}
        </p>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="authStore.loading"
        class="w-full rounded-xl bg-scholar-600 py-3.5 font-display text-base font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 active:scale-95 disabled:opacity-50"
      >
        <div class="flex items-center justify-center gap-2">
          <span v-if="authStore.loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          {{ authStore.loading ? 'Initializing...' : 'Initialize Account' }}
        </div>
      </button>

      <!-- Divider -->
      <div class="flex items-center gap-3 py-1">
        <div class="h-px flex-1 bg-paper-100 dark:bg-white/10"></div>
        <span class="text-[9px] font-black uppercase tracking-widest text-sage">or</span>
        <div class="h-px flex-1 bg-paper-100 dark:bg-white/10"></div>
      </div>

      <!-- Social -->
      <button 
        type="button" 
        @click="authStore.signInWithGoogle()"
        class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-paper-100 bg-white py-2.5 text-sm font-bold text-paper-900 transition-all hover:bg-paper-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="h-4 w-4" alt="Google" />
        Google Identity
      </button>
    </form>

    <template #footer>
      <p class="text-xs font-bold text-sage dark:text-paper-400">
        Already have an account? 
        <NuxtLink to="/auth/login" class="text-scholar-600 dark:text-scholar-400 underline underline-offset-4 hover:text-scholar-700">Login</NuxtLink>
      </p>
    </template>
  </AuthCard>
</template>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

@keyframes reveal {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-reveal { animation: reveal 0.4s ease-out forwards; }
</style>
