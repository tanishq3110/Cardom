/**
 * partnerLocationApi.js — Driver GPS location tracking and reporting service for Cardom Partner App.
 * Handles permissions, hardware GPS/Capacitor Geolocation with browser fallback,
 * throttled Supabase updates (~5-10 seconds), and active-state tracking lifecycle.
 */

import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'
import { supabase } from '@/lib/supabase'
import { reportPartnerLocation } from '@/services/partnerAvailabilityApi'

let activeWatchId = null
let activeRideId = null
let lastUpdateTime = 0
let lastPosition = null
let availabilityTimer = null
const MIN_UPDATE_INTERVAL_MS = 6000 // 6 seconds throttle to avoid excessive writes
const MIN_DISTANCE_METERS = 5 // or when moved at least 5 meters

/**
 * Check and request location permissions.
 * Safe across both native Android and web platforms.
 * @returns {Promise<{ granted: boolean, error?: string }>}
 */
export async function checkAndRequestLocationPermission() {
  try {
    if (Capacitor.isNativePlatform()) {
      let status = await Geolocation.checkPermissions()
      if (status.location !== 'granted') {
        status = await Geolocation.requestPermissions()
      }
      return { granted: status.location === 'granted' }
    } else {
      // In browser / web view
      if (!('geolocation' in navigator)) {
        return { granted: false, error: 'Geolocation is not supported by your device.' }
      }
      return { granted: true }
    }
  } catch (err) {
    console.warn('[Location] Permission check error:', err)
    return { granted: false, error: err.message || 'Permission denied' }
  }
}

/**
 * Get current single GPS location.
 * @returns {Promise<{ coords: { latitude: number, longitude: number, accuracy: number, heading: number|null, speed: number|null }|null, error: Error|null }>}
 */
export async function getCurrentLocation() {
  try {
    const perm = await checkAndRequestLocationPermission()
    if (!perm.granted) {
      throw new Error(perm.error || 'Location permission not granted')
    }

    if (Capacitor.isNativePlatform()) {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      })
      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        },
        error: null,
      }
    } else {
      // Browser fallback
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              },
              error: null,
            })
          },
          (err) => {
            resolve({ coords: null, error: err })
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
        )
      })
    }
  } catch (err) {
    return { coords: null, error: err }
  }
}

/**
 * Update the driver's location in Supabase for the given active ride.
 * Enforces RLS: Partner must have active assignment for this ride.
 * Upserts a single row per ride_id (stores ONLY the latest location).
 * @param {string} rideId
 * @param {object} coords
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function updateDriverLocation(rideId, coords) {
  if (!rideId || !coords?.latitude || !coords?.longitude) {
    return { data: null, error: new Error('Invalid coordinates or rideId') }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Not authenticated') }

  const payload = {
    ride_id: rideId,
    partner_id: user.id,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy_meters: coords.accuracy || null,
    heading: coords.heading || null,
    speed_mps: coords.speed || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('ride_driver_locations')
    .upsert(payload, { onConflict: 'ride_id' })
    .select()
    .maybeSingle()

  return { data, error }
}

/**
 * Start GPS tracking for an active ride.
 * Throttled to ~6-10 seconds to prevent excessive database writes.
 * @param {string} rideId
 * @param {function(object)} onLocationUpdate
 * @param {function(Error)} onError
 */
export async function startDriverLocationTracking(rideId, onLocationUpdate, onError) {
  // If already tracking this ride, do nothing
  if (activeWatchId && activeRideId === rideId) return

  // Stop previous tracking if any
  stopDriverLocationTracking()

  activeRideId = rideId
  lastUpdateTime = 0
  lastPosition = null

  // Check permissions first
  const perm = await checkAndRequestLocationPermission()
  if (!perm.granted) {
    if (onError) onError(new Error(perm.error || 'Location permission denied.'))
    return
  }

  const handlePosition = async (coords) => {
    if (!coords || !activeRideId) return

    const now = Date.now()
    const timeSinceLast = now - lastUpdateTime

    // Check throttle
    if (timeSinceLast < MIN_UPDATE_INTERVAL_MS && lastPosition) {
      return
    }

    lastUpdateTime = now
    lastPosition = coords

    if (onLocationUpdate) {
      onLocationUpdate(coords)
    }

    // Persist to Supabase
    try {
      await updateDriverLocation(activeRideId, coords)
    } catch (err) {
      console.warn('[Location] Failed to send location update to server:', err)
    }
  }

  // Initial immediate fetch
  const initial = await getCurrentLocation()
  if (initial.coords) {
    await handlePosition(initial.coords)
  }

  try {
    if (Capacitor.isNativePlatform()) {
      activeWatchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
        (position, err) => {
          if (err) {
            if (onError) onError(err)
            return
          }
          if (position?.coords) {
            handlePosition({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            })
          }
        }
      )
    } else {
      // Browser watchPosition
      activeWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          handlePosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          })
        },
        (err) => {
          if (onError) onError(err)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      )
    }
  } catch (err) {
    if (onError) onError(err)
  }
}

/**
 * Stop GPS tracking and clean up watchers.
 */
export function stopDriverLocationTracking() {
  if (activeWatchId !== null) {
    try {
      if (Capacitor.isNativePlatform()) {
        Geolocation.clearWatch({ id: activeWatchId })
      } else if (navigator.geolocation) {
        navigator.geolocation.clearWatch(activeWatchId)
      }
    } catch (_) {}
  }
  activeWatchId = null
  activeRideId = null
  lastPosition = null
  lastUpdateTime = 0
}

/**
 * Start periodic general availability location reporting when partner is ONLINE.
 * Only reports to public.partner_locations, never interferes with active ride GPS.
 */
export function startPartnerAvailabilityLocationTracking() {
  if (availabilityTimer) return

  const report = async () => {
    try {
      const loc = await getCurrentLocation()
      if (loc?.coords) {
        await reportPartnerLocation(loc.coords)
      }
    } catch (_e) {}
  }

  // Initial immediate report
  report()

  // Periodic report every 20 seconds
  availabilityTimer = setInterval(report, 20000)
}

/**
 * Stop availability location tracking (e.g. when partner goes offline).
 */
export function stopPartnerAvailabilityLocationTracking() {
  if (availabilityTimer) {
    clearInterval(availabilityTimer)
    availabilityTimer = null
  }
}
