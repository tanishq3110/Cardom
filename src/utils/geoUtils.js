/**
 * geoUtils.js - Lightweight geodesic distance and formatting utilities.
 */

/**
 * Calculate distance between two lat/lng points in kilometers using Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number|null} Distance in km, or null if coordinates invalid
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return null
  }

  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance in a human-friendly string (e.g. "2.4 km away" or "450 m away").
 * @param {number|null} km
 * @returns {string}
 */
export function formatDistance(km) {
  if (km === null || km === undefined || isNaN(km)) return 'Distance unavailable'
  if (km < 1) {
    const meters = Math.round(km * 1000)
    return `${meters} m away`
  }
  return `${km.toFixed(1)} km away`
}

/**
 * Calculate approximate ETA given distance in km and optional speed in meters/second.
 * Returns formatted string like "~6 min" or null if distance is invalid.
 * Does NOT invent fake ETA.
 * @param {number|null} distanceKm
 * @param {number|null} speedMps
 * @returns {string|null}
 */
export function calculateEta(distanceKm, speedMps) {
  if (!distanceKm || distanceKm <= 0) return null

  // If real speed is reported and > 2 m/s (~7 km/h)
  if (speedMps && speedMps > 2) {
    const speedKmh = speedMps * 3.6
    const hours = distanceKm / speedKmh
    const minutes = Math.round(hours * 60)
    if (minutes < 1) return '< 1 min'
    if (minutes > 120) return `~${Math.round(minutes / 60)} hrs`
    return `~${minutes} min`
  }

  // City driving average fallback: 25 km/h
  const avgSpeedKmh = 25
  const hours = distanceKm / avgSpeedKmh
  const minutes = Math.round(hours * 60)
  if (minutes < 1) return '< 1 min'
  return `~${minutes} min`
}

