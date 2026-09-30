import { supabase } from '@/lib/supabase'

// ─────────────────────────────────────────────
// Formatters – convert raw DB rows to flat lead objects
// ─────────────────────────────────────────────

function formatInsuranceLead(row, assignment) {
  return {
    assignmentId: assignment.id,
    leadId: assignment.lead_id,
    leadType: 'insurance',
    type: 'Insurance',
    partnerStatus: assignment.partner_status,
    notes: assignment.notes,
    assignedAt: assignment.assigned_at,
    // source fields
    customer: row.contact_name,
    phone: row.contact_phone,
    email: row.contact_email,
    city: row.city,
    vehicle: `${row.car_brand || ''} ${row.car_model || ''}`.trim() || null,
    vehicleDetail: row.registration_year ? `${row.registration_year} · ${row.fuel_type || ''}`.trim() : row.fuel_type || null,
    previousPolicy: row.previous_policy_status,
    sourceStatus: row.status,
    createdAt: row.created_at,
  }
}

function formatFinanceLead(row, assignment) {
  return {
    assignmentId: assignment.id,
    leadId: assignment.lead_id,
    leadType: 'finance',
    type: 'Finance',
    partnerStatus: assignment.partner_status,
    notes: assignment.notes,
    assignedAt: assignment.assigned_at,
    // source fields
    customer: row.contact_name,
    phone: row.contact_phone,
    email: row.contact_email,
    city: null,
    vehicle: row.car_price ? `Car Price: ₹${Number(row.car_price).toLocaleString('en-IN')}` : null,
    vehicleDetail: null,
    loanAmount: row.loan_amount,
    monthlyEmi: row.monthly_emi,
    downPayment: row.down_payment,
    interestRate: row.interest_rate,
    carPrice: row.car_price,
    tenure: row.tenure_years ? `${row.tenure_years} yrs` : null,
    employmentType: row.employment_type,
    annualIncome: row.annual_income ? `₹${Number(row.annual_income).toLocaleString('en-IN')}` : null,
    sourceStatus: row.status,
    createdAt: row.created_at,
  }
}

