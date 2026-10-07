import { supabase } from '@/lib/supabase'

/**
 * Fetch the active SOS event for a ride (if any)
 */
export async function getActiveRideSos(rideId) {
  if (!rideId) return { safetyEvent: null, error: null }

  try {
    const { data, error } = await supabase.rpc('get_active_ride_sos', {
      p_ride_id: rideId,
    })

    if (error) {
      // Fallback query if RPC fails
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
    console.error('getActiveRideSos error:', err)
    return { safetyEvent: null, error: err }
  }
}

/**
 * Realtime subscription to ride safety events for a specific ride
 */
export function subscribeToRideSafetyEvents(rideId, onEvent) {
  if (!rideId) return () => {}

  const channel = supabase
    .channel(`ride_safety_${rideId}`)
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
 * Trigger an Emergency SOS event for an active ride
 */
export async function triggerRideSos({
  rideId,
  latitude = null,
  longitude = null,
  accuracyMeters = null,
  message = 'Emergency SOS triggered by passenger',
}) {
  if (!rideId) return { error: 'Ride ID is required' }

  try {
    const { data, error } = await supabase.rpc('trigger_ride_sos', {
      p_ride_id: rideId,
      p_latitude: latitude,
      p_longitude: longitude,
      p_accuracy_meters: accuracyMeters,
      p_message: message,
    })

    if (error) throw error
    return { data, error: null }
  } catch (err) {
    console.error('triggerRideSos error:', err)
    return { data: null, error: err?.message || err }
  }
}

/**
 * Resolve an active SOS event
 */
export async function resolveRideSos(safetyEventId, note = 'Resolved by passenger') {
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

/**
 * Emergency Contacts management
 */
export async function getEmergencyContacts() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export async function addEmergencyContact({ name, phone, relationship = '', isPrimary = false }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  if (isPrimary) {
    // Unset current primary
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('user_id', user.id)
  }

  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({
      user_id: user.id,
      name,
      phone,
      relationship,
      is_primary: isPrimary,
    })
    .select()
    .single()

  return { data, error }
}

export async function deleteEmergencyContact(contactId) {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId)

  return { error }
}

