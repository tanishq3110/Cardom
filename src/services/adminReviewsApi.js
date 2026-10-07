import { supabase } from '@/lib/supabase'

/**
 * Fetch reviews and ratings with passenger & partner details
 */
export async function getReviews({
  page = 1,
  limit = 20,
  rating = 'all',
  partnerId = null,
} = {}) {
  try {
    let query = supabase
      .from('ride_ratings')
      .select(`
        *,
        ride_bookings (
          booking_reference,
          pickup_address,
          drop_address,
          ride_type
        ),
        profiles:user_id (
          full_name,
          email,
          avatar_url
        ),
        partner_profiles:partner_id (
          business_name,
          authorized_contact_name,
          phone
        )
      `, { count: 'exact' })

    if (rating !== 'all') {
      query = query.eq('rating', parseInt(rating, 10))
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
    console.error('[adminReviewsApi] getReviews error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch overall rating metrics
 */
export async function getReviewsSummary() {
  try {
    const { data, error } = await supabase
      .from('ride_ratings')
      .select('rating')

    if (error) throw error

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalScore = 0

    ;(data || []).forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++
      }
      totalScore += r.rating
    })

    const count = data?.length || 0
    const average = count > 0 ? +(totalScore / count).toFixed(1) : 0

    return {
      data: {
        totalReviews: count,
        averageRating: average,
        distribution,
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: err }
  }
}
