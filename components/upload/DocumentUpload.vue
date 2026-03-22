<template>
  <div class="flex flex-col gap-5" aria-labelledby="upload-heading">
    <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
      {{ uploadStore.liveAnnouncement }}
    </div>

    <!-- Header -->
    <div>
      <h2 id="upload-heading" class="flex items-center gap-2 text-2xl font-extrabold text-white tracking-tight mb-2">
        <span aria-hidden="true">📄</span> Document to Quiz
      </h2>
      <p class="text-sm text-navy-400 leading-relaxed max-w-lg">
        Upload your study notes, textbooks, or past questions. Our AI will extract practice questions from your materials.
      </p>
    </div>

    <!-- Drop zone -->
    <div
      class="relative border-2 border-dashed rounded-2xl min-h-[180px] flex items-center justify-center text-center cursor-pointer transition-all duration-200 bg-navy-800 outline-offset-4"
      :class="{
        'border-gold-500 bg-gold-500/[0.04] scale-[1.01] shadow-gold': isDragging,
        'border-navy-400 border-solid': uploadStore.files.length > 0 && !uploadStore.isProcessing,
        'border-purple-600 cursor-default pointer-events-none': uploadStore.isProcessing,
        'border-green-600 border-solid bg-green-500/[0.03]': isDone,
        'border-navy-500 hover:border-gold-600 hover:bg-navy-700': !isDragging && !isDone && !uploadStore.isProcessing,
      }"
      role="button" tabindex="0"
      :aria-label="dropZoneAriaLabel"
      :aria-describedby="uploadStore.files.length > 0 ? 'file-list-desc' : 'drop-zone-hint'"
      @click="triggerFileInput"
      @keydown.enter="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input ref="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.txt"
        class="sr-only" aria-hidden="true" tabindex="-1" @change="handleFileSelect" />

      <Transition name="zone-swap" mode="out-in">
        <!-- Empty -->
        <div v-if="uploadStore.files.length === 0 && !isDone" key="empty" class="flex flex-col items-center gap-3 px-6 py-8">
          <span class="text-4xl text-navy-400 transition-all duration-200 group-hover:text-gold-500" aria-hidden="true">↑</span>
          <p class="text-sm font-semibold text-white">Drop files here or press Enter to browse</p>
          <p id="drop-zone-hint" class="text-xs text-navy-400">Supports PDF, DOC, DOCX, TXT — up to 50MB each</p>
          <div class="flex gap-2 mt-1" aria-hidden="true">
            <span v-for="fmt in ['PDF','DOC','TXT']" :key="fmt"
              class="px-2 py-0.5 bg-navy-600 border border-navy-500 rounded text-[10px] font-bold text-navy-400 tracking-wider">
              {{ fmt }}
            </span>
          </div>
        </div>

        <!-- Queued -->
        <div v-else-if="uploadStore.files.length > 0 && !uploadStore.isProcessing && !isDone" key="queued" class="flex flex-col items-center gap-2 px-6 py-8">
          <span class="text-4xl" aria-hidden="true">📋</span>
          <p class="text-sm font-semibold text-white">
            {{ uploadStore.files.length }} file{{ uploadStore.files.length !== 1 ? 's' : '' }} ready
          </p>
          <p class="text-xs text-navy-400">Click to add more, or process below</p>
        </div>

        <!-- Processing -->
        <div v-else-if="uploadStore.isProcessing" key="processing" class="flex flex-col items-center gap-4 px-6 py-8 w-full max-w-xs">
          <div class="w-9 h-9 border-[3px] border-navy-500 border-t-purple-500 rounded-full animate-spin-slow" aria-hidden="true" />
          <p class="text-sm font-semibold text-white">Analysing your documents…</p>
          <div class="w-full h-1.5 bg-navy-600 rounded-full overflow-hidden"
            role="progressbar" :aria-valuenow="uploadStore.progress" aria-valuemin="0" aria-valuemax="100"
            :aria-label="`Processing progress: ${uploadStore.progress}%`">
            <div class="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300"
              :style="{ width: uploadStore.progress + '%' }" />
          </div>
          <p class="font-mono text-xs text-navy-400">{{ uploadStore.progress }}% — extracting questions</p>
        </div>

        <!-- Done -->
        <div v-else-if="isDone" key="done" class="flex flex-col items-center gap-2 px-6 py-8">
          <span class="text-5xl font-black text-green-500" aria-hidden="true">✓</span>
          <p class="text-sm font-semibold text-white">{{ uploadStore.generatedQuestions.length }} questions generated!</p>
          <p class="text-xs text-navy-400">Ready to start a quiz with your materials</p>
        </div>
      </Transition>

      <!-- Drag overlay -->
      <div v-if="isDragging"
        class="absolute inset-0 rounded-2xl flex items-center justify-center bg-gold-500/[0.08] pointer-events-none"
        aria-hidden="true">
        <span class="text-lg font-bold text-gold-500">Drop files here</span>
      </div>
    </div>

    <!-- File list -->
    <Transition name="list-fade">
      <div v-if="uploadStore.files.length > 0" id="file-list-desc" class="bg-navy-800 border border-navy-600 rounded-xl p-4">
        <h3 id="file-list-label" class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-navy-400 mb-3">
          Queued files
          <span class="font-mono px-2 py-0.5 bg-navy-600 border border-navy-500 rounded-full text-[10px]"
            :aria-label="`${uploadStore.files.length} files`">
            {{ uploadStore.files.length }}
          </span>
        </h3>
        <ul role="list" aria-label="Files queued for processing" aria-labelledby="file-list-label" class="flex flex-col gap-1.5 list-none">
          <li v-for="file in uploadStore.files" :key="file.id"
            class="flex items-center gap-3 px-3 py-2 bg-navy-700 border border-navy-600 rounded-lg animate-fade-in"
            role="listitem">
            <span class="text-xl flex-shrink-0" aria-hidden="true">{{ getFileIcon(file.type) }}</span>
            <div class="flex-1 min-w-0">
              <span class="block text-sm font-medium text-white truncate" :title="file.name">{{ truncateName(file.name) }}</span>
              <span class="font-mono text-[11px] text-navy-400">{{ formatSize(file.size) }}</span>
            </div>
            <span v-if="file.status === 'done'"
              class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-500/10 text-green-500 border border-green-500/20 flex-shrink-0"
              aria-label="Processing complete">Done</span>
            <button v-else-if="!uploadStore.isProcessing"
              class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-navy-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-150 text-xs border-0 bg-transparent cursor-pointer"
              :aria-label="`Remove ${file.name}`"
              @click.stop="uploadStore.removeFile(file.id)">
              <span aria-hidden="true">✕</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Error -->
    <div v-if="uploadStore.error"
      class="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400"
      role="alert" aria-live="assertive">
      <span aria-hidden="true">⚠</span>{{ uploadStore.error }}
    </div>

    <!-- Action buttons -->
    <div class="flex gap-3 flex-wrap">
      <button v-if="uploadStore.files.length > 0 && !uploadStore.isProcessing && !isDone"
        class="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all duration-200 shadow-cta disabled:opacity-60"
        :disabled="uploadStore.isProcessing"
        aria-label="Process uploaded files and generate quiz questions"
        @click="processFiles">
        <span aria-hidden="true">⚡</span> Generate Questions
      </button>
      <button v-if="isDone"
        class="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all duration-200 shadow-cta"
        aria-label="Start a quiz with the generated questions"
        @click="startDocQuiz">
        <span aria-hidden="true">🎯</span> Start Quiz from Documents
      </button>
      <button v-if="isDone"
        class="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-navy-500 bg-transparent text-sm font-semibold text-white hover:bg-navy-600 hover:border-navy-400 transition-all duration-200"
        aria-label="Upload more documents"
        @click="resetUpload">
        Upload More
      </button>
    </div>

    <!-- Preview -->
    <Transition name="preview-reveal">
      <div v-if="isDone && uploadStore.generatedQuestions.length > 0" class="bg-navy-800 border border-navy-600 rounded-xl p-5">
        <h3 class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-navy-400 mb-4">
          Generated questions preview
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-gold-500/10 text-gold-500 border border-gold-500/30">
            {{ uploadStore.generatedQuestions.length }} total
          </span>
        </h3>
        <ul role="list" aria-label="Preview of generated questions" class="flex flex-col gap-2.5 list-none">
          <li v-for="(q, i) in uploadStore.generatedQuestions.slice(0, 3)" :key="q.id"
            class="flex items-start gap-3 px-3 py-3 bg-navy-700 border border-navy-600 rounded-lg animate-slide-up"
            :style="{ animationDelay: `${i * 100}ms` }">
            <span class="font-mono text-[11px] text-navy-400 mt-0.5 flex-shrink-0 min-w-[24px]">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white leading-relaxed mb-2">{{ q.question }}</p>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/30">
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
import { useUploadStore } from '~/stores/index'

