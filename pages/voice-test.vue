<template>
  <div class="min-h-screen bg-paper-50 dark:bg-ink-900 font-sans text-scholar-900 dark:text-paper-50 px-6 py-12">
    <div class="mx-auto max-w-3xl space-y-8">

      <!-- Header -->
      <header class="space-y-1">
        <NuxtLink to="/quiz" class="text-xs font-bold uppercase tracking-widest text-sage hover:text-scholar-600 transition-colors">
          ← Back to Quiz
        </NuxtLink>
        <h1 class="font-display text-3xl font-black tracking-tight mt-2">
          🎤 Voice Calibration Lab
        </h1>
        <p class="text-sm text-sage">
          Test microphone sensitivity and sentence capture accuracy before enabling Blind Scholar mode.
        </p>
      </header>

      <!-- Status Bar -->
      <div class="flex items-center gap-3 rounded-2xl border-2 px-6 py-4 transition-all"
        :class="statusClasses">
        <span class="relative flex h-3 w-3">
          <span v-if="isListening" class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span class="relative inline-flex h-3 w-3 rounded-full"
            :class="isListening ? 'bg-red-500' : micError ? 'bg-warn' : 'bg-paper-200 dark:bg-white/20'" />
        </span>
        <span class="font-bold text-sm">{{ statusLabel }}</span>
        <span v-if="confidence > 0" class="ml-auto font-mono text-xs font-bold text-sage">
          Confidence: {{ (confidence * 100).toFixed(0) }}%
        </span>
      </div>

      <!-- Controls -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <button @click="startListening" :disabled="isListening || !supported"
          class="flex flex-col items-center gap-2 rounded-2xl border-2 border-scholar-600 bg-scholar-600 py-4 font-bold text-sm text-white transition-all hover:bg-scholar-700 disabled:opacity-40 disabled:cursor-not-allowed">
          <span class="text-2xl">🎙️</span> Start
        </button>
        <button @click="stopListening" :disabled="!isListening"
          class="flex flex-col items-center gap-2 rounded-2xl border-2 border-paper-200 dark:border-white/10 py-4 font-bold text-sm text-sage transition-all hover:border-error hover:text-error disabled:opacity-40 disabled:cursor-not-allowed">
          <span class="text-2xl">⏹</span> Stop
        </button>
        <button @click="clearTranscript"
          class="flex flex-col items-center gap-2 rounded-2xl border-2 border-paper-200 dark:border-white/10 py-4 font-bold text-sm text-sage transition-all hover:border-scholar-600 hover:text-scholar-600">
          <span class="text-2xl">🗑️</span> Clear
        </button>
        <button @click="runEcho" :disabled="!lastFinalTranscript"
          class="flex flex-col items-center gap-2 rounded-2xl border-2 border-paper-200 dark:border-white/10 py-4 font-bold text-sm text-sage transition-all hover:border-gold-500 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed">
          <span class="text-2xl">🔊</span> Echo
        </button>
      </div>

      <!-- Settings Panel -->
      <div class="rounded-2xl border border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 space-y-4">
        <h2 class="font-display font-black text-base uppercase tracking-widest text-sage">Calibration Settings</h2>

        <!-- Silence Threshold -->
        <div>
          <label class="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-sage mb-2">
            <span>Silence Threshold (ms)</span>
            <span class="font-mono text-scholar-600">{{ silenceThreshold }}ms</span>
          </label>
          <input type="range" v-model.number="silenceThreshold" min="500" max="3000" step="100"
            class="w-full accent-scholar-600" />
          <div class="flex justify-between text-[10px] text-sage mt-1">
            <span>Fast (500ms)</span><span>Natural (1000ms)</span><span>Slow (3000ms)</span>
          </div>
        </div>

        <!-- Language -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-sage mb-2">Recognition Language</label>
          <select v-model="recognitionLang"
            class="w-full rounded-xl border-2 border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-bold focus:border-scholar-600 focus:outline-none transition-colors">
            <option value="en-NG">English (Nigeria)</option>
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
          </select>
        </div>

        <!-- Auto-restart toggle -->
        <label class="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p class="font-bold text-sm">Auto-restart on error</p>
            <p class="text-xs text-sage">Mimics Blind Mode resilience</p>
          </div>
          <div @click="autoRestart = !autoRestart"
            :class="autoRestart ? 'bg-scholar-600' : 'bg-paper-200 dark:bg-white/10'"
            class="h-6 w-11 rounded-full relative transition-colors cursor-pointer">
            <div :class="autoRestart ? 'translate-x-6' : 'translate-x-1'"
              class="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-sm" />
          </div>
        </label>
      </div>

      <!-- Real-time Transcript Card -->
      <div class="rounded-2xl border border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div class="flex items-center justify-between border-b border-paper-200 dark:border-white/10 px-6 py-3">
          <h2 class="font-display font-black text-sm uppercase tracking-widest text-sage">Real-time Transcript</h2>
          <span class="font-mono text-xs text-sage">{{ sentences.length }} sentence{{ sentences.length !== 1 ? 's' : '' }} captured</span>
        </div>

        <!-- Live interim -->
        <div class="min-h-[80px] px-6 pt-4 pb-2">
          <p v-if="interimText" class="text-base italic text-sage animate-pulse">
            "{{ interimText }}"
          </p>
          <p v-else-if="!isListening && !sentences.length" class="text-sm text-sage/60">
            Press <strong>Start</strong> and begin speaking. The transcript will appear here.
          </p>
          <p v-else-if="isListening && !interimText" class="text-sm text-sage/60 animate-pulse">
            Listening… speak now
          </p>
        </div>

        <!-- Final sentences log -->
        <div v-if="sentences.length" class="border-t border-paper-200 dark:border-white/10 divide-y divide-paper-200 dark:divide-white/10">
          <TransitionGroup name="sentence">
            <div v-for="(s, i) in sentences.slice().reverse()" :key="s.id"
              class="flex items-start gap-4 px-6 py-4">
              <span class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                :class="s.confidence > 0.85 ? 'bg-scholar-100 text-scholar-700 dark:bg-scholar-900/40 dark:text-scholar-300'
                  : s.confidence > 0.6 ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/40'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40'">
                {{ sentences.length - i }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium leading-relaxed">{{ s.text }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-[10px] font-bold text-sage">
                    {{ (s.confidence * 100).toFixed(0) }}% confidence
                  </span>
                  <span :class="s.confidence > 0.85 ? 'text-scholar-600' : s.confidence > 0.6 ? 'text-warn' : 'text-error'"
                    class="text-[10px] font-black uppercase tracking-wide">
                    {{ s.confidence > 0.85 ? '✓ High' : s.confidence > 0.6 ? '~ Medium' : '✗ Low' }}
                  </span>
                  <span class="text-[10px] text-sage ml-auto">{{ s.timestamp }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- Command Recognition Panel -->
      <div class="rounded-2xl border border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 space-y-4">
        <h2 class="font-display font-black text-base uppercase tracking-widest text-sage">Command Detection</h2>
        <p class="text-xs text-sage">These are the commands Blind Scholar Mode will recognise. Test them below.</p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div v-for="cmd in COMMANDS" :key="cmd.phrase"
            :class="lastCommand === cmd.phrase ? 'border-scholar-600 bg-scholar-50 dark:bg-scholar-900/30 scale-105' : 'border-paper-200 dark:border-white/10'"
            class="rounded-xl border-2 px-4 py-3 text-center transition-all duration-300">
            <p class="font-mono text-xs font-black uppercase text-scholar-600">{{ cmd.phrase }}</p>
            <p class="text-[10px] text-sage mt-0.5">{{ cmd.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Debug Log -->
      <div class="rounded-2xl border border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div class="flex items-center justify-between border-b border-paper-200 dark:border-white/10 px-6 py-3">
          <h2 class="font-display font-black text-sm uppercase tracking-widest text-sage">System Log</h2>
          <button @click="debugLog = []" class="text-[10px] font-bold text-sage hover:text-error transition-colors">Clear</button>
        </div>
        <div class="max-h-48 overflow-y-auto p-4 space-y-1 font-mono text-xs">
          <div v-if="!debugLog.length" class="text-sage/50">No events yet.</div>
          <div v-for="(entry, i) in debugLog.slice().reverse()" :key="i"
            :class="entry.type === 'error' ? 'text-error' : entry.type === 'success' ? 'text-scholar-600' : 'text-sage'">
            <span class="opacity-50">{{ entry.time }}</span> {{ entry.msg }}
          </div>
        </div>
      </div>

      <!-- Browser support warning -->
      <div v-if="!supported"
        class="rounded-2xl border-2 border-dashed border-error/40 bg-red-50 dark:bg-red-900/10 px-6 py-5 text-center space-y-2">
        <p class="text-xl">🚫</p>
        <p class="font-bold text-error">Speech Recognition not supported</p>
        <p class="text-xs text-sage">Use Chrome, Edge, or Safari 15+ for Web Speech API support.</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({ title: 'Voice Calibration Lab — MASTERY' })

// ── Types ─────────────────────────────────────────────────────────────────
interface Sentence {
  id: number
  text: string
  confidence: number
  timestamp: string
}
interface LogEntry {
  type: 'info' | 'success' | 'error'
  msg: string
  time: string
}

// ── Commands recognised by Blind Scholar Mode ─────────────────────────────
const COMMANDS = [
  { phrase: 'START',        desc: 'Begin session' },
  { phrase: 'NEXT',         desc: 'Next question' },
  { phrase: 'READ',         desc: 'Re-read question' },
  { phrase: 'RESTART QUIZ', desc: 'Play again' },
  { phrase: 'DASHBOARD',    desc: 'Go to dashboard' },
  { phrase: 'A / B / C / D', desc: 'Pick answer option' },
]

// ── State ─────────────────────────────────────────────────────────────────
const supported         = ref(false)
const isListening       = ref(false)
const interimText       = ref('')
const sentences         = ref<Sentence[]>([])
const confidence        = ref(0)
const micError          = ref(false)
const lastFinalTranscript = ref('')
const lastCommand       = ref('')
const debugLog          = ref<LogEntry[]>([])
const silenceThreshold  = ref(1000) // ms
const recognitionLang   = ref('en-NG')
const autoRestart       = ref(true)

let recognition: any    = null
let sentenceIdCounter   = 0
let silenceTimer: ReturnType<typeof setTimeout> | null = null
let restartCount        = 0

// ── Computed ──────────────────────────────────────────────────────────────
const statusLabel = computed(() => {
  if (!supported.value)  return 'Speech API not supported in this browser'
  if (micError.value)    return 'Microphone error — check permissions'
  if (isListening.value) return `Listening… (${silenceThreshold.value}ms silence threshold)`
  return 'Ready — click Start to calibrate'
})

const statusClasses = computed(() => {
  if (micError.value)    return 'border-error/40 bg-red-50 dark:bg-red-900/10 text-error'
  if (isListening.value) return 'border-scholar-600/40 bg-scholar-50 dark:bg-scholar-900/20 text-scholar-700 dark:text-scholar-300'
  return 'border-paper-200 dark:border-white/10 bg-white dark:bg-white/5 text-sage'
})

// ── Helpers ───────────────────────────────────────────────────────────────
const log = (msg: string, type: LogEntry['type'] = 'info') => {
  debugLog.value.push({
    type,
    msg,
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
  })
}

const detectCommand = (text: string): string | null => {
  const upper = text.toUpperCase().trim()
  for (const cmd of COMMANDS) {
    if (cmd.phrase === 'A / B / C / D') {
      if (/^[ABCD]$/.test(upper) || /^(OPTION\s+)?[ABCD]$/i.test(upper)) return upper[0]
    } else if (upper.includes(cmd.phrase)) {
      return cmd.phrase
    }
  }
  return null
}

const pushSentence = (text: string, conf: number) => {
  sentences.value.push({
    id: sentenceIdCounter++,
    text,
    confidence: conf,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  })
  lastFinalTranscript.value = text

  const cmd = detectCommand(text)
  if (cmd) {
    lastCommand.value = cmd
    log(`Command detected: "${cmd}"`, 'success')
    setTimeout(() => { lastCommand.value = '' }, 2000)
  } else {
    log(`Sentence captured (${(conf * 100).toFixed(0)}%): "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`, 'success')
  }
}

// ── SpeechRecognition setup ───────────────────────────────────────────────
const buildRecognition = () => {
  if (!import.meta.client) return
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRec) return

  recognition = new SpeechRec()
  recognition.continuous      = true
  recognition.interimResults  = true
  recognition.lang            = recognitionLang.value
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    isListening.value = true
    micError.value    = false
    restartCount++
    log(`Recognition started (attempt #${restartCount})`, 'info')
  }

  recognition.onresult = (e: any) => {
    // Reset silence timer on every new result
    if (silenceTimer) clearTimeout(silenceTimer)

    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const result = e.results[i]
      if (result.isFinal) {
        const text = result[0].transcript.trim()
        const conf = result[0].confidence ?? 0.8
        if (text) {
          confidence.value = conf
          pushSentence(text, conf)
          interimText.value = ''
        }
      } else {
        interim += result[0].transcript
      }
    }

    if (interim) {
      interimText.value = interim
      // Silence probability: after `silenceThreshold` ms of no new interim,
      // force-commit the interim as a final sentence (browser cut-off guard)
      silenceTimer = setTimeout(() => {
        if (interimText.value) {
          log(`Silence detected — committing interim: "${interimText.value.slice(0, 50)}…"`, 'info')
          pushSentence(interimText.value, 0.6)
          interimText.value = ''
        }
      }, silenceThreshold.value)
    }
  }

  recognition.onerror = (e: any) => {
    const ignorable = ['no-speech', 'aborted']
    if (ignorable.includes(e.error)) {
      log(`Non-fatal: ${e.error}`, 'info')
    } else {
      micError.value = true
      log(`Error: ${e.error}`, 'error')
    }
    isListening.value = false
  }

  recognition.onend = () => {
    isListening.value = false
    interimText.value = ''
    if (silenceTimer) clearTimeout(silenceTimer)
    log('Recognition ended', 'info')

    // Auto-restart in calibration mode (mirrors blind mode resilience)
    if (autoRestart.value && !micError.value && restartCount < 100) {
      setTimeout(() => {
        try {
          recognition.lang = recognitionLang.value
          recognition.start()
          log('Auto-restarted recognition', 'info')
        } catch {
          log('Auto-restart failed', 'error')
        }
      }, 300)
    }
  }
}

const startListening = () => {
  if (!supported.value || isListening.value) return
  micError.value = false
  restartCount   = 0
  if (recognition) {
    recognition.lang = recognitionLang.value
    try { recognition.start() } catch { log('Failed to start', 'error') }
  }
}

const stopListening = () => {
  autoRestart.value = false // Prevent auto-restart when manually stopped
  if (recognition) {
    try { recognition.stop() } catch { recognition.abort() }
  }
  if (silenceTimer) clearTimeout(silenceTimer)
  isListening.value = false
  interimText.value = ''
  log('Manually stopped', 'info')
  // Re-enable auto-restart toggle after manual stop
  nextTick(() => { autoRestart.value = true })
}

const clearTranscript = () => {
  sentences.value         = []
  interimText.value       = ''
  lastFinalTranscript.value = ''
  confidence.value        = 0
  log('Transcript cleared', 'info')
}

const runEcho = () => {
  if (!import.meta.client || !lastFinalTranscript.value) return
  window.speechSynthesis.cancel()
  const utt  = new SpeechSynthesisUtterance(`You said: ${lastFinalTranscript.value}`)
  utt.lang   = recognitionLang.value
  utt.rate   = 0.95
  window.speechSynthesis.speak(utt)
  log(`Echo: "${lastFinalTranscript.value.slice(0, 50)}"`, 'info')
}

// ── Watch lang change: rebuild recognition ────────────────────────────────
watch(recognitionLang, () => {
  if (recognition) {
    const wasListening = isListening.value
    try { recognition.abort() } catch { /* noop */ }
    buildRecognition()
    if (wasListening) startListening()
    log(`Language changed to ${recognitionLang.value}`, 'info')
  }
})

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  if (!import.meta.client) return
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  supported.value = !!SpeechRec
  if (supported.value) {
    buildRecognition()
    log('Speech API ready', 'success')
  } else {
    log('SpeechRecognition not available in this browser', 'error')
  }
})

onUnmounted(() => {
  if (silenceTimer) clearTimeout(silenceTimer)
  if (recognition) try { recognition.abort() } catch { /* noop */ }
  if (import.meta.client) window.speechSynthesis?.cancel()
})
</script>

<style scoped>
.sentence-enter-active { transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
.sentence-enter-from   { opacity: 0; transform: translateY(-8px); }
</style>
