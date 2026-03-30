// stores/uploadStore.ts
import { defineStore } from 'pinia'

export const useUploadStore = defineStore('upload', {
  state: () => ({
    files: [] as Array<{
      id: string
      name: string
      size: number
      type: string
      file: File | null
      status: 'pending' | 'uploading' | 'done' | 'error'
      progress: number
      documentId: string | null
      error: string | null
    }>,
    isProcessing:        false,
    progress:            0,
    generatedQuestions:  [] as any[],
    userDocuments:       [] as any[],
    error:               null as string | null,
    liveAnnouncement:    '',
  }),

  getters: {
    pendingFiles:    (state) => state.files.filter(f => f.status === 'pending'),
    hasFiles:        (state) => state.files.length > 0,
    allDone:         (state) => state.files.length > 0 && state.files.every(f => f.status === 'done' || f.status === 'error'),
  },

  actions: {
    addFile(file: File) {
      const entry = {
        id:         Date.now().toString(),
        name:       file.name,
        size:       file.size,
        type:       file.type,
        file,
        status:     'pending' as const,
        progress:   0,
        documentId: null,
        error:      null,
      }
      this.files.push(entry)
      this.liveAnnouncement = `File ${file.name} added. Ready to process.`
      return entry
    },

    removeFile(id: string) {
      const file = this.files.find(f => f.id === id)
      this.files = this.files.filter(f => f.id !== id)
      if (file) this.liveAnnouncement = `File ${file.name} removed.`
    },

    clearAll() {
      this.files              = []
      this.generatedQuestions = []
      this.error              = null
      this.progress           = 0
    },

    // ── POST /api/user/ingest → POST /api/trivia/generate-from-doc ─
    async processFiles(subject: string, field: string, title: string) {
      const pending = this.files.filter(f => f.status === 'pending')
      if (pending.length === 0) return

      const config    = useRuntimeConfig()
      const authStore = useAuthStore()

      this.isProcessing   = true
      this.progress       = 0
      this.error          = null
      this.generatedQuestions = []
      this.liveAnnouncement = 'Uploading your documents. Please wait.'

      const total = pending.length
      let done    = 0

      for (const entry of pending) {
        const idx = this.files.findIndex(f => f.id === entry.id)
        this.files[idx].status   = 'uploading'
        this.files[idx].progress = 0

        try {
          // Step 1: Upload document
          const formData = new FormData()
          formData.append('file',    entry.file!)
          formData.append('field',   field)
          formData.append('subject', subject)
          formData.append('title',   title || entry.name)

          const ingestData = await $fetch<any>(`${config.public.apiBase}/api/user/ingest`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${authStore.token}` },
            credentials: 'include',
            body: formData,
          })

          this.files[idx].progress   = 60
          this.files[idx].documentId = ingestData.document_id

          if (!ingestData.success) {
            throw new Error(ingestData.status || 'Processing failed')
          }

          // Step 2: Generate questions from the uploaded document
          this.liveAnnouncement = 'Generating questions from your document…'
          const genData = await $fetch<any>(`${config.public.apiBase}/api/trivia/generate-from-doc`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${authStore.token}` },
            credentials: 'include',
            body: {
              document_id: ingestData.document_id,
              subject,
              difficulty: 'medium',
              count:      10,
            },
          })

          if (genData.success) {
            this.generatedQuestions.push(...genData.questions)
          }

          this.files[idx].status   = 'done'
          this.files[idx].progress = 100

        } catch (err: any) {
          this.files[idx].status = 'error'
          this.files[idx].error  = err.data?.detail ?? 'Upload failed'
          this.error             = `Failed to process ${entry.name}`
        }

        done++
        this.progress = Math.round((done / total) * 100)
      }

      this.isProcessing = false
      const succeeded   = this.files.filter(f => f.status === 'done').length
      const failed      = this.files.filter(f => f.status === 'error').length

      if (failed === 0) {
        this.liveAnnouncement = `Done. ${this.generatedQuestions.length} questions generated from ${succeeded} document${succeeded > 1 ? 's' : ''}.`
      } else {
        this.liveAnnouncement = `Processed ${succeeded} file${succeeded !== 1 ? 's' : ''}. ${failed} failed.`
      }
    },

    // ── Load user's previously uploaded documents ─────────────────
    async fetchUserDocuments() {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()
      try {
        const data = await $fetch<any>(`${config.public.apiBase}/api/user/documents`, {
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
        })
        if (data.success) {
          this.userDocuments = data.data
        }
      } catch (err) {
        console.warn('[uploadStore] fetchUserDocuments failed:', err)
      }
    },

    // ── Delete a document ─────────────────────────────────────────
    async deleteDocument(docId: string) {
      const config    = useRuntimeConfig()
      const authStore = useAuthStore()
      try {
        await $fetch(`${config.public.apiBase}/api/user/documents/${docId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authStore.token}` },
          credentials: 'include',
        })
        this.userDocuments = this.userDocuments.filter((d: any) => d.id !== docId)
      } catch (err) {
        console.warn('[uploadStore] deleteDocument failed:', err)
        throw err
      }
    },
  },
})
