import { supabase } from '@/lib/supabase'

/**
 * Fetch the latest driver location for a given rideId.
 * RLS enforces that user can only read location for their own ride.
 * @param {string} rideId
 * @returns {Promise<{ data: object|null, error: Error|null }>}
 */
export async function getDriverLocation(rideId) {
  if (!rideId) return { data: null, error: new Error('Missing rideId') }

  const { data, error } = await supabase
    .from('ride_driver_locations')
    .select('*')
    .eq('ride_id', rideId)
    .maybeSingle()

  return { data, error }
}

/**
 * Subscribe to realtime updates for a driver's location for a given ride.
 * Cleans up channel when unsubscribed.
 * @param {string} rideId
 * @param {function(object)} onLocationUpdate
 * @returns {object} Subscription channel with unsubscribe method
 */
export function subscribeToDriverLocation(rideId, onLocationUpdate) {
  if (!rideId) return { unsubscribe: () => {} }

  const channel = supabase
    .channel(`driver_loc_${rideId}_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ride_driver_locations',
        filter: `ride_id=eq.${rideId}`,
      },
      (payload) => {
        if (payload?.new) {
          onLocationUpdate(payload.new)
        }
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
}
