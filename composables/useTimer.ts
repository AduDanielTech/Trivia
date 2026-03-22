/**
 * useTimer — countdown timer composable for quiz sessions
 */
export const useTimer = (initialSeconds = 30) => {
  const seconds = ref(initialSeconds)
  const isRunning = ref(false)
  const isExpired = computed(() => seconds.value <= 0)
  const isWarning = computed(() => seconds.value <= 10 && seconds.value > 0)
  let interval: ReturnType<typeof setInterval> | null = null

  const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    interval = setInterval(() => {
      if (seconds.value <= 0) {
        stop()
      } else {
        seconds.value--
      }
    }, 1000)
  }

  const stop = () => {
    if (interval) clearInterval(interval)
    isRunning.value = false
  }

  const reset = (newSeconds = initialSeconds) => {
    stop()
    seconds.value = newSeconds
  }

  onUnmounted(stop)

  return {
    seconds: readonly(seconds),
    isRunning: readonly(isRunning),
    isExpired,
    isWarning,
    start,
    stop,
    reset,
  }
}
