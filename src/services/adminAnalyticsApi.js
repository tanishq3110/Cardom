import { supabase } from '@/lib/supabase'

/**
 * Fetch ecosystem analytics across all modules
 */
export async function getAnalyticsData() {
  try {
    const [
      ridesRes,
      partnersRes,
      leadsCountRes,
      ratingsRes,
      safetyRes,
    ] = await Promise.all([
      supabase.from('ride_bookings').select('id, status, ride_type, final_fare, estimated_fare, created_at').order('created_at', { ascending: false }).limit(500),
      supabase.from('partner_profiles').select('id, status, is_verified, is_online, partner_category, created_at'),
      Promise.all([
        supabase.from('insurance_leads').select('created_at'),
        supabase.from('finance_leads').select('created_at'),
        supabase.from('service_requests').select('created_at'),
        supabase.from('inquiries').select('created_at'),
      ]),
      supabase.from('ride_ratings').select('rating, created_at'),
      supabase.from('ride_safety_events').select('status, created_at'),
    ])

    const rides = ridesRes.data || []
    const partners = partnersRes.data || []
    const [ins, fin, srv, inq] = leadsCountRes
    const ratings = ratingsRes.data || []
    const safety = safetyRes.data || []

    // 1. Ride Metrics
    const completedRides = rides.filter((r) => r.status === 'completed')
    const cancelledRides = rides.filter((r) => r.status === 'cancelled')
    const totalRevenue = completedRides.reduce((sum, r) => sum + Number(r.final_fare || r.estimated_fare || 0), 0)
    const completionRate = rides.length > 0 ? +((completedRides.length / rides.length) * 100).toFixed(1) : 0
    const cancellationRate = rides.length > 0 ? +((cancelledRides.length / rides.length) * 100).toFixed(1) : 0

    // 2. Rides by Type
    const ridesByType = { economy: 0, comfort: 0, xl: 0 }
    rides.forEach((r) => {
      if (ridesByType[r.ride_type] !== undefined) ridesByType[r.ride_type]++
    })

    // 3. Partner Categories
    const partnerCategories = {}
    partners.forEach((p) => {
      const cat = p.partner_category || 'other'
      partnerCategories[cat] = (partnerCategories[cat] || 0) + 1
    })

    // 4. Daily Ride Series (last 7 days)
    const daysMap = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      daysMap[key] = { date: key, completed: 0, cancelled: 0, other: 0, revenue: 0 }
    }

    rides.forEach((r) => {
      if (!r.created_at) return
      const day = r.created_at.split('T')[0]
      if (daysMap[day]) {
        if (r.status === 'completed') {
          daysMap[day].completed++
          daysMap[day].revenue += Number(r.final_fare || r.estimated_fare || 0)
        } else if (r.status === 'cancelled') {
          daysMap[day].cancelled++
        } else {
          daysMap[day].other++
        }
      }
    })

    const dailyTrends = Object.values(daysMap)

    return {
      data: {
        rides: {
          total: rides.length,
          completed: completedRides.length,
          cancelled: cancelledRides.length,
          completionRate,
          cancellationRate,
          totalRevenue,
          ridesByType,
          dailyTrends,
        },
        partners: {
          total: partners.length,
          verified: partners.filter((p) => p.is_verified).length,
          online: partners.filter((p) => p.is_online).length,
          categories: partnerCategories,
        },
        leads: {
          insurance: ins.data?.length || 0,
          finance: fin.data?.length || 0,
          services: srv.data?.length || 0,
          inquiries: inq.data?.length || 0,
          total: (ins.data?.length || 0) + (fin.data?.length || 0) + (srv.data?.length || 0) + (inq.data?.length || 0),
        },
        ratings: {
          total: ratings.length,
          avg: ratings.length > 0 ? +(ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : 0,
        },
        safety: {
          totalIncidents: safety.length,
          resolved: safety.filter((s) => s.status === 'resolved').length,
          active: safety.filter((s) => s.status === 'active' || s.status === 'acknowledged').length,
        },
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminAnalyticsApi] getAnalyticsData error:', err)
    return { data: null, error: err }
  }
}
