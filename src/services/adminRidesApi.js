import { supabase } from '@/lib/supabase'

/**
 * Fetch paginated list of ride bookings
 */
export async function getRides({
  page = 1,
  limit = 15,
  search = '',
  status = 'all',
  rideType = 'all',
  paymentStatus = 'all',
  sortBy = 'created_at',
  ascending = false,
} = {}) {
  try {
    let query = supabase
      .from('ride_bookings')
      .select('*', { count: 'exact' })

    if (search?.trim()) {
      const s = search.trim()
      query = query.or(`booking_reference.ilike.%${s}%,pickup_address.ilike.%${s}%,drop_address.ilike.%${s}%,driver_name.ilike.%${s}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (rideType !== 'all') {
      query = query.eq('ride_type', rideType)
    }

    if (paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order(sortBy, { ascending }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminRidesApi] getRides error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch complete 360-degree ride details
 */
export async function getRideDetails(rideId) {
  if (!rideId) return { data: null, error: new Error('Ride ID required') }

  try {
    const [
      bookingRes,
      assignmentRes,
      driverLocRes,
      offersRes,
      safetyRes,
      paymentRes,
      ratingRes,
    ] = await Promise.all([
      supabase.from('ride_bookings').select('*').eq('id', rideId).maybeSingle(),
      supabase.from('ride_assignments').select('*, partner_profiles(*)').eq('ride_id', rideId).maybeSingle(),
      supabase.from('ride_driver_locations').select('*').eq('ride_id', rideId).maybeSingle(),
      supabase.from('ride_dispatch_offers').select('*, partner_profiles(business_name, authorized_contact_name, phone)').eq('ride_id', rideId).order('created_at', { ascending: true }),
      supabase.from('ride_safety_events').select('*').eq('ride_id', rideId).order('created_at', { ascending: false }),
      supabase.from('ride_payments').select('*').eq('ride_id', rideId).maybeSingle(),
      supabase.from('ride_ratings').select('*').eq('ride_id', rideId).maybeSingle(),
    ])

    const booking = bookingRes.data
    if (!booking) throw new Error('Ride booking not found')

    // Fetch passenger profile
    let passenger = null
    if (booking.user_id) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', booking.user_id).maybeSingle()
      passenger = p
    }

    return {
      data: {
        booking,
        passenger,
        assignment: assignmentRes.data || null,
        driverLocation: driverLocRes.data || null,
        offers: offersRes.data || [],
        safetyEvents: safetyRes.data || [],
        payment: paymentRes.data || null,
        rating: ratingRes.data || null,
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminRidesApi] getRideDetails error:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetch all currently active live rides with driver locations
 */
export async function getLiveRides() {
  try {
    const { data: activeRides, error } = await supabase
      .from('ride_bookings')
      .select('*')
      .in('status', ['searching', 'driver_assigned', 'arriving', 'started'])
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!activeRides || activeRides.length === 0) return { data: [], error: null }

    const rideIds = activeRides.map((r) => r.id)

    // Fetch locations and safety events for active rides in parallel
    const [locationsRes, safetyRes] = await Promise.all([
      supabase.from('ride_driver_locations').select('*').in('ride_id', rideIds),
      supabase.from('ride_safety_events').select('*').in('ride_id', rideIds).in('status', ['active', 'acknowledged']),
    ])

    const locationMap = new Map()
    ;(locationsRes.data || []).forEach((loc) => {
      locationMap.set(loc.ride_id, loc)
    })

    const safetyMap = new Map()
    ;(safetyRes.data || []).forEach((sos) => {
      safetyMap.set(sos.ride_id, sos)
    })

    const enriched = activeRides.map((ride) => ({
      ...ride,
      driverLocation: locationMap.get(ride.id) || null,
      activeSos: safetyMap.get(ride.id) || null,
    }))

    return { data: enriched, error: null }
  } catch (err) {
    console.error('[adminRidesApi] getLiveRides error:', err)
    return { data: [], error: err }
  }
}

/**
 * Realtime subscription for ride booking changes
 */
export function subscribeToAllRides(callback) {
  const channel = supabase
    .channel(`admin_rides_feed_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ride_bookings',
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
