import { supabase } from '@/lib/supabase'
import { mapSupabaseCar } from '@/services/carsApi'

/**
 * Normalizes an inquiry row into a structured object for the Cardom UI.
 */
export function mapInquiry(row) {
  if (!row) return null

  const car = row.cars ? mapSupabaseCar(row.cars) : null
  const buyer = row.buyer_profile || null

  return {
    id: row.id,
    car_id: row.car_id,
    buyer_id: row.buyer_id,
    seller_id: row.seller_id,
    message: row.message || '',
    phone: row.phone || buyer?.phone || '',
    status: row.status || 'unread', // 'unread' | 'read' | 'archived'
    created_at: row.created_at,
    updated_at: row.updated_at,
    car: car || {
      id: row.car_id,
      brand: 'Vehicle',
      model: 'Listing',
      year: new Date().getFullYear(),
      price: 0,
      image_url: '',
      location: 'India',
    },
    buyer: {
      id: row.buyer_id,
      name: buyer?.full_name || 'Cardom Buyer',
      email: buyer?.email || '',
      avatar_url: buyer?.avatar_url || '',
      phone: row.phone || buyer?.phone || '',
    },
  }
}

/**
 * Submits a new inquiry from an authenticated buyer to a car's seller.
 *
 * @param {Object} params
 * @param {string} params.carId
 * @param {string} params.buyerId
 * @param {string} params.sellerId
 * @param {string} params.message
 * @param {string} [params.phone]
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function createInquiry({ carId, buyerId, sellerId, message, phone }) {
  if (!carId) {
    return { data: null, error: new Error('Car ID is required.') }
  }
  if (!buyerId) {
    return { data: null, error: new Error('Buyer authentication is required.') }
  }
  if (!sellerId) {
    return { data: null, error: new Error('Seller information is missing for this vehicle.') }
  }
  if (!message || !message.trim()) {
    return { data: null, error: new Error('Please enter a message for the seller.') }
  }
  if (message.trim().length > 1000) {
    return { data: null, error: new Error('Message cannot exceed 1000 characters.') }
  }

  try {
    const payload = {
      car_id: carId,
      buyer_id: buyerId,
      seller_id: sellerId,
      message: message.trim(),
      phone: phone?.trim() || null,
      status: 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('inquiries')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[Cardom Inquiries] createInquiry error:', error.message)
      return { data: null, error }
    }

    return { data: mapInquiry(data), error: null }
  } catch (err) {
    console.error('[Cardom Inquiries] createInquiry exception:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetches all inquiries received by a seller for their vehicles.
 *
 * @param {string} sellerId
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchSellerInquiries(sellerId) {
  if (!sellerId) return { data: [], error: null }

  try {
    // 1. Fetch inquiries with joined car data
    const { data: inquiriesData, error: inquiriesErr } = await supabase
      .from('inquiries')
      .select(`
        *,
        cars:car_id (
          id,
          brand,
          model,
          year,
          price,
          fuel_type,
          transmission,
          mileage,
          location,
          image_url,
          status
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (inquiriesErr) {
      console.error('[Cardom Inquiries] fetchSellerInquiries error:', inquiriesErr.message)
      return { data: [], error: inquiriesErr }
    }

    if (!inquiriesData || inquiriesData.length === 0) {
      return { data: [], error: null }
    }

    // 2. Fetch corresponding buyer profiles to attach buyer details
    const buyerIds = [...new Set(inquiriesData.map((i) => i.buyer_id).filter(Boolean))]
    let profilesMap = {}

    if (buyerIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone')
        .in('id', buyerIds)

      if (profilesData) {
        profilesMap = profilesData.reduce((acc, p) => {
          acc[p.id] = p
          return acc
        }, {})
      }
    }

    // 3. Assemble complete mapped inquiries
    const mapped = inquiriesData.map((row) => ({
      ...row,
      buyer_profile: profilesMap[row.buyer_id] || null,
    }))

    return { data: mapped.map(mapInquiry), error: null }
  } catch (err) {
    console.error('[Cardom Inquiries] fetchSellerInquiries exception:', err)
    return { data: [], error: err }
  }
}

/**
 * Fetches all inquiries sent by a buyer.
 *
 * @param {string} buyerId
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchBuyerInquiries(buyerId) {
  if (!buyerId) return { data: [], error: null }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        cars:car_id (
          id,
          brand,
          model,
          year,
          price,
          fuel_type,
          transmission,
          mileage,
          location,
          image_url,
          status
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Cardom Inquiries] fetchBuyerInquiries error:', error.message)
      return { data: [], error }
    }

    return { data: (data || []).map(mapInquiry), error: null }
  } catch (err) {
    console.error('[Cardom Inquiries] fetchBuyerInquiries exception:', err)
    return { data: [], error: err }
  }
}

/**
 * Marks an inquiry as read (only permitted for the seller who owns the inquiry).
 *
 * @param {string} inquiryId
 * @param {string} sellerId
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function markInquiryAsRead(inquiryId, sellerId) {
  if (!inquiryId || !sellerId) {
    return { success: false, error: new Error('Inquiry ID and Seller ID required.') }
  }

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({
        status: 'read',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)
      .eq('seller_id', sellerId)

    if (error) {
      console.error('[Cardom Inquiries] markInquiryAsRead error:', error.message)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[Cardom Inquiries] markInquiryAsRead exception:', err)
    return { success: false, error: err }
  }
}

/**
 * Archives an inquiry (only permitted for the seller).
 *
 * @param {string} inquiryId
 * @param {string} sellerId
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function archiveInquiry(inquiryId, sellerId) {
  if (!inquiryId || !sellerId) {
    return { success: false, error: new Error('Inquiry ID and Seller ID required.') }
  }

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)
      .eq('seller_id', sellerId)

    if (error) {
      console.error('[Cardom Inquiries] archiveInquiry error:', error.message)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[Cardom Inquiries] archiveInquiry exception:', err)
    return { success: false, error: err }
  }
}

/**
 * Unarchives an inquiry back to read status.
 *
 * @param {string} inquiryId
 * @param {string} sellerId
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function unarchiveInquiry(inquiryId, sellerId) {
  return markInquiryAsRead(inquiryId, sellerId)
}

/**
 * Fetches counts of inquiries for a seller (total, unread).
 *
 * @param {string} sellerId
 * @returns {Promise<{ total: number, unread: number, error: Error|null }>}
 */
