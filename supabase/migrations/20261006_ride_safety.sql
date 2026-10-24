-- ============================================================
-- CARDOM — PHASE 11: RIDE SAFETY, SOS & EMERGENCY ASSISTANCE
-- Migration: 20261006_ride_safety.sql
-- ============================================================

-- ── 1. Emergency Contacts Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  phone        text NOT NULL,
  relationship text,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contacts' AND policyname = 'Users manage their own emergency contacts') THEN
    CREATE POLICY "Users manage their own emergency contacts"
      ON public.emergency_contacts
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ── 2. Ride Safety Events Table ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.ride_safety_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id         uuid NOT NULL REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type      text NOT NULL CHECK (event_type IN ('sos_triggered', 'sos_acknowledged', 'sos_resolved', 'location_shared', 'emergency_call')),
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'cancelled')),
  latitude        double precision,
  longitude       double precision,
  accuracy_meters double precision,
  message         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  resolved_at     timestamptz,
  resolved_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ride_safety_events_ride_id   ON public.ride_safety_events(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_safety_events_user_id   ON public.ride_safety_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_safety_events_partner_id ON public.ride_safety_events(partner_id);
CREATE INDEX IF NOT EXISTS idx_ride_safety_events_status     ON public.ride_safety_events(status);

-- Partial unique index ensuring at most one active/acknowledged SOS per ride
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_ride_sos
  ON public.ride_safety_events(ride_id)
  WHERE status IN ('active', 'acknowledged');

ALTER TABLE public.ride_safety_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_safety_events' AND policyname = 'Users can view their own safety events') THEN
    CREATE POLICY "Users can view their own safety events"
      ON public.ride_safety_events
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_safety_events' AND policyname = 'Partners can view safety events for assigned rides') THEN
    CREATE POLICY "Partners can view safety events for assigned rides"
      ON public.ride_safety_events
      FOR SELECT
      TO authenticated
      USING (partner_id = auth.uid());
  END IF;
END $$;

-- Enable Realtime publication for ride_safety_events
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_safety_events;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- ── 3. RPC: trigger_ride_sos ────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_ride_sos(
  p_ride_id         uuid,
  p_latitude        double precision DEFAULT NULL,
  p_longitude       double precision DEFAULT NULL,
  p_accuracy_meters double precision DEFAULT NULL,
  p_message         text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid;
  v_ride      record;
  v_partner_id uuid;
  v_existing  record;
  v_event_id  uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- 1. Check existing active SOS for this ride (idempotent / duplicate protection)
  SELECT * INTO v_existing
  FROM public.ride_safety_events
  WHERE ride_id = p_ride_id
    AND status IN ('active', 'acknowledged')
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'safety_event_id', v_existing.id,
      'status', v_existing.status,
      'is_duplicate', true,
      'message', 'Existing active SOS found'
    );
  END IF;

  -- 2. Validate ride ownership and active status
  SELECT * INTO v_ride
  FROM public.ride_bookings
  WHERE id = p_ride_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ride booking not found');
  END IF;

  IF v_ride.user_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You are not the owner of this ride');
  END IF;

  IF v_ride.status NOT IN ('driver_assigned', 'arriving', 'started') THEN
    RETURN jsonb_build_object('success', false, 'error', 'SOS is only available during active rides');
  END IF;

  -- 3. Securely derive assigned partner ID from ride_assignments (never trust frontend)
  SELECT partner_id INTO v_partner_id
  FROM public.ride_assignments
  WHERE ride_id = p_ride_id
    AND partner_status NOT IN ('rejected', 'cancelled')
  LIMIT 1;

  -- Fallback to driver_id on ride_bookings if assignment row is not matched
  IF v_partner_id IS NULL THEN
    v_partner_id := v_ride.driver_id;
  END IF;

  -- 4. Insert ride safety event
  INSERT INTO public.ride_safety_events (
    ride_id,
    user_id,
    partner_id,
    event_type,
    status,
    latitude,
    longitude,
    accuracy_meters,
    message,
    created_at
  ) VALUES (
    p_ride_id,
    v_user_id,
    v_partner_id,
    'sos_triggered',
    'active',
    p_latitude,
    p_longitude,
    p_accuracy_meters,
    COALESCE(p_message, 'Emergency SOS triggered by passenger'),
    now()
  )
  RETURNING id INTO v_event_id;

  -- 5. Auto-create notification for partner (triggers in-app and FCM push)
  IF v_partner_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      partner_id,
      type,
      title,
      message,
      ride_id,
      event_key
    ) VALUES (
      v_partner_id,
      'sos_triggered',
      '🚨 EMERGENCY SOS',
      'Your passenger has triggered an emergency SOS! Please check immediately.',
      p_ride_id,
      v_event_id::text || '::sos_triggered::partner'
    )
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'safety_event_id', v_event_id,
    'status', 'active',
    'partner_id', v_partner_id
  );
