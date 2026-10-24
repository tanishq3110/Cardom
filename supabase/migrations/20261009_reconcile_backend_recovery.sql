-- ==============================================================================
-- CARDOM ECOSYSTEM — PHASE 13.2: LIVE SCHEMA RECONCILIATION & RECOVERY
-- File: 20261009_reconcile_backend_recovery.sql
-- Description: Reconciles all missing database objects across Payments, Ratings,
--              Smart Dispatch, Ride Safety SOS, Admin Policies, and Production Hardening.
-- Safety: Completely non-destructive, idempotent, preserves all existing tables and data.
-- ==============================================================================

-- ==============================================================================
-- PART 1: RIDE PAYMENTS (PHASE 5)
-- ==============================================================================

-- 1.1 Columns on ride_bookings & partner_profiles
ALTER TABLE public.ride_bookings
  ADD COLUMN IF NOT EXISTS final_fare numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;

ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS upi_id text,
  ADD COLUMN IF NOT EXISTS upi_qr_url text;

-- 1.2 Table: ride_payments
CREATE TABLE IF NOT EXISTS public.ride_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'upi')),
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'customer_marked_paid', 'confirmed', 'failed')),
  customer_marked_paid_at timestamptz,
  partner_confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uq_ride_payments_ride UNIQUE (ride_id)
);

CREATE INDEX IF NOT EXISTS idx_ride_payments_ride_id ON public.ride_payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_payments_status ON public.ride_payments(status);

ALTER TABLE public.ride_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_payments' AND policyname = 'Customers can view payments for their rides') THEN
    CREATE POLICY "Customers can view payments for their rides"
      ON public.ride_payments FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.ride_bookings b WHERE b.id = ride_payments.ride_id AND b.user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_payments' AND policyname = 'Partners can view payments for assigned rides') THEN
    CREATE POLICY "Partners can view payments for assigned rides"
      ON public.ride_payments FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.ride_assignments a WHERE a.ride_id = ride_payments.ride_id AND a.partner_id = auth.uid()));
  END IF;
END $$;

-- 1.3 RPC: customer_mark_payment_paid
CREATE OR REPLACE FUNCTION public.customer_mark_payment_paid(
  p_ride_id uuid,
  p_payment_method text DEFAULT 'upi'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_method text;
  v_amount numeric(10,2);
BEGIN
  SELECT * INTO v_booking
  FROM public.ride_bookings
  WHERE id = p_ride_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride booking not found or unauthorized';
  END IF;

  v_method := lower(trim(coalesce(p_payment_method, v_booking.payment_method, 'upi')));
  IF v_method NOT IN ('cash', 'upi') THEN
    v_method := 'upi';
  END IF;

  v_amount := coalesce(v_booking.final_fare, v_booking.estimated_fare, 0);

  UPDATE public.ride_bookings
  SET
    payment_status = 'customer_marked_paid',
    payment_method = v_method,
    final_fare = v_amount,
    updated_at = now()
  WHERE id = p_ride_id;

  INSERT INTO public.ride_payments (
    ride_id, payment_method, amount, status, customer_marked_paid_at, updated_at
  )
  VALUES (
    p_ride_id, v_method, v_amount, 'customer_marked_paid', now(), now()
  )
  ON CONFLICT (ride_id) DO UPDATE SET
    payment_method = EXCLUDED.payment_method,
    amount = EXCLUDED.amount,
    status = 'customer_marked_paid',
    customer_marked_paid_at = now(),
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'ride_id', p_ride_id,
    'payment_status', 'customer_marked_paid',
    'payment_method', v_method,
    'final_fare', v_amount
  );
END;
$$;

