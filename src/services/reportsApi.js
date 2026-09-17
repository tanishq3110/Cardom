import { supabase } from '@/lib/supabase'

export const REPORT_REASONS = [
  'Incorrect information',
  'Wrong price',
  'Duplicate listing',
  'Suspicious listing',
  'Inappropriate content',
  'Other',
]

/**
 * Submits a new report for a car listing.
 *
 * @param {Object} params
 * @param {string} params.carId - The UUID of the vehicle being reported
 * @param {string} params.reporterId - The UUID of the authenticated user reporting
 * @param {string} params.reason - Selected reason from REPORT_REASONS
 * @param {string} [params.description] - Optional details (max 500 chars)
 * @returns {Promise<{ data: Object|null, error: Error|null, isDuplicate?: boolean }>}
 */
export async function createCarReport({ carId, reporterId, reason, description }) {
  if (!carId) {
    return { data: null, error: new Error('Car ID is required.') }
  }
  if (!reporterId) {
    return { data: null, error: new Error('Authentication is required to submit a report.') }
  }
  if (!reason || !REPORT_REASONS.includes(reason)) {
    return { data: null, error: new Error('Please select a valid report reason.') }
  }

  const cleanDescription = (description || '').trim().slice(0, 500)

  try {
    const { data, error } = await supabase
      .from('car_reports')
      .insert({
        car_id: carId,
        reporter_id: reporterId,
        reason,
        description: cleanDescription || null,
        status: 'open',
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation (duplicate report)
      if (error.code === '23505') {
        return {
          data: null,
          error: new Error('You have already submitted a report for this vehicle with this reason.'),
          isDuplicate: true,
        }
      }
      console.error('[Cardom Supabase] createCarReport error:', error.message)
      return { data: null, error: new Error(error.message || 'Failed to submit report.') }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[Cardom Supabase] createCarReport exception:', err)
    return { data: null, error: new Error('An unexpected error occurred while submitting the report.') }
  }
}

/**
 * Fetches reports submitted by a specific user.
 *
 * @param {string} userId - The UUID of the authenticated user
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchUserReports(userId) {
  if (!userId) return { data: [], error: null }

  try {
    const { data, error } = await supabase
      .from('car_reports')
      .select('*')
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Cardom Supabase] fetchUserReports error:', error.message)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Cardom Supabase] fetchUserReports exception:', err)
    return { data: [], error: err }
  }
}