END;
$$;

-- ── 4. RPC: acknowledge_ride_sos ─────────────────────────────
CREATE OR REPLACE FUNCTION public.acknowledge_ride_sos(
  p_safety_event_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_event      record;
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_event
  FROM public.ride_safety_events
  WHERE id = p_safety_event_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Safety event not found');
  END IF;

  IF v_event.partner_id != v_partner_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You are not the assigned partner for this ride');
  END IF;

  IF v_event.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event is already ' || v_event.status);
  END IF;

  UPDATE public.ride_safety_events
  SET status          = 'acknowledged',
      acknowledged_at = now()
  WHERE id = p_safety_event_id;

  -- Notify user in realtime and via FCM
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    ride_id,
    event_key
  ) VALUES (
    v_event.user_id,
    'sos_acknowledged',
    'SOS Acknowledged',
    'Your driver has acknowledged your emergency alert and is responding.',
    v_event.ride_id,
    p_safety_event_id::text || '::sos_acknowledged::user'
  )
  ON CONFLICT (event_key) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'safety_event_id', p_safety_event_id,
    'status', 'acknowledged'
  );
END;
$$;

-- ── 5. RPC: resolve_ride_sos ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.resolve_ride_sos(
  p_safety_event_id uuid,
  p_resolution_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id  uuid;
  v_event      record;
  v_target_user uuid;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_event
  FROM public.ride_safety_events
  WHERE id = p_safety_event_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Safety event not found');
  END IF;

  -- Only ride owner (passenger) or assigned partner can resolve
  IF v_caller_id != v_event.user_id AND v_caller_id != v_event.partner_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized to resolve this safety event');
  END IF;

  IF v_event.status = 'resolved' THEN
    RETURN jsonb_build_object('success', true, 'status', 'resolved', 'message', 'Already resolved');
  END IF;

  UPDATE public.ride_safety_events
  SET status      = 'resolved',
      resolved_at = now(),
      resolved_by = v_caller_id,
      message     = CASE 
                      WHEN p_resolution_note IS NOT NULL 
                      THEN COALESCE(message, '') || ' | Resolution: ' || p_resolution_note
                      ELSE message
                    END
  WHERE id = p_safety_event_id;

  -- Notify the other party
  IF v_caller_id = v_event.user_id THEN
    -- Passenger resolved ("I'm Safe") -> notify partner
    IF v_event.partner_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        partner_id,
        type,
        title,
        message,
        ride_id,
        event_key
      ) VALUES (
        v_event.partner_id,
        'sos_resolved',
        'SOS Resolved',
        'Passenger marked the situation as safe and resolved.',
        v_event.ride_id,
        p_safety_event_id::text || '::sos_resolved::partner'
      )
      ON CONFLICT (event_key) DO NOTHING;
    END IF;
  ELSE
    -- Partner resolved -> notify passenger
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      ride_id,
      event_key
    ) VALUES (
      v_event.user_id,
      'sos_resolved',
      'SOS Resolved',
      'Emergency event marked as resolved by driver.',
      v_event.ride_id,
      p_safety_event_id::text || '::sos_resolved::user'
    )
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'safety_event_id', p_safety_event_id,
    'status', 'resolved'
  );
END;
$$;

-- ── 6. RPC: get_active_ride_sos ──────────────────────────────
CREATE OR REPLACE FUNCTION public.get_active_ride_sos(
  p_ride_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid;
  v_event record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('safety_event', null);
  END IF;

  SELECT * INTO v_event
  FROM public.ride_safety_events
  WHERE ride_id = p_ride_id
    AND (user_id = v_uid OR partner_id = v_uid)
    AND status IN ('active', 'acknowledged')
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('safety_event', null);
  END IF;

  RETURN jsonb_build_object('safety_event', row_to_json(v_event));
END;
$$;

-- Grant RPC execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.trigger_ride_sos(uuid, double precision, double precision, double precision, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.acknowledge_ride_sos(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_ride_sos(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_ride_sos(uuid) TO authenticated;
