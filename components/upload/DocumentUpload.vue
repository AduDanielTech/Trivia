<template>
  <div class="space-y-8" aria-labelledby="upload-heading">
    <!-- Accessibility Announcement -->
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ uploadStore.liveAnnouncement }}
    </div>

    <!-- Section Intro -->
    <div class="space-y-2">
      <h2 id="upload-heading" class="font-display text-3xl font-black tracking-tight md:text-4xl">
        Study Sync <span class="text-scholar-600">AI</span>
      </h2>
      <p class="max-w-md text-base font-medium leading-relaxed text-sage dark:text-paper-200">
        Turn your textbooks and lecture notes into dynamic practice sessions. Paste or drop your materials below.
      </p>
    </div>

    <!-- The Drop Zone -->
    <div
      class="group relative flex min-h-[240px] cursor-pointer items-center justify-center rounded-[2.5rem] border-2 border-dashed transition-all duration-500"
      :class="[
        isDragging ? 'border-scholar-600 bg-scholar-50/50 scale-[1.02] shadow-2xl dark:bg-scholar-900/20' : 
        isDone ? 'border-scholar-600 bg-white dark:bg-white/5' :
        uploadStore.files.length > 0 ? 'border-scholar-600/40 bg-white dark:bg-white/5' :
        'border-paper-200 bg-white hover:border-scholar-600/50 hover:bg-paper-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
      ]"
      role="button"
      tabindex="0"
      @click="triggerFileInput"
      @keydown.enter="triggerFileInput"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input ref="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.txt" class="sr-only" @change="handleFileSelect" />

      <Transition name="fade-scale" mode="out-in">
        <!-- State: Idle -->
        <div v-if="uploadStore.files.length === 0 && !isDone" key="idle" class="flex flex-col items-center space-y-4 px-6 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper-50 text-3xl transition-transform group-hover:scale-110 group-hover:rotate-3 dark:bg-white/5">
            📄
          </div>
          <div class="space-y-1">
            <p class="font-display text-lg font-black tracking-tight">Drop your notes here</p>
            <p class="text-xs font-bold text-sage">PDF, DOCX, or TXT (Max 50MB)</p>
          </div>
          <div class="flex gap-2 pt-2">
            <span v-for="tag in ['Smart Extraction', 'Deep Learning', 'Instant Quiz']" :key="tag" 
                  class="rounded-md border border-paper-200 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-sage dark:border-white/10">
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- State: Files Queued -->
        <div v-else-if="uploadStore.files.length > 0 && !uploadStore.isProcessing && !isDone" key="ready" class="flex flex-col items-center space-y-3 px-6 text-center">
          <div class="flex h-16 w-16 animate-bounce-slow items-center justify-center rounded-full bg-scholar-600 text-3xl text-white shadow-xl">
            📋
          </div>
          <p class="font-display text-lg font-black tracking-tight">
            {{ uploadStore.files.length }} Material{{ uploadStore.files.length > 1 ? 's' : '' }} Ready
          </p>
          <p class="text-xs font-bold text-scholar-600 uppercase tracking-widest">Click to add more</p>
        </div>

        <!-- State: AI Processing -->
        <div v-else-if="uploadStore.isProcessing" key="processing" class="flex w-full max-w-sm flex-col items-center space-y-6 px-10 text-center">
          <div class="relative h-16 w-16">
             <div class="absolute inset-0 animate-ping rounded-full bg-scholar-600/20"></div>
             <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-scholar-600 text-2xl text-white">
               🧠
             </div>
          </div>
          <div class="w-full space-y-2">
            <p class="font-display text-lg font-black tracking-tight animate-pulse">Analyzing Content...</p>
            <div class="h-2 w-full overflow-hidden rounded-full bg-paper-100 dark:bg-white/10">
              <div 
                class="h-full rounded-full bg-scholar-600 transition-all duration-500 ease-out"
                :style="{ width: uploadStore.progress + '%' }"
              />
            </div>
            <p class="font-mono text-[10px] font-black uppercase tracking-widest text-sage">{{ uploadStore.progress }}% Complete</p>
          </div>
        </div>

        <!-- State: Success -->
        <div v-else-if="isDone" key="done" class="flex flex-col items-center space-y-3 px-6 text-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-scholar-50 text-5xl dark:bg-scholar-900/30">
            ✓
          </div>
          <h3 class="font-display text-2xl font-black tracking-tight">Knowledge Extracted</h3>
          <p class="text-sm font-bold text-scholar-600">{{ uploadStore.generatedQuestions.length }} Questions generated successfully.</p>
        </div>
      </Transition>
    </div>

    <!-- Subject Selector (Shown when files are ready) -->
    <div v-if="uploadStore.files.length > 0 && !uploadStore.isProcessing && !isDone"
      class="bg-white border border-paper-200 rounded-[2rem] p-6 flex flex-col gap-3 dark:bg-white/5 dark:border-white/10">
      <p class="text-[10px] font-black uppercase tracking-widest text-sage">
        Assign Subject Context
      </p>
      <select v-model="selectedSubject"
        class="w-full bg-paper-50 border border-paper-200 rounded-xl px-4 py-3 text-scholar-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-scholar-600/20 transition dark:bg-white/5 dark:text-white dark:border-white/10">
        <option v-for="opt in subjectOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-3 sm:flex-row">
      <button 
        v-if="uploadStore.files.length > 0 && !uploadStore.isProcessing && !isDone"
        @click="processFiles"
        class="flex-1 rounded-2xl bg-scholar-600 py-5 font-display text-lg font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 hover:scale-[1.02] active:scale-100"
      >
        ⚡ Generate Quiz
      </button>
      
      <template v-if="isDone">
        <button 
          @click="startDocQuiz"
          class="flex-1 rounded-2xl bg-scholar-600 py-5 font-display text-lg font-black text-white shadow-xl shadow-scholar-600/20 transition-all hover:bg-scholar-700 hover:scale-[1.02]"
        >
          🎯 Start Practice
        </button>
        <button 
          @click="resetUpload"
          class="rounded-2xl border-2 border-paper-200 bg-white px-8 py-5 font-bold text-paper-900 transition hover:bg-paper-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Reset Engine
        </button>
      </template>
    </div>

    <!-- Question Preview -->
    <Transition name="slide-up">
      <div v-if="isDone && uploadStore.generatedQuestions.length > 0" class="bg-white border border-paper-200 rounded-[2.5rem] p-8 dark:bg-white/5 dark:border-white/10">
        <h3 class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sage mb-6">
          AI Intelligence Preview
          <span class="px-2 py-0.5 rounded-full bg-scholar-100 text-scholar-700 dark:bg-scholar-900/40 dark:text-scholar-100">
            {{ uploadStore.generatedQuestions.length }} items
          </span>
        </h3>
        <ul class="space-y-4">
          <li v-for="(q, i) in uploadStore.generatedQuestions.slice(0, 3)" :key="q.id"
            class="flex items-start gap-4 p-5 bg-paper-50 border border-paper-100 rounded-2xl dark:bg-white/5 dark:border-white/10">
            <span class="font-mono text-xs font-bold text-sage">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-paper-900 leading-relaxed mb-2 dark:text-white">{{ q.question }}</p>
              <span class="text-[9px] font-black uppercase tracking-widest text-scholar-600">
                {{ q.subject }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useUploadStore } from '~/stores/uploadStore'

