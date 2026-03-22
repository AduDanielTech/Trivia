<template>
  <div class="w-full max-w-[440px] bg-navy-700 border border-navy-500 rounded-xl overflow-hidden shadow-card-lg animate-scale-in"
    role="region" :aria-labelledby="headingId">
    <div class="px-8 pt-8 pb-0">
      <h1 :id="headingId" class="text-2xl font-extrabold text-white tracking-tight mb-1.5">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-navy-400 leading-relaxed">{{ subtitle }}</p>
    </div>
    <div class="px-8 py-6"><slot /></div>
    <div v-if="$slots.footer" class="px-8 pb-7 pt-5 border-t border-navy-600 text-center">
      <slot name="footer" />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ title: string; subtitle?: string; headingId?: string }>()
const headingId = computed(() => props.headingId ?? 'auth-heading')
</script>
