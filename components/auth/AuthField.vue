<template>
  <div class="flex flex-col gap-1.5">
    <label :for="inputId" class="text-[10px] font-black uppercase tracking-widest text-paper-900 dark:text-white/40 ml-1">
      {{ label }}
      <span v-if="required" class="text-scholar-600 ml-0.5">*</span>
    </label>

    <div 
      class="relative flex items-center bg-paper-50 dark:bg-white/5 border-2 rounded-xl transition-all duration-200 group"
      :class="error
        ? 'border-error/30 ring-4 ring-error/5'
        : 'border-paper-100 focus-within:border-scholar-600 focus-within:bg-white dark:focus-within:bg-ink-900 focus-within:ring-4 focus-within:ring-scholar-600/5'"
    >
      <span v-if="icon" class="pl-4 text-base opacity-40 group-focus-within:opacity-100 group-focus-within:text-scholar-600 transition-all">
        {{ icon }}
      </span>

      <input
        :id="inputId"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        class="flex-1 bg-transparent border-none outline-none text-paper-900 dark:text-white font-sans text-[15px] font-bold py-3 px-3.5 placeholder:text-sage/40 placeholder:font-medium min-w-0"
        v-bind="$attrs"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <button v-if="type === 'password'" type="button"
        class="mr-2 p-1.5 rounded-lg text-sage hover:text-scholar-600 transition-all"
        @click="showPassword = !showPassword">
        <span class="text-base">{{ showPassword ? '🔓' : '🔒' }}</span>
      </button>
    </div>

    <p v-if="error" class="text-[11px] text-error font-black ml-1 animate-pulse">
      ⚠️ {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = defineProps<{
  modelValue: string; label: string; type?: string; placeholder?: string
  required?: boolean; autocomplete?: string; icon?: string; error?: string; hint?: string; id?: string
}>()
const uid = Math.random().toString(36).slice(2, 8);
const inputId = computed(() => props.id ?? `field-${uid}`);
const showPassword = ref(false);
const actualType = computed(() => props.type === 'password' ? (showPassword.value ? 'text' : 'password') : (props.type ?? 'text'));
</script>