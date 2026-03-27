<template>
  <div class="min-h-screen bg-navy-900 pb-24 md:pb-12">
    <div class="max-w-[880px] mx-auto px-6 py-8 flex flex-col gap-6">

      <header class="animate-fade-in">
        <h1 class="text-3xl font-extrabold tracking-tight text-white mb-1">
          Choose Your Field
        </h1>
        <p class="text-sm text-navy-400">Pick what you're studying — you can always change this later in Settings.</p>
      </header>

      <!-- Field category cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" style="animation-delay:100ms">
        <button
          v-for="cat in fields"
          :key="cat.id"
          class="flex flex-col gap-3 p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer"
          :class="selectedCategory?.id === cat.id
            ? 'bg-gold-500/[0.08] border-yellow-600'
            : 'bg-navy-700 border-navy-500 hover:bg-navy-600 hover:border-navy-400'"
          :aria-pressed="selectedCategory?.id === cat.id"
          :aria-label="`Select ${cat.name}`"
          @click="selectCategory(cat)"
        >
          <span class="text-3xl" aria-hidden="true">{{ cat.icon }}</span>
          <div>
            <div class="text-sm font-bold text-white">{{ cat.name }}</div>
            <div class="text-[11px] text-navy-400 mt-0.5">
              {{ cat.subjects.length }} subject{{ cat.subjects.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </button>
      </div>

      <!-- Subject selection (visible once category picked) -->
      <Transition name="screen-fade" mode="out-in">
        <section
          v-if="selectedCategory"
          :key="selectedCategory.id"
          class="bg-navy-700 border border-navy-500 rounded-2xl p-5 animate-fade-in"
          :aria-label="`Subjects in ${selectedCategory.name}`"
        >
          <h2 class="text-xs font-bold uppercase tracking-widest text-navy-400 mb-4">
            {{ selectedCategory.name }} — Choose a Subject
          </h2>

          <div class="flex flex-col gap-2">
            <button
              v-for="sub in selectedCategory.subjects"
              :key="sub.id"
              class="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer"
              :class="selectedSubject?.id === sub.id
                ? 'bg-gold-500/[0.08] border-yellow-600'
                : 'bg-navy-600 border-navy-500 hover:bg-navy-500 hover:border-navy-400'"
              :aria-pressed="selectedSubject?.id === sub.id"
              @click="selectedSubject = sub"
            >
              <div class="flex-1">
                <div class="text-sm font-semibold text-white">{{ sub.name }}</div>
                <div v-if="sub.covers?.length" class="text-[11px] text-navy-400 mt-0.5">
                  Covers: {{ sub.covers.join(', ') }}
                </div>
              </div>
              <span
                v-if="sub.bundle"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-gold-500/10 text-gold-500 border border-gold-500/30 flex-shrink-0"
              >Bundle</span>
              <span
                v-if="selectedSubject?.id === sub.id"
                class="text-gold-500 flex-shrink-0"
                aria-hidden="true"
              >✓</span>
            </button>
          </div>
        </section>
      </Transition>

      <!-- Confirm button -->
      <Transition name="screen-fade">
        <div v-if="selectedCategory && selectedSubject" class="flex gap-3 animate-fade-in">
          <button
            class="flex-1 py-3.5 rounded-xl bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="saving"
            aria-label="Confirm field selection and go to dashboard"
            @click="confirmField"
          >
            <span v-if="saving">Saving…</span>
            <span v-else>Confirm — Start Studying {{ selectedSubject.name }}</span>
          </button>
          <button
            class="px-5 py-3.5 rounded-xl border border-navy-500 text-navy-400 font-semibold text-sm hover:bg-navy-700 hover:text-white transition-all duration-200 cursor-pointer bg-transparent"
            @click="selectedCategory = null; selectedSubject = null"
          >
            Reset
          </button>
        </div>
      </Transition>

      <p v-if="errorMsg" class="text-sm text-red-400 text-center" role="alert">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore  } from '~/stores/userStore'

definePageMeta({ layout: 'default' })
useHead({ title: 'Choose Your Field — TRIVIA' })

const userStore = useUserStore()

const fields = [
  {
    id: 'exam_prep', name: 'Exam Preparation', icon: '🎓',
    subjects: [
      { id: 'jamb', name: 'JAMB',          bundle: true,  covers: ['English', 'Mathematics', 'Physics', 'Chemistry'] },
      { id: 'waec', name: 'WAEC',           bundle: true,  covers: ['English', 'Mathematics', 'Biology', 'Chemistry'] },
      { id: 'neco', name: 'NECO',           bundle: false, covers: [] },
      { id: 'gce',  name: 'GCE / A-Levels', bundle: false, covers: [] },
    ],
  },
  {
    id: 'tech_interviews', name: 'Tech Interviews', icon: '💻',
    subjects: [
      { id: 'programming',     name: 'Programming Fundamentals',     bundle: false, covers: [] },
      { id: 'data_structures', name: 'Data Structures & Algorithms', bundle: false, covers: [] },
      { id: 'system_design',   name: 'System Design',                bundle: false, covers: [] },
      { id: 'databases',       name: 'Databases & SQL',              bundle: false, covers: [] },
    ],
  },
  {
    id: 'university', name: 'University', icon: '🏛️',
    subjects: [
      { id: 'mathematics', name: 'Mathematics', bundle: false, covers: [] },
      { id: 'physics',     name: 'Physics',     bundle: false, covers: [] },
      { id: 'chemistry',   name: 'Chemistry',   bundle: false, covers: [] },
      { id: 'biology',     name: 'Biology',     bundle: false, covers: [] },
    ],
  },
  {
    id: 'professional', name: 'Professional Certs', icon: '📜',
    subjects: [
      { id: 'aws',  name: 'AWS Certification', bundle: false, covers: [] },
      { id: 'pmp',  name: 'PMP',               bundle: false, covers: [] },
      { id: 'ican', name: 'ICAN',               bundle: false, covers: [] },
    ],
  },
  {
    id: 'sciences', name: 'Sciences', icon: '🔬',
    subjects: [
      { id: 'biology',   name: 'Biology',   bundle: false, covers: [] },
      { id: 'chemistry', name: 'Chemistry', bundle: false, covers: [] },
      { id: 'physics',   name: 'Physics',   bundle: false, covers: [] },
    ],
  },
  {
    id: 'humanities', name: 'Humanities', icon: '📚',
    subjects: [
      { id: 'history',    name: 'History',    bundle: false, covers: [] },
      { id: 'literature', name: 'Literature', bundle: false, covers: [] },
      { id: 'government', name: 'Government', bundle: false, covers: [] },
    ],
  },
]

const selectedCategory = ref<typeof fields[0] | null>(null)
const selectedSubject  = ref<typeof fields[0]['subjects'][0] | null>(null)
const saving   = ref(false)
const errorMsg = ref('')

function selectCategory(cat: typeof fields[0]) {
  selectedCategory.value = cat
  selectedSubject.value  = null
}

async function confirmField() {
  if (!selectedCategory.value || !selectedSubject.value) return
  saving.value   = true
  errorMsg.value = ''
  try {
    await userStore.updateField(selectedCategory.value.id, selectedSubject.value.id)
    await navigateTo('/')
  } catch {
    errorMsg.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
