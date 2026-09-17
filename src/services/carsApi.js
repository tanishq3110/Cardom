import { supabase } from '@/lib/supabase'
import { FEATURED_CARS } from '@/data/cars'
import { fetchCarImages, deleteCarImagesForCar } from '@/services/carImagesApi'

/**
 * Normalizes a database row from public.cars into the shape expected by Cardom UI.
 * Handles both snake_case and camelCase column naming gracefully.
 */
export function mapSupabaseCar(row) {
  if (!row) return null

  const rawPrice = Number(row.price) || 0

  let rawMileage = row.mileage
  if (typeof rawMileage === 'string') {
    const parsed = parseInt(rawMileage.replace(/[^0-9]/g, ''), 10)
    rawMileage = isNaN(parsed) ? rawMileage : parsed
  }

  const location = row.location || 'India'

  const image =
    row.image_url ||
    row.image ||
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80'

  return {
    id: String(row.id ?? ''),
    brand: row.brand || row.make || 'Automobile',
    model: row.model || row.title || 'Vehicle',
    year: Number(row.year) || new Date().getFullYear(),
    price: rawPrice,
    fuel: row.fuel_type || row.fuel || 'Petrol',
    fuel_type: row.fuel_type || row.fuel || 'Petrol',
    transmission: row.transmission || 'Automatic',
    mileage: rawMileage ?? 0,
    location,
    image,
    image_url: image,
    description: row.description || row.title || '',
    badge: row.badge || (row.is_featured ? 'Featured' : null),
    isFeatured: Boolean(row.is_featured ?? false),
    seller_id: row.seller_id ?? null,
    status: row.status ?? 'active',
    specs: row.specs || {},
    features: row.features || [],
    gallery: row.gallery || [],
    created_at: row.created_at,
  }
}

/**
 * Helper to filter local mock cars when Supabase is offline or errors.
 */
function filterLocalCars(cars, filters = {}) {
  let result = [...cars]
  const search = (filters.search ?? filters.q ?? '').toLowerCase().trim()
  const brand = filters.brand && filters.brand !== 'All' ? filters.brand.toLowerCase() : null
  const fuel =
    (filters.fuel ?? filters.fuel_type) && (filters.fuel ?? filters.fuel_type) !== 'All'
      ? (filters.fuel ?? filters.fuel_type).toLowerCase()
      : null
  const trans =
    filters.transmission && filters.transmission !== 'All'
      ? filters.transmission.toLowerCase()
      : null
  const loc =
    filters.location && filters.location !== 'All'
      ? filters.location.toLowerCase().trim()
      : null
  const minP =
    filters.minPrice !== undefined && filters.minPrice !== '' ? Number(filters.minPrice) : null
  const maxP =
    filters.maxPrice !== undefined && filters.maxPrice !== '' ? Number(filters.maxPrice) : null
  const minY =
    filters.minYear !== undefined && filters.minYear !== 'all' && filters.minYear !== ''
      ? Number(filters.minYear)
      : null
  const maxY =
    filters.maxYear !== undefined && filters.maxYear !== 'all' && filters.maxYear !== ''
      ? Number(filters.maxYear)
      : null
  const sort = filters.sort || filters.sortBy || 'newest'

  if (search) {
    const words = search.split(/\s+/).filter(Boolean)
    result = result.filter((c) => {
      const b = (c.brand || '').toLowerCase()
      const m = (c.model || '').toLowerCase()
      return words.every((w) => b.includes(w) || m.includes(w))
    })
  }

  if (brand) {
    result = result.filter((c) => (c.brand || '').toLowerCase() === brand)
  }
  if (fuel) {
    result = result.filter((c) => (c.fuel || c.fuel_type || '').toLowerCase() === fuel)
  }
  if (trans) {
    result = result.filter((c) => (c.transmission || '').toLowerCase() === trans)
  }
  if (loc) {
    result = result.filter((c) => (c.location || '').toLowerCase().includes(loc))
  }
  if (minP !== null && !isNaN(minP)) {
    result = result.filter((c) => c.price >= minP)
  }
  if (maxP !== null && !isNaN(maxP)) {
    result = result.filter((c) => c.price <= maxP)
  }
  if (minY !== null && !isNaN(minY)) {
    result = result.filter((c) => c.year >= minY)
  }
  if (maxY !== null && !isNaN(maxY)) {
    result = result.filter((c) => c.year <= maxY)
  }

  const statusFilter =
    filters.status === undefined ? 'active' : filters.status === 'all' ? null : filters.status
  if (statusFilter) {
    result = result.filter((c) => (c.status || 'active') === statusFilter)
  }

  // Sorting
  if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
  else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
  else if (sort === 'year_desc') result.sort((a, b) => b.year - a.year)
  else if (sort === 'year_asc') result.sort((a, b) => a.year - b.year)
  else if (sort === 'mileage_asc') result.sort((a, b) => a.mileage - b.mileage)
  else if (sort === 'mileage_desc') result.sort((a, b) => b.mileage - a.mileage)

  const totalCount = result.length

  if (filters.page && filters.limit) {
    const from = (Number(filters.page) - 1) * Number(filters.limit)
    result = result.slice(from, from + Number(filters.limit))
  }

  return {
    data: result.map(mapSupabaseCar),
    count: totalCount,
    error: null,
    source: 'local',
  }
}

