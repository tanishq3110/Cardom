import { supabase } from '@/lib/supabase'

/**
 * Fetch unified leads from all sources (insurance, finance, service, car inquiries)
 */
export async function getUnifiedLeads({
  page = 1,
  limit = 20,
  type = 'all',
  status = 'all',
  search = '',
} = {}) {
  try {
    const promises = []

    if (type === 'all' || type === 'insurance') {
      let q = supabase.from('insurance_leads').select('*').order('created_at', { ascending: false }).limit(limit)
      if (status !== 'all') q = q.eq('status', status)
      promises.push(
        q.then(({ data }) =>
          (data || []).map((row) => ({
            id: row.id,
            type: 'insurance',
            customer: row.contact_name || 'Customer',
            phone: row.contact_phone || '—',
            email: row.contact_email || '—',
            details: `${row.car_brand} ${row.car_model} (${row.registration_year || '—'})`,
            status: row.status || 'new',
            createdAt: row.created_at,
            raw: row,
          }))
        )
      )
    }

    if (type === 'all' || type === 'finance') {
      let q = supabase.from('finance_leads').select('*').order('created_at', { ascending: false }).limit(limit)
      if (status !== 'all') q = q.eq('status', status)
      promises.push(
        q.then(({ data }) =>
          (data || []).map((row) => ({
            id: row.id,
            type: 'finance',
            customer: row.contact_name || 'Customer',
            phone: row.contact_phone || '—',
            email: row.contact_email || '—',
            details: `Loan: ₹${Number(row.loan_amount || 0).toLocaleString()} (EMI: ₹${Number(row.monthly_emi || 0).toLocaleString()})`,
            status: row.status || 'new',
            createdAt: row.created_at,
            raw: row,
          }))
        )
      )
    }

    if (type === 'all' || type === 'service') {
      let q = supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(limit)
      if (status !== 'all') q = q.eq('status', status)
      promises.push(
        q.then(({ data }) =>
          (data || []).map((row) => ({
            id: row.id,
            type: 'service',
            customer: row.booking_reference || 'Service Request',
            phone: '—',
            email: '—',
            details: `${row.vehicle_name} • ${row.service_center_name || 'Center'} (₹${Number(row.total_amount || 0).toLocaleString()})`,
            status: row.status || 'scheduled',
            createdAt: row.created_at,
            raw: row,
          }))
        )
      )
    }

    if (type === 'all' || type === 'inquiry') {
      let q = supabase.from('inquiries').select('*, cars(brand, model)').order('created_at', { ascending: false }).limit(limit)
      if (status !== 'all') q = q.eq('status', status)
      promises.push(
        q.then(({ data }) =>
          (data || []).map((row) => ({
            id: row.id,
            type: 'inquiry',
            customer: 'Buyer Inquiry',
            phone: row.phone || '—',
            email: '—',
            details: `${row.cars?.brand || 'Car'} ${row.cars?.model || ''}: "${(row.message || '').slice(0, 40)}..."`,
            status: row.status || 'unread',
            createdAt: row.created_at,
            raw: row,
          }))
        )
      )
    }

    const results = await Promise.all(promises)
    let combined = results.flat()

    // Filter by search
    if (search?.trim()) {
      const s = search.toLowerCase().trim()
      combined = combined.filter(
        (lead) =>
          lead.customer?.toLowerCase().includes(s) ||
          lead.phone?.toLowerCase().includes(s) ||
          lead.email?.toLowerCase().includes(s) ||
          lead.details?.toLowerCase().includes(s) ||
          lead.id?.toLowerCase().includes(s)
      )
    }

    // Sort by created_at desc
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const from = (page - 1) * limit
    const paginated = combined.slice(from, from + limit)

    return {
      data: paginated,
      total: combined.length,
      error: null,
    }
  } catch (err) {
    console.error('[adminLeadsApi] getUnifiedLeads error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch detailed lead record by type and ID
 */
export async function getLeadDetails(type, id) {
  if (!type || !id) return { data: null, error: new Error('Type and ID required') }

  try {
    let tableName = ''
    switch (type) {
      case 'insurance':
        tableName = 'insurance_leads'
        break
      case 'finance':
        tableName = 'finance_leads'
        break
      case 'service':
        tableName = 'service_requests'
        break
      case 'inquiry':
        tableName = 'inquiries'
        break
      default:
        throw new Error(`Unknown lead type: ${type}`)
    }

    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle()
    if (error) throw error

    // Fetch user profile if user_id exists
    let userProfile = null
    if (data?.user_id || data?.buyer_id) {
      const uid = data.user_id || data.buyer_id
      const { data: u } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
      userProfile = u
    }

    // Check if partner assigned via partner_lead_assignments
    const { data: assignment } = await supabase
      .from('partner_lead_assignments')
      .select('*, partner_profiles(*)')
      .eq('lead_id', id)
      .maybeSingle()

    return {
      data: {
        lead: data,
        type,
        userProfile,
        assignment,
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminLeadsApi] getLeadDetails error:', err)
    return { data: null, error: err }
  }
}
