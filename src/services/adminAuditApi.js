import { supabase } from '@/lib/supabase'

/**
 * Log an administrative action to admin_audit_logs
 */
export async function logAdminAction(action, targetType, targetId, before = null, after = null, reason = '') {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      admin_id: user?.id || null,
      action,
      target_type: targetType,
      target_id: targetId ? String(targetId) : null,
      before_data: before || null,
      after_data: after || null,
      reason: reason || null,
    }

    const { data, error } = await supabase
      .from('admin_audit_logs')
      .insert(payload)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('[adminAuditApi] Unable to record audit log:', error.message)
    }

    return { data, error }
  } catch (err) {
    console.warn('[adminAuditApi] Exception recording audit log:', err.message)
    return { data: null, error: err }
  }
}

/**
 * Fetch paginated list of audit logs
 */
export async function getAuditLogs({
  page = 1,
  limit = 25,
  action = 'all',
  targetType = 'all',
} = {}) {
  try {
    let query = supabase
      .from('admin_audit_logs')
      .select(`
        *,
        admin_profiles:admin_id (
          full_name,
          email,
          role
        )
      `, { count: 'exact' })

    if (action !== 'all') {
      query = query.eq('action', action)
    }

    if (targetType !== 'all') {
      query = query.eq('target_type', targetType)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminAuditApi] getAuditLogs error:', err)
    return { data: [], total: 0, error: err }
  }
}
