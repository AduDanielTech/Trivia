<template>
  <div class="min-h-screen bg-navy-900 flex items-center justify-center px-6 font-sans" role="main" aria-labelledby="error-heading">
    <div class="flex flex-col items-center text-center gap-4 max-w-sm animate-scale-in">
      <span class="text-5xl text-red-500 animate-pulse-gold" aria-hidden="true">⚠</span>
      <h1 id="error-heading" class="font-mono text-8xl font-extrabold text-white tracking-tight leading-none">
        {{ error?.statusCode ?? '?' }}
      </h1>
      <p class="text-xl font-bold text-white">
        {{ error?.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
      </p>
      <p class="text-sm text-navy-400 leading-relaxed">
        {{ error?.statusCode === 404
          ? "The page you are looking for doesn't exist or has been moved."
          : 'An unexpected error occurred. Please try again.' }}
      </p>
      <button
        class="mt-2 flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-all duration-200"
        @click="handleError">
        Go to Dashboard
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } | null }>()
const handleError = () => clearError({ redirect: '/' })
</script>
