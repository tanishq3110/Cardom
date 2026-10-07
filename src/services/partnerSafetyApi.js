import { supabase } from '@/lib/supabase'

/**
 * Fetch active SOS for a ride on the partner side
 */
export async function getPartnerActiveRideSos(rideId) {
  if (!rideId) return { safetyEvent: null, error: null }

  try {
    const { data, error } = await supabase.rpc('get_active_ride_sos', {
      p_ride_id: rideId,
    })

    if (error) {
      const { data: directData, error: directErr } = await supabase
        .from('ride_safety_events')
        .select('*')
        .eq('ride_id', rideId)
        .in('status', ['active', 'acknowledged'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return { safetyEvent: directData || null, error: directErr }
    }

    return { safetyEvent: data?.safety_event || null, error: null }
  } catch (err) {
    console.error('getPartnerActiveRideSos error:', err)
    return { safetyEvent: null, error: err }
  }
}

/**
 * Realtime subscription to ride safety events for a specific ride
 */
export function subscribeToPartnerRideSafetyEvents(rideId, onEvent) {
  if (!rideId) return () => {}

  const channel = supabase
    .channel(`partner_ride_safety_${rideId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ride_safety_events',
        filter: `ride_id=eq.${rideId}`,
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
 * Acknowledge an active passenger SOS
 */
export async function acknowledgeRideSos(safetyEventId) {
  if (!safetyEventId) return { error: 'Safety event ID is required' }

  try {
    const { data, error } = await supabase.rpc('acknowledge_ride_sos', {
      p_safety_event_id: safetyEventId,
    })

    if (error) throw error
    return { data, error: null }
  } catch (err) {
    console.error('acknowledgeRideSos error:', err)
    return { data: null, error: err?.message || err }
  }
}

/**
 * Resolve an active passenger SOS
 */
export async function resolveRideSos(safetyEventId, note = 'Resolved by partner') {
  if (!safetyEventId) return { error: 'Safety event ID is required' }

  try {
    const { data, error } = await supabase.rpc('resolve_ride_sos', {
      p_safety_event_id: safetyEventId,
      p_resolution_note: note,
    })

    if (error) throw error
    return { data, error: null }
  } catch (err) {
    console.error('resolveRideSos error:', err)
    return { data: null, error: err?.message || err }
  }
}

