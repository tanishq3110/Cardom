import { supabase } from '@/lib/supabase'

/**
 * Triggers rule-based dispatch for a ride in searching status.
 * Finds closest eligible partner within maxRadiusKm and sends offer.
 * @param {string} rideId
 * @param {number} maxRadiusKm
 * @returns {Promise<{ success: boolean, matched: boolean, data?: object, error?: string }>}
 */
export async function dispatchRide(rideId, maxRadiusKm = 5) {
  if (!rideId) return { success: false, matched: false, error: 'Missing ride ID' }

  try {
    const { data, error } = await supabase.rpc('dispatch_find_and_offer_ride', {
      p_ride_id: rideId,
      p_max_radius_km: maxRadiusKm,
    })

    if (error) {
      return { success: false, matched: false, error: error.message }
    }

    return {
      success: data?.success ?? true,
      matched: !!data?.matched,
      data,
      error: data?.error || null,
    }
  } catch (err) {
    return { success: false, matched: false, error: err.message }
  }
}

/**
 * Cancels active dispatch offers when a user cancels a searching ride.
 * @param {string} rideId
 */
export async function cancelRideDispatch(rideId) {
  if (!rideId) return { success: true }
  try {
    const { data, error } = await supabase.rpc('cancel_ride_dispatch', {
      p_ride_id: rideId,
    })
    if (error) return { success: false, error: error.message }
    return { success: data?.success ?? true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

