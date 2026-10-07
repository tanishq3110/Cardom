import { supabase } from '@/lib/supabase'

/**
 * Fetch in-app notifications stream
 */
export async function getNotifications({
  page = 1,
  limit = 20,
  type = 'all',
  isRead = 'all',
} = {}) {
  try {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })

    if (type !== 'all') {
      query = query.eq('type', type)
    }

    if (isRead !== 'all') {
      query = query.eq('is_read', isRead === 'true' || isRead === true)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminNotificationsApi] getNotifications error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch Push Notification infrastructure health and active device tokens
 */
export async function getPushDeliveryMetrics() {
  try {
    const [tokensRes, deliveriesRes] = await Promise.all([
      supabase.from('device_push_tokens').select('*'),
      supabase.from('push_notification_deliveries').select('*').order('created_at', { ascending: false }).limit(200),
    ])

    const tokens = tokensRes.data || []
    const deliveries = deliveriesRes.data || []

    const userTokens = tokens.filter((t) => t.app_type === 'user')
    const partnerTokens = tokens.filter((t) => t.app_type === 'partner')
    const activeTokens = tokens.filter((t) => t.is_active)

    const deliveryStats = {
      total: deliveries.length,
      sent: deliveries.filter((d) => d.status === 'sent').length,
      failed: deliveries.filter((d) => d.status === 'failed').length,
      pending: deliveries.filter((d) => d.status === 'pending').length,
      invalidToken: deliveries.filter((d) => d.status === 'invalid_token').length,
    }

    return {
      data: {
        totalDevices: tokens.length,
        activeDevices: activeTokens.length,
        userDevices: userTokens.length,
        partnerDevices: partnerTokens.length,
        recentDeliveries: deliveries.slice(0, 50),
        deliveryStats,
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminNotificationsApi] getPushDeliveryMetrics error:', err)
    return { data: null, error: err }
  }
}