function formatServiceLead(row, assignment) {
  return {
    assignmentId: assignment.id,
    leadId: assignment.lead_id,
    leadType: 'service',
    type: 'Service',
    partnerStatus: assignment.partner_status,
    notes: assignment.notes,
    assignedAt: assignment.assigned_at,
    // source fields
    customer: row.booking_reference,
    phone: null,
    email: null,
    city: row.service_center_city,
    vehicle: row.vehicle_name,
    vehicleDetail: row.vehicle_fuel,
    serviceCenter: row.service_center_name,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    doorsepValet: row.doorstep_valet,
    totalAmount: row.total_amount,
    sourceStatus: row.status,
    createdAt: row.created_at,
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function getCurrentPartnerId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Fetch all assigned leads for the current partner, filtered by category.
 * @param {string} category - 'insurance' | 'finance' | 'service_center' | 'car_dealer'
 * @returns {{ data: object[], error: Error|null }}
 */
export async function getPartnerLeads(category) {
  const partnerId = await getCurrentPartnerId()
  if (!partnerId) return { data: [], error: new Error('Not authenticated') }

  // Determine which lead types to query based on category
  const leadTypes = categoryToLeadTypes(category)

  const { data: assignments, error: assignErr } = await supabase
    .from('partner_lead_assignments')
    .select('*')
    .eq('partner_id', partnerId)
    .in('lead_type', leadTypes)
    .order('assigned_at', { ascending: false })

  if (assignErr) return { data: [], error: assignErr }
  if (!assignments || assignments.length === 0) return { data: [], error: null }

  // Group assignment IDs by lead type
  const insuranceIds = assignments.filter(a => a.lead_type === 'insurance').map(a => a.lead_id)
  const financeIds = assignments.filter(a => a.lead_type === 'finance').map(a => a.lead_id)
  const serviceIds = assignments.filter(a => a.lead_type === 'service').map(a => a.lead_id)

  // Parallel fetch source records
  const [insuranceRes, financeRes, serviceRes] = await Promise.all([
    insuranceIds.length > 0
      ? supabase.from('insurance_leads').select('id, user_id, car_brand, car_model, registration_year, fuel_type, city, previous_policy_status, contact_name, contact_phone, contact_email, status, created_at, updated_at').in('id', insuranceIds)
      : Promise.resolve({ data: [], error: null }),
    financeIds.length > 0
      ? supabase.from('finance_leads').select('id, user_id, car_price, down_payment, loan_amount, interest_rate, tenure_years, monthly_emi, employment_type, annual_income, contact_name, contact_phone, contact_email, status, created_at, updated_at').in('id', financeIds)
      : Promise.resolve({ data: [], error: null }),
    serviceIds.length > 0
      ? supabase.from('service_requests').select('id, user_id, booking_reference, vehicle_name, vehicle_fuel, service_packages, service_center_name, service_center_city, scheduled_date, scheduled_time, doorstep_valet, base_cost, valet_fee, tax_amount, total_amount, status, created_at, updated_at').in('id', serviceIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  // Build lookup maps
  const insuranceMap = Object.fromEntries((insuranceRes.data || []).map(r => [r.id, r]))
  const financeMap = Object.fromEntries((financeRes.data || []).map(r => [r.id, r]))
  const serviceMap = Object.fromEntries((serviceRes.data || []).map(r => [r.id, r]))

  // Format and merge
  const leads = assignments.map(assignment => {
    if (assignment.lead_type === 'insurance') {
      const row = insuranceMap[assignment.lead_id]
      return row ? formatInsuranceLead(row, assignment) : null
    }
    if (assignment.lead_type === 'finance') {
      const row = financeMap[assignment.lead_id]
      return row ? formatFinanceLead(row, assignment) : null
    }
    if (assignment.lead_type === 'service') {
      const row = serviceMap[assignment.lead_id]
      return row ? formatServiceLead(row, assignment) : null
    }
    return null
  }).filter(Boolean)

  return { data: leads, error: null }
}

/**
 * Update a partner's own status on a lead assignment.
 * @param {string} assignmentId
 * @param {string} newStatus - one of: new|contacted|in_progress|completed|cancelled
 * @returns {{ error: Error|null }}
 */
export async function updatePartnerLeadStatus(assignmentId, newStatus) {
  const partnerId = await getCurrentPartnerId()
  if (!partnerId) return { error: new Error('Not authenticated') }

  const { error } = await supabase
    .from('partner_lead_assignments')
    .update({ partner_status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('partner_id', partnerId) // enforce ownership

  return { error }
}

/**
 * Fetch summary stats for the partner dashboard.
 * @returns {{ data: object|null, error: Error|null }}
 */
export async function getPartnerDashboardStats() {
  const partnerId = await getCurrentPartnerId()
  if (!partnerId) return { data: null, error: new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('partner_lead_assignments')
    .select('partner_status')
    .eq('partner_id', partnerId)

  if (error) return { data: null, error }

  const stats = {
    total: data.length,
    new: data.filter(r => r.partner_status === 'new').length,
    contacted: data.filter(r => r.partner_status === 'contacted').length,
    inProgress: data.filter(r => r.partner_status === 'in_progress').length,
    completed: data.filter(r => r.partner_status === 'completed').length,
    cancelled: data.filter(r => r.partner_status === 'cancelled').length,
  }

  return { data: stats, error: null }
}

/**
 * Fetch the most recent N lead assignments for the dashboard preview.
 * @param {string} category - partner category
 * @param {number} limit - max records to return (default 4)
 * @returns {{ data: object[], error: Error|null }}
 */
export async function getPartnerRecentLeads(category, limit = 4) {
  const partnerId = await getCurrentPartnerId()
  if (!partnerId) return { data: [], error: new Error('Not authenticated') }

  const leadTypes = categoryToLeadTypes(category)

  const { data: assignments, error: assignErr } = await supabase
    .from('partner_lead_assignments')
    .select('*')
    .eq('partner_id', partnerId)
    .in('lead_type', leadTypes)
    .order('assigned_at', { ascending: false })
    .limit(limit)

  if (assignErr) return { data: [], error: assignErr }
  if (!assignments || assignments.length === 0) return { data: [], error: null }

  // Same approach as getPartnerLeads but limited
  const insuranceIds = assignments.filter(a => a.lead_type === 'insurance').map(a => a.lead_id)
  const financeIds = assignments.filter(a => a.lead_type === 'finance').map(a => a.lead_id)
  const serviceIds = assignments.filter(a => a.lead_type === 'service').map(a => a.lead_id)

  const [insuranceRes, financeRes, serviceRes] = await Promise.all([
    insuranceIds.length > 0
      ? supabase.from('insurance_leads').select('id, car_brand, car_model, registration_year, fuel_type, city, previous_policy_status, contact_name, contact_phone, contact_email, status, created_at').in('id', insuranceIds)
      : Promise.resolve({ data: [], error: null }),
    financeIds.length > 0
      ? supabase.from('finance_leads').select('id, car_price, down_payment, loan_amount, interest_rate, tenure_years, monthly_emi, employment_type, annual_income, contact_name, contact_phone, contact_email, status, created_at').in('id', financeIds)
      : Promise.resolve({ data: [], error: null }),
    serviceIds.length > 0
      ? supabase.from('service_requests').select('id, booking_reference, vehicle_name, vehicle_fuel, service_center_name, service_center_city, scheduled_date, scheduled_time, doorstep_valet, total_amount, status, created_at').in('id', serviceIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const insuranceMap = Object.fromEntries((insuranceRes.data || []).map(r => [r.id, r]))
  const financeMap = Object.fromEntries((financeRes.data || []).map(r => [r.id, r]))
  const serviceMap = Object.fromEntries((serviceRes.data || []).map(r => [r.id, r]))

  const leads = assignments.map(assignment => {
    if (assignment.lead_type === 'insurance') {
      const row = insuranceMap[assignment.lead_id]
      return row ? formatInsuranceLead(row, assignment) : null
    }
    if (assignment.lead_type === 'finance') {
      const row = financeMap[assignment.lead_id]
      return row ? formatFinanceLead(row, assignment) : null
    }
    if (assignment.lead_type === 'service') {
      const row = serviceMap[assignment.lead_id]
      return row ? formatServiceLead(row, assignment) : null
    }
    return null
  }).filter(Boolean)

  return { data: leads, error: null }
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

function categoryToLeadTypes(category) {
  switch (category) {
    case 'insurance':     return ['insurance']
    case 'finance':       return ['finance']
    case 'service_center': return ['service']
    case 'car_dealer':    return ['insurance', 'finance', 'service']
    default:              return ['insurance', 'finance', 'service']
  }
}
