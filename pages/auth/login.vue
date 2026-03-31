<template>
  <AuthCard title="Welcome Back" subtitle="Log in to your scholar portal." heading-id="login-heading">
    
    <!-- Global Error Alert -->
    <div v-if="authStore.error" class="mb-4 rounded-xl border border-error/20 bg-error/5 p-3 text-xs font-bold text-red-600 dark:text-red-400 animate-reveal">
      <p class="flex items-center gap-2"><span>⚠️</span> {{ authStore.error }}</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
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
      <div class="space-y-1">
        <AuthField 
          v-model="form.password" 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          icon="🔒" 
          :required="true" 
          :error="errors.password" 
        />
        <div class="flex justify-end pr-1">
          <NuxtLink to="/auth/forgot-password" class="text-[9px] font-black uppercase tracking-widest text-sage hover:text-scholar-600 transition-colors">
            Forgot Credentials?
          </NuxtLink>
        </div>
      </div>

      <!-- Submit Action -->
      <button 
        type="submit" 
        :disabled="authStore.loading"
        class="w-full rounded-xl bg-scholar-600 py-3.5 font-display text-base font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 active:scale-95 disabled:opacity-50"
      >
        {{ authStore.loading ? 'Authenticating...' : 'Enter Portal' }}
      </button>

      <!-- Divider -->
      <div class="flex items-center gap-3 py-1">
        <div class="h-px flex-1 bg-paper-100 dark:bg-white/10"></div>
        <span class="text-[9px] font-black uppercase tracking-widest text-sage dark:text-paper-500">Social Entry</span>
        <div class="h-px flex-1 bg-paper-100 dark:bg-white/10"></div>
      </div>

      <!-- Google Social Login -->
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
        New to the academy? 
        <NuxtLink to="/auth/signup" class="text-scholar-600 dark:text-scholar-400 underline underline-offset-4 hover:text-scholar-700">
          Create an account?
        </NuxtLink>
      </p>
    </template>
  </AuthCard>
</template>
<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import AuthCard  from '~/components/auth/AuthCard.vue'
import AuthField from '~/components/auth/AuthField.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Scholar Login — MASTERY' })

const authStore = useAuthStore()

// Form State
const form = reactive({ 
  email: '', 
  password: '' 
})

// Local Validation State
const errors = reactive({ 
  email: '', 
  password: '' 
})

// Clear errors when user types
watch(() => form.email, () => { errors.email = ''; authStore.clearError() })
watch(() => form.password, () => { errors.password = ''; authStore.clearError() })

const validate = () => {
  errors.email = ''
  errors.password = ''
  let ok = true

  // Email Validation (Robust Regex from backend update)
  if (!form.email) { 
    errors.email = 'Email address is required.'
    ok = false 
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { 
    errors.email = 'Please enter a valid academic email.'
    ok = false 
  }

  // Password Validation
  if (!form.password) { 
    errors.password = 'Security code (password) is required.'
    ok = false 
  }

  return ok
}

const handleLogin = async () => { 
  if (validate()) {
    await authStore.signIn(form.email, form.password) 
  }
}
</script>


<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

@keyframes reveal {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-reveal { animation: reveal 0.4s ease-out forwards; }
</style>
