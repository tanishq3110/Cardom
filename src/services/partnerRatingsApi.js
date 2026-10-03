import { supabase } from '@/lib/supabase'

/**
 * Get partner's rating stats (average + count).
 */
export async function getPartnerRatingStats() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { average: 0, count: 0 }

  const { data, error } = await supabase
    .from('ride_ratings')
    .select('rating')
    .eq('partner_id', user.id)

  if (error || !data?.length) return { average: 0, count: 0 }

  const sum = data.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
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
    .select('id, rating, review, created_at, ride_id')
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}
