<template>
  <section
    :class="[
      'rounded-2xl border shadow-sm',
      'border-paper-200 bg-white dark:border-white/10 dark:bg-white/5',
      paddingClass,
      hoverable ? 'transition hover:-translate-y-0.5 hover:shadow-md' : '',
    ]"
  >
    <slot />
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
}>(), {
  padding: 'md',
  hoverable: false,
})

const paddingClass =
  props.padding === 'sm' ? 'p-4' :
  props.padding === 'lg' ? 'p-8' :
  'p-6'
</script>

