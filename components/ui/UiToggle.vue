<template>
  <button
    type="button"
    class="inline-flex h-10 items-center gap-3 rounded-2xl border border-paper-200 bg-white px-4 text-sm font-extrabold text-paper-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-scholar-600/25 dark:border-white/10 dark:bg-white/5 dark:text-white"
    :aria-pressed="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="relative inline-flex h-5 w-9 items-center rounded-full transition"
      :class="modelValue ? 'bg-scholar-600' : 'bg-paper-200 dark:bg-white/10'"
      aria-hidden="true"
    >
      <span
        class="h-4 w-4 rounded-full bg-white shadow-sm transition"
        :class="modelValue ? 'translate-x-4' : 'translate-x-1'"
      />
    </span>
    <span><slot /></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
</script>