/**
 * Fetches distinct brand names available in active public.cars listings.
 * Used to dynamically populate the Brand filter dropdown / pills.
 *
 * @returns {Promise<{ data: string[], error: Error|null }>}
 */
export async function fetchDistinctBrands() {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('brand')
      .eq('status', 'active')

    if (error) {
      console.warn('[Cardom Supabase] fetchDistinctBrands fallback:', error.message)
      const mockBrands = [...new Set(FEATURED_CARS.map((c) => c.brand).filter(Boolean))].sort()
      return { data: mockBrands, error: null }
    }

    const brands = [
      ...new Set(
        (data || [])
          .map((c) => c.brand?.trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

    return { data: brands, error: null }
  } catch (err) {
    const mockBrands = [...new Set(FEATURED_CARS.map((c) => c.brand).filter(Boolean))].sort()
    return { data: mockBrands, error: null }
  }
}

/**
 * Fetches cars from public.cars Supabase table with server-side search,
 * filtering, sorting, and pagination.
 * Falls back to local mock data if Supabase is unreachable or encounters an error.
 *
 * @param {Object} [filters]
 * @param {string} [filters.search] - Search query matching brand or model
 * @param {string} [filters.q] - Alias for search
 * @param {string} [filters.brand] - Brand name filter
 * @param {number|string} [filters.minPrice] - Minimum price in INR
 * @param {number|string} [filters.maxPrice] - Maximum price in INR
 * @param {number|string} [filters.minYear] - Minimum model year
 * @param {number|string} [filters.maxYear] - Maximum model year
 * @param {string} [filters.fuel] - Fuel type
 * @param {string} [filters.fuel_type] - Alias for fuel
 * @param {string} [filters.transmission] - Transmission type
 * @param {string} [filters.location] - Location query
 * @param {string} [filters.sortBy] - Sort key
 * @param {string} [filters.sort] - Alias for sortBy
 * @param {string} [filters.status] - Status ('active')
 * @param {number} [filters.page] - Page number (1-based)
 * @param {number} [filters.limit] - Page limit
 * @returns {Promise<{ data: Array, count: number, error: Error|null, source: 'supabase'|'local' }>}
 */
export async function fetchCars(filters = {}) {
  const {
    search,
    q,
    brand,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    fuel,
    fuel_type,
    transmission,
    location,
    sortBy = 'newest',
    sort,
    status,
    page,
    limit,
  } = filters

  const effectiveSearch = (search ?? q ?? '').trim()
  const effectiveBrand = brand && brand !== 'All' ? brand.trim() : null
  const rawFuel = fuel ?? fuel_type
  const effectiveFuel = rawFuel && rawFuel !== 'All' ? rawFuel.trim() : null
  const effectiveTransmission =
    transmission && transmission !== 'All' ? transmission.trim() : null
  const effectiveLocation =
    location && location.trim() && location !== 'All' ? location.trim() : null
  const effectiveSort = sort || sortBy || 'newest'

  try {
    let query = supabase.from('cars').select('*', { count: 'exact' })

    // 1. Status (defaults to 'active' for marketplace, unless explicitly 'all')
    const effectiveStatus = status === undefined ? 'active' : status === 'all' ? null : status
    if (effectiveStatus) {
      query = query.eq('status', effectiveStatus)
    }

    // 2. Search matching brand or model (multi-word tolerant)
    if (effectiveSearch) {
      const words = effectiveSearch.split(/\s+/).filter(Boolean)
      for (const word of words) {
        const cleanWord = word.replace(/[,.()]/g, '').trim()
        if (cleanWord) {
          query = query.or(`brand.ilike.%${cleanWord}%,model.ilike.%${cleanWord}%`)
        }
      }
    }

    // 3. Brand filter (case-insensitive)
    if (effectiveBrand) {
      query = query.ilike('brand', effectiveBrand)
    }

    // 4. Price range (INR)
    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      query = query.gte('price', Number(minPrice))
    }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      query = query.lte('price', Number(maxPrice))
    }

    // 5. Year range
    if (minYear !== undefined && minYear !== '' && minYear !== 'all' && !isNaN(Number(minYear))) {
      query = query.gte('year', Number(minYear))
    }
    if (maxYear !== undefined && maxYear !== '' && maxYear !== 'all' && !isNaN(Number(maxYear))) {
      query = query.lte('year', Number(maxYear))
    }

    // 6. Fuel Type
    if (effectiveFuel) {
      query = query.eq('fuel_type', effectiveFuel)
    }

    // 7. Transmission
    if (effectiveTransmission) {
      query = query.eq('transmission', effectiveTransmission)
    }

    // 8. Location
    if (effectiveLocation) {
      query = query.ilike('location', `%${effectiveLocation}%`)
    }

    // 9. Sorting
    switch (effectiveSort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'year_desc':
        query = query.order('year', { ascending: false })
        break
      case 'year_asc':
        query = query.order('year', { ascending: true })
        break
      case 'mileage_asc':
        query = query.order('mileage', { ascending: true, nullsFirst: false })
        break
      case 'mileage_desc':
        query = query.order('mileage', { ascending: false, nullsFirst: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false, nullsFirst: false })
        break
    }

    // 10. Pagination
    if (page && limit) {
      const from = (Number(page) - 1) * Number(limit)
      const to = from + Number(limit) - 1
      query = query.range(from, to)
    }

    const { data, count, error } = await query

    if (error) {
      if (error.code === '42501' || error.code === 'PGRST205' || error.code === '42P01') {
        console.info('[Cardom] Supabase permission pending / table missing — using local data.')
        return filterLocalCars(FEATURED_CARS, filters)
      }
      console.warn('[Cardom Supabase] fetchCars error:', error.message)
      return filterLocalCars(FEATURED_CARS, filters)
    }

    return {
      data: (data || []).map(mapSupabaseCar),
      count: count ?? (data ? data.length : 0),
      error: null,
      source: 'supabase',
    }
  } catch (err) {
    console.warn('[Cardom Supabase] Unexpected error in fetchCars:', err.message)
    return filterLocalCars(FEATURED_CARS, filters)
  }
}

