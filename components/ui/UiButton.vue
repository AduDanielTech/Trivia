<template>
  <component
    :is="as"
    :type="as === 'button' ? (type ?? 'button') : undefined"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2',
      'rounded-2xl font-extrabold',
      sizeClass,
      disabled ? 'cursor-not-allowed opacity-60' : 'transition hover:-translate-y-0.5 hover:shadow-md',
      variantClass,
      'focus:outline-none focus:ring-4 focus:ring-scholar-600/25',
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: 'button' | 'a' | 'div'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'ghost' | 'soft'
}>(), {
  as: 'button',
  size: 'md',
  variant: 'primary',
  disabled: false,
})

const sizeClass =
  props.size === 'sm' ? 'h-10 px-4 text-sm' :
  props.size === 'lg' ? 'h-14 px-6 text-lg' :
  'h-12 px-5 text-base'

const variantClass =
  props.variant === 'ghost'
    ? 'border border-paper-200 bg-white text-paper-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white'
    : props.variant === 'soft'
      ? 'border border-paper-200 bg-paper-50 text-paper-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white'
      : 'bg-scholar-600 text-white shadow-sm hover:bg-scholar-700'
</script>

