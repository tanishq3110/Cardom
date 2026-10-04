-- ============================================================
-- PHASE 10: Push Notification Token Management
-- ============================================================

-- ── Device Push Tokens ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  token       text NOT NULL,
  platform    text NOT NULL DEFAULT 'android',
  app_type    text NOT NULL CHECK (app_type IN ('user', 'partner')),
  device_id   text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT device_push_tokens_platform_check CHECK (platform IN ('android', 'ios', 'web'))
);

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user_id     ON public.device_push_tokens(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_token       ON public.device_push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_app_type    ON public.device_push_tokens(app_type, is_active);

-- Unique token per user (prevents double registration)
CREATE UNIQUE INDEX IF NOT EXISTS uq_device_push_tokens_token ON public.device_push_tokens(token);

ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own tokens
CREATE POLICY "Users manage own push tokens"
  ON public.device_push_tokens
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Push Notification Delivery Tracking ─────────────────────
CREATE TABLE IF NOT EXISTS public.push_notification_deliveries (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id    uuid REFERENCES public.notifications(id) ON DELETE CASCADE,
  device_token_id    uuid REFERENCES public.device_push_tokens(id) ON DELETE CASCADE,
  status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'invalid_token')),
  attempts           integer NOT NULL DEFAULT 0,
  sent_at            timestamptz,
  error_message      text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_push_delivery_notification_token UNIQUE (notification_id, device_token_id)
);

CREATE INDEX IF NOT EXISTS idx_push_deliveries_notification_id ON public.push_notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_push_deliveries_status          ON public.push_notification_deliveries(status);

ALTER TABLE public.push_notification_deliveries ENABLE ROW LEVEL SECURITY;

-- Delivery records are server-managed only; no direct client access
-- Edge Function uses service role to insert/update

-- ── RPC: Register Push Token ─────────────────────────────────
-- SECURITY DEFINER: derives user_id from auth.uid(), client cannot inject another uid
CREATE OR REPLACE FUNCTION public.register_push_token(
  p_token    text,
  p_app_type text,
  p_platform text DEFAULT 'android',
  p_device_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid      uuid;
  v_existing uuid;
BEGIN
  -- Resolve caller identity
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Validate app_type
  IF p_app_type NOT IN ('user', 'partner') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid app_type');
  END IF;

  -- Upsert: if token already exists, update ownership and mark active
  INSERT INTO public.device_push_tokens (user_id, token, platform, app_type, device_id, is_active, last_seen_at, updated_at)
  VALUES (v_uid, p_token, p_platform, p_app_type, p_device_id, true, now(), now())
  ON CONFLICT (token) DO UPDATE
    SET user_id      = v_uid,
        app_type     = p_app_type,
        platform     = COALESCE(p_platform, device_push_tokens.platform),
        device_id    = COALESCE(p_device_id, device_push_tokens.device_id),
        is_active    = true,
        last_seen_at = now(),
        updated_at   = now()
  RETURNING id INTO v_existing;

  RETURN jsonb_build_object('success', true, 'token_id', v_existing);
END;
$$;

-- ── RPC: Remove/Deactivate Push Token ───────────────────────
CREATE OR REPLACE FUNCTION public.remove_push_token(
  p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE public.device_push_tokens
  SET is_active  = false,
      updated_at = now()
  WHERE token   = p_token
    AND user_id = v_uid;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ── RPC: Deactivate All Tokens for Current User ──────────────
-- Called on logout to prevent post-logout notifications
CREATE OR REPLACE FUNCTION public.deactivate_my_push_tokens(
  p_app_type text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_app_type IS NOT NULL THEN
    UPDATE public.device_push_tokens
    SET is_active  = false,
        updated_at = now()
    WHERE user_id  = v_uid
      AND app_type = p_app_type
      AND is_active = true;
  ELSE
    UPDATE public.device_push_tokens
    SET is_active  = false,
        updated_at = now()
    WHERE user_id  = v_uid
      AND is_active = true;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.register_push_token(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_push_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_my_push_tokens(text) TO authenticated;

-- ── Trigger: Dispatch Offer to Notification ─────────────────
-- When a new ride dispatch offer is created, generate a notification row
-- for the partner so FCM and in-app feeds are automatically notified!
CREATE OR REPLACE FUNCTION public.notify_on_new_ride_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.offer_status = 'offered' THEN
    INSERT INTO public.notifications (
      partner_id,
      type,
      title,
      message,
      ride_id,
      event_key
    ) VALUES (
      NEW.partner_id,
      'new_ride_offer',
      'New Ride Request',
      'You have an incoming ride offer. Tap to view and accept.',
      NEW.ride_id,
      NEW.id::text || '::new_ride_offer::partner'
    )
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_ride_offer ON public.ride_dispatch_offers;
CREATE TRIGGER trg_notify_ride_offer
  AFTER INSERT OR UPDATE OF offer_status ON public.ride_dispatch_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_ride_offer();

