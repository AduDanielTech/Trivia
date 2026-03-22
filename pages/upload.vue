<template>
  <div class="min-h-[calc(100vh-60px)] bg-navy-900 pb-24 md:pb-12">
    <div class="max-w-[760px] mx-auto px-6 py-8 flex flex-col gap-6">
      <header class="flex items-center justify-between animate-fade-in">
        <NuxtLink to="/" class="text-xs text-navy-400 no-underline hover:text-white transition-colors">← Dashboard</NuxtLink>
        <div class="flex gap-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/30">AI-Powered</span>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-gold-500/10 text-gold-500 border border-gold-500/30">Beta</span>
        </div>
      </header>
      <div class="animate-fade-in" style="animation-delay:100ms">
        <DocumentUpload />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import DocumentUpload from '~/components/upload/DocumentUpload.vue'
definePageMeta({ layout: 'default' })
useHead({ title: 'Upload Documents — TRIVIA' })
</script>
