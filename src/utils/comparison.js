const STORAGE_KEY = 'cardom_compare_cars'
export const MAX_COMPARE_CARS = 3

/**
 * Retrieves the array of compared car IDs from localStorage.
 * Only IDs are persisted to keep localStorage lightweight.
 *
 * @returns {string[]} Array of car IDs (up to 3)
 */
export function getCompareIds() {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string' && id.trim()).slice(0, MAX_COMPARE_CARS)
      : []
  } catch (err) {
    console.warn('[Cardom] Failed to read compare cars from localStorage:', err)
    return []
  }
}

/**
 * Saves the array of compared car IDs to localStorage and broadcasts an update event.
 *
 * @param {string[]} ids
 */
export function saveCompareIds(ids) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const valid = Array.isArray(ids)
      ? ids.filter((id) => typeof id === 'string' && id.trim()).slice(0, MAX_COMPARE_CARS)
      : []
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid))
    window.dispatchEvent(new CustomEvent('cardom_compare_updated', { detail: valid }))
  } catch (err) {
    console.warn('[Cardom] Failed to save compare cars to localStorage:', err)
  }
}

/**
 * Adds a car ID to the comparison list if under limit (max 3).
 *
 * @param {string} carId
 * @returns {{ success: boolean, reason?: string, count?: number }}
 */
export function addToCompare(carId) {
  if (!carId) return { success: false, reason: 'invalid_id' }
  const current = getCompareIds()
  if (current.includes(carId)) {
    return { success: true, count: current.length }
  }
  if (current.length >= MAX_COMPARE_CARS) {
    return { success: false, reason: 'max_reached', limit: MAX_COMPARE_CARS }
  }
  const updated = [...current, carId]
  saveCompareIds(updated)
  return { success: true, count: updated.length }
}

/**
 * Removes a car ID from the comparison list.
 *
 * @param {string} carId
 */
export function removeFromCompare(carId) {
  if (!carId) return
  const current = getCompareIds()
  const updated = current.filter((id) => id !== carId)
  saveCompareIds(updated)
}

/**
 * Clears all compared cars from localStorage.
 */
export function clearCompare() {
  saveCompareIds([])
}

/**
 * Checks whether a car ID is present in the comparison list.
 *
 * @param {string} carId
 * @returns {boolean}
 */
export function isCarInCompare(carId) {
  if (!carId) return false
  const current = getCompareIds()
  return current.includes(carId)
}

