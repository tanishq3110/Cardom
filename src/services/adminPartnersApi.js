import { supabase } from '@/lib/supabase'
import { logAdminAction } from './adminAuditApi'

/**
 * Fetch paginated list of partners with filtering
 */
export async function getPartners({
  page = 1,
  limit = 15,
  search = '',
  status = 'all',
  category = 'all',
  isVerified = 'all',
  isOnline = 'all',
  sortBy = 'created_at',
  ascending = false,
} = {}) {
  try {
    let query = supabase
      .from('partner_profiles')
      .select('*', { count: 'exact' })

    if (search?.trim()) {
      const s = search.trim()
      query = query.or(`business_name.ilike.%${s}%,authorized_contact_name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,city.ilike.%${s}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (category !== 'all') {
      query = query.eq('partner_category', category)
    }

    if (isVerified !== 'all') {
      query = query.eq('is_verified', isVerified === 'true' || isVerified === true)
    }

    if (isOnline !== 'all') {
      query = query.eq('is_online', isOnline === 'true' || isOnline === true)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order(sortBy, { ascending }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminPartnersApi] getPartners error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch detailed partner record and metrics
 */
export async function getPartnerDetails(partnerId) {
  if (!partnerId) return { data: null, error: new Error('Partner ID required') }

  try {
    const [profileRes, locationRes, assignmentsRes, ratingsRes, safetyRes] = await Promise.all([
      supabase.from('partner_profiles').select('*').eq('id', partnerId).maybeSingle(),
      supabase.from('partner_locations').select('*').eq('partner_id', partnerId).maybeSingle(),
      supabase.from('ride_assignments').select(`
        *,
        ride_bookings (*)
      `).eq('partner_id', partnerId).order('assigned_at', { ascending: false }).limit(30),
      supabase.from('ride_ratings').select('*').eq('partner_id', partnerId),
      supabase.from('ride_safety_events').select('*').eq('partner_id', partnerId),
    ])

    const profile = profileRes.data || { id: partnerId, business_name: 'Partner Not Found' }
    const location = locationRes.data || null
    const assignments = assignmentsRes.data || []
    const ratings = ratingsRes.data || []
    const safetyEvents = safetyRes.data || []

    const completedRides = assignments.filter((a) => a.partner_status === 'completed').length
    const rejectedRides = assignments.filter((a) => a.partner_status === 'rejected').length
    const acceptedRides = assignments.filter((a) => a.partner_status === 'accepted' || a.partner_status === 'started' || a.partner_status === 'completed').length

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 'N/A'

    return {
      data: {
        profile,
        location,
        stats: {
          totalAssigned: assignments.length,
          completedRides,
          rejectedRides,
          acceptedRides,
          avgRating,
          reviewCount: ratings.length,
          safetyIncidents: safetyEvents.length,
        },
        assignments,
        ratings,
        safetyEvents,
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminPartnersApi] getPartnerDetails error:', err)
    return { data: null, error: err }
  }
}

/**
 * Update partner status and verification flag
 */
export async function updatePartnerStatus(partnerId, status, isVerified = null, reason = '') {
  try {
    // Try RPC first for transactional update + audit log
    const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_update_partner_status', {
      p_partner_id: partnerId,
      p_status: status,
      p_is_verified: isVerified,
      p_reason: reason || `Admin updated status to ${status}`,
    })

    if (!rpcErr && rpcData?.success) {
      return { success: true, partner: rpcData.partner }
    }

    // Direct fallback
    const { data: before } = await supabase.from('partner_profiles').select('*').eq('id', partnerId).single()
    const updatePayload = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (isVerified !== null) {
      updatePayload.is_verified = isVerified
    }

    const { data, error } = await supabase
      .from('partner_profiles')
      .update(updatePayload)
      .eq('id', partnerId)
      .select()
      .single()

    if (error) throw error

    await logAdminAction('UPDATE_PARTNER_STATUS', 'partner_profiles', partnerId, before, data, reason)
    return { success: true, partner: data }
  } catch (err) {
    console.error('[adminPartnersApi] updatePartnerStatus error:', err)
    return { success: false, error: err.message }
  }
}
