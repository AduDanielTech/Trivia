// Nuxt auto-import augmentations
export {}

declare global {
  // Score colours helper used across multiple components
  type ScoreLevel = 'weak' | 'average' | 'strong'

  interface QuizQuestion {
    id: number
    question: string
    options: string[]
    correct: number
    subject: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    xp: number
    explanation: string
  }

  interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    status: 'pending' | 'processing' | 'done' | 'error'
    progress: number
  }

  interface Achievement {
    id: string
    name: string
    earned: boolean
    icon: string
  }

  interface LeaderboardEntry {
    id: number
    username: string
    initials: string
    score: number
    tier: string
    isYou: boolean
  }
}
