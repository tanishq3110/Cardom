import { supabase } from '@/lib/supabase'

/**
 * Normalizes a database row from public.profiles into a clean object.
 */
export function mapProfile(row, fallbackUser = null) {
  if (!row && !fallbackUser) return null
  return {
    id: row?.id || fallbackUser?.id || '',
    full_name: row?.full_name || fallbackUser?.user_metadata?.full_name || '',
    email: row?.email || fallbackUser?.email || '',
    avatar_url: row?.avatar_url || '',
    phone: row?.phone || '',
    location: row?.location || '',
    created_at: row?.created_at || fallbackUser?.created_at || null,
    updated_at: row?.updated_at || null,
  }
}

/**
 * Fetches the user profile by user UUID from public.profiles.
 * @param {string} userId
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function fetchProfile(userId) {
  if (!userId) return { data: null, error: new Error('User ID is required') }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('[Cardom Profile] fetchProfile error:', error.message)
      return { data: null, error }
    }

    return { data: data ? mapProfile(data) : null, error: null }
  } catch (err) {
    console.error('[Cardom Profile] Unexpected error in fetchProfile:', err)
    return { data: null, error: err }
  }
}

/**
 * Updates the user profile in public.profiles.
 * Performs an upsert so if a profile wasn't created yet, it creates it smoothly.
 * @param {string} userId
 * @param {Object} updates - { full_name, phone, location, avatar_url }
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function updateProfile(userId, updates) {
  if (!userId) return { data: null, error: new Error('User ID is required') }

  try {
    const payload = {
      id: userId,
      full_name: updates.full_name?.trim() ?? '',
      phone: updates.phone?.trim() ?? '',
      location: updates.location?.trim() ?? '',
      avatar_url: updates.avatar_url?.trim() ?? '',
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single()

    if (error) {
      console.warn('[Cardom Profile] updateProfile error:', error.message)
      return { data: null, error }
    }

    // Also sync full_name to auth.user metadata for consistency across the app
    if (payload.full_name) {
      supabase.auth.updateUser({
        data: { full_name: payload.full_name },
      }).catch(() => {})
    }

    return { data: mapProfile(data), error: null }
  } catch (err) {
    console.error('[Cardom Profile] Unexpected error in updateProfile:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetches safe public profile fields for a seller (full_name, avatar_url, location).
 * Never exposes private account details, email, or internal metadata.
 * @param {string} userId
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function fetchPublicProfile(userId) {
  if (!userId) return { data: null, error: new Error('User ID is required') }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, location')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('[Cardom Profile] fetchPublicProfile error:', error.message)
      return { data: null, error }
    }

    return {
      data: data
        ? {
            id: data.id,
            full_name: data.full_name || 'Verified Seller',
            avatar_url: data.avatar_url || '',
            location: data.location || '',
          }
        : null,
      error: null,
    }
  } catch (err) {
    console.error('[Cardom Profile] Unexpected error in fetchPublicProfile:', err)
    return { data: null, error: err }
  }
}

