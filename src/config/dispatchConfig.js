/**
 * dispatchConfig.js — Centralized configuration for ride matching and dispatch.
 */

export const DISPATCH_CONFIG = {
  // Initial search radius around pickup point in kilometers
  RIDE_MATCHING_RADIUS_KM: 5,

  // Second-stage search radius expansion if no partners found in initial radius
  RIDE_MATCHING_EXPANDED_RADIUS_KM: 10,

  // Maximum search radius expansion
  RIDE_MATCHING_MAX_RADIUS_KM: 15,

  // Duration in seconds before an unanswered partner ride offer expires
  RIDE_OFFER_TIMEOUT_SECONDS: 20,

  // Retry interval in seconds for searching user dispatch loop
  RIDE_MATCHING_RETRY_SECONDS: 10,

  // Maximum allowed age of partner GPS coordinates for matching eligibility
  PARTNER_LOCATION_MAX_AGE_SECONDS: 60,
}

export default DISPATCH_CONFIG

