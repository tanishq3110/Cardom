import { supabase } from '@/lib/supabase'

/**
 * Get current partner availability state from profile.
 * @returns {Promise<{ isOnline: boolean, lastOnlineAt: string|null, lastOfflineAt: string|null, error: Error|null }>}
 */
export async function getPartnerAvailability() {
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return { isOnline: false, lastOnlineAt: null, lastOfflineAt: null, error: authErr || new Error('Not authenticated') }
  }

  const { data, error } = await supabase
    .from('partner_profiles')
    .select('is_online, last_online_at, last_offline_at')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return { isOnline: false, lastOnlineAt: null, lastOfflineAt: null, error }
  }

  return {
    isOnline: !!data?.is_online,
    lastOnlineAt: data?.last_online_at || null,
    lastOfflineAt: data?.last_offline_at || null,
    error: null,
  }
}

/**
 * Switch partner availability to ONLINE.
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function setPartnerOnline() {
  const { data, error } = await supabase.rpc('update_partner_availability', {
    p_is_online: true,
  })

  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error || 'Failed to go online' }

  return { success: true, error: null }
}

/**
 * Switch partner availability to OFFLINE.
 * Checks active ride protection on backend.
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function setPartnerOffline() {
  const { data, error } = await supabase.rpc('update_partner_availability', {
    p_is_online: false,
  })

  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error || 'Failed to go offline' }

  return { success: true, error: null }
}

/**
 * Report partner availability GPS location.
 * @param {object} coords
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function reportPartnerLocation({ latitude, longitude, accuracy, heading, speed }) {
  if (latitude == null || longitude == null) {
    return { success: false, error: 'Invalid coordinates' }
  }

  const { data, error } = await supabase.rpc('update_partner_location', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_accuracy: accuracy ?? null,
    p_heading: heading ?? null,
    p_speed: speed ?? null,
  })

  if (error) return { success: false, error: error.message }
  return { success: data?.success ?? true, error: null }
}

/**
 * Realtime subscription to partner profile availability changes.
 */
export function subscribeToPartnerProfile(partnerId, onChange) {
  if (!partnerId) return () => {}

  const channel = supabase
    .channel(`partner_profile_avail_${partnerId}_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'partner_profiles',
        filter: `id=eq.${partnerId}`,
      },
      (payload) => {
        if (payload?.new && typeof onChange === 'function') {
          onChange(payload.new)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

