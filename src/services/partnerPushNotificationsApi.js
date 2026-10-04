import { supabase } from '@/lib/supabase'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

let _tokenRegisteredCallback = null
let _notificationActionCallback = null
let _initialized = false
let _currentToken = null

/**
 * Request permission and register for FCM push notifications.
 * Must be called after partner successfully authenticates.
 * @param {Function} [onTokenRegistered] - called with token string
 * @param {Function} [onNotificationAction] - called when user taps notification
 */
export async function initializePartnerPushNotifications(onTokenRegistered, onNotificationAction) {
  if (!isNative) return { success: false, reason: 'not_native' }
  if (_initialized) return { success: true, reason: 'already_initialized' }

  try {
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[PartnerPush] Permission denied')
      return { success: false, reason: 'permission_denied' }
    }

    // Create Android notification channels
    try {
      await PushNotifications.createChannel({
        id: 'cardom_rides',
        name: 'New Ride Offers & Alerts',
        description: 'Urgent incoming ride dispatch offers',
        importance: 5, // IMPORTANCE_HIGH (Heads up notification)
        visibility: 1,
        vibration: true,
      })
      await PushNotifications.createChannel({
        id: 'cardom_general',
        name: 'Partner Updates',
        description: 'Ratings, reviews, and general notifications',
        importance: 4,
        visibility: 1,
        vibration: true,
      })
    } catch (e) {
      console.warn('[PartnerPush] Channel creation error (non-fatal):', e)
    }

    _tokenRegisteredCallback = onTokenRegistered
    _notificationActionCallback = onNotificationAction

    await _registerPartnerListeners()

    await PushNotifications.register()

    _initialized = true
    return { success: true }
  } catch (err) {
    console.error('[PartnerPush] Initialization error:', err)
    return { success: false, reason: err.message }
  }
}

/**
 * Cleanup listeners on logout.
 */
export async function cleanupPartnerPushNotifications() {
  if (!isNative) return
  try {
    await PushNotifications.removeAllListeners()
    _initialized = false
    _tokenRegisteredCallback = null
    _notificationActionCallback = null
  } catch (err) {
    console.warn('[PartnerPush] Cleanup error:', err)
  }
}

/**
 * Save FCM token to Supabase via secure RPC.
 * @param {string} token
 */
export async function savePartnerPushToken(token) {
  if (!token) return { success: false }
  try {
    const { data, error } = await supabase.rpc('register_push_token', {
      p_token: token,
      p_app_type: 'partner',
      p_platform: 'android',
    })
    if (error) {
      console.error('[PartnerPush] Failed to save token:', error.message)
      return { success: false, error: error.message }
    }
    _currentToken = token
    return { success: true, data }
  } catch (err) {
    console.error('[PartnerPush] savePartnerPushToken error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Deactivate the current device's push token on logout.
 */
export async function deactivatePartnerPushToken() {
  try {
    if (_currentToken) {
      await supabase.rpc('remove_push_token', { p_token: _currentToken })
    } else {
      await supabase.rpc('deactivate_my_push_tokens', { p_app_type: 'partner' })
    }
    _currentToken = null
  } catch (err) {
    console.warn('[PartnerPush] deactivate error:', err)
  }
}

export function getCurrentPartnerPushToken() {
  return _currentToken
}

// ── Private: listeners ────────────────────────────────────────
async function _registerPartnerListeners() {
  await PushNotifications.addListener('registration', (token) => {
    console.log('[PartnerPush] Token received:', token.value)
    _currentToken = token.value
    if (_tokenRegisteredCallback) {
      _tokenRegisteredCallback(token.value)
    }
  })

  await PushNotifications.addListener('registrationError', (err) => {
    console.error('[PartnerPush] Registration error:', err)
  })

  // Foreground: do not duplicate the existing realtime notification system
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[PartnerPush] Foreground push received (handled by realtime):', notification.data)
  })

  // Notification tap — route to correct screen
  await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data || {}
    console.log('[PartnerPush] Notification tapped:', data)
    if (_notificationActionCallback) {
      _notificationActionCallback(data)
    }
  })
}
