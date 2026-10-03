import { supabase } from '@/lib/supabase'

export async function getPartnerNotifications(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}

export async function getPartnerUnreadNotificationCount() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('partner_id', user.id)
    .eq('is_read', false)

  return count || 0
}

export async function markPartnerNotificationsRead(ids) {
  if (!ids?.length) return { error: null }
  try {
    const { error: rpcErr } = await supabase.rpc('mark_notifications_read', { p_ids: ids })
    if (!rpcErr) return { error: null }
  } catch (_) {
    // fallback to direct update
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', ids)
  return { error }
}

export async function markAllPartnerNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try {
    const { error: rpcErr } = await supabase.rpc('mark_all_notifications_read')
    if (!rpcErr) return { error: null }
  } catch (_) {
    // fallback to direct update
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('partner_id', user.id)
    .eq('is_read', false)
  return { error }
}

export function subscribeToPartnerNotifications(partnerId, onNew) {
  const channel = supabase
    .channel(`partner_notifications_${partnerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `partner_id=eq.${partnerId}`,
      },
      (payload) => {
        if (payload?.new && typeof onNew === 'function') {
          onNew(payload.new)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
