/**
 * partnerPaymentApi.js — Partner-side payment operations (Direct UPI & Cash confirmation).
 */

import { supabase } from '@/lib/supabase'

/**
 * Partner confirms payment receipt (Cash received or UPI received).
 * Moves payment_status to 'confirmed'.
 *
 * @param {string} rideId - The ID of the ride booking
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function confirmPartnerPayment(rideId) {
  if (!rideId) return { success: false, error: 'Missing ride ID' }

  // 1. Try secure RPC
  try {
    const { data, error: rpcError } = await supabase.rpc('partner_confirm_payment', {
      p_ride_id: rideId,
    })

    if (!rpcError && data) {
      return { success: true, error: null }
    }
  } catch (rpcErr) {
    console.warn('partner_confirm_payment RPC failed, attempting fallback update:', rpcErr)
  }

  // 2. Direct fallback update
  try {
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('ride_bookings')
      .update({
        payment_status: 'confirmed',
        payment_confirmed_at: now,
        updated_at: now,
      })
      .eq('id', rideId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Try updating public.ride_payments if it exists
    try {
      await supabase
        .from('ride_payments')
        .update({
          status: 'confirmed',
          partner_confirmed_at: now,
          updated_at: now,
        })
        .eq('ride_id', rideId)
    } catch (_) {
      // optional
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message || 'Failed to confirm payment' }
  }
}

/**
 * Reads an image file (e.g. UPI QR screenshot) as a Base64 data URL.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readQrImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'))
    }

    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please upload a valid image file (PNG/JPG).'))
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error('Image size must be less than 5MB.'))
    }

    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

/**
 * Saves partner UPI settings (UPI ID and optional custom QR data URL).
 *
 * @param {Object} params
 * @param {string} params.upiId - Partner VPA
 * @param {string} [params.upiQrUrl] - Optional base64 or hosted QR image URL
 * @returns {Promise<{ error: Error|null }>}
 */
export async function savePartnerUpiSettings({ upiId, upiQrUrl = '' }) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return { error: authErr || new Error('Not authenticated') }
  }

  const { error } = await supabase
    .from('partner_profiles')
    .update({
      upi_id: upiId ? upiId.trim() : null,
      upi_qr_url: upiQrUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  return { error }
}

