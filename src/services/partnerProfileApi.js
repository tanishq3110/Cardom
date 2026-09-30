import { supabase } from '@/lib/supabase'

// Read-only fields that partners cannot edit
const READ_ONLY_FIELDS = ['id', 'status', 'is_verified', 'partner_category', 'created_at']

/**
 * Fetch the partner profile for the current authenticated user.
 * @returns {{ data: object|null, error: Error|null }}
 */
export async function getPartnerProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: authError || new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return { data, error }
}

/**
 * Update editable partner profile fields.
 * Strips any read-only fields before sending to prevent accidental overwrites.
 * @param {object} updates - fields to update
 * @returns {{ error: Error|null }}
 */
export async function updatePartnerProfile(updates) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: authError || new Error('Not authenticated') }

  // Strip read-only fields defensively
  const safe = { ...updates }
  for (const field of READ_ONLY_FIELDS) delete safe[field]

  const { error } = await supabase
    .from('partner_profiles')
    .update(safe)
    .eq('id', user.id)

  return { error }
}

/**
 * Calculate profile completion percentage (frontend only, not stored).
 * Based on editable fields only.
 * @param {object} profile - partner_profiles row
 * @returns {number} 0-100
 */
export function calcProfileCompletion(profile) {
  if (!profile) return 0
  const FIELDS = [
    'business_name',
    'authorized_contact_name',
    'phone',
    'email',
    'registration_number',
    'address',
    'city',
    'state',
    'pincode',
    'gstin',
  ]
  const filled = FIELDS.filter((f) => !!profile[f]?.toString().trim()).length
  return Math.round((filled / FIELDS.length) * 100)
}
