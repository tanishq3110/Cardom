import { supabase } from '@/lib/supabase'
import { mapSupabaseCar } from '@/services/carsApi'

/**
 * Fetches all favorites for a user from public.favorites.
 * Joins with the cars table if foreign key is available.
 *
 * @param {string} userId
 * @returns {Promise<{ data: Array<{ id: string, car_id: string, car: Object|null }>, carIds: string[], error: Error|null }>}
 */
export async function fetchFavorites(userId) {
  if (!userId) return { data: [], carIds: [], error: null }

  try {
    // Attempt query with joined cars data
    const { data, error } = await supabase
      .from('favorites')
      .select('id, car_id, created_at, cars(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      // If joined query fails, fall back to simple select of favorites
      console.warn('[Cardom Favorites] Joined query failed, trying simple select:', error.message)
      const { data: simpleData, error: simpleError } = await supabase
        .from('favorites')
        .select('id, car_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (simpleError) {
        return { data: [], carIds: [], error: simpleError }
      }

      const carIds = (simpleData || []).map((item) => String(item.car_id))
      return {
        data: (simpleData || []).map((item) => ({
          id: item.id,
          car_id: String(item.car_id),
          car: null,
          created_at: item.created_at,
        })),
        carIds,
        error: null,
      }
    }

    const formatted = (data || []).map((item) => ({
      id: item.id,
      car_id: String(item.car_id),
      car: item.cars ? mapSupabaseCar(item.cars) : null,
      created_at: item.created_at,
    }))

    const carIds = formatted.map((item) => String(item.car_id))
    return { data: formatted, carIds, error: null }
  } catch (err) {
    console.error('[Cardom Favorites] Unexpected error in fetchFavorites:', err)
    return { data: [], carIds: [], error: err }
  }
}

/**
 * Checks if a specific car is favorited by the user.
 *
 * @param {string} userId
 * @param {string} carId
 * @returns {Promise<{ isFav: boolean, error: Error|null }>}
 */
export async function isFavorite(userId, carId) {
  if (!userId || !carId) return { isFav: false, error: null }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('car_id', carId)
      .maybeSingle()

    if (error) return { isFav: false, error }
    return { isFav: Boolean(data), error: null }
  } catch (err) {
    return { isFav: false, error: err }
  }
}

/**
 * Adds a car to user's favorites in public.favorites.
 *
 * @param {string} userId
 * @param {string} carId
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function addFavorite(userId, carId) {
  if (!userId || !carId) return { data: null, error: new Error('User ID and Car ID required') }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        car_id: carId,
      })
      .select()
      .single()

    if (error) {
      // If error is unique constraint violation, user already favorited it
      if (error.code === '23505') {
        return { data: null, error: null }
      }
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[Cardom Favorites] Error adding favorite:', err)
    return { data: null, error: err }
  }
}

/**
 * Removes a car from user's favorites in public.favorites.
 *
 * @param {string} userId
 * @param {string} carId
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function removeFavorite(userId, carId) {
  if (!userId || !carId) return { success: false, error: new Error('User ID and Car ID required') }

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('car_id', carId)

    if (error) return { success: false, error }
    return { success: true, error: null }
  } catch (err) {
    console.error('[Cardom Favorites] Error removing favorite:', err)
    return { success: false, error: err }
  }
}

/**
 * Toggles a car favorite state for a user.
 *
 * @param {string} userId
 * @param {string} carId
 * @param {boolean} currentlyFavorited
 * @returns {Promise<{ isFavorited: boolean, error: Error|null }>}
 */
export async function toggleFavorite(userId, carId, currentlyFavorited) {
  if (currentlyFavorited) {
    const { success, error } = await removeFavorite(userId, carId)
    if (error) return { isFavorited: true, error }
    return { isFavorited: false, error: null }
  } else {
    const { error } = await addFavorite(userId, carId)
    if (error) return { isFavorited: false, error }
    return { isFavorited: true, error: null }
  }
}