const uploadStore = useUploadStore()
const router = useRouter()
const sound = useSound()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedSubject = ref('jamb')
const selectedField = ref('exam_prep')
const isDragging = ref(false)
const dragCounter = ref(0)

const subjectOptions = [
  { value: 'jamb', label: 'JAMB' },
  { value: 'waec', label: 'WAEC' },
  { value: 'programming', label: 'Programming' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'general', label: 'General' },
]

const isDone = computed(() => !uploadStore.isProcessing && uploadStore.generatedQuestions.length > 0)

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const t = e.target as HTMLInputElement
  if (t.files) {
    Array.from(t.files).forEach(f => {
      uploadStore.addFile(f)
      sound.playUpload?.()
    })
  }
  if (fileInput.value) fileInput.value.value = ''
}

const handleDragEnter = () => { dragCounter.value++; isDragging.value = true }
const handleDragLeave = () => { dragCounter.value--; if (dragCounter.value === 0) isDragging.value = false }
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  dragCounter.value = 0
  if (e.dataTransfer?.files) {
    Array.from(e.dataTransfer.files).forEach(f => {
      uploadStore.addFile(f)
      sound.playUpload?.()
    })
  }
}

const processFiles = async () => {
  sound.playClick?.()
  await uploadStore.processFiles(
    selectedSubject.value || 'general',
    selectedField.value || 'exam_prep',
    uploadStore.files[0]?.name?.replace(/\.[^/.]+$/, '') || 'My Document'
  )
  sound.playLevelUp?.()
}

const startDocQuiz = () => { 
  sound.playClick?.()
  router.push('/quiz?mode=documents') 
}

const resetUpload = () => {
  uploadStore.$reset()
}

// Helpers
const getFileIcon = (type: string) => type.includes('pdf') ? '📕' : type.includes('doc') ? '📘' : '📄'
const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`
const truncateName = (name: string, max = 32) => {
  if (name.length <= max) return name
  const ext = name.split('.').pop()!
  return `${name.slice(0, max - ext.length - 4)}...${ext}`
}
</script>

<style scoped>
.font-display { font-family: 'Lexend', sans-serif; }

.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.95); }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
</style>