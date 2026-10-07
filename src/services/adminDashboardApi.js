import { supabase } from '@/lib/supabase'

/**
 * Fetch top ecosystem overview stats
 */
export async function getDashboardOverview() {
  try {
    // Try RPC first for fast server aggregation
    const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_get_ecosystem_stats')
    if (!rpcErr && rpcData && !rpcData.error) {
      return { data: rpcData, error: null }
    }

    // Direct querying fallback
    const [
      usersRes,
      partnersRes,
      onlinePartnersRes,
      pendingPartnersRes,
      carsRes,
      activeRidesRes,
      todayRidesRes,
      completedRidesRes,
      cancelledRidesRes,
      sosRes,
      insLeadsRes,
      finLeadsRes,
      srvLeadsRes,
      inqRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('partner_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('partner_profiles').select('*', { count: 'exact', head: true }).eq('is_online', true),
      supabase.from('partner_profiles').select('*', { count: 'exact', head: true }).or('status.eq.pending,is_verified.eq.false'),
      supabase.from('cars').select('*', { count: 'exact', head: true }),
      supabase.from('ride_bookings').select('*', { count: 'exact', head: true }).in('status', ['searching', 'driver_assigned', 'arriving', 'started']),
      supabase.from('ride_bookings').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from('ride_bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('ride_bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      supabase.from('ride_safety_events').select('*', { count: 'exact', head: true }).in('status', ['active', 'acknowledged']),
      supabase.from('insurance_leads').select('*', { count: 'exact', head: true }),
      supabase.from('finance_leads').select('*', { count: 'exact', head: true }),
      supabase.from('service_requests').select('*', { count: 'exact', head: true }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    ])

    // Calculate revenue from completed rides
    const { data: revData } = await supabase
      .from('ride_bookings')
      .select('final_fare, estimated_fare')
      .eq('status', 'completed')

    const totalRevenue = (revData || []).reduce((sum, r) => sum + Number(r.final_fare || r.estimated_fare || 0), 0)
    const totalLeads = (insLeadsRes.count || 0) + (finLeadsRes.count || 0) + (srvLeadsRes.count || 0) + (inqRes.count || 0)

    return {
      data: {
        total_users: usersRes.count || 0,
        total_partners: partnersRes.count || 0,
        online_partners: onlinePartnersRes.count || 0,
        pending_partners: pendingPartnersRes.count || 0,
        total_cars: carsRes.count || 0,
        active_rides: activeRidesRes.count || 0,
        today_rides: todayRidesRes.count || 0,
        completed_rides: completedRidesRes.count || 0,
        cancelled_rides: cancelledRidesRes.count || 0,
        active_sos: sosRes.count || 0,
        total_leads: totalLeads,
        total_revenue: totalRevenue,
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminDashboardApi] getDashboardOverview error:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetch rides status distribution
 */
export async function getRideStatusDistribution() {
  const { data, error } = await supabase
    .from('ride_bookings')
    .select('status')

  if (error) return { data: {}, error }

  const distribution = {
    searching: 0,
    driver_assigned: 0,
    arriving: 0,
    started: 0,
    completed: 0,
    cancelled: 0,
  }

  ;(data || []).forEach((r) => {
    if (distribution[r.status] !== undefined) {
      distribution[r.status]++
    }
  })

  return { data: distribution, error: null }
}

/**
 * Fetch lead counts by category
 */
export async function getLeadsDistribution() {
  const [ins, fin, srv, inq] = await Promise.all([
    supabase.from('insurance_leads').select('*', { count: 'exact', head: true }),
    supabase.from('finance_leads').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
  ])

  return {
    data: {
      insurance: ins.count || 0,
      finance: fin.count || 0,
      service: srv.count || 0,
      inquiries: inq.count || 0,
    },
    error: null,
  }
}

/**
 * Fetch recent rides (last 10)
 */
export async function getRecentRides(limit = 8) {
  const { data, error } = await supabase
    .from('ride_bookings')
    .select(`
      id,
      booking_reference,
      pickup_address,
      drop_address,
      ride_type,
      status,
      estimated_fare,
      final_fare,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}