-- 1.4 RPC: partner_confirm_payment
CREATE OR REPLACE FUNCTION public.partner_confirm_payment(
  p_ride_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment record;
  v_booking record;
  v_amount numeric(10,2);
BEGIN
  SELECT * INTO v_assignment
  FROM public.ride_assignments
  WHERE ride_id = p_ride_id
    AND partner_id = auth.uid()
    AND partner_status NOT IN ('rejected', 'cancelled');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized: Partner is not assigned to this ride';
  END IF;

  SELECT * INTO v_booking
  FROM public.ride_bookings
  WHERE id = p_ride_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride booking not found';
  END IF;

  v_amount := coalesce(v_booking.final_fare, v_booking.estimated_fare, 0);

  UPDATE public.ride_bookings
  SET
    payment_status = 'paid',
    payment_confirmed_at = now(),
    updated_at = now()
  WHERE id = p_ride_id;

  INSERT INTO public.ride_payments (
    ride_id, payment_method, amount, status, partner_confirmed_at, updated_at
  )
  VALUES (
    p_ride_id, coalesce(v_booking.payment_method, 'upi'), v_amount, 'confirmed', now(), now()
  )
  ON CONFLICT (ride_id) DO UPDATE SET
    status = 'confirmed',
    partner_confirmed_at = now(),
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'ride_id', p_ride_id,
    'payment_status', 'paid',
    'payment_confirmed_at', now()
  );
END;
$$;

