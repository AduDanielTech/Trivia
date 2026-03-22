/**
 * useSound — lightweight audio feedback composable
 * Creates AudioContext tones rather than loading files,
 * so it works offline and loads instantly.
 */
export const useSound = () => {
  const isEnabled = ref(true)
  let audioCtx: AudioContext | null = null

  const getCtx = () => {
    if (!audioCtx && typeof window !== 'undefined') {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioCtx
  }

  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    if (!isEnabled.value) return
    const ctx = getCtx()
    if (!ctx) return
    try {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (_) {}
  }

  const playSuccess = () => {
    // Ascending chime — correct answer
    setTimeout(() => playTone(523, 0.15, 'sine', 0.25), 0)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 120)
    setTimeout(() => playTone(784, 0.25, 'sine', 0.3), 240)
  }

  const playError = () => {
    // Low thud — wrong answer
    playTone(180, 0.3, 'square', 0.15)
    setTimeout(() => playTone(150, 0.3, 'square', 0.1), 150)
  }

  const playLevelUp = () => {
    // Fanfare sequence — tier upgrade
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.35), i * 150)
    })
  }

  const playStreak = () => {
    // Quick double chime — streak milestone
    playTone(880, 0.12, 'sine', 0.2)
    setTimeout(() => playTone(1108, 0.25, 'sine', 0.25), 130)
  }

  const playClick = () => {
    playTone(400, 0.06, 'sine', 0.1)
  }

  const playUpload = () => {
    playTone(660, 0.1, 'sine', 0.2)
    setTimeout(() => playTone(880, 0.2, 'sine', 0.2), 100)
  }

  const toggle = () => {
    isEnabled.value = !isEnabled.value
  }

  return {
    isEnabled: readonly(isEnabled),
    playSuccess,
    playError,
    playLevelUp,
    playStreak,
    playClick,
    playUpload,
    toggle,
  }
}
