import { supabase } from '@/lib/supabase'

/**
 * Fetch payments records with ride context
 */
export async function getPayments({
  page = 1,
  limit = 20,
  status = 'all',
  method = 'all',
} = {}) {
  try {
    let query = supabase
      .from('ride_payments')
      .select(`
        *,
        ride_bookings (
          booking_reference,
          user_id,
          pickup_address,
          drop_address,
          ride_type,
          estimated_fare,
          final_fare,
          payment_status
        )
      `, { count: 'exact' })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (method !== 'all') {
      query = query.eq('payment_method', method)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminPaymentsApi] getPayments error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch summary payment stats
 */
export async function getPaymentStats() {
  try {
    const { data, error } = await supabase
      .from('ride_payments')
      .select('amount, status, payment_method')

    if (error) throw error

    const stats = {
      totalVolume: 0,
      confirmedVolume: 0,
      confirmedCount: 0,
      pendingCount: 0,
      cashCount: 0,
      upiCount: 0,
    }

    ;(data || []).forEach((p) => {
      const amt = Number(p.amount) || 0
      stats.totalVolume += amt
      if (p.status === 'confirmed') {
        stats.confirmedVolume += amt
        stats.confirmedCount++
      } else if (p.status === 'pending' || p.status === 'customer_marked_paid') {
        stats.pendingCount++
      }
      if (p.payment_method === 'cash') stats.cashCount++
      if (p.payment_method === 'upi') stats.upiCount++
    })

    return { data: stats, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}
