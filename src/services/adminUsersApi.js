import { supabase } from '@/lib/supabase'
import { logAdminAction } from './adminAuditApi'

/**
 * Fetch paginated list of users with stats
 */
export async function getUsers({ page = 1, limit = 15, search = '', sortBy = 'created_at', ascending = false } = {}) {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    if (search?.trim()) {
      const s = search.trim()
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order(sortBy, { ascending }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminUsersApi] getUsers error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch detailed user record and aggregated relations
 */
export async function getUserDetails(userId) {
  if (!userId) return { data: null, error: new Error('User ID required') }

  try {
    const [profileRes, ridesRes, leadsRes, safetyRes, ratingsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('ride_bookings').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      Promise.all([
        supabase.from('insurance_leads').select('*').eq('user_id', userId),
        supabase.from('finance_leads').select('*').eq('user_id', userId),
        supabase.from('service_requests').select('*').eq('user_id', userId),
        supabase.from('inquiries').select('*').eq('buyer_id', userId),
      ]),
      supabase.from('ride_safety_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('ride_ratings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ])

    const [insLeads, finLeads, srvRequests, inquiries] = leadsRes

    const profile = profileRes.data || { id: userId, email: 'User Not Found' }
    const rides = ridesRes.data || []
    const safetyEvents = safetyRes.data || []
    const ratings = ratingsRes.data || []

    const completedRides = rides.filter((r) => r.status === 'completed').length
    const cancelledRides = rides.filter((r) => r.status === 'cancelled').length

    return {
      data: {
        profile,
        stats: {
          totalRides: rides.length,
          completedRides,
          cancelledRides,
          totalRatings: ratings.length,
          safetyIncidents: safetyEvents.length,
        },
        rides,
        leads: {
          insurance: insLeads.data || [],
          finance: finLeads.data || [],
          services: srvRequests.data || [],
          inquiries: inquiries.data || [],
        },
        safetyEvents,
        ratings,
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminUsersApi] getUserDetails error:', err)
    return { data: null, error: err }
  }
}

/**
 * Update user profile or notes
 */
export async function updateUserAdminNote(userId, notes, reason = 'Admin updated user notes') {
  try {
    const { data: before } = await supabase.from('profiles').select('*').eq('id', userId).single()
    const { data, error } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    await logAdminAction('UPDATE_USER_NOTE', 'profiles', userId, before, data, reason)
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
