import { supabase } from '@/lib/supabase'

/**
 * Fetch current active ride dispatch offer for calling partner.
 * @returns {Promise<{ offer: object|null, error: Error|null }>}
 */
export async function getActiveOffer() {
  try {
    const { data, error } = await supabase.rpc('get_active_partner_offer')
    if (error) return { offer: null, error }
    return { offer: data?.offer || null, error: null }
  } catch (err) {
    return { offer: null, error: err }
  }
}

/**
 * Accept a ride offer via atomic RPC.
 * @param {string} offerId
 * @returns {Promise<{ success: boolean, rideId: string|null, error: string|null }>}
 */
export async function acceptOffer(offerId) {
  if (!offerId) return { success: false, rideId: null, error: 'Missing offer ID' }

  const { data, error } = await supabase.rpc('accept_ride_offer', {
    p_offer_id: offerId,
  })

  if (error) return { success: false, rideId: null, error: error.message }
  if (!data?.success) return { success: false, rideId: null, error: data?.error || 'Failed to accept offer' }

  return { success: true, rideId: data.ride_id, error: null }
}

/**
 * Reject a ride offer via RPC and automatically trigger next partner dispatch.
 * @param {string} offerId
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function rejectOffer(offerId) {
  if (!offerId) return { success: false, error: 'Missing offer ID' }

  const { data, error } = await supabase.rpc('reject_ride_offer', {
    p_offer_id: offerId,
  })

  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error || 'Failed to reject offer' }

  return { success: true, error: null }
}

/**
 * Expire an offer that timed out and trigger next partner dispatch.
 * @param {string} offerId
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function expireOffer(offerId) {
  if (!offerId) return { success: false, error: 'Missing offer ID' }

  const { data, error } = await supabase.rpc('expire_ride_offer', {
    p_offer_id: offerId,
  })

  if (error) return { success: false, error: error.message }
  return { success: data?.success ?? true, error: null }
}

/**
 * Subscribe to realtime ride dispatch offers for the partner.
 */
export function subscribeToPartnerOffers(partnerId, onOffer) {
  if (!partnerId) return () => {}

  const channel = supabase
    .channel(`partner_dispatch_offers_${partnerId}_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ride_dispatch_offers',
        filter: `partner_id=eq.${partnerId}`,
      },
      (payload) => {
        if (typeof onOffer === 'function') {
          onOffer(payload)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