const uploadStore = useUploadStore()
const router      = useRouter()
const sound       = useSound()

const fileInput  = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const dragCounter = ref(0)

const isDone = computed(() => !uploadStore.isProcessing && uploadStore.generatedQuestions.length > 0)

const dropZoneAriaLabel = computed(() => {
  if (uploadStore.isProcessing) return `Processing ${uploadStore.files.length} files. Progress: ${uploadStore.progress}%`
  if (isDone.value)             return `Processing complete. ${uploadStore.generatedQuestions.length} questions generated.`
  if (uploadStore.files.length) return `${uploadStore.files.length} files queued. Press Enter to add more.`
  return 'Upload documents to generate quiz questions. Press Enter or Space to browse, or drag and drop here.'
})

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const t = e.target as HTMLInputElement
  if (t.files) Array.from(t.files).forEach(f => { uploadStore.addFile(f); sound.playUpload() })
  if (fileInput.value) fileInput.value.value = ''
}

const handleDragEnter = () => { dragCounter.value++; isDragging.value = true }
const handleDragLeave = () => { dragCounter.value--; if (dragCounter.value === 0) isDragging.value = false }
const handleDrop = (e: DragEvent) => {
  isDragging.value = false; dragCounter.value = 0
  if (e.dataTransfer?.files) Array.from(e.dataTransfer.files).forEach(f => { uploadStore.addFile(f); sound.playUpload() })
}

const processFiles = async () => { sound.playClick(); await uploadStore.processFiles(); sound.playLevelUp() }
const startDocQuiz = () => { sound.playClick(); router.push('/quiz?mode=documents') }
const resetUpload  = () => uploadStore.$reset()

const getFileIcon  = (type: string) => type.includes('pdf') ? '📕' : type.includes('doc') ? '📘' : '📄'
const formatSize   = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`
const truncateName = (name: string, max = 28) => {
  if (name.length <= max) return name
  const ext = name.split('.').pop()!
  return `${name.slice(0, max - ext.length - 4)}…${ext}`
}
</script>

<style scoped>
.zone-swap-enter-active, .zone-swap-leave-active { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
.zone-swap-enter-from, .zone-swap-leave-to { opacity: 0; transform: scale(0.96); }
.list-fade-enter-active, .list-fade-leave-active { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
.list-fade-enter-from, .list-fade-leave-to { opacity: 0; transform: translateY(-6px); }
.preview-reveal-enter-active, .preview-reveal-leave-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.preview-reveal-enter-from, .preview-reveal-leave-to { opacity: 0; transform: translateY(10px); }
</style>
