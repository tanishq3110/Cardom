import { supabase } from '@/lib/supabase'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

// Only runs on native Android/iOS
const isNative = Capacitor.isNativePlatform()

let _tokenRegisteredCallback = null
let _notificationActionCallback = null
let _initialized = false

/**
 * Request notification permission and register for push notifications.
 * Should be called once after user signs in.
 * @param {Function} [onTokenRegistered] - called with token string when FCM token received
 * @param {Function} [onNotificationAction] - called with notification data when user taps notification
 */
export async function initializePushNotifications(onTokenRegistered, onNotificationAction) {
  if (!isNative) return { success: false, reason: 'not_native' }
  if (_initialized) return { success: true, reason: 'already_initialized' }

  try {
    // 1. Check/request permission
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[PushNotifications] Permission denied')
      return { success: false, reason: 'permission_denied' }
    }

    // 2. Create Android notification channels
    try {
      await PushNotifications.createChannel({
        id: 'cardom_rides',
        name: 'Ride Updates',
        description: 'Critical updates about your rides and drivers',
        importance: 5, // IMPORTANCE_HIGH
        visibility: 1, // VISIBILITY_PUBLIC
        vibration: true,
      })
      await PushNotifications.createChannel({
        id: 'cardom_general',
        name: 'General Updates',
        description: 'Account, payment, and promotions',
        importance: 4,
        visibility: 1,
        vibration: true,
      })
    } catch (e) {
      console.warn('[PushNotifications] Channel creation error (non-fatal):', e)
    }

    // 3. Store callbacks
    _tokenRegisteredCallback = onTokenRegistered
    _notificationActionCallback = onNotificationAction

    // 4. Register listeners before registering with FCM
    await _registerListeners()

    // 5. Register with FCM / APNs
    await PushNotifications.register()

    _initialized = true
    return { success: true }
  } catch (err) {
    console.error('[PushNotifications] Initialization error:', err)
    return { success: false, reason: err.message }
  }
}


/**
 * Remove all push notification listeners and reset state.
 * Call on logout.
 */
export async function cleanupPushNotifications() {
  if (!isNative) return
  try {
    await PushNotifications.removeAllListeners()
    _initialized = false
    _tokenRegisteredCallback = null
    _notificationActionCallback = null
  } catch (err) {
    console.warn('[PushNotifications] Cleanup error:', err)
  }
}

/**
 * Save FCM token to Supabase via secure RPC.
 * @param {string} token - FCM device token
 * @param {string} appType - 'user' or 'partner'
 */
export async function savePushToken(token, appType = 'user') {
  if (!token) return { success: false }
  try {
    const { data, error } = await supabase.rpc('register_push_token', {
      p_token: token,
      p_app_type: appType,
      p_platform: 'android',
    })
    if (error) {
      console.error('[PushNotifications] Failed to save token:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, data }
  } catch (err) {
    console.error('[PushNotifications] savePushToken error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Deactivate the current device's push token on logout.
 * @param {string} token - current FCM token to deactivate
 * @param {string} appType - 'user' or 'partner'
 */
export async function deactivatePushToken(token, appType = 'user') {
  if (!token) {
    // Deactivate all tokens for this app type
    try {
      await supabase.rpc('deactivate_my_push_tokens', { p_app_type: appType })
    } catch (err) {
      console.warn('[PushNotifications] deactivate error:', err)
    }
    return
  }

  try {
    await supabase.rpc('remove_push_token', { p_token: token })
  } catch (err) {
    console.warn('[PushNotifications] remove_push_token error:', err)
  }
}

// Internal: current token for cleanup on logout
let _currentToken = null

export function getCurrentPushToken() {
  return _currentToken
}

// ── Private: register FCM listeners ─────────────────────────
async function _registerListeners() {
  // Token registered (new or refreshed)
  await PushNotifications.addListener('registration', (token) => {
    console.log('[PushNotifications] Token received:', token.value)
    _currentToken = token.value
    if (_tokenRegisteredCallback) {
      _tokenRegisteredCallback(token.value)
    }
  })

  // Registration error
  await PushNotifications.addListener('registrationError', (err) => {
    console.error('[PushNotifications] Registration error:', err)
  })

  // Push received while app is in foreground
  // We intentionally do NOT show a native notification here — Supabase Realtime
  // already handles in-app toast notifications when the app is open.
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[PushNotifications] Foreground push received:', notification.data)
    // Let existing Supabase Realtime handle in-app toasts
  })

  // User tapped a notification
  await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data || {}
    console.log('[PushNotifications] Notification tapped:', data)
    if (_notificationActionCallback) {
      _notificationActionCallback(data)
    }
  })
}
