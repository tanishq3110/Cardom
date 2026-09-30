/**
 * rideBookingApi.js — Supabase API client for User ride booking
 */

import { supabase } from '@/lib/supabase'

function generateBookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'CARDOM-RIDE-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createRideBooking({
  pickupAddress,
  dropAddress,
  rideType = 'comfort',
  estimatedFare,
  estimatedDistanceKm = 10,
  paymentMethod = 'upi',
}) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: authError || new Error('Please sign in to book a ride.') }
  }

  const bookingReference = generateBookingReference()

  const { data, error } = await supabase
    .from('ride_bookings')
    .insert({
      user_id: user.id,
      booking_reference: bookingReference,
      pickup_address: pickupAddress,
      drop_address: dropAddress,
      ride_type: rideType,
      estimated_fare: estimatedFare,
      estimated_distance_km: estimatedDistanceKm,
      status: 'searching',
      payment_method: paymentMethod,
      payment_status: 'pending',
    })
    .select()
    .single()

  return { data, error }
}

export async function getMyRideBookings() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: [], error: authError }

  const { data, error } = await supabase
    .from('ride_bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export async function getRideBookingById(id) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: authError }

  const { data, error } = await supabase
    .from('ride_bookings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  return { data, error }
}

export async function cancelRideBooking(id) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: authError }

  // Verify status is searching before cancelling
  const { data: existing, error: fetchErr } = await supabase
    .from('ride_bookings')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !existing) {
    return { data: null, error: fetchErr || new Error('Ride not found.') }
  }

  if (existing.status !== 'searching') {
    return { data: null, error: new Error('Ride can only be cancelled while searching for a driver.') }
  }

  const { data, error } = await supabase
    .from('ride_bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error }
}

/**
 * Realtime subscription for a specific ride booking
 * Listens for UPDATE events on public.ride_bookings where id = rideId.
 * Returns unsubscribe function.
 */
export function subscribeToRideBooking(rideId, onUpdate, onStatusChange) {
  if (!rideId) return () => {}

  const channelName = `ride_booking_${rideId}_${Date.now()}`
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ride_bookings',
        filter: `id=eq.${rideId}`,
      },
      (payload) => {
        if (payload?.new) {
          onUpdate(payload.new)
        }
      }
    )
    .subscribe((status) => {
      if (onStatusChange) {
        onStatusChange(status)
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
