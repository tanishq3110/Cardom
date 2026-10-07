import { supabase } from '@/lib/supabase'

/**
 * Fetch dispatch offers with filters
 */
export async function getDispatchOffers({
  page = 1,
  limit = 20,
  status = 'all',
  rideId = null,
  partnerId = null,
} = {}) {
  try {
    let query = supabase
      .from('ride_dispatch_offers')
      .select(`
        *,
        ride_bookings (
          booking_reference,
          pickup_address,
          drop_address,
          ride_type,
          status
        ),
        partner_profiles (
          business_name,
          authorized_contact_name,
          phone
        )
      `, { count: 'exact' })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (rideId) {
      query = query.eq('ride_id', rideId)
    }

    if (partnerId) {
      query = query.eq('partner_id', partnerId)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminDispatchApi] getDispatchOffers error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Calculate dispatch efficiency metrics
 */
export async function getDispatchStats() {
  try {
    const { data, error } = await supabase
      .from('ride_dispatch_offers')
      .select('status, distance_to_pickup_km, created_at, responded_at')
      .limit(500)

    if (error) throw error

    const stats = {
      totalOffers: data?.length || 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      offered: 0,
      avgDistanceKm: 0,
      avgResponseSecs: 0,
    }

    let totalDist = 0
    let totalRespTime = 0
    let respCount = 0

    ;(data || []).forEach((o) => {
      if (stats[o.status] !== undefined) stats[o.status]++
      if (o.distance_to_pickup_km) totalDist += Number(o.distance_to_pickup_km)
      if (o.responded_at && o.created_at) {
        const diff = (new Date(o.responded_at) - new Date(o.created_at)) / 1000
        if (diff > 0 && diff < 60) {
          totalRespTime += diff
          respCount++
        }
      }
    })

    if (stats.totalOffers > 0) {
      stats.avgDistanceKm = +(totalDist / stats.totalOffers).toFixed(1)
    }
    if (respCount > 0) {
      stats.avgResponseSecs = +(totalRespTime / respCount).toFixed(1)
    }

    return { data: stats, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}
