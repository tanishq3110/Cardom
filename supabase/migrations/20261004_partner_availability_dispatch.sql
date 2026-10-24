-- ============================================================
-- Cardom Ride Booking — Phase 8 + 9
-- Migration: 20261004_partner_availability_dispatch.sql
-- Phase 8: Partner Availability / Online-Offline
-- Phase 9: Smart Ride Matching / Rule-Based Dispatch Engine
-- ============================================================

-- ── 1. Partner Availability Columns in partner_profiles ───────
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_online_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_offline_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_partner_profiles_online
  ON public.partner_profiles(is_online, status);

-- ── 2. Partner General Availability Locations ─────────────────
CREATE TABLE IF NOT EXISTS public.partner_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy_meters numeric,
  heading numeric,
  speed_mps numeric,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_partner_locations_partner UNIQUE (partner_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_locations_partner ON public.partner_locations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_locations_updated ON public.partner_locations(updated_at DESC);

ALTER TABLE public.partner_locations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_locations' AND policyname = 'Partners can view their own location') THEN
    CREATE POLICY "Partners can view their own location"
      ON public.partner_locations FOR SELECT TO authenticated
      USING (partner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_locations' AND policyname = 'Partners can insert/update their own location') THEN
    CREATE POLICY "Partners can insert/update their own location"
      ON public.partner_locations FOR ALL TO authenticated
      USING (partner_id = auth.uid())
      WITH CHECK (partner_id = auth.uid());
  END IF;
END $$;

-- ── 3. Ride Dispatch Offers Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.ride_dispatch_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distance_to_pickup_km numeric,
  status text NOT NULL DEFAULT 'offered'
    CHECK (status IN ('offered', 'accepted', 'rejected', 'expired', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz NOT NULL,
  CONSTRAINT uq_ride_partner_offer UNIQUE (ride_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_partner_status
  ON public.ride_dispatch_offers(partner_id, status);

CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_ride_status
  ON public.ride_dispatch_offers(ride_id, status);

CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_expires
  ON public.ride_dispatch_offers(expires_at);

ALTER TABLE public.ride_dispatch_offers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_dispatch_offers' AND policyname = 'Partners can view their own ride offers') THEN
    CREATE POLICY "Partners can view their own ride offers"
      ON public.ride_dispatch_offers FOR SELECT TO authenticated
      USING (partner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_dispatch_offers' AND policyname = 'Users can view offers for their rides') THEN
    CREATE POLICY "Users can view offers for their rides"
      ON public.ride_dispatch_offers FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.ride_bookings rb
          WHERE rb.id = public.ride_dispatch_offers.ride_id
            AND rb.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── 4. Enable Supabase Realtime Publications ──────────────────
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_dispatch_offers;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_locations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ── 5. Deterministic Geodesic Distance Calculation ────────────
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
  lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN NULL
    WHEN lat1 = lat2 AND lon1 = lon2 THEN 0
    ELSE (6371 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
        sin(radians(lat1)) * sin(radians(lat2))
      ))
    ))::numeric(10, 2)
  END;
$$;

-- ── 6. Helper: Check if Partner has an active ride ────────────
CREATE OR REPLACE FUNCTION public.is_partner_busy(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ride_assignments ra
    JOIN public.ride_bookings rb ON rb.id = ra.ride_id
    WHERE ra.partner_id = p_partner_id
      AND ra.partner_status IN ('accepted', 'started')
      AND rb.status IN ('driver_assigned', 'arriving', 'started')
  );
$$;

-- ── 7. RPC: update_partner_availability ───────────────────────
CREATE OR REPLACE FUNCTION public.update_partner_availability(p_is_online boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_busy boolean;
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Active ride protection: cannot go offline if currently on an active ride
  IF NOT p_is_online THEN
    v_busy := public.is_partner_busy(v_partner_id);
    IF v_busy THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'You have an active ride in progress. Complete or cancel it before going offline.'
      );
    END IF;

    -- Expire any active offers for this partner
    UPDATE public.ride_dispatch_offers
    SET status = 'expired', responded_at = now()
    WHERE partner_id = v_partner_id AND status = 'offered';
  END IF;

  UPDATE public.partner_profiles
  SET
    is_online = p_is_online,
    last_online_at = CASE WHEN p_is_online THEN now() ELSE last_online_at END,
    last_offline_at = CASE WHEN NOT p_is_online THEN now() ELSE last_offline_at END,
    updated_at = now()
  WHERE id = v_partner_id;

  RETURN jsonb_build_object('success', true, 'is_online', p_is_online);
END;
$$;

-- ── 8. RPC: update_partner_location ───────────────────────────
CREATE OR REPLACE FUNCTION public.update_partner_location(
  p_latitude numeric,
  p_longitude numeric,
  p_accuracy numeric DEFAULT NULL,
  p_heading numeric DEFAULT NULL,
  p_speed numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  INSERT INTO public.partner_locations (
    partner_id, latitude, longitude, accuracy_meters, heading, speed_mps, updated_at
  )
  VALUES (
    v_partner_id, p_latitude, p_longitude, p_accuracy, p_heading, p_speed, now()
  )
  ON CONFLICT (partner_id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    accuracy_meters = EXCLUDED.accuracy_meters,
    heading = EXCLUDED.heading,
    speed_mps = EXCLUDED.speed_mps,
    updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ── 9. RPC: dispatch_find_and_offer_ride ──────────────────────
CREATE OR REPLACE FUNCTION public.dispatch_find_and_offer_ride(
  p_ride_id uuid,
  p_max_radius_km numeric DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ride record;
  v_existing_offer record;
  v_chosen_partner record;
  v_offer_id uuid;
  v_offer_timeout_seconds integer := 20;
BEGIN
  -- 1. Check if ride is still in searching status
  SELECT * INTO v_ride
  FROM public.ride_bookings
  WHERE id = p_ride_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ride not found');
  END IF;

  IF v_ride.status != 'searching' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ride is no longer searching');
  END IF;

  -- 2. Check if an active offer already exists and is still valid
  SELECT * INTO v_existing_offer
  FROM public.ride_dispatch_offers
  WHERE ride_id = p_ride_id
    AND status = 'offered'
    AND expires_at > now()
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'matched', true,
      'offer_id', v_existing_offer.id,
      'partner_id', v_existing_offer.partner_id,
      'distance_km', v_existing_offer.distance_to_pickup_km,
      'expires_at', v_existing_offer.expires_at,
      'note', 'Existing active offer in progress'
    );
  END IF;

  -- Expire any past-due offers for this ride
  UPDATE public.ride_dispatch_offers
  SET status = 'expired', responded_at = now()
  WHERE ride_id = p_ride_id
    AND status = 'offered'
    AND expires_at <= now();

  -- 3. Find closest eligible partner
  SELECT
    pp.id,
    pp.business_name,
    pp.phone,
    public.calculate_distance_km(
      v_ride.pickup_latitude, v_ride.pickup_longitude,
      pl.latitude, pl.longitude
    ) AS distance_km
  INTO v_chosen_partner
  FROM public.partner_profiles pp
  JOIN public.partner_locations pl ON pl.partner_id = pp.id
  WHERE pp.is_online = true
    AND (pp.status IS NULL OR pp.status NOT IN ('suspended', 'rejected'))
    AND NOT public.is_partner_busy(pp.id)
    -- Must have reported location recently (within 5 minutes)
    AND pl.updated_at >= (now() - interval '5 minutes')
    -- Partner has not already been offered this ride
    AND NOT EXISTS (
      SELECT 1 FROM public.ride_dispatch_offers rdo
      WHERE rdo.ride_id = p_ride_id
        AND rdo.partner_id = pp.id
        AND rdo.status IN ('offered', 'rejected', 'expired')
    )
    -- Distance constraint (if coordinates available)
    AND (
      v_ride.pickup_latitude IS NULL
      OR pl.latitude IS NULL
      OR public.calculate_distance_km(
           v_ride.pickup_latitude, v_ride.pickup_longitude,
           pl.latitude, pl.longitude
         ) <= p_max_radius_km
    )
  ORDER BY
    distance_km ASC NULLS LAST,
    pl.updated_at DESC
  LIMIT 1;

  -- If no partner with location within radius, check for any online available partner as fallback
  IF v_chosen_partner.id IS NULL THEN
    SELECT
      pp.id,
      pp.business_name,
      pp.phone,
      coalesce(
        public.calculate_distance_km(
          v_ride.pickup_latitude, v_ride.pickup_longitude,
          pl.latitude, pl.longitude
        ),
        1.5
      ) AS distance_km
    INTO v_chosen_partner
    FROM public.partner_profiles pp
    LEFT JOIN public.partner_locations pl ON pl.partner_id = pp.id
    WHERE pp.is_online = true
      AND (pp.status IS NULL OR pp.status NOT IN ('suspended', 'rejected'))
      AND NOT public.is_partner_busy(pp.id)
      AND NOT EXISTS (
        SELECT 1 FROM public.ride_dispatch_offers rdo
        WHERE rdo.ride_id = p_ride_id
          AND rdo.partner_id = pp.id
          AND rdo.status IN ('offered', 'rejected', 'expired')
      )
    ORDER BY pp.updated_at DESC
    LIMIT 1;
  END IF;

  -- 4. If no partner found
  IF v_chosen_partner.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'matched', false,
      'reason', 'no_eligible_partners',
      'radius_km', p_max_radius_km
    );
  END IF;

  -- 5. Create new offer for chosen partner
  INSERT INTO public.ride_dispatch_offers (
    ride_id,
    partner_id,
    distance_to_pickup_km,
    status,
    expires_at
  )
  VALUES (
    p_ride_id,
    v_chosen_partner.id,
    v_chosen_partner.distance_km,
    'offered',
    now() + (interval '1 second' * v_offer_timeout_seconds)
  )
  RETURNING id INTO v_offer_id;

  -- 6. Trigger in-app notification for the partner
  INSERT INTO public.notifications (
    partner_id,
    type,
    title,
    message,
    ride_id,
    event_key
  )
  VALUES (
    v_chosen_partner.id,
    'new_ride_offer',
    '🚗 New Ride Request',
    'Pickup: ' || coalesce(v_ride.pickup_address, 'Near you') || ' (₹' || coalesce(v_ride.estimated_fare::text, '0') || ')',
    p_ride_id,
    p_ride_id::text || '::new_ride_offer::' || v_chosen_partner.id::text
  )
  ON CONFLICT (event_key) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'matched', true,
    'offer_id', v_offer_id,
    'partner_id', v_chosen_partner.id,
    'distance_km', v_chosen_partner.distance_km,
    'expires_in_seconds', v_offer_timeout_seconds
  );
END;
$$;

-- ── 10. RPC: accept_ride_offer ────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_ride_offer(p_offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_offer record;
  v_ride record;
  v_partner_profile record;
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- 1. Lock the offer row atomically
  SELECT * INTO v_offer
  FROM public.ride_dispatch_offers
  WHERE id = p_offer_id
    AND partner_id = v_partner_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer not found or unauthorized');
  END IF;

  IF v_offer.status != 'offered' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer is no longer active (' || v_offer.status || ')');
  END IF;

  IF v_offer.expires_at <= now() THEN
    UPDATE public.ride_dispatch_offers
    SET status = 'expired', responded_at = now()
    WHERE id = p_offer_id;
    RETURN jsonb_build_object('success', false, 'error', 'Offer has expired');
  END IF;

  -- 2. Verify partner is still online and not busy
  IF public.is_partner_busy(v_partner_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are already on an active ride');
  END IF;

  -- 3. Lock ride row atomically to prevent race condition
  SELECT * INTO v_ride
  FROM public.ride_bookings
  WHERE id = v_offer.ride_id
    AND status = 'searching'
  FOR UPDATE;

  IF NOT FOUND THEN
    -- User cancelled or another assignment won
    UPDATE public.ride_dispatch_offers
    SET status = 'cancelled', responded_at = now()
    WHERE id = p_offer_id;
    RETURN jsonb_build_object('success', false, 'error', 'Ride is no longer available');
  END IF;

  -- 4. Mark offer accepted
  UPDATE public.ride_dispatch_offers
  SET status = 'accepted', responded_at = now()
  WHERE id = p_offer_id;

  -- Cancel all other pending offers for this ride
  UPDATE public.ride_dispatch_offers
  SET status = 'cancelled', responded_at = now()
  WHERE ride_id = v_offer.ride_id
    AND id != p_offer_id
    AND status = 'offered';

  -- 5. Fetch partner driver details
  SELECT * INTO v_partner_profile
  FROM public.partner_profiles
  WHERE id = v_partner_id;

  -- 6. Update ride_bookings atomically
  UPDATE public.ride_bookings
  SET
    status       = 'driver_assigned',
    driver_id    = v_partner_id,
    driver_name  = coalesce(
                     nullif(trim(v_partner_profile.authorized_contact_name), ''),
                     nullif(trim(v_partner_profile.business_name), ''),
                     'Cardom Partner'
                   ),
    driver_phone = v_partner_profile.phone,
    vehicle_name = v_partner_profile.business_name,
    updated_at   = now()
  WHERE id = v_offer.ride_id;

  -- 7. Upsert ride_assignments record
  INSERT INTO public.ride_assignments (
    ride_id, partner_id, partner_status, accepted_at, updated_at
  )
  VALUES (
    v_offer.ride_id, v_partner_id, 'accepted', now(), now()
  )
  ON CONFLICT (ride_id, partner_id) DO UPDATE
    SET partner_status = 'accepted', accepted_at = now(), updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'ride_id', v_offer.ride_id,
    'offer_id', p_offer_id
  );
END;
$$;

-- ── 11. RPC: reject_ride_offer ────────────────────────────────
CREATE OR REPLACE FUNCTION public.reject_ride_offer(p_offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_offer record;
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_offer
  FROM public.ride_dispatch_offers
  WHERE id = p_offer_id AND partner_id = v_partner_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer not found');
  END IF;

  UPDATE public.ride_dispatch_offers
  SET status = 'rejected', responded_at = now()
  WHERE id = p_offer_id;

  -- Immediately attempt dispatch to the next partner
  PERFORM public.dispatch_find_and_offer_ride(v_offer.ride_id);

  RETURN jsonb_build_object('success', true, 'ride_id', v_offer.ride_id);
END;
$$;

-- ── 12. RPC: expire_ride_offer ────────────────────────────────
CREATE OR REPLACE FUNCTION public.expire_ride_offer(p_offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer record;
BEGIN
  SELECT * INTO v_offer
  FROM public.ride_dispatch_offers
  WHERE id = p_offer_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer not found');
  END IF;

  IF v_offer.status = 'offered' THEN
    UPDATE public.ride_dispatch_offers
    SET status = 'expired', responded_at = now()
    WHERE id = p_offer_id;

    -- Immediately dispatch to next partner
    PERFORM public.dispatch_find_and_offer_ride(v_offer.ride_id);
  END IF;

  RETURN jsonb_build_object('success', true, 'ride_id', v_offer.ride_id);
END;
$$;

-- ── 13. RPC: get_active_partner_offer ─────────────────────────
CREATE OR REPLACE FUNCTION public.get_active_partner_offer()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_offer record;
  v_ride record;
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('offer', null);
  END IF;

  SELECT * INTO v_offer
  FROM public.ride_dispatch_offers
  WHERE partner_id = v_partner_id
    AND status = 'offered'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('offer', null);
  END IF;

  SELECT * INTO v_ride
  FROM public.ride_bookings
  WHERE id = v_offer.ride_id;

  IF NOT FOUND OR v_ride.status != 'searching' THEN
    -- Mark invalid offer as cancelled
    UPDATE public.ride_dispatch_offers
    SET status = 'cancelled'
    WHERE id = v_offer.id;
    RETURN jsonb_build_object('offer', null);
  END IF;

  RETURN jsonb_build_object(
    'offer', jsonb_build_object(
      'id', v_offer.id,
      'ride_id', v_offer.ride_id,
      'distance_to_pickup_km', v_offer.distance_to_pickup_km,
      'status', v_offer.status,
      'created_at', v_offer.created_at,
      'expires_at', v_offer.expires_at,
      'booking_reference', v_ride.booking_reference,
      'pickup_address', v_ride.pickup_address,
      'drop_address', v_ride.drop_address,
      'ride_type', v_ride.ride_type,
      'estimated_fare', v_ride.estimated_fare,
      'estimated_distance_km', v_ride.estimated_distance_km,
      'estimated_duration_minutes', v_ride.estimated_duration_minutes
    )
  );
END;
$$;

-- ── 14. RPC: cancel_ride_dispatch ─────────────────────────────
CREATE OR REPLACE FUNCTION public.cancel_ride_dispatch(p_ride_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ride_dispatch_offers
  SET status = 'cancelled', responded_at = now()
  WHERE ride_id = p_ride_id AND status = 'offered';

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ── 15. Trigger on ride cancellation to cancel offers ─────────
CREATE OR REPLACE FUNCTION public.on_ride_cancelled_cancel_offers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.ride_dispatch_offers
    SET status = 'cancelled', responded_at = now()
    WHERE ride_id = NEW.id AND status = 'offered';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cancel_dispatch_offers ON public.ride_bookings;
CREATE TRIGGER trg_cancel_dispatch_offers
  AFTER UPDATE OF status ON public.ride_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.on_ride_cancelled_cancel_offers();

