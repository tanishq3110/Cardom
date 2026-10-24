/**
 * Unit tests for send-fcm-notification — authentication guard.
 *
 * Run with:
 *   deno test --allow-env supabase/functions/send-fcm-notification/index.test.ts
 *
 * These tests exercise only the authentication layer. They do not make live
 * FCM or Supabase calls; the Deno.env and fetch are stubbed per-test.
 *
 * Scenarios:
 *   1. WEBHOOK_SECRET is not set (empty) → 401 for any request.
 *   2. WEBHOOK_SECRET is set, Authorization header is absent → 401.
 *   3. WEBHOOK_SECRET is set, Authorization header is wrong → 401.
 *   4. WEBHOOK_SECRET is set, Authorization header is correct → request passes
 *      auth and the handler proceeds (returns non-401 status).
 */

import { assertEquals } from 'jsr:@std/assert'

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_SECRET = 'super-secret-test-value-abc123'

/**
 * The notification payload that satisfies the handler's record validation so
 * that an authenticated request does not immediately short-circuit to
 * `skipped: no_record`. Because we stub fetch, no real network call is made.
 */
const VALID_BODY = JSON.stringify({
  record: {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    partner_id: null,
    type: 'driver_assigned',
    title: 'Driver Assigned',
    message: 'Your driver has been assigned.',
    ride_id: '00000000-0000-0000-0000-000000000003',
    is_read: false,
    created_at: new Date().toISOString(),
    event_key: null,
  },
})

/** Build an environment map that the stub will serve via Deno.env.get(). */
function buildEnv(overrides: Record<string, string | undefined> = {}): Record<string, string> {
  return {
    WEBHOOK_SECRET: VALID_SECRET,
    FCM_PROJECT_ID: 'test-firebase-project',
    FCM_CLIENT_EMAIL: 'test@test-firebase-project.iam.gserviceaccount.com',
    FCM_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----\n',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-placeholder',
    ...overrides,
  }
}

/**
 * Dynamically import the handler module with a per-test Deno.env stub.
 *
 * Because the module reads env vars at the top level, we must re-import it
 * with a fresh module cache for each test. Deno module caching is scoped to
 * the module specifier, so we append a unique query param to force a reload.
 *
 * The returned `handler` is the exported default fetch handler extracted from
 * the Deno.serve() call by monkey-patching Deno.serve before import.
 */
async function importHandlerWithEnv(
  env: Record<string, string>,
): Promise<(req: Request) => Promise<Response>> {
  // Stub Deno.env.get
  const originalGet = Deno.env.get.bind(Deno.env)
  Deno.env.get = (key: string) => env[key] ?? undefined

  let capturedHandler: ((req: Request) => Promise<Response>) | null = null

  // Stub Deno.serve to capture the handler instead of actually binding a port
  const originalServe = Deno.serve.bind(Deno)
  // @ts-ignore – intentional stub
  Deno.serve = (handler: (req: Request) => Promise<Response>) => {
    capturedHandler = handler
    return { shutdown: () => Promise.resolve() }
  }

  // Stub globalThis.fetch so no real network calls are made for authenticated
  // requests that reach the FCM / Supabase code paths.
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    // Return a plausible Supabase "no rows" response for device_push_tokens
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Force a fresh module load by appending a unique cache-busting param.
    await import(`./index.ts?test=${Math.random()}`)
  } finally {
    // Restore originals regardless of import outcome.
    Deno.env.get = originalGet
    // @ts-ignore – restore
    Deno.serve = originalServe
    globalThis.fetch = originalFetch
  }

  if (!capturedHandler) {
    throw new Error('Deno.serve was not called by the module — handler not captured.')
  }

  return capturedHandler!
}

// ── Tests ─────────────────────────────────────────────────────────────────────

Deno.test('auth: WEBHOOK_SECRET not configured → 401 for any POST', async () => {
  const handler = await importHandlerWithEnv(buildEnv({ WEBHOOK_SECRET: undefined }))

  const req = new Request('http://localhost/', {
    method: 'POST',
    body: VALID_BODY,
    headers: { 'Content-Type': 'application/json' },
  })

  const res = await handler(req)
  assertEquals(res.status, 401, 'Expected 401 when WEBHOOK_SECRET is absent')
})

Deno.test('auth: WEBHOOK_SECRET configured, Authorization header absent → 401', async () => {
  const handler = await importHandlerWithEnv(buildEnv())

  const req = new Request('http://localhost/', {
    method: 'POST',
    body: VALID_BODY,
    headers: { 'Content-Type': 'application/json' },
    // No Authorization header
  })

  const res = await handler(req)
  assertEquals(res.status, 401, 'Expected 401 when Authorization header is absent')
})

Deno.test('auth: WEBHOOK_SECRET configured, wrong Authorization value → 401', async () => {
  const handler = await importHandlerWithEnv(buildEnv())

  const req = new Request('http://localhost/', {
    method: 'POST',
    body: VALID_BODY,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer wrong-secret-value',
    },
  })

  const res = await handler(req)
  assertEquals(res.status, 401, 'Expected 401 for an incorrect secret')
})

Deno.test('auth: correct Authorization header → request passes auth (non-401)', async () => {
  const handler = await importHandlerWithEnv(buildEnv())

  const req = new Request('http://localhost/', {
    method: 'POST',
    body: VALID_BODY,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VALID_SECRET}`,
    },
  })

  const res = await handler(req)
  // The function proceeds past auth. With a stubbed fetch that returns no
  // device tokens, it will return 200 { ok: true, skipped: 'no_active_tokens' }.
  // We only assert it is not a 401.
  assertEquals(
    res.status !== 401,
    true,
    `Expected non-401 for a correctly authenticated request, got ${res.status}`,
  )
})

Deno.test('auth: non-POST method → 405 regardless of auth', async () => {
  const handler = await importHandlerWithEnv(buildEnv())

  const req = new Request('http://localhost/', {
    method: 'GET',
    headers: { Authorization: `Bearer ${VALID_SECRET}` },
  })

  const res = await handler(req)
  assertEquals(res.status, 405, 'Expected 405 for non-POST method')
})

