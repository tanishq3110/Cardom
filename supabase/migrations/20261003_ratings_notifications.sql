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
    CREATE POLICY "Users can view ratings for their rides" ON public.ride_ratings FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_ratings' AND policyname = 'Partners can view ratings for their rides') THEN
    CREATE POLICY "Partners can view ratings for their rides" ON public.ride_ratings FOR SELECT TO authenticated USING (partner_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  ride_id uuid REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  event_key text UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_partner_id ON public.notifications(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their notifications') THEN
    CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Partners can view their notifications') THEN
    CREATE POLICY "Partners can view their notifications" ON public.notifications FOR SELECT TO authenticated USING (partner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their notifications') THEN
    CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Partners can update their notifications') THEN
    CREATE POLICY "Partners can update their notifications" ON public.notifications FOR UPDATE TO authenticated USING (partner_id = auth.uid()) WITH CHECK (partner_id = auth.uid());
  END IF;
END $$;

-- Enable Realtime for notifications table
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

CREATE OR REPLACE FUNCTION public.submit_ride_rating(p_ride_id uuid, p_rating integer, p_review text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ride record;
  v_partner_id uuid;
  v_result record;
BEGIN
  SELECT * INTO v_ride FROM public.ride_bookings WHERE id = p_ride_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Ride not found'); END IF;
  IF v_ride.status != 'completed' THEN RETURN jsonb_build_object('success', false, 'error', 'Ride not completed'); END IF;
  IF v_ride.user_id != auth.uid() THEN RETURN jsonb_build_object('success', false, 'error', 'Unauthorized'); END IF;

  SELECT partner_id INTO v_partner_id FROM public.ride_assignments WHERE ride_id = p_ride_id AND partner_status NOT IN ('rejected','cancelled') LIMIT 1;
  IF v_partner_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Partner not found'); END IF;

  INSERT INTO public.ride_ratings (ride_id, user_id, partner_id, rating, review)
  VALUES (p_ride_id, auth.uid(), v_partner_id, p_rating, p_review)
  ON CONFLICT (ride_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, review = EXCLUDED.review, updated_at = now()
  RETURNING * INTO v_result;

  INSERT INTO public.notifications (partner_id, type, title, message, ride_id, event_key)
  VALUES (v_partner_id, 'rating_received', 'New Rating Received', 'You received a ' || p_rating || '-star rating from a recent ride.', p_ride_id, p_ride_id::text || '::rating_received::partner')
  ON CONFLICT (event_key) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'ride_id', p_ride_id, 'partner_id', v_partner_id, 'rating', p_rating);
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_ids uuid[])
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.notifications SET is_read = true WHERE id = ANY(p_ids) AND (user_id = auth.uid() OR partner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.notifications SET is_read = true WHERE user_id = auth.uid() OR partner_id = auth.uid();
$$;

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
  
  SELECT partner_id INTO v_partner_id FROM public.ride_assignments WHERE ride_id = NEW.id AND partner_status NOT IN ('rejected','cancelled') LIMIT 1;

  CASE NEW.status
    WHEN 'driver_assigned' THEN
      v_title := 'Driver Assigned'; v_message := 'Your driver has been assigned. They will be arriving soon.'; v_event_key_user := NEW.id::text || '::driver_assigned::user';
    WHEN 'arriving' THEN
      v_title := 'Driver Arriving'; v_message := 'Your driver is on the way to your pickup location.'; v_event_key_user := NEW.id::text || '::arriving::user';
    WHEN 'started' THEN
      v_title := 'Ride Started'; v_message := 'Your ride has started. Enjoy your journey!'; v_event_key_user := NEW.id::text || '::started::user';
    WHEN 'completed' THEN
      v_title := 'Ride Completed'; v_message := 'Your ride has been completed. Please make payment.'; v_event_key_user := NEW.id::text || '::completed::user';
      v_partner_title := 'Ride Completed'; v_partner_message := 'The ride has been completed successfully.'; v_event_key_partner := NEW.id::text || '::completed::partner';
    WHEN 'cancelled' THEN
      v_title := 'Ride Cancelled'; v_message := 'Your ride has been cancelled.'; v_event_key_user := NEW.id::text || '::cancelled::user';
    ELSE RETURN NEW;
  END CASE;

  IF v_title IS NOT NULL AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, ride_id, event_key) VALUES (NEW.user_id, NEW.status, v_title, v_message, NEW.id, v_event_key_user) ON CONFLICT (event_key) DO NOTHING;
  END IF;

  IF v_partner_title IS NOT NULL AND v_partner_id IS NOT NULL THEN
    INSERT INTO public.notifications (partner_id, type, title, message, ride_id, event_key) VALUES (v_partner_id, 'ride_completed', v_partner_title, v_partner_message, NEW.id, v_event_key_partner) ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_ride_status ON public.ride_bookings;
CREATE TRIGGER trg_notify_ride_status AFTER UPDATE OF status ON public.ride_bookings FOR EACH ROW EXECUTE FUNCTION public.notify_on_ride_status_change();

CREATE OR REPLACE FUNCTION public.notify_on_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
BEGIN
  IF NEW.payment_status = OLD.payment_status OR NEW.payment_status IS NULL THEN RETURN NEW; END IF;
  
  SELECT partner_id INTO v_partner_id FROM public.ride_assignments WHERE ride_id = NEW.id AND partner_status NOT IN ('rejected','cancelled') LIMIT 1;

  CASE NEW.payment_status
    WHEN 'customer_marked_paid' THEN
      IF v_partner_id IS NOT NULL THEN
        INSERT INTO public.notifications (partner_id, type, title, message, ride_id, event_key) VALUES (v_partner_id, 'customer_marked_paid', 'Payment Marked', 'The customer has marked the payment as paid. Please confirm receipt.', NEW.id, NEW.id::text || '::customer_marked_paid::partner') ON CONFLICT (event_key) DO NOTHING;
      END IF;
    WHEN 'confirmed' THEN
      IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, ride_id, event_key) VALUES (NEW.user_id, 'payment_confirmed', 'Payment Confirmed', 'Your payment has been confirmed by the driver. Thank you!', NEW.id, NEW.id::text || '::payment_confirmed::user') ON CONFLICT (event_key) DO NOTHING;
        INSERT INTO public.notifications (user_id, type, title, message, ride_id, event_key) VALUES (NEW.user_id, 'rating_reminder', 'Rate Your Ride', 'How was your ride? Share your experience with the driver.', NEW.id, NEW.id::text || '::rating_reminder::user') ON CONFLICT (event_key) DO NOTHING;
      END IF;
    ELSE NULL;
  END CASE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_payment_status ON public.ride_bookings;
CREATE TRIGGER trg_notify_payment_status AFTER UPDATE OF payment_status ON public.ride_bookings FOR EACH ROW EXECUTE FUNCTION public.notify_on_payment_status_change();
