import { supabase } from '@/lib/supabase'
import { logAdminAction } from './adminAuditApi'

/**
 * Fetch paginated list of cars from marketplace
 */
export async function getCars({
  page = 1,
  limit = 15,
  search = '',
  brand = 'all',
  status = 'all',
  fuelType = 'all',
  sortBy = 'created_at',
  ascending = false,
} = {}) {
  try {
    let query = supabase
      .from('cars')
      .select('*', { count: 'exact' })

    if (search?.trim()) {
      const s = search.trim()
      query = query.or(`brand.ilike.%${s}%,model.ilike.%${s}%,location.ilike.%${s}%`)
    }

    if (brand !== 'all') {
      query = query.ilike('brand', `%${brand}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (fuelType !== 'all') {
      query = query.ilike('fuel_type', `%${fuelType}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order(sortBy, { ascending }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return { data: data || [], total: count || 0, error: null }
  } catch (err) {
    console.error('[adminCarsApi] getCars error:', err)
    return { data: [], total: 0, error: err }
  }
}

/**
 * Fetch car listing details and associated inquiries
 */
export async function getCarDetails(carId) {
  if (!carId) return { data: null, error: new Error('Car ID required') }

  try {
    const [carRes, inquiriesRes] = await Promise.all([
      supabase.from('cars').select('*').eq('id', carId).maybeSingle(),
      supabase.from('inquiries').select('*').eq('car_id', carId).order('created_at', { ascending: false }),
    ])

    const car = carRes.data || null
    let seller = null

    if (car?.seller_id) {
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', car.seller_id)
        .maybeSingle()
      seller = sellerData
    }

    return {
      data: {
        car,
        seller,
        inquiries: inquiriesRes.data || [],
      },
      error: null,
    }
  } catch (err) {
    console.error('[adminCarsApi] getCarDetails error:', err)
    return { data: null, error: err }
  }
}

/**
 * Moderate car listing status (approve, reject, inactive, restore)
 */
export async function moderateCar(carId, status, reason = '') {
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_moderate_car', {
      p_car_id: carId,
      p_status: status,
      p_reason: reason || `Admin updated car listing status to ${status}`,
    })

    if (!rpcErr && rpcData?.success) {
      return { success: true, car: rpcData.car }
    }

    // Direct fallback
    const { data: before } = await supabase.from('cars').select('*').eq('id', carId).single()
    const { data, error } = await supabase
      .from('cars')
      .update({ status })
      .eq('id', carId)
      .select()
      .single()

    if (error) throw error

    await logAdminAction('MODERATE_CAR_LISTING', 'cars', carId, before, data, reason)
    return { success: true, car: data }
  } catch (err) {
    console.error('[adminCarsApi] moderateCar error:', err)
    return { success: false, error: err.message }
  }
}
