// Supabase Edge Function: send-fcm-notification
// Receives notification events (via database webhook or direct invoke),
// fetches target device tokens, and sends FCM HTTP v1 push notifications.
//
// SECURITY:
// - Firebase private credentials stored ONLY in Supabase project secrets
// - Service role Supabase key used ONLY here (never in client code)
// - Token data never exposed to clients
//
// Required Supabase Secrets:
//   FCM_PROJECT_ID      - your Firebase project ID
//   FCM_CLIENT_EMAIL    - service account email
//   FCM_PRIVATE_KEY     - service account private key (with real \n newlines)
//   SUPABASE_URL        - your Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for server operations)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FCM_PROJECT_ID = Deno.env.get('FCM_PROJECT_ID')!
const FCM_CLIENT_EMAIL = Deno.env.get('FCM_CLIENT_EMAIL')!
const FCM_PRIVATE_KEY = Deno.env.get('FCM_PRIVATE_KEY')!

// ── Types ────────────────────────────────────────────────────
interface NotificationEvent {
  type: 'record'
  table: string
  record: {
    id: string
    user_id: string | null
    partner_id: string | null
    type: string
    title: string
    message: string
    ride_id: string | null
    is_read: boolean
    created_at: string
    event_key: string | null
  }
}

// ── FCM OAuth2 Token via JWT ─────────────────────────────────
async function getFcmAccessToken(): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: FCM_CLIENT_EMAIL,
    sub: FCM_CLIENT_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  }

  const toBase64Url = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const headerEncoded = toBase64Url(header)
  const payloadEncoded = toBase64Url(payload)
  const signingInput = `${headerEncoded}.${payloadEncoded}`

  // Import RSA private key
  const privateKeyPem = FCM_PRIVATE_KEY.replace(/\\n/g, '\n')
  const pemBody = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '')
  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(signingInput))
  const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const jwt = `${signingInput}.${signatureEncoded}`

  // Exchange JWT for OAuth2 access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`FCM OAuth token error: ${err}`)
  }

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

// ── Send FCM HTTP v1 Message ─────────────────────────────────
async function sendFcmMessage(
  accessToken: string,
  deviceToken: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<{ success: boolean; invalidToken?: boolean; error?: string }> {
  const message = {
    message: {
      token: deviceToken,
      notification: { title, body },
      data,
      android: {
        priority: 'HIGH',
        notification: {
          channel_id: data.type === 'new_ride_offer' ? 'cardom_rides' : 'cardom_general',
          priority: data.type === 'new_ride_offer' ? 'MAX' : 'HIGH',
          default_vibrate_timings: true,
          default_sound: true,
        },
      },
    },
  }

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(message),
    }
  )

  if (res.ok) {
    return { success: true }
  }

  const errBody = await res.json().catch(() => ({ error: { status: 'UNKNOWN' } }))
  const errStatus = errBody?.error?.status || ''

  if (errStatus === 'UNREGISTERED' || errStatus === 'INVALID_ARGUMENT') {
    return { success: false, invalidToken: true, error: errStatus }
  }

  return { success: false, error: errStatus || 'FCM_ERROR' }
}

// ── Main Handler ─────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // Accept POST only
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    // Validate that request comes from Supabase (DB webhook or internal call)
    // Database webhooks send a shared secret in the Authorization header
    const authHeader = req.headers.get('Authorization') || ''
    const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || ''
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json() as NotificationEvent

    // Support direct payload or DB webhook format
    const record = body.record || body as unknown as NotificationEvent['record']

    if (!record?.id || !record?.title) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_record' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Determine target user
    const targetUserId = record.user_id || record.partner_id
    const appType = record.user_id ? 'user' : 'partner'

    if (!targetUserId) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_target_user' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch active device tokens for this user
    const { data: tokens, error: tokenError } = await supabase
      .from('device_push_tokens')
      .select('id, token')
      .eq('user_id', targetUserId)
      .eq('app_type', appType)
      .eq('is_active', true)

    if (tokenError) {
      console.error('Failed to fetch tokens:', tokenError.message)
      return new Response(JSON.stringify({ ok: false, error: tokenError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_active_tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get FCM access token once for all messages
    const accessToken = await getFcmAccessToken()

    // Build data payload (minimum safe data, no PII)
    const notifData: Record<string, string> = {
      notification_id: record.id,
      type: record.type || 'general',
      app_type: appType,
      target_route: getTargetRoute(record.type, record.ride_id, appType),
    }
    if (record.ride_id) notifData.ride_id = record.ride_id

    // Send to all active devices
    const results = await Promise.allSettled(
      tokens.map(async (tokenRow) => {
        const result = await sendFcmMessage(
          accessToken,
          tokenRow.token,
          record.title,
          record.message,
          notifData
        )

        // If token is invalid, mark it inactive
        if (result.invalidToken) {
          await supabase
            .from('device_push_tokens')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', tokenRow.id)
          console.log('Marked invalid token:', tokenRow.id)
        }

        // Record delivery attempt
        try {
          await supabase.from('push_notification_deliveries').upsert({
            notification_id: record.id,
            device_token_id: tokenRow.id,
            status: result.success ? 'sent' : (result.invalidToken ? 'invalid_token' : 'failed'),
            attempts: 1,
            sent_at: result.success ? new Date().toISOString() : null,
            error_message: result.error || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'notification_id,device_token_id' })
        } catch (e) {
          console.warn('Failed to record delivery:', e)
        }

        return result
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length
    return new Response(JSON.stringify({ ok: true, sent, total: tokens.length }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge Function error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// ── Route helper ──────────────────────────────────────────────
function getTargetRoute(type: string, rideId: string | null, appType: string): string {
  if (appType === 'partner') {
    if (type === 'new_ride_offer') return '/rides'
    if (type === 'customer_marked_paid') return rideId ? `/rides/${rideId}` : '/rides'
    if (type === 'rating_received') return '/notifications'
    return '/dashboard'
  }

  // User routes
  if (rideId && ['driver_assigned', 'arriving', 'started', 'completed', 'cancelled',
                  'payment_confirmed', 'rating_reminder'].includes(type)) {
    return `/ride/${rideId}`
  }
  return '/bookings'
}
