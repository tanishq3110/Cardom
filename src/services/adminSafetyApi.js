import { supabase } from '@/lib/supabase'
import { logAdminAction } from './adminAuditApi'

/**
 * Fetch safety and SOS events with filters
 */
export async function getSafetyEvents({
  page = 1,
  limit = 20,
  status = 'all',
  eventType = 'all',
} = {}) {
  try {
    let query = supabase
      .from('ride_safety_events')
      .select(`
        *,
        ride_bookings (
          booking_reference,
          pickup_address,
          drop_address,
          status,
          ride_type,
          driver_name,
          driver_phone,
          vehicle_number
        ),
        profiles:user_id (
          full_name,
          phone,
          email
        ),
        partner_profiles:partner_id (
          business_name,
          authorized_contact_name,
          phone
        )
      `, { count: 'exact' })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (eventType !== 'all') {
      query = query.eq('event_type', eventType)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminSafetyApi] getSafetyEvents error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch all currently active or acknowledged SOS incidents
 */
export async function getActiveSosIncidents() {
  try {
    const { data, error } = await supabase
      .from('ride_safety_events')
      .select(`
        *,
        ride_bookings (
          booking_reference,
          pickup_address,
          drop_address,
          status,
          ride_type,
          driver_name,
          driver_phone,
          vehicle_number
        ),
        profiles:user_id (
          full_name,
          phone,
          email
        ),
        partner_profiles:partner_id (
          business_name,
          authorized_contact_name,
          phone
        )
      `)
      .in('status', ['active', 'acknowledged'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (err) {
    console.error('[adminSafetyApi] getActiveSosIncidents error:', err)
    return { data: [], error: err }
  }
}

/**
 * Admin acknowledges an SOS incident
 */
export async function acknowledgeSosIncident(eventId, adminNotes = '') {
  try {
    const { data: before } = await supabase.from('ride_safety_events').select('*').eq('id', eventId).single()
    const { data, error } = await supabase
      .from('ride_safety_events')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error

    await logAdminAction('ACKNOWLEDGE_SOS', 'ride_safety_events', eventId, before, data, adminNotes)
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Admin resolves an SOS incident with mandatory resolution notes
 */
export async function resolveSosIncident(eventId, resolutionNotes) {
  if (!resolutionNotes?.trim()) {
    return { success: false, error: 'Resolution notes are required for SOS resolution' }
  }

  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_resolve_sos', {
      p_safety_event_id: eventId,
      p_resolution_notes: resolutionNotes.trim(),
    })

    if (!rpcErr && rpcData?.success) {
      return { success: true, event: rpcData.event }
    }

    // Direct fallback
    const { data: { user } } = await supabase.auth.getUser()
    const { data: before } = await supabase.from('ride_safety_events').select('*').eq('id', eventId).single()

    const { data, error } = await supabase
      .from('ride_safety_events')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id,
        message: `${before?.message || ''} [Resolved by Admin: ${resolutionNotes.trim()}]`,
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error

    await logAdminAction('RESOLVE_SOS', 'ride_safety_events', eventId, before, data, resolutionNotes)
    return { success: true, event: data }
  } catch (err) {
    console.error('[adminSafetyApi] resolveSosIncident error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Realtime subscription to safety events
 */
export function subscribeToSafetyEvents(callback) {
  const channel = supabase
    .channel(`admin_safety_feed_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ride_safety_events',
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
