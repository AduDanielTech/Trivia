<template>
  <AuthCard title="Join the Hall" subtitle="Embark on your academic journey." heading-id="signup-heading">
    
    <div v-if="authStore.successMessage" class="mb-4 rounded-xl border border-scholar-600/20 bg-scholar-50 dark:bg-scholar-900/30 p-3 text-xs font-bold text-scholar-700 dark:text-scholar-100 animate-reveal">
      <p class="flex items-center gap-2"><span>✓</span> {{ authStore.successMessage }}</p>
    </div>

    <form @submit.prevent="handleSignup" class="space-y-4" novalidate>
      <AuthField v-model="form.fullName" label="Full Name" type="text" placeholder="Adaeze Obi" icon="👤" :required="true" :error="errors.fullName" />
      <AuthField v-model="form.email" label="Email" type="email" placeholder="you@academy.com" icon="✉" :required="true" :error="errors.email" />
      <AuthField v-model="form.password" label="Password" type="password" placeholder="8+ characters" icon="🔒" :required="true" :error="errors.password" />

      <div v-if="form.password" class="space-y-1.5 px-1">
        <div class="flex gap-1">
          <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full bg-paper-100 dark:bg-white/10 overflow-hidden">
            <div v-if="i <= passwordStrength.score" class="h-full bg-scholar-600 transition-all duration-500"></div>
          </div>
        </div>
        <p class="text-right text-[9px] font-black uppercase tracking-widest" :style="{ color: passwordStrength.color }">
          {{ passwordStrength.label }} Security
        </p>
      </div>

      <div class="space-y-1">
        <label class="text-[10px] font-black uppercase tracking-widest text-paper-900 dark:text-white/40 ml-1">Field of Focus</label>
        <select v-model="form.field" class="w-full rounded-xl border-2 border-paper-100 bg-paper-50 py-2.5 px-3 text-sm font-bold text-paper-900 dark:bg-white/5 dark:text-white dark:border-white/5 outline-none focus:border-scholar-600 transition-all">
          <option value="" disabled>Select...</option>
          <option value="JAMB Bundle">JAMB Comprehensive</option>
          <option value="WAEC Bundle">WAEC All-Access</option>
        </select>
      </div>

      <label class="flex cursor-pointer items-start gap-2 pt-1 group">
        <input type="checkbox" v-model="form.agreedToTerms" class="sr-only" />
        <div class="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-paper-200 transition-all group-hover:border-scholar-600"
             :class="form.agreedToTerms ? 'bg-scholar-600 border-scholar-600' : 'bg-white dark:bg-white/5'">
          <span v-if="form.agreedToTerms" class="flex h-full w-full items-center justify-center text-[10px] text-white">✓</span>
        </div>
        <span class="text-[11px] font-medium leading-tight text-sage dark:text-paper-400">
          I agree to the <span class="font-bold text-scholar-600 dark:text-scholar-400">Scholar Terms</span>.
        </span>
      </label>

      <button type="submit" :disabled="authStore.loading"
        class="w-full rounded-xl bg-scholar-600 py-3.5 font-display text-base font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 active:scale-95 disabled:opacity-50">
        Initialize Account
      </button>
    </form>

    <template #footer>
      <p class="text-xs font-bold text-sage dark:text-paper-400">
        Already a have an account? 
        <NuxtLink to="/auth/login" class="text-scholar-600 dark:text-scholar-400 underline underline-offset-4 hover:text-scholar-700">Login</NuxtLink>
      </p>
    </template>
  </AuthCard>
</template>






<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AuthCard from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Join Mastery Academy' })

const authStore = useAuthStore()
const form = reactive({ fullName: '', email: '', password: '', field: '', agreedToTerms: false })
const errors = reactive({ fullName: '', email: '', password: '', field: '', terms: '' })

const clearFieldError = (f: keyof typeof errors) => { (errors as any)[f] = ''; authStore.clearError() }

const passwordStrength = computed(() => {
  const p = form.password; let s = 0
  if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++
  return {
    score: s,
    label: ['Minimal', 'Weak', 'Fair', 'High', 'Optimal'][s],
    color: ['#BE123C', '#BE123C', '#CA8A04', '#16a34a', '#16a34a'][s]
  }
})

const validate = () => {
  let ok = true; Object.keys(errors).forEach(k => (errors as any)[k] = '')
  if (!form.fullName.trim()) { errors.fullName = 'Identity required.'; ok = false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Valid email required.'; ok = false }
  if (form.password.length < 8) { errors.password = '8+ characters required.'; ok = false }
  if (!form.field) { errors.field = 'Select your discipline.'; ok = false }
  if (!form.agreedToTerms) { errors.terms = 'Agreement required.'; ok = false }
  return ok
}

const handleSignup = async () => { if (validate()) await authStore.signUp(form.email, form.password, form.fullName) }
</script>