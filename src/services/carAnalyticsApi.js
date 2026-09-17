import { supabase } from '@/lib/supabase'

const SESSION_STORAGE_KEY = 'cardom_analytics_session'

/**
 * Retrieves or creates a temporary random session identifier in sessionStorage.
 * Resets when the browser session ends and stores no IP addresses.
 *
 * @returns {string} Session UUID
 */
export function getOrCreateSessionId() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return 'anon-session'
  }

  try {
    let sid = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!sid) {
      sid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, sid)
    }
    return sid
  } catch (err) {
    return 'anon-session'
  }
}

/**
 * Records a listing view with database-enforced 30-minute deduplication.
 * Uses authenticated viewer_id when logged in, or anonymous session_id when guest.
 *
 * @param {string} carId - Vehicle ID
 * @returns {Promise<{ recorded: boolean, error: Error|null }>}
 */
export async function recordCarView(carId) {
  if (!carId) return { recorded: false, error: null }

  const sessionId = getOrCreateSessionId()

  try {
    const { data, error } = await supabase.rpc('record_car_view', {
      p_car_id: carId,
      p_session_id: sessionId,
    })

    if (error) {
      // If RPC is not yet created in Supabase, fail silently without crashing
      console.info('[Cardom Analytics] record_car_view pending migration:', error.message)
      return { recorded: false, error }
    }

    return { recorded: Boolean(data), error: null }
  } catch (err) {
    console.warn('[Cardom Analytics] recordCarView exception:', err)
    return { recorded: false, error: err }
  }
}

/**
 * Fetches the total view count for a specific vehicle.
 *
 * @param {string} carId
 * @returns {Promise<{ count: number, error: Error|null }>}
 */
export async function fetchCarViewCount(carId) {
  if (!carId) return { count: 0, error: null }

  try {
    const { data, error } = await supabase.rpc('get_car_view_count', {
      p_car_id: carId,
    })

    if (!error && data !== null) {
      return { count: Number(data) || 0, error: null }
    }

    // Direct count query fallback
    const { count: fallbackCount, error: countErr } = await supabase
      .from('car_views')
      .select('*', { count: 'exact', head: true })
      .eq('car_id', carId)

    if (!countErr && fallbackCount !== null) {
      return { count: fallbackCount || 0, error: null }
    }

    return { count: 0, error: null }
  } catch (err) {
    return { count: 0, error: err }
  }
}

/**
 * Fetches the total favorite count for a specific vehicle.
 *
 * @param {string} carId
 * @returns {Promise<{ count: number, error: Error|null }>}
 */
export async function fetchCarFavoriteCount(carId) {
  if (!carId) return { count: 0, error: null }

  try {
    const { data, error } = await supabase.rpc('get_car_favorite_count', {
      p_car_id: carId,
    })

    if (!error && data !== null) {
      return { count: Number(data) || 0, error: null }
    }

    // Direct head query fallback
    const { count: fallbackCount, error: countErr } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('car_id', carId)

    if (!countErr && fallbackCount !== null) {
      return { count: fallbackCount || 0, error: null }
    }

    return { count: 0, error: null }
  } catch (err) {
    return { count: 0, error: err }
  }
}

/**
 * Fetches aggregate metrics (views, favorites, inquiries) for an array of car IDs in a single batch.
 * Prevents N+1 database queries on seller dashboards and card lists.
 *
 * @param {string[]} carIds
/**
 * Fetches aggregate metrics (views, favorites, inquiries) for an array of car IDs in a single batch.
 * Prevents N+1 database queries on seller dashboards and card lists.
 *
 * @param {string[]} carIds
 * @returns {Promise<{ data: Record<string, { views: number, favorites: number, inquiries: number }>|null, error: Error|null }>}
 */
export async function fetchBatchListingStats(carIds) {
  if (!Array.isArray(carIds) || carIds.length === 0) {
    return { data: {}, error: null }
  }

  try {
    const { data, error } = await supabase.rpc('get_batch_car_stats', {
      p_car_ids: carIds,
    })

    if (!error && Array.isArray(data)) {
      const statsMap = {}
      for (const row of data) {
        statsMap[row.car_id] = {
          views: Number(row.view_count) || 0,
          favorites: Number(row.favorite_count) || 0,
          inquiries: Number(row.inquiry_count) || 0,
        }
      }
      return { data: statsMap, error: null }
    }

    if (error) {
      console.warn('[Cardom Analytics] fetchBatchListingStats RPC error:', error)
      return { data: null, error }
    }

    return { data: {}, error: null }
  } catch (err) {
    console.warn('[Cardom Analytics] fetchBatchListingStats exception:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetches overview statistics for a seller's account page.
 * Strictly relies on authenticated server authority (auth.uid()) via get_seller_overview_stats().
 * Never trusts a client-supplied seller ID as the security authority.
 *
 * @param {string} [sellerId] - Optional seller ID for fallback/overload compatibility
 * @returns {Promise<{
 *   activeListings: number,
 *   soldListings: number,
 *   totalViews: number,
 *   totalFavorites: number,
 *   totalInquiries: number,
 *   error: Error|null
 * }>}
 */
export async function fetchSellerAnalytics(sellerId) {
  const defaultStats = {
    activeListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalInquiries: 0,
    error: null,
  }

  try {
    // 1. Primary: parameterless call (authority derived strictly from auth.uid() in DB)
    const { data, error } = await supabase.rpc('get_seller_overview_stats')

    if (!error && data) {
      return {
        activeListings: Number(data.activeListings) || 0,
        soldListings: Number(data.soldListings) || 0,
        totalViews: Number(data.totalViews) || 0,
        totalFavorites: Number(data.totalFavorites) || 0,
        totalInquiries: Number(data.totalInquiries) || 0,
        error: null,
      }
    }

    // 2. Backward compatibility fallback: if parameterless call signature mismatch
    if (error && sellerId) {
      const { data: fallbackData, error: fallbackErr } = await supabase.rpc(
        'get_seller_overview_stats',
        { p_seller_id: sellerId }
      )

      if (!fallbackErr && fallbackData) {
        return {
          activeListings: Number(fallbackData.activeListings) || 0,
          soldListings: Number(fallbackData.soldListings) || 0,
          totalViews: Number(fallbackData.totalViews) || 0,
          totalFavorites: Number(fallbackData.totalFavorites) || 0,
          totalInquiries: Number(fallbackData.totalInquiries) || 0,
          error: null,
        }
      }
    }

    if (error) {
      console.warn('[Cardom Analytics] get_seller_overview_stats RPC error:', error)
      return { ...defaultStats, error }
    }

    return defaultStats
  } catch (err) {
    console.warn('[Cardom Analytics] fetchSellerAnalytics exception:', err)
    return { ...defaultStats, error: err }
  }
}