-- 1.5 RPC: get_ride_partner_payment_info
CREATE OR REPLACE FUNCTION public.get_ride_partner_payment_info(
  p_ride_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_partner record;
BEGIN
  SELECT * INTO v_booking
  FROM public.ride_bookings
  WHERE id = p_ride_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found or unauthorized';
  END IF;

  SELECT pp.upi_id, pp.upi_qr_url, pp.business_name, pp.phone
  INTO v_partner
  FROM public.partner_profiles pp
  JOIN public.ride_assignments ra ON ra.partner_id = pp.id
  WHERE ra.ride_id = p_ride_id
    AND ra.partner_status NOT IN ('rejected', 'cancelled')
  LIMIT 1;

  RETURN jsonb_build_object(
    'ride_id', p_ride_id,
    'fare_amount', coalesce(v_booking.final_fare, v_booking.estimated_fare),
    'payment_method', v_booking.payment_method,
    'payment_status', v_booking.payment_status,
    'upi_id', v_partner.upi_id,
    'upi_qr_url', v_partner.upi_qr_url,
    'partner_name', v_partner.business_name,
    'partner_phone', v_partner.phone
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.customer_mark_payment_paid(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.partner_confirm_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ride_partner_payment_info(uuid) TO authenticated;


-- ==============================================================================
-- PART 2: RIDE RATINGS & NOTIFICATIONS TRIGGERS (PHASES 6 & 7)
-- ==============================================================================

-- 2.1 Table: ride_ratings
CREATE TABLE IF NOT EXISTS public.ride_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_ride_ratings_ride_user UNIQUE (ride_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ride_ratings_partner_id ON public.ride_ratings(partner_id);
CREATE INDEX IF NOT EXISTS idx_ride_ratings_ride_id ON public.ride_ratings(ride_id);

ALTER TABLE public.ride_ratings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_ratings' AND policyname = 'Users can view ratings for their rides') THEN
    CREATE POLICY "Users can view ratings for their rides"
      ON public.ride_ratings FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_ratings' AND policyname = 'Partners can view ratings for their rides') THEN
    CREATE POLICY "Partners can view ratings for their rides"
      ON public.ride_ratings FOR SELECT TO authenticated
      USING (partner_id = auth.uid());
  END IF;
END $$;

-- 2.2 Rating RPCs
CREATE OR REPLACE FUNCTION public.submit_ride_rating(
  p_ride_id uuid,
  p_rating integer,
  p_review text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ride record;
  v_partner_id uuid;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rating must be between 1 and 5');
  END IF;

  SELECT * INTO v_ride
  FROM public.ride_bookings
  WHERE id = p_ride_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ride not found or unauthorized');
  END IF;

  IF v_ride.status != 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Can only rate completed rides');
  END IF;

  SELECT partner_id INTO v_partner_id
  FROM public.ride_assignments
  WHERE ride_id = p_ride_id AND partner_status NOT IN ('rejected', 'cancelled')
  LIMIT 1;

  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No driver assigned to this ride');
  END IF;

  INSERT INTO public.ride_ratings (ride_id, user_id, partner_id, rating, review, updated_at)
  VALUES (p_ride_id, auth.uid(), v_partner_id, p_rating, p_review, now())
  ON CONFLICT (ride_id, user_id) DO UPDATE SET
    rating = EXCLUDED.rating,
    review = EXCLUDED.review,
    updated_at = now();

  INSERT INTO public.notifications (partner_id, type, title, message, ride_id, event_key)
  VALUES (
    v_partner_id, 'rating_received', 'New Rating Received',
    'You received a ' || p_rating || '-star rating from a recent ride.',
    p_ride_id, p_ride_id::text || '::rating_received::partner'
  )
  ON CONFLICT (event_key) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'ride_id', p_ride_id, 'partner_id', v_partner_id, 'rating', p_rating);
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_ids uuid[])
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.notifications SET is_read = true WHERE id = ANY(p_ids) AND (user_id = auth.uid() OR partner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.notifications SET is_read = true WHERE user_id = auth.uid() OR partner_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.submit_ride_rating(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notifications_read(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;

-- 2.3 Automatic Notification Triggers on ride_bookings
CREATE OR REPLACE FUNCTION public.notify_on_ride_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_title text;
  v_message text;
  v_partner_title text;
  v_partner_message text;
  v_event_key_user text;
  v_event_key_partner text;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  SELECT partner_id INTO v_partner_id
  FROM public.ride_assignments
  WHERE ride_id = NEW.id AND partner_status NOT IN ('rejected', 'cancelled')
  LIMIT 1;

  CASE NEW.status
    WHEN 'driver_assigned' THEN
      v_title := 'Driver Assigned';
      v_message := 'Your driver has been assigned and will be arriving shortly.';
      v_event_key_user := NEW.id::text || '::driver_assigned::user';
    WHEN 'arriving' THEN
      v_title := 'Driver Arriving';
      v_message := 'Your driver is on the way to your pickup location.';
      v_event_key_user := NEW.id::text || '::arriving::user';
    WHEN 'started' THEN
      v_title := 'Ride Started';
      v_message := 'Your ride has started. Enjoy your journey!';
      v_event_key_user := NEW.id::text || '::started::user';
    WHEN 'completed' THEN
      v_title := 'Ride Completed';
      v_message := 'Your ride is complete. Please complete fare payment.';
      v_event_key_user := NEW.id::text || '::completed::user';
      v_partner_title := 'Ride Completed';
      v_partner_message := 'The ride has been completed successfully.';
      v_event_key_partner := NEW.id::text || '::completed::partner';
    WHEN 'cancelled' THEN
      v_title := 'Ride Cancelled';
      v_message := 'Your ride has been cancelled.';
      v_event_key_user := NEW.id::text || '::cancelled::user';
    ELSE
      RETURN NEW;
  END CASE;

  IF v_title IS NOT NULL AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, ride_id, event_key)
    VALUES (NEW.user_id, NEW.status, v_title, v_message, NEW.id, v_event_key_user)
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  IF v_partner_title IS NOT NULL AND v_partner_id IS NOT NULL THEN
    INSERT INTO public.notifications (partner_id, type, title, message, ride_id, event_key)
    VALUES (v_partner_id, 'ride_completed', v_partner_title, v_partner_message, NEW.id, v_event_key_partner)
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_ride_status ON public.ride_bookings;
CREATE TRIGGER trg_notify_ride_status
  AFTER UPDATE OF status ON public.ride_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_ride_status_change();

CREATE OR REPLACE FUNCTION public.notify_on_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
BEGIN
  IF NEW.payment_status = OLD.payment_status OR NEW.payment_status IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT partner_id INTO v_partner_id
  FROM public.ride_assignments
  WHERE ride_id = NEW.id AND partner_status NOT IN ('rejected', 'cancelled')
  LIMIT 1;

  CASE NEW.payment_status
    WHEN 'customer_marked_paid' THEN
      IF v_partner_id IS NOT NULL THEN
        INSERT INTO public.notifications (partner_id, type, title, message, ride_id, event_key)
        VALUES (v_partner_id, 'customer_marked_paid', 'Payment Marked', 'The customer has marked payment as complete. Please confirm receipt.', NEW.id, NEW.id::text || '::customer_marked_paid::partner')
        ON CONFLICT (event_key) DO NOTHING;
      END IF;
    WHEN 'confirmed', 'paid' THEN
      IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, ride_id, event_key)
        VALUES (NEW.user_id, 'payment_confirmed', 'Payment Confirmed', 'Your driver confirmed payment receipt. Thank you!', NEW.id, NEW.id::text || '::payment_confirmed::user')
        ON CONFLICT (event_key) DO NOTHING;
        INSERT INTO public.notifications (user_id, type, title, message, ride_id, event_key)
        VALUES (NEW.user_id, 'rating_reminder', 'Rate Your Ride', 'How was your experience? Leave a review for your driver.', NEW.id, NEW.id::text || '::rating_reminder::user')
        ON CONFLICT (event_key) DO NOTHING;
      END IF;
    ELSE NULL;
  END CASE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_payment_status ON public.ride_bookings;
CREATE TRIGGER trg_notify_payment_status
  AFTER UPDATE OF payment_status ON public.ride_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_payment_status_change();


-- ==============================================================================
-- PART 3: PARTNER AVAILABILITY & SMART DISPATCH (PHASES 8 & 9)
-- ==============================================================================

-- 3.1 Availability columns on partner_profiles
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_online_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_offline_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_partner_profiles_online ON public.partner_profiles(is_online, status);

-- 3.2 Table: partner_locations
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

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_locations' AND policyname = 'Partners can update their own location') THEN
    CREATE POLICY "Partners can update their own location"
      ON public.partner_locations FOR ALL TO authenticated
      USING (partner_id = auth.uid())
      WITH CHECK (partner_id = auth.uid());
  END IF;
END $$;

-- 3.3 Table: ride_dispatch_offers
CREATE TABLE IF NOT EXISTS public.ride_dispatch_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'rejected', 'expired', 'cancelled')),
  attempt_number integer NOT NULL DEFAULT 1,
  search_radius_km numeric(4,1) NOT NULL DEFAULT 5.0,
  distance_km numeric(6,2),
  offered_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '20 seconds'),
  responded_at timestamptz,
  CONSTRAINT uq_ride_dispatch_offers_ride_partner UNIQUE (ride_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_ride ON public.ride_dispatch_offers(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_partner ON public.ride_dispatch_offers(partner_id);
CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_status ON public.ride_dispatch_offers(status);
CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_expires ON public.ride_dispatch_offers(expires_at) WHERE status = 'offered';

ALTER TABLE public.ride_dispatch_offers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_dispatch_offers' AND policyname = 'Partners can view their offers') THEN
    CREATE POLICY "Partners can view their offers"
      ON public.ride_dispatch_offers FOR SELECT TO authenticated
      USING (partner_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_dispatch_offers' AND policyname = 'Partners can respond to their offers') THEN
    CREATE POLICY "Partners can respond to their offers"
      ON public.ride_dispatch_offers FOR UPDATE TO authenticated
      USING (partner_id = auth.uid())
      WITH CHECK (partner_id = auth.uid());
  END IF;
END $$;

-- 3.4 Geodesic helper function
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
  lat1 numeric, lon1 numeric,
  lat2 numeric, lon2 numeric
)
RETURNS numeric(10, 2)
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

-- 3.5 Dispatch helper: check if partner is busy
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

-- 3.6 Partner availability & location RPCs
CREATE OR REPLACE FUNCTION public.update_partner_availability(p_is_online boolean)
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

  IF NOT p_is_online AND public.is_partner_busy(v_partner_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot go offline while on an active ride');
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

-- 3.7 Core Smart Dispatch Engine
CREATE OR REPLACE FUNCTION public.dispatch_find_and_offer_ride(p_ride_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ride record;
  v_candidate record;
  v_radius numeric(4,1);
  v_radii numeric(4,1)[] := ARRAY[5.0, 10.0, 15.0];
  v_attempt integer;
  v_offer_id uuid;
  v_expires_at timestamptz;
  v_now timestamptz := now();
BEGIN
  SELECT * INTO v_ride FROM public.ride_bookings WHERE id = p_ride_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Ride not found');
  END IF;

  IF v_ride.status != 'searching' THEN
    RETURN jsonb_build_object('status', 'not_searching', 'ride_status', v_ride.status);
  END IF;

  UPDATE public.ride_dispatch_offers
  SET status = 'expired', responded_at = v_now
  WHERE ride_id = p_ride_id AND status = 'offered' AND expires_at <= v_now;

  IF EXISTS (SELECT 1 FROM public.ride_dispatch_offers WHERE ride_id = p_ride_id AND status = 'offered' AND expires_at > v_now) THEN
    SELECT * INTO v_candidate FROM public.ride_dispatch_offers WHERE ride_id = p_ride_id AND status = 'offered' AND expires_at > v_now LIMIT 1;
    RETURN jsonb_build_object(
      'status', 'offer_active',
      'offer_id', v_candidate.id,
      'partner_id', v_candidate.partner_id,
      'expires_at', v_candidate.expires_at,
      'seconds_remaining', EXTRACT(EPOCH FROM (v_candidate.expires_at - v_now))::integer
    );
  END IF;

  SELECT coalesce(max(attempt_number), 0) + 1 INTO v_attempt FROM public.ride_dispatch_offers WHERE ride_id = p_ride_id;

  FOREACH v_radius IN ARRAY v_radii LOOP
    SELECT
      pp.id AS partner_id,
      pl.latitude,
      pl.longitude,
      public.calculate_distance_km(v_ride.pickup_latitude, v_ride.pickup_longitude, pl.latitude, pl.longitude) AS distance_km
    INTO v_candidate
    FROM public.partner_profiles pp
    JOIN public.partner_locations pl ON pl.partner_id = pp.id
    WHERE pp.is_online = true
      AND pp.status = 'active'
      AND pp.is_verified = true
      AND pl.updated_at >= (v_now - interval '10 minutes')
      AND NOT public.is_partner_busy(pp.id)
      AND NOT EXISTS (
        SELECT 1 FROM public.ride_dispatch_offers rdo
        WHERE rdo.ride_id = p_ride_id AND rdo.partner_id = pp.id
      )
      AND public.calculate_distance_km(v_ride.pickup_latitude, v_ride.pickup_longitude, pl.latitude, pl.longitude) <= v_radius
    ORDER BY distance_km ASC
    LIMIT 1;

    IF v_candidate.partner_id IS NOT NULL THEN
      EXIT;
    END IF;
  END LOOP;

  IF v_candidate.partner_id IS NULL THEN
    RETURN jsonb_build_object('status', 'no_drivers_available', 'attempts', v_attempt - 1);
  END IF;

  v_expires_at := v_now + interval '20 seconds';

  INSERT INTO public.ride_dispatch_offers (
    ride_id, partner_id, status, attempt_number, search_radius_km, distance_km, offered_at, expires_at
  )
  VALUES (
    p_ride_id, v_candidate.partner_id, 'offered', v_attempt, v_radius, v_candidate.distance_km, v_now, v_expires_at
  )
  RETURNING id INTO v_offer_id;

  RETURN jsonb_build_object(
    'status', 'offered',
    'offer_id', v_offer_id,
    'partner_id', v_candidate.partner_id,
    'distance_km', v_candidate.distance_km,
    'search_radius_km', v_radius,
    'expires_at', v_expires_at,
    'attempt_number', v_attempt
  );
END;
$$;

-- 3.8 Accept / Reject Offer RPCs
CREATE OR REPLACE FUNCTION public.accept_ride_offer(p_offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer record;
  v_partner_id uuid;
  v_partner record;
  v_booking record;
  v_now timestamptz := now();
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_offer
  FROM public.ride_dispatch_offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer not found');
  END IF;

  IF v_offer.partner_id != v_partner_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not your offer');
  END IF;

  IF v_offer.status != 'offered' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer is no longer active (' || v_offer.status || ')');
  END IF;

  IF v_offer.expires_at < v_now THEN
    UPDATE public.ride_dispatch_offers
    SET status = 'expired', responded_at = v_now
    WHERE id = p_offer_id;
    RETURN jsonb_build_object('success', false, 'error', 'Offer has expired');
  END IF;

  SELECT * INTO v_booking
  FROM public.ride_bookings
  WHERE id = v_offer.ride_id
  FOR UPDATE;

  IF v_booking.status != 'searching' THEN
    UPDATE public.ride_dispatch_offers
    SET status = 'cancelled', responded_at = v_now
    WHERE id = p_offer_id;
    RETURN jsonb_build_object('success', false, 'error', 'Ride is no longer available');
  END IF;

  SELECT * INTO v_partner FROM public.partner_profiles WHERE id = v_partner_id;

  UPDATE public.ride_dispatch_offers
  SET status = 'accepted', responded_at = v_now
  WHERE id = p_offer_id;

  UPDATE public.ride_dispatch_offers
  SET status = 'cancelled', responded_at = v_now
  WHERE ride_id = v_offer.ride_id AND id != p_offer_id AND status = 'offered';

  UPDATE public.ride_bookings
  SET
    status = 'driver_assigned',
    driver_id = v_partner_id,
    driver_name = coalesce(v_partner.business_name, 'Driver'),
    driver_phone = v_partner.phone,
    vehicle_name = coalesce(v_partner.business_name, 'Cardom Partner Vehicle'),
    updated_at = v_now
  WHERE id = v_offer.ride_id;

  INSERT INTO public.ride_assignments (
    ride_id, partner_id, partner_status, assigned_at
  )
  VALUES (
    v_offer.ride_id, v_partner_id, 'accepted', v_now
  )
  ON CONFLICT (ride_id, partner_id) DO UPDATE SET
    partner_status = 'accepted',
    assigned_at = v_now;

  RETURN jsonb_build_object(
    'success', true,
    'ride_id', v_offer.ride_id,
    'status', 'driver_assigned'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_ride_offer(p_offer_id uuid)
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
  WHERE id = p_offer_id AND partner_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer not found or unauthorized');
  END IF;

  IF v_offer.status != 'offered' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Offer is not active');
  END IF;

  UPDATE public.ride_dispatch_offers
  SET status = 'rejected', responded_at = now()
  WHERE id = p_offer_id;

  PERFORM public.dispatch_find_and_offer_ride(v_offer.ride_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

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
  v_now timestamptz := now();
BEGIN
  v_partner_id := auth.uid();
  IF v_partner_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_offer
  FROM public.ride_dispatch_offers
  WHERE partner_id = v_partner_id
    AND status = 'offered'
    AND expires_at > v_now
  ORDER BY offered_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_ride FROM public.ride_bookings WHERE id = v_offer.ride_id;

  RETURN jsonb_build_object(
    'offer_id', v_offer.id,
    'ride_id', v_offer.ride_id,
    'distance_km', v_offer.distance_km,
    'expires_at', v_offer.expires_at,
    'seconds_remaining', EXTRACT(EPOCH FROM (v_offer.expires_at - v_now))::integer,
    'pickup_address', v_ride.pickup_address,
    'drop_address', v_ride.drop_address,
    'estimated_fare', v_ride.estimated_fare,
    'estimated_distance_km', v_ride.estimated_distance_km,
    'ride_type', v_ride.ride_type
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_partner_availability(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_partner_location(numeric, numeric, numeric, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dispatch_find_and_offer_ride(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_ride_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_ride_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_partner_offer() TO authenticated;


-- ==============================================================================
-- PART 4: RIDE SAFETY & EMERGENCY SOS (PHASE 11)
-- ==============================================================================

-- 4.1 Safety columns on ride_bookings
ALTER TABLE public.ride_bookings
  ADD COLUMN IF NOT EXISTS has_active_emergency boolean NOT NULL DEFAULT false;

-- 4.2 Table: emergency_contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contacts' AND policyname = 'Users can view their emergency contacts') THEN
    CREATE POLICY "Users can view their emergency contacts"
      ON public.emergency_contacts FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contacts' AND policyname = 'Users can manage their emergency contacts') THEN
    CREATE POLICY "Users can manage their emergency contacts"
      ON public.emergency_contacts FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 4.3 Table: ride_safety_events
CREATE TABLE IF NOT EXISTS public.ride_safety_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  triggered_by text NOT NULL CHECK (triggered_by IN ('user', 'partner', 'system', 'admin')),
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('sos_button', 'route_deviation', 'excessive_stop', 'accident_suspected', 'manual_report')),
  latitude numeric,
  longitude numeric,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm')),
  message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ride_safety_events_ride_id ON public.ride_safety_events(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_safety_events_status ON public.ride_safety_events(status);
CREATE INDEX IF NOT EXISTS idx_ride_safety_events_created ON public.ride_safety_events(created_at DESC);

ALTER TABLE public.ride_safety_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_safety_events' AND policyname = 'Users can view safety events for their rides') THEN
    CREATE POLICY "Users can view safety events for their rides"
      ON public.ride_safety_events FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.ride_bookings rb WHERE rb.id = ride_safety_events.ride_id AND rb.user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_safety_events' AND policyname = 'Partners can view safety events for assigned rides') THEN
    CREATE POLICY "Partners can view safety events for assigned rides"
      ON public.ride_safety_events FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.ride_assignments ra WHERE ra.ride_id = ride_safety_events.ride_id AND ra.partner_id = auth.uid()));
  END IF;
END $$;

-- 4.4 Safety SOS RPCs
CREATE OR REPLACE FUNCTION public.trigger_ride_sos(
  p_ride_id uuid,
  p_latitude numeric DEFAULT NULL,
  p_longitude numeric DEFAULT NULL,
  p_reason text DEFAULT 'Passenger triggered Emergency SOS'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_booking record;
  v_event_id uuid;
  v_partner_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_booking
  FROM public.ride_bookings
  WHERE id = p_ride_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ride not found');
  END IF;

  SELECT partner_id INTO v_partner_id
  FROM public.ride_assignments
  WHERE ride_id = p_ride_id AND partner_status NOT IN ('rejected', 'cancelled')
  LIMIT 1;

  IF v_booking.user_id != v_uid AND (v_partner_id IS NULL OR v_partner_id != v_uid) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  INSERT INTO public.ride_safety_events (
    ride_id, triggered_by, actor_id, event_type, latitude, longitude, status, message, created_at, updated_at
  )
  VALUES (
    p_ride_id,
    CASE WHEN v_booking.user_id = v_uid THEN 'user' ELSE 'partner' END,
    v_uid,
    'sos_button',
    p_latitude,
    p_longitude,
    'active',
    p_reason,
    now(),
    now()
  )
  RETURNING id INTO v_event_id;

  UPDATE public.ride_bookings
  SET has_active_emergency = true, updated_at = now()
  WHERE id = p_ride_id;

  IF v_partner_id IS NOT NULL THEN
    INSERT INTO public.notifications (partner_id, type, title, message, ride_id, event_key)
    VALUES (
      v_partner_id, 'sos_alert', 'EMERGENCY SOS TRIGGERED',
      'An emergency SOS alert has been triggered for Ride ' || v_booking.booking_reference,
      p_ride_id, v_event_id::text || '::sos::partner'
    )
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('success', true, 'event_id', v_event_id, 'status', 'active');
END;
$$;

CREATE OR REPLACE FUNCTION public.acknowledge_ride_sos(p_safety_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_event record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_event FROM public.ride_safety_events WHERE id = p_safety_event_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Safety event not found');
  END IF;

  UPDATE public.ride_safety_events
  SET status = 'acknowledged', acknowledged_at = now(), acknowledged_by = v_uid, updated_at = now()
  WHERE id = p_safety_event_id;

  RETURN jsonb_build_object('success', true, 'status', 'acknowledged');
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_ride_sos(
  p_safety_event_id uuid,
  p_notes text DEFAULT 'Resolved'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_event record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_event FROM public.ride_safety_events WHERE id = p_safety_event_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Safety event not found');
  END IF;

  UPDATE public.ride_safety_events
  SET
    status = 'resolved',
    resolved_at = now(),
    resolved_by = v_uid,
    message = coalesce(message, '') || ' [Notes: ' || p_notes || ']',
    updated_at = now()
  WHERE id = p_safety_event_id;

  IF NOT EXISTS (
    SELECT 1 FROM public.ride_safety_events
    WHERE ride_id = v_event.ride_id AND id != p_safety_event_id AND status IN ('active', 'acknowledged')
  ) THEN
    UPDATE public.ride_bookings SET has_active_emergency = false, updated_at = now() WHERE id = v_event.ride_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'status', 'resolved');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_ride_sos(p_ride_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event record;
BEGIN
  SELECT * INTO v_event
  FROM public.ride_safety_events
  WHERE ride_id = p_ride_id AND status IN ('active', 'acknowledged')
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN to_jsonb(v_event);
END;
$$;

GRANT EXECUTE ON FUNCTION public.trigger_ride_sos(uuid, numeric, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.acknowledge_ride_sos(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_ride_sos(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_ride_sos(uuid) TO authenticated;


-- ==============================================================================
-- PART 5: ADMIN ACCESS POLICIES ON RECONCILED TABLES
-- ==============================================================================

DO $$ BEGIN
  -- ride_payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_payments' AND policyname = 'Admins can view all ride_payments') THEN
    CREATE POLICY "Admins can view all ride_payments" ON public.ride_payments FOR SELECT TO authenticated USING (public.is_admin());
  END IF;

  -- ride_ratings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_ratings' AND policyname = 'Admins can view all ride_ratings') THEN
    CREATE POLICY "Admins can view all ride_ratings" ON public.ride_ratings FOR SELECT TO authenticated USING (public.is_admin());
  END IF;

  -- partner_locations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_locations' AND policyname = 'Admins can view all partner_locations') THEN
    CREATE POLICY "Admins can view all partner_locations" ON public.partner_locations FOR SELECT TO authenticated USING (public.is_admin());
  END IF;

  -- ride_dispatch_offers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_dispatch_offers' AND policyname = 'Admins can view all ride_dispatch_offers') THEN
    CREATE POLICY "Admins can view all ride_dispatch_offers" ON public.ride_dispatch_offers FOR SELECT TO authenticated USING (public.is_admin());
  END IF;

  -- emergency_contacts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contacts' AND policyname = 'Admins can view all emergency_contacts') THEN
    CREATE POLICY "Admins can view all emergency_contacts" ON public.emergency_contacts FOR SELECT TO authenticated USING (public.is_admin());
  END IF;

  -- ride_safety_events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_safety_events' AND policyname = 'Admins can view all ride_safety_events') THEN
    CREATE POLICY "Admins can view all ride_safety_events" ON public.ride_safety_events FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;


-- ==============================================================================
-- PART 6: PRODUCTION HARDENING & PERFORMANCE (PHASE 13)
-- ==============================================================================

-- 6.1 Composite & High-Throughput Indexes
CREATE INDEX IF NOT EXISTS idx_ride_bookings_status_created
  ON public.ride_bookings (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ride_bookings_driver_status
  ON public.ride_bookings (driver_id, status)
  WHERE driver_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_status_expires
  ON public.ride_dispatch_offers (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_partner_locations_updated
  ON public.partner_locations (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ride_safety_events_status_created
  ON public.ride_safety_events (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_created
  ON public.admin_audit_logs (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target
  ON public.admin_audit_logs (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user_active
  ON public.device_push_tokens (user_id, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_partner_profiles_cat_status
  ON public.partner_profiles (partner_category, status, is_verified);

-- 6.2 Safe RPC: admin_can_bootstrap
CREATE OR REPLACE FUNCTION public.admin_can_bootstrap()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.admin_profiles;
  RETURN (v_count = 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_can_bootstrap() TO anon, authenticated;

-- 6.3 Hardened Audit Log Immutability Constraint
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'admin_audit_logs is an append-only immutable ledger. Updates and deletions are prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON public.admin_audit_logs;
CREATE TRIGGER trg_prevent_audit_log_modification
  BEFORE UPDATE OR DELETE ON public.admin_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_modification();


-- ==============================================================================
-- PART 7: SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_payments;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_ratings;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_locations;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_dispatch_offers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_safety_events;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- ==============================================================================
-- END OF RECONCILIATION MIGRATION
-- ==============================================================================

