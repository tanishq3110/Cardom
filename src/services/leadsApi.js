import { supabase } from '@/lib/supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone) {
  return /^[\d\s\-+().]{7,20}$/.test(phone)
}

// ─── Insurance Lead ───────────────────────────────────────────────────────────

/**
 * Submits a new insurance lead to Supabase.
 *
 * @param {Object} data
 * @param {string} data.carBrand - Required
 * @param {string} data.carModel - Required
 * @param {string} [data.registrationYear]
 * @param {string} [data.fuelType]
 * @param {string} [data.city]
 * @param {string} [data.previousPolicyStatus]
 * @param {string} [data.contactName]
 * @param {string} [data.contactPhone]
 * @param {string} [data.contactEmail]
 * @param {string|null} [data.userId] - null for guest submissions
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function submitInsuranceLead({
  carBrand,
  carModel,
  registrationYear = null,
  fuelType = null,
  city = null,
  previousPolicyStatus = null,
  contactName = null,
  contactPhone = null,
  contactEmail = null,
  userId = null,
}) {
  if (!carBrand?.trim()) {
    return { data: null, error: new Error('Car brand is required.') }
  }
  if (!carModel?.trim()) {
    return { data: null, error: new Error('Car model is required.') }
  }
  if (contactEmail && !isValidEmail(contactEmail)) {
    return { data: null, error: new Error('Please enter a valid email address.') }
  }
  if (contactPhone && !isValidPhone(contactPhone)) {
    return { data: null, error: new Error('Please enter a valid phone number.') }
  }

  try {
    const payload = {
      user_id: userId || null,
      car_brand: carBrand.trim(),
      car_model: carModel.trim(),
      registration_year: registrationYear || null,
      fuel_type: fuelType || null,
      city: city?.trim() || null,
      previous_policy_status: previousPolicyStatus || null,
      contact_name: contactName?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
      contact_email: contactEmail?.trim() || null,
      status: 'new',
    }

    const { error } = await supabase
      .from('insurance_leads')
      .insert(payload)

    if (error) {
      console.error('[Cardom Leads] submitInsuranceLead error:', error.message)
      return { data: null, error: new Error('Unable to submit your insurance request. Please try again.') }
    }

    return { data: payload, error: null }
  } catch (err) {
    console.error('[Cardom Leads] submitInsuranceLead exception:', err)
    return { data: null, error: new Error('An unexpected error occurred. Please try again.') }
  }
}

// ─── Finance Lead ─────────────────────────────────────────────────────────────

/**
 * Submits a new finance lead to Supabase.
 *
 * @param {Object} data
 * @param {number} data.carPrice - Required
 * @param {number} data.downPayment - Required
 * @param {number} data.loanAmount - Required
 * @param {number} data.interestRate - Required
 * @param {number} data.tenureYears - Required
 * @param {number} data.monthlyEmi - Required
 * @param {string} [data.employmentType]
 * @param {string} [data.annualIncome]
 * @param {string} [data.contactName]
 * @param {string} [data.contactPhone]
 * @param {string} [data.contactEmail]
 * @param {string|null} [data.userId]
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function submitFinanceLead({
  carPrice,
  downPayment,
  loanAmount,
  interestRate,
  tenureYears,
  monthlyEmi,
  employmentType = null,
  annualIncome = null,
  contactName = null,
  contactPhone = null,
  contactEmail = null,
  userId = null,
}) {
  if (!carPrice || carPrice <= 0) {
    return { data: null, error: new Error('Car price must be greater than zero.') }
  }
  if (downPayment < 0) {
    return { data: null, error: new Error('Down payment cannot be negative.') }
  }
  if (!contactName?.trim()) {
    return { data: null, error: new Error('Contact name is required.') }
  }
  if (!contactPhone?.trim()) {
    return { data: null, error: new Error('Contact phone is required.') }
  }
  if (contactEmail && !isValidEmail(contactEmail)) {
    return { data: null, error: new Error('Please enter a valid email address.') }
  }
  if (contactPhone && !isValidPhone(contactPhone)) {
    return { data: null, error: new Error('Please enter a valid phone number.') }
  }

  try {
    const payload = {
      user_id: userId || null,
      car_price: carPrice,
      down_payment: downPayment,
      loan_amount: loanAmount,
      interest_rate: interestRate,
      tenure_years: tenureYears,
      monthly_emi: monthlyEmi,
      employment_type: employmentType || null,
      annual_income: annualIncome || null,
      contact_name: contactName.trim(),
      contact_phone: contactPhone.trim(),
      contact_email: contactEmail?.trim() || null,
      status: 'new',
    }

    const { error } = await supabase
      .from('finance_leads')
      .insert(payload)

    if (error) {
      console.error('[Cardom Leads] submitFinanceLead error:', error.message)
      return { data: null, error: new Error('Unable to submit your financing request. Please try again.') }
    }

    return { data: payload, error: null }
  } catch (err) {
    console.error('[Cardom Leads] submitFinanceLead exception:', err)
    return { data: null, error: new Error('An unexpected error occurred. Please try again.') }
  }
}

// ─── Service Request ──────────────────────────────────────────────────────────

/**
 * Submits a new vehicle service request to Supabase.
 *
 * @param {Object} data
 * @param {string} data.vehicleName - Required
 * @param {string} [data.vehicleFuel]
 * @param {Array}  data.servicePackages - Required (array of package objects)
 * @param {string} data.serviceCenterName - Required
 * @param {string} [data.serviceCenterCity]
 * @param {string} data.scheduledDate - Required
 * @param {string} data.scheduledTime - Required
 * @param {boolean} data.doorstepValet
 * @param {number} data.baseCost
 * @param {number} data.valetFee
 * @param {number} data.taxAmount
 * @param {number} data.totalAmount
 * @param {string|null} [data.userId]
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function submitServiceRequest({
  vehicleName,
  vehicleFuel = null,
  servicePackages = [],
  serviceCenterName,
  serviceCenterCity = null,
  scheduledDate,
  scheduledTime,
  doorstepValet = false,
  baseCost = 0,
  valetFee = 0,
  taxAmount = 0,
  totalAmount = 0,
  userId = null,
}) {
  if (!vehicleName?.trim()) {
    return { data: null, error: new Error('Vehicle is required.') }
  }
  if (!serviceCenterName?.trim()) {
    return { data: null, error: new Error('Service center is required.') }
  }
  if (!scheduledDate?.trim()) {
    return { data: null, error: new Error('Scheduled date is required.') }
  }
  if (!scheduledTime?.trim()) {
    return { data: null, error: new Error('Scheduled time is required.') }
  }
  if (!servicePackages || servicePackages.length === 0) {
    return { data: null, error: new Error('At least one service package must be selected.') }
  }

  // Generate a unique booking reference
  const bookingReference = 'CDM-SRV-' + Math.floor(100000 + Math.random() * 900000)

  try {
    const payload = {
      user_id: userId || null,
      booking_reference: bookingReference,
      vehicle_name: vehicleName.trim(),
      vehicle_fuel: vehicleFuel || null,
      service_packages: servicePackages,
      service_center_name: serviceCenterName.trim(),
      service_center_city: serviceCenterCity?.trim() || null,
      scheduled_date: scheduledDate.trim(),
      scheduled_time: scheduledTime.trim(),
      doorstep_valet: doorstepValet,
      base_cost: baseCost,
      valet_fee: valetFee,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: 'scheduled',
    }

    const { error } = await supabase
      .from('service_requests')
      .insert(payload)

    if (error) {
      console.error('[Cardom Leads] submitServiceRequest error:', error.message)
      return { data: null, error: new Error('Unable to confirm your service booking. Please try again.') }
    }

    return { data: payload, error: null }
  } catch (err) {
    console.error('[Cardom Leads] submitServiceRequest exception:', err)
    return { data: null, error: new Error('An unexpected error occurred. Please try again.') }
  }
}

