/**
 * useAnnouncer — manages ARIA live region announcements
 * for screen reader users throughout the application.
 *
 * Two regions: 'polite' for informational updates,
 * 'assertive' for critical feedback (correct/wrong answer).
 */
export const useAnnouncer = () => {
  const politeMsg = ref('')
  const assertiveMsg = ref('')

  // Clear and re-set to force screen reader to re-announce
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      assertiveMsg.value = ''
      nextTick(() => { assertiveMsg.value = message })
    } else {
      politeMsg.value = ''
      nextTick(() => { politeMsg.value = message })
    }
  }

  const announceScore = (score: number, total: number) => {
    const pct = Math.round((score / total) * 100)
    announce(`Session complete. You scored ${score} out of ${total}, that is ${pct} percent.`, 'assertive')
  }

  const announceTierChange = (tierName: string, description: string) => {
    announce(`Congratulations! Tier upgraded to ${tierName}. ${description}`, 'assertive')
  }

  const announceQuestion = (questionNumber: number, total: number, questionText: string) => {
    announce(`Question ${questionNumber} of ${total}. ${questionText}`, 'polite')
  }

  const announceAnswer = (correct: boolean, correctOptionText: string) => {
    if (correct) {
      announce('Correct answer! Well done.', 'assertive')
    } else {
      announce(`Incorrect. The correct answer was: ${correctOptionText}. An explanation is now available below.`, 'assertive')
    }
  }

  return {
    politeMsg: readonly(politeMsg),
    assertiveMsg: readonly(assertiveMsg),
    announce,
    announceScore,
    announceTierChange,
    announceQuestion,
    announceAnswer,
  }
}