/**
 * Fetches a single car by ID from Supabase, with local fallback.
 * @param {string} id
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function fetchCarById(id) {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (!error && data) {
      const car = mapSupabaseCar(data)
      const { data: dbImages } = await fetchCarImages(id)
      if (dbImages && dbImages.length > 0) {
        const galleryUrls = dbImages.map((img) => img.image_url)
        car.gallery = galleryUrls
        car.image = galleryUrls[0]
        car.image_url = galleryUrls[0]
      } else if (car.image) {
        car.gallery = [car.image]
      }
      return { data: car, error: null }
    }

    const local = FEATURED_CARS.find((c) => c.id === id) || null
    return { data: local, error: null }
  } catch (err) {
    const local = FEATURED_CARS.find((c) => c.id === id) || null
    return { data: local, error: null }
  }
}

/**
 * Fetches only the listings created by a specific user (seller_id = userId).
 *
 * @param {string} userId
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchMyListings(userId) {
  if (!userId) return { data: [], error: null }

  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Cardom Supabase] fetchMyListings error:', error.message)
      return { data: [], error }
    }

    return { data: (data || []).map(mapSupabaseCar), error: null }
  } catch (err) {
    console.error('[Cardom Supabase] fetchMyListings exception:', err)
    return { data: [], error: err }
  }
}

/**
 * Creates a new car listing owned by the current authenticated user.
 *
 * @param {Object} carData
 * @param {string} userId
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function createCar(carData, userId) {
  if (!userId) {
    return { data: null, error: new Error('User ID is required to create a listing.') }
  }

  try {
    const payload = {
      brand: carData.brand?.trim(),
      model: carData.model?.trim(),
      year: Number(carData.year) || new Date().getFullYear(),
      price: Number(carData.price) || 0,
      fuel_type: carData.fuel_type || carData.fuel || 'Petrol',
      transmission: carData.transmission || 'Automatic',
      mileage: Number(carData.mileage) || 0,
      location: carData.location?.trim() || 'India',
      image_url: carData.image_url || carData.image || '',
      description: carData.description?.trim() || '',
      seller_id: userId,
      status: carData.status || 'active',
    }

    const { data, error } = await supabase
      .from('cars')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[Cardom Supabase] createCar error:', error.message)
      return { data: null, error }
    }

    return { data: mapSupabaseCar(data), error: null }
  } catch (err) {
    console.error('[Cardom Supabase] createCar exception:', err)
    return { data: null, error: err }
  }
}

/**
 * Updates a car listing owned by the authenticated user.
 *
 * @param {string} carId
 * @param {Object} carData
 * @param {string} userId
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function updateCar(carId, carData, userId) {
  if (!carId || !userId) {
    return { data: null, error: new Error('Car ID and User ID are required.') }
  }

  try {
    const payload = {
      ...(carData.brand && { brand: carData.brand.trim() }),
      ...(carData.model && { model: carData.model.trim() }),
      ...(carData.year && { year: Number(carData.year) }),
      ...(carData.price !== undefined && { price: Number(carData.price) }),
      ...((carData.fuel_type || carData.fuel) && { fuel_type: carData.fuel_type || carData.fuel }),
      ...(carData.transmission && { transmission: carData.transmission }),
      ...(carData.mileage !== undefined && { mileage: Number(carData.mileage) }),
      ...(carData.location && { location: carData.location.trim() }),
      ...((carData.image_url || carData.image) && { image_url: carData.image_url || carData.image }),
      ...(carData.description !== undefined && { description: carData.description.trim() }),
      ...(carData.status && { status: carData.status }),
    }

    const { data, error } = await supabase
      .from('cars')
      .update(payload)
      .eq('id', carId)
      .eq('seller_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[Cardom Supabase] updateCar error:', error.message)
      return { data: null, error }
    }

    return { data: mapSupabaseCar(data), error: null }
  } catch (err) {
    console.error('[Cardom Supabase] updateCar exception:', err)
    return { data: null, error: err }
  }
}

/**
 * Deletes a car listing owned by the authenticated user.
 *
 * @param {string} carId
 * @param {string} userId
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function deleteCar(carId, userId) {
  if (!carId || !userId) {
    return { success: false, error: new Error('Car ID and User ID are required.') }
  }

  try {
    // 1. Delete associated Storage files and DB images first
    await deleteCarImagesForCar(carId)

    // 2. Delete car listing
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId)
      .eq('seller_id', userId)

    if (error) {
      console.error('[Cardom Supabase] deleteCar error:', error.message)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[Cardom Supabase] deleteCar exception:', err)
    return { success: false, error: err }
  }
}

/**
 * Marks a car listing as sold.
 * Only callable by the car's seller.
 *
 * @param {string} carId
 * @param {string} userId
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function markCarAsSold(carId, userId) {
  return updateCar(carId, { status: 'sold' }, userId)
}

/**
 * Restores a sold car listing back to active.
 * Only callable by the car's seller.
 *
 * @param {string} carId
 * @param {string} userId
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function restoreCarListing(carId, userId) {
  return updateCar(carId, { status: 'active' }, userId)
}

/**
 * Fetches multiple cars by their IDs.
 * Used by Recently Viewed to preserve the order of viewed items.
 *
 * @param {string[]} ids
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchCarsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { data: [], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .in('id', ids)

    if (!error && data) {
      const mapped = data.map(mapSupabaseCar)
      // Preserve array order of ids and filter out missing/null
      const ordered = ids
        .map((id) => mapped.find((c) => String(c.id) === String(id)))
        .filter(Boolean)
      return { data: ordered, error: null }
    }

    // Fallback to local mock data
    const local = ids
      .map((id) => FEATURED_CARS.find((c) => String(c.id) === String(id)))
      .filter(Boolean)
      .map(mapSupabaseCar)
    return { data: local, error: null }
  } catch (err) {
    const local = ids
      .map((id) => FEATURED_CARS.find((c) => String(c.id) === String(id)))
      .filter(Boolean)
      .map(mapSupabaseCar)
    return { data: local, error: null }
  }
}

/**
 * Fetches similar vehicles to a given car.
 * Criteria: same brand, similar price range, same fuel, same transmission.
 * Excludes the current car. Maximum limit (default 4).
 * Prefers active listings only.
 *
 * @param {Object} currentCar
 * @param {number} [limit=4]
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchSimilarCars(currentCar, limit = 4) {
  if (!currentCar || !currentCar.id) return { data: [], error: null }

  try {
    // 1. Try matching same brand and active status
    let query = supabase
      .from('cars')
      .select('*')
      .eq('status', 'active')
      .neq('id', currentCar.id)

    if (currentCar.brand) {
      query = query.ilike('brand', currentCar.brand)
    }

    const { data: brandMatches } = await query.limit(limit)
    let results = (brandMatches || []).map(mapSupabaseCar)

    // 2. If fewer than limit, fetch other active cars (matching fuel or transmission)
    if (results.length < limit) {
      const remaining = limit - results.length
      const existingIds = [currentCar.id, ...results.map((c) => c.id)]

      let fallbackQuery = supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .not('id', 'in', `(${existingIds.map((id) => `"${id}"`).join(',')})`)

      if (currentCar.fuel_type || currentCar.fuel) {
        fallbackQuery = fallbackQuery.eq('fuel_type', currentCar.fuel_type || currentCar.fuel)
      }

      const { data: fallbackMatches } = await fallbackQuery.limit(remaining)
      if (fallbackMatches && fallbackMatches.length > 0) {
        results = [...results, ...fallbackMatches.map(mapSupabaseCar)]
      }

      // 3. If still fewer than limit, fetch any other active cars
      if (results.length < limit) {
        const stillRemaining = limit - results.length
        const allExistingIds = [currentCar.id, ...results.map((c) => c.id)]
        const { data: anyMatches } = await supabase
          .from('cars')
          .select('*')
          .eq('status', 'active')
          .not('id', 'in', `(${allExistingIds.map((id) => `"${id}"`).join(',')})`)
          .limit(stillRemaining)

        if (anyMatches && anyMatches.length > 0) {
          results = [...results, ...anyMatches.map(mapSupabaseCar)]
        }
      }
    }

    return { data: results.slice(0, limit), error: null }
  } catch (err) {
    console.warn('[Cardom Supabase] fetchSimilarCars fallback to local:', err)
    const local = FEATURED_CARS
      .filter((c) => c.id !== currentCar.id)
      .slice(0, limit)
      .map(mapSupabaseCar)
    return { data: local, error: null }
  }
}
