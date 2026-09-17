/**
 * Formats a vehicle listing age into human-readable automotive freshness copy.
 *
 * Examples:
 * - "Listed today"
 * - "Listed 1 day ago"
 * - "Listed 2 days ago"
 * - "Listed 1 week ago"
 * - "Listed 3 weeks ago"
 * - "Listed Sep 2026"
 *
 * @param {string|Date} dateInput - ISO string or Date instance
 * @returns {string} Human-friendly freshness label
 */
export function formatListingFreshness(dateInput) {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return 'Listed today'

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays === 0) {
    return 'Listed today'
  }
  if (diffDays === 1) {
    return 'Listed 1 day ago'
  }
  if (diffDays < 7) {
    return `Listed ${diffDays} days ago`
  }
  if (diffDays < 14) {
    return 'Listed 1 week ago'
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `Listed ${weeks} weeks ago`
  }

  // Older than a month: e.g. "Listed Sep 2026"
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `Listed ${month} ${year}`
}

/**
 * Checks if a vehicle listing was created within the last 7 days.
 * Used for the "NEW" marketplace badge.
 *
 * @param {string|Date} dateInput
 * @returns {boolean}
 */
export function isListingNew(dateInput) {
  if (!dateInput) return false
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return false

  const now = Date.now()
  const diffDays = (now - date.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}

/**
 * Formats a numeric count into a compact representation (e.g. 1245 -> "1.2K").
 *
 * @param {number} count
 * @returns {string}
 */
export function formatMetricCount(count) {
  const num = Number(count) || 0
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return num.toLocaleString()
}

