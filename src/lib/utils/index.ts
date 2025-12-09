import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as Italian currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Format date in Italian format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Format date with time in Italian format
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Calculate assessment score
 */
export function calculatePoints(
  answer: 'VERO' | 'INCERTO' | 'FALSO',
  scoringType: 'direct' | 'inverse'
): number {
  if (scoringType === 'direct') {
    switch (answer) {
      case 'VERO': return 2
      case 'INCERTO': return 1
      case 'FALSO': return 0
    }
  } else {
    // inverse scoring
    switch (answer) {
      case 'FALSO': return 2
      case 'INCERTO': return 1
      case 'VERO': return 0
    }
  }
}

/**
 * Calculate characteristic score (0-100)
 */
export function calculateCharacteristicScore(
  totalPoints: number,
  questionCount: number
): number {
  const maxPoints = questionCount * 2 // max 2 points per question
  return Math.round((totalPoints / maxPoints) * 100)
}

/**
 * Get pillar color
 */
export function getPillarColor(pillar: string): string {
  const colors: Record<string, string> = {
    ESSERE: '#3B82F6',   // blue
    SENTIRE: '#10B981',  // green
    PENSARE: '#8B5CF6',  // purple
    AGIRE: '#F59E0B',    // orange
  }
  return colors[pillar] || '#6B7280'
}
