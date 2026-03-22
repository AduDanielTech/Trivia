<template>
  <div class="flex flex-col gap-1.5">
    <label :for="inputId" class="text-[13px] font-semibold text-navy-400">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5" aria-label="required">*</span>
    </label>

    <div class="relative flex items-center bg-navy-800 border rounded-lg transition-all duration-200"
      :class="error
        ? 'border-red-500 focus-within:shadow-[0_0_0_3px_rgba(255,79,109,0.15)]'
        : 'border-navy-500 focus-within:border-gold-600 focus-within:shadow-[0_0_0_3px_rgba(255,215,0,0.08)]'"
    >
      <span v-if="icon" class="pl-3.5 text-base opacity-60 flex-shrink-0" aria-hidden="true">{{ icon }}</span>
      <input
        :id="inputId"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :aria-describedby="error ? errorId : undefined"
        :aria-invalid="!!error"
        class="flex-1 bg-transparent border-none outline-none text-white font-sans text-sm py-3 px-3.5 placeholder-navy-400 min-w-0"
        :class="{ 'pl-2': icon, 'pr-11': type === 'password' }"
        v-bind="$attrs"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button v-if="type === 'password'" type="button"
        class="absolute right-3 text-navy-400 hover:text-white transition-colors p-1 rounded"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :aria-pressed="showPassword"
        @click="showPassword = !showPassword">
        <span aria-hidden="true" class="text-sm">{{ showPassword ? '🙈' : '👁' }}</span>
      </button>
    </div>

    <p v-if="error" :id="errorId" class="flex items-center gap-1.5 text-xs text-red-400 font-medium"
      role="alert" aria-live="assertive">
      <span aria-hidden="true">⚠</span>{{ error }}
    </p>
    <p v-else-if="hint" class="text-[11px] text-navy-400 leading-relaxed">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = defineProps<{
  modelValue: string; label: string; type?: string; placeholder?: string
  required?: boolean; autocomplete?: string; icon?: string; error?: string; hint?: string; id?: string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
const uid        = Math.random().toString(36).slice(2, 8)
const inputId    = computed(() => props.id ?? `field-${uid}`)
const errorId    = computed(() => `${inputId.value}-error`)
const showPassword = ref(false)
const actualType = computed(() => props.type === 'password' ? (showPassword.value ? 'text' : 'password') : (props.type ?? 'text'))
</script>
