/**
 * partnerRideApi.js — Partner-side ride booking operations.
 * All operations use Supabase RPCs (security definer) or RLS-enforced queries.
 * No service-role key. No direct unfiltered access to ride_bookings.
 */

import { supabase } from '@/lib/supabase'

// ── Helpers ───────────────────────────────────────────────────

export async function getCurrentPartnerId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// ── API Functions ─────────────────────────────────────────────

/**
 * Get available rides in 'searching' status for partners to accept.
 * Uses a security definer RPC — returns only safe fields, no user PII.
 * @returns {Promise<{ data: object[], error: Error|null }>}
 */
export async function getAvailableRides() {
  const { data, error } = await supabase.rpc('get_available_rides')
  return { data: data || [], error }
}

/**
 * Get all rides assigned to the current partner (excluding rejected).
 * @returns {Promise<{ data: object[], error: Error|null }>}
 */
export async function getPartnerRides() {
  const partnerId = await getCurrentPartnerId()
  if (!partnerId) return { data: [], error: new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('ride_assignments')
    .select(`
      *,
      ride_bookings (
        id,
        booking_reference,
        pickup_address,
        drop_address,
        ride_type,
        estimated_fare,
        estimated_distance_km,
        estimated_duration_minutes,
        status,
        driver_name,
        driver_phone,
        vehicle_name,
        payment_method,
        payment_status,
        created_at,
        updated_at
      )
    `)
    .eq('partner_id', partnerId)
    .neq('partner_status', 'rejected')
    .order('assigned_at', { ascending: false })

  return { data: data || [], error }
}

/**
 * Get a single ride assignment + ride details by ride_id.
 * Partner must have an assignment for this ride.
 * @param {string} rideId
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function getRideById(rideId) {
  const partnerId = await getCurrentPartnerId()
  if (!partnerId) return { data: null, error: new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('ride_assignments')
    .select(`
      *,
      ride_bookings (*)
    `)
    .eq('ride_id', rideId)
    .eq('partner_id', partnerId)
    .maybeSingle()

  return { data, error }
}

/**
 * Request a ride — creates an assignment record via secure RPC.
 * Partners cannot directly INSERT into ride_assignments.
 * @param {string} rideId
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function requestRide(rideId) {
  const { data, error } = await supabase.rpc('assign_ride_to_partner', {
    p_ride_id: rideId,
  })
  if (error) return { data: null, error: error.message }
  if (!data?.success) return { data: null, error: data?.error || 'Failed to request ride' }
  return { data, error: null }
}

/**
 * Accept a ride — atomic operation via security definer RPC.
 * Uses FOR UPDATE lock to prevent double-accept race condition.
 * @param {string} rideId
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function acceptRide(rideId) {
  const { data, error } = await supabase.rpc('accept_ride', {
    p_ride_id: rideId,
  })
  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error || 'Could not accept ride' }
  return { success: true, error: null }
}

/**
 * Start a ride (driver_assigned → started).
 * @param {string} rideId
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function startRide(rideId) {
  const { data, error } = await supabase.rpc('update_ride_status', {
    p_ride_id: rideId,
    p_new_status: 'started',
  })
  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error || 'Could not start ride' }
  return { success: true, error: null }
}

/**
 * Complete a ride (started → completed).
 * @param {string} rideId
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function completeRide(rideId) {
  const { data, error } = await supabase.rpc('update_ride_status', {
    p_ride_id: rideId,
    p_new_status: 'completed',
  })
  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error || 'Could not complete ride' }
  return { success: true, error: null }
}

/**
 * Reject a ride — marks the partner's assignment as rejected.
 * Does NOT change the user's ride_bookings.status (stays 'searching').
 * @param {string} rideId
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function rejectRide(rideId) {
  const { data, error } = await supabase.rpc('reject_ride', {
    p_ride_id: rideId,
  })
  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error || 'Could not reject ride' }
  return { success: true, error: null }
}

/**
 * Cancel a ride from the partner side (accepted → cancelled).
 * @param {string} rideId
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function cancelRide(rideId) {
  const partnerId = await getCurrentPartnerId()
  if (!partnerId) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('ride_assignments')
    .update({ partner_status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('partner_id', partnerId)
    .eq('partner_status', 'accepted')
    .filter('ride_id', 'eq', rideId)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

/**
 * Realtime subscription for a partner's assigned rides
 * Listens for changes to ride_assignments for the given partnerId
 */
export function subscribeToPartnerAssignments(partnerId, onEvent) {
  if (!partnerId) return () => {}

  const channel = supabase
    .channel(`partner_assignments_${partnerId}_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ride_assignments',
        filter: `partner_id=eq.${partnerId}`,
      },
      (payload) => {
        onEvent(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Realtime subscription for a single active ride (booking updates)
 */
export function subscribeToRideDetails(rideId, onUpdate) {
  if (!rideId) return () => {}

  const channel = supabase
    .channel(`partner_ride_${rideId}_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ride_bookings',
        filter: `id=eq.${rideId}`,
      },
      (payload) => {
        if (payload?.new) {
          onUpdate(payload.new)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
