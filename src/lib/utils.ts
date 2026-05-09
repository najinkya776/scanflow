export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toFixed(0)}`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getSentimentEmoji(rating: string): string {
  const map: Record<string, string> = {
    excellent: '😍',
    good: '🙂',
    average: '😐',
    bad: '😞',
  }
  return map[rating] ?? '😐'
}

export function getSentimentColor(sentiment: string): string {
  return sentiment === 'positive'
    ? 'text-green-600 bg-green-50'
    : 'text-red-600 bg-red-50'
}

export function getRatingColor(rating: string): string {
  const map: Record<string, string> = {
    excellent: 'text-green-700 bg-green-100',
    good: 'text-blue-700 bg-blue-100',
    average: 'text-yellow-700 bg-yellow-100',
    bad: 'text-red-700 bg-red-100',
  }
  return map[rating] ?? 'text-gray-700 bg-gray-100'
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
