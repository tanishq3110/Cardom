import { supabase } from '@/lib/supabase'

/**
 * Fetch notifications for the current user.
 * @param {number} limit
 * @returns {Promise<{ data: object[], error: any }>}
 */
export async function getMyNotifications(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}

/**
 * Get unread count for the current user.
 */
export async function getUnreadNotificationCount() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return count || 0
}

/**
 * Mark specific notification IDs as read.
 */
export async function markNotificationsRead(ids) {
  if (!ids?.length) return { error: null }

  // Try RPC first, fall back to direct update
  try {
    const { error } = await supabase.rpc('mark_notifications_read', { p_ids: ids })
    if (!error) return { error: null }
  } catch (_) {}

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', ids)

  return { error }
}

/**
 * Mark all notifications as read for current user.
 */
export async function markAllNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return { error }
}

/**
 * Subscribe to realtime notifications for current user.
 * @param {string} userId
 * @param {Function} onNew - called with new notification object
 * @returns cleanup function
 */
export function subscribeToUserNotifications(userId, onNew) {
  const channel = supabase
    .channel(`user_notifications_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNew(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
