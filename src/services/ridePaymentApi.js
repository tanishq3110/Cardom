import { supabase } from '@/lib/supabase'

/**
 * Fetch assigned partner's payment details (UPI ID, custom QR, name) for a ride.
 * @param {string} rideId
 * @returns {Promise<{ data: { upi_id: string, upi_qr_url: string, partner_name: string } | null, error: any }>}
 */
export async function getRidePartnerPaymentInfo(rideId) {
  if (!rideId) return { data: null, error: 'Invalid ride ID' }

  // 1. Try secure RPC first
  try {
    const { data, error } = await supabase.rpc('get_ride_partner_payment_info', {
      p_ride_id: rideId,
    })

    if (!error && data) {
      return { data, error: null }
    }
  } catch (rpcErr) {
    console.warn('get_ride_partner_payment_info RPC failed, attempting fallback query:', rpcErr)
  }

  // 2. Fallback: Query ride assignment and partner profile
  try {
    const { data: assignment, error: assignErr } = await supabase
      .from('ride_assignments')
      .select('partner_id, partner_profiles(business_name, authorized_contact_name, upi_id, upi_qr_url)')
      .eq('ride_id', rideId)
      .maybeSingle()

    if (assignErr || !assignment) {
      return { data: null, error: assignErr || 'No assigned partner found' }
    }

    const profile = assignment.partner_profiles
    return {
      data: {
        upi_id: profile?.upi_id || '',
        upi_qr_url: profile?.upi_qr_url || '',
        partner_name: profile?.authorized_contact_name || profile?.business_name || 'Cardom Driver',
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: err.message || 'Error fetching partner payment info' }
  }
}

/**
 * Customer marks payment as paid (Cash or UPI).
 * @param {string} rideId
 * @param {string} paymentMethod - 'cash' | 'upi'
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function markPaymentAsPaid(rideId, paymentMethod = 'upi') {
  if (!rideId) return { data: null, error: 'Invalid ride ID' }

  const method = paymentMethod.toLowerCase() === 'cash' ? 'cash' : 'upi'

  // 1. Try RPC customer_mark_payment_paid
  try {
    const { data, error } = await supabase.rpc('customer_mark_payment_paid', {
      p_ride_id: rideId,
      p_payment_method: method,
    })

    if (!error && data) {
      return { data, error: null }
    }
  } catch (rpcErr) {
    console.warn('customer_mark_payment_paid RPC failed, attempting fallback update:', rpcErr)
  }

  // 2. Direct fallback update
  try {
    const { data: booking, error: fetchErr } = await supabase
      .from('ride_bookings')
      .select('estimated_fare, final_fare')
      .eq('id', rideId)
      .single()

    if (fetchErr) return { data: null, error: fetchErr.message }

    const finalAmount = booking.final_fare || booking.estimated_fare || 0

    const { data, error } = await supabase
      .from('ride_bookings')
      .update({
        payment_status: 'customer_marked_paid',
        payment_method: method,
        final_fare: finalAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rideId)
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    // Optionally update public.ride_payments if table exists
    try {
      await supabase.from('ride_payments').upsert({
        ride_id: rideId,
        payment_method: method,
        amount: finalAmount,
        status: 'customer_marked_paid',
        customer_marked_paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'ride_id' })
    } catch (_) {
      // Table might not exist or optional
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Failed to update payment status' }
  }
}

/**
 * Fetches complete ride details for the receipt page.
 * @param {string} rideId
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function getRideReceipt(rideId) {
  if (!rideId) return { data: null, error: 'Invalid ride ID' }

  try {
    const { data, error } = await supabase
      .from('ride_bookings')
      .select(`
        *,
        ride_assignments (
          partner_id,
          driver_notes,
          partner_profiles (
            business_name,
            authorized_contact_name,
            phone,
            upi_id
          )
        )
      `)
      .eq('id', rideId)
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load receipt' }
  }
}

