import { supabase } from '@/lib/supabase'

/**
 * Submit a ride rating using secure RPC.
 */
export async function submitRideRating({ rideId, rating, review = '' }) {
  if (!rideId || !rating) return { data: null, error: 'Missing required fields' }

  // Try RPC first
  try {
    const { data, error } = await supabase.rpc('submit_ride_rating', {
      p_ride_id: rideId,
      p_rating: rating,
      p_review: review || null,
    })
    if (!error) return { data, error: null }
  } catch (_) {}

  // Fallback: direct insert (RLS will validate)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  // Get partner from assignment
  const { data: assignment } = await supabase
    .from('ride_assignments')
    .select('partner_id')
    .eq('ride_id', rideId)
    .neq('partner_status', 'rejected')
    .maybeSingle()

  if (!assignment?.partner_id) return { data: null, error: 'No assigned partner found' }

  const { data, error } = await supabase
    .from('ride_ratings')
    .upsert({
      ride_id: rideId,
      user_id: user.id,
      partner_id: assignment.partner_id,
      rating,
      review: review || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'ride_id,user_id' })
    .select()
    .single()

  return { data, error: error?.message || error }
}

/**
 * Get existing rating for a specific ride (current user).
 */
export async function getRideRating(rideId) {
  if (!rideId) return { data: null, error: null }

  const { data, error } = await supabase
    .from('ride_ratings')
    .select('*')
    .eq('ride_id', rideId)
    .maybeSingle()

  return { data, error }
}

/**
 * Get partner's rating stats (average + count).
 * Called from partner-side.
 */
export async function getPartnerRatingStats() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { average: 0, count: 0 }

  const { data, error } = await supabase
    .from('ride_ratings')
    .select('rating')
    .eq('partner_id', user.id)

  if (error || !data?.length) return { average: 0, count: 0 }

  const sum = data.reduce((acc, r) => acc + r.rating, 0)
  const average = +(sum / data.length).toFixed(1)
  return { average, count: data.length }
}

/**
 * Get recent ratings for a partner (last 10).
 */
export async function getPartnerRecentRatings(limit = 10) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('ride_ratings')
    .select('rating, review, created_at')
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}