export async function fetchSellerInquiryCounts(sellerId) {
  if (!sellerId) return { total: 0, unread: 0, error: null }

  try {
    const { count: total, error: totalErr } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)

    if (totalErr) return { total: 0, unread: 0, error: totalErr }

    const { count: unread, error: unreadErr } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('status', 'unread')

    if (unreadErr) return { total: total || 0, unread: 0, error: unreadErr }

    return { total: total || 0, unread: unread || 0, error: null }
  } catch (err) {
    return { total: 0, unread: 0, error: err }
  }
}

/**
 * Fetches solely the unread inquiry count for a seller (efficient head query).
 *
 * @param {string} sellerId
 * @returns {Promise<number>}
 */
export async function fetchUnreadInquiriesCount(sellerId) {
  if (!sellerId) return 0

  try {
    const { count, error } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('status', 'unread')

    if (error) {
      console.warn('[Cardom Inquiries] fetchUnreadInquiriesCount warning:', error.message)
      return 0
    }

    return count || 0
  } catch (err) {
    return 0
  }
}

/**
 * Formats an ISO date into human-readable relative time (e.g. "5 minutes ago", "2 days ago").
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000))

  if (diffInSeconds < 45) return 'Just now'
  if (diffInSeconds < 90) return '1 minute ago'

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Subscribes to real-time changes for inquiries involving the authenticated user (as seller or buyer).
 * Automatically cleans up the channel when unsubscribed.
 *
 * @param {Object} options
 * @param {string} options.userId - Authenticated user UUID
 * @param {Function} options.onChange - Callback triggered on any INSERT or UPDATE
 * @returns {() => void} Unsubscribe cleanup function
 */
export function subscribeToInquiries({ userId, onChange }) {
  if (!userId) return () => {}

  try {
    const channelName = `realtime-inquiries-${userId}-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inquiries',
        },
        (payload) => {
          // Verify event is relevant to this user
          const sellerId = payload.new?.seller_id || payload.old?.seller_id
          const buyerId = payload.new?.buyer_id || payload.old?.buyer_id

          if (sellerId === userId || buyerId === userId) {
            if (typeof onChange === 'function') {
              onChange(payload)
            }
          }
        },
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('[Cardom Inquiries Realtime] Subscription status:', status, err.message)
        }
      })

    return () => {
      supabase.removeChannel(channel).catch(() => {})
    }
  } catch (err) {
    console.warn('[Cardom Inquiries Realtime] Could not subscribe:', err.message)
    return () => {}
  }
}

