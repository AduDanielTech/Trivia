<template>
  <div class="min-h-screen bg-navy-900 flex items-center justify-center px-4" role="main" aria-labelledby="confirm-heading">
    <div class="w-full max-w-sm bg-navy-700 border border-navy-500 rounded-xl p-12 text-center animate-scale-in">
      <div v-if="status === 'loading'" class="flex flex-col items-center gap-4" aria-live="polite">
        <div class="w-11 h-11 border-[3px] border-navy-500 border-t-gold-500 rounded-full animate-spin-slow" aria-hidden="true" />
        <h1 id="confirm-heading" class="text-xl font-extrabold text-white">Confirming your account…</h1>
        <p class="text-sm text-navy-400">Please wait a moment.</p>
      </div>
      <div v-else-if="status === 'success'" class="flex flex-col items-center gap-3" aria-live="assertive">
        <span class="text-5xl font-black text-green-500" aria-hidden="true">✓</span>
        <h1 id="confirm-heading" class="text-xl font-extrabold text-white">Account confirmed!</h1>
        <p class="text-sm text-navy-400">Redirecting you to your dashboard…</p>
      </div>
      <div v-else class="flex flex-col items-center gap-3" aria-live="assertive" role="alert">
        <span class="text-5xl text-red-500" aria-hidden="true">⚠</span>
        <h1 id="confirm-heading" class="text-xl font-extrabold text-white">Confirmation failed</h1>
        <p class="text-sm text-navy-400">{{ errorMessage }}</p>
        <NuxtLink to="/auth/login" class="mt-2 px-6 py-2.5 bg-gold-500 text-navy-900 font-bold rounded-lg no-underline hover:bg-gold-400 transition-all">
          Back to Sign In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Confirming Account — TRIVIA' })
const status = ref<'loading'|'success'|'error'>('loading')
const errorMessage = ref('The confirmation link may have expired. Please request a new one.')
onMounted(async () => {
  const user = useSupabaseUser()
  await new Promise(r => setTimeout(r, 1500))
  if (user.value) { status.value = 'success'; setTimeout(() => navigateTo('/'), 1500) }
  else status.value = 'error'
})
</script>
