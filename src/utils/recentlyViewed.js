const STORAGE_KEY = 'cardom_recently_viewed'
const MAX_ITEMS = 8

/**
 * Retrieves the array of recently viewed car IDs from localStorage.
 * @returns {string[]} Array of car IDs (up to 8, newest first)
 */
export function getRecentlyViewedIds() {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string' && id.trim()) : []
  } catch (err) {
    console.warn('[Cardom] Failed to read recently viewed cars:', err)
    return []
  }
}

/**
 * Adds a car ID to the recently viewed list.
 * If the car ID already exists, it is moved to the top.
 * Maximum 8 items are preserved.
 *
 * @param {string} carId - The ID of the car viewed
 */
export function addRecentlyViewed(carId) {
  if (!carId || typeof window === 'undefined' || !window.localStorage) return
  try {
    const current = getRecentlyViewedIds()
    // Remove existing occurrence to avoid duplicates
    const filtered = current.filter((id) => id !== carId)
    // Add to beginning
    const updated = [carId, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[Cardom] Failed to save recently viewed car:', err)
  }
}

/**
 * Clears recently viewed cars from localStorage.
 */
export function clearRecentlyViewed() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[Cardom] Failed to clear recently viewed cars:', err)
  }
}

