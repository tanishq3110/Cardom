-- ============================================================
-- CARDOM — PHASE 12: ADMIN OPERATIONS SUBSYSTEM
-- Migration: 20261007_admin_operations.sql
-- ============================================================

-- 0. Admin Profiles Table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text NOT NULL DEFAULT 'Admin',
  role        text NOT NULL DEFAULT 'ADMIN' 
              CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT', 'SAFETY_ADMIN', 'FINANCE_ADMIN')),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_role   ON public.admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_active ON public.admin_profiles(is_active);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Helper Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_active boolean;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT is_active INTO v_is_active
  FROM public.admin_profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_is_active, false);
END;
$$;

-- 2. Helper Function: is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT role INTO v_role
  FROM public.admin_profiles
  WHERE id = p_user_id AND is_active = true;

  RETURN (v_role = 'SUPER_ADMIN');
END;
$$;

-- 3. RLS Policies for admin_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_profiles' AND policyname = 'Admins can view admin profiles') THEN
    CREATE POLICY "Admins can view admin profiles"
      ON public.admin_profiles FOR SELECT TO authenticated
      USING (public.is_admin() OR id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_profiles' AND policyname = 'Super admins can manage admin profiles') THEN
    CREATE POLICY "Super admins can manage admin profiles"
      ON public.admin_profiles FOR ALL TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

-- 4. Admin Audit Logs Table (Append-Only)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action       text NOT NULL,
  target_type  text NOT NULL,
  target_id    text,
  before_data  jsonb,
  after_data   jsonb,
  reason       text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id    ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target      ON public.admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at  ON public.admin_audit_logs(created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_logs' AND policyname = 'Admins can view audit logs') THEN
    CREATE POLICY "Admins can view audit logs"
      ON public.admin_audit_logs FOR SELECT TO authenticated
      USING (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_logs' AND policyname = 'Admins can insert audit logs') THEN
    CREATE POLICY "Admins can insert audit logs"
      ON public.admin_audit_logs FOR INSERT TO authenticated
      WITH CHECK (public.is_admin() AND (admin_id = auth.uid() OR admin_id IS NULL));
  END IF;
END $$;

-- 5. Safe Admin SELECT Policies on Existing Ecosystem Tables
DO $$ BEGIN
  -- profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
      CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- partner_profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_profiles' AND policyname = 'Admins can view all partner_profiles') THEN
      CREATE POLICY "Admins can view all partner_profiles" ON public.partner_profiles FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- cars
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cars') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'Admins can view all cars') THEN
      CREATE POLICY "Admins can view all cars" ON public.cars FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- inquiries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inquiries') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inquiries' AND policyname = 'Admins can view all inquiries') THEN
      CREATE POLICY "Admins can view all inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- insurance_leads
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'insurance_leads') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'insurance_leads' AND policyname = 'Admins can view all insurance_leads') THEN
      CREATE POLICY "Admins can view all insurance_leads" ON public.insurance_leads FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- finance_leads
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finance_leads') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_leads' AND policyname = 'Admins can view all finance_leads') THEN
      CREATE POLICY "Admins can view all finance_leads" ON public.finance_leads FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- service_requests
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_requests') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Admins can view all service_requests') THEN
      CREATE POLICY "Admins can view all service_requests" ON public.service_requests FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- ride_bookings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_bookings') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_bookings' AND policyname = 'Admins can view all ride_bookings') THEN
      CREATE POLICY "Admins can view all ride_bookings" ON public.ride_bookings FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- ride_assignments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_assignments') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_assignments' AND policyname = 'Admins can view all ride_assignments') THEN
      CREATE POLICY "Admins can view all ride_assignments" ON public.ride_assignments FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- ride_dispatch_offers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_dispatch_offers') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_dispatch_offers' AND policyname = 'Admins can view all ride_dispatch_offers') THEN
      CREATE POLICY "Admins can view all ride_dispatch_offers" ON public.ride_dispatch_offers FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- ride_driver_locations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_driver_locations') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_driver_locations' AND policyname = 'Admins can view all ride_driver_locations') THEN
      CREATE POLICY "Admins can view all ride_driver_locations" ON public.ride_driver_locations FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- partner_locations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_locations') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_locations' AND policyname = 'Admins can view all partner_locations') THEN
      CREATE POLICY "Admins can view all partner_locations" ON public.partner_locations FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- ride_payments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_payments') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_payments' AND policyname = 'Admins can view all ride_payments') THEN
      CREATE POLICY "Admins can view all ride_payments" ON public.ride_payments FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- ride_ratings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_ratings') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_ratings' AND policyname = 'Admins can view all ride_ratings') THEN
      CREATE POLICY "Admins can view all ride_ratings" ON public.ride_ratings FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- notifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Admins can view all notifications') THEN
      CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- emergency_contacts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergency_contacts') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emergency_contacts' AND policyname = 'Admins can view all emergency_contacts') THEN
      CREATE POLICY "Admins can view all emergency_contacts" ON public.emergency_contacts FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- ride_safety_events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_safety_events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ride_safety_events' AND policyname = 'Admins can view all ride_safety_events') THEN
      CREATE POLICY "Admins can view all ride_safety_events" ON public.ride_safety_events FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- device_push_tokens
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'device_push_tokens') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'device_push_tokens' AND policyname = 'Admins can view all device_push_tokens') THEN
      CREATE POLICY "Admins can view all device_push_tokens" ON public.device_push_tokens FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;

  -- push_notification_deliveries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'push_notification_deliveries') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_notification_deliveries' AND policyname = 'Admins can view all push_notification_deliveries') THEN
      CREATE POLICY "Admins can view all push_notification_deliveries" ON public.push_notification_deliveries FOR SELECT TO authenticated USING (public.is_admin());
    END IF;
  END IF;
END $$;

-- 6. RPC: admin_check_access
CREATE OR REPLACE FUNCTION public.admin_check_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_admin record;
  v_total_admins integer;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('is_admin', false, 'error', 'Unauthenticated');
  END IF;

  SELECT count(*) INTO v_total_admins FROM public.admin_profiles;

  SELECT * INTO v_admin
  FROM public.admin_profiles
  WHERE id = v_uid;

  IF FOUND AND v_admin.is_active = true THEN
    RETURN jsonb_build_object(
      'is_admin', true,
      'role', v_admin.role,
      'full_name', v_admin.full_name,
      'email', v_admin.email,
      'can_bootstrap', false
    );
  END IF;

  -- If zero admins exist, allow bootstrap
  IF v_total_admins = 0 THEN
    RETURN jsonb_build_object(
      'is_admin', false,
      'can_bootstrap', true
    );
  END IF;

  RETURN jsonb_build_object('is_admin', false, 'error', 'Unauthorized');
END;
$$;

-- 7. RPC: admin_bootstrap_first_admin
CREATE OR REPLACE FUNCTION public.admin_bootstrap_first_admin(p_full_name text DEFAULT 'Super Admin')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_count integer;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated');
  END IF;

  SELECT count(*) INTO v_count FROM public.admin_profiles;
  IF v_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin already bootstrapped');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

  INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
  VALUES (v_uid, COALESCE(v_email, 'admin@cardom.com'), COALESCE(p_full_name, 'Super Admin'), 'SUPER_ADMIN', true);

  -- Log bootstrap action
  INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, after_data, reason)
  VALUES (v_uid, 'BOOTSTRAP_FIRST_ADMIN', 'admin_profiles', v_uid::text, jsonb_build_object('role', 'SUPER_ADMIN'), 'Initial system setup');

  RETURN jsonb_build_object('success', true, 'role', 'SUPER_ADMIN');
END;
$$;

-- 8. RPC: admin_update_partner_status
CREATE OR REPLACE FUNCTION public.admin_update_partner_status(
  p_partner_id uuid,
  p_status text,
  p_is_verified boolean DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_before record;
  v_updated record;
BEGIN
  IF NOT public.is_admin(v_admin_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF p_status NOT IN ('pending', 'active', 'suspended', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid partner status');
  END IF;

  SELECT * INTO v_before FROM public.partner_profiles WHERE id = p_partner_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Partner not found');
  END IF;

  UPDATE public.partner_profiles
  SET 
    status = p_status,
    is_verified = COALESCE(p_is_verified, is_verified),
    updated_at = now()
  WHERE id = p_partner_id
  RETURNING * INTO v_updated;

  -- Append audit log
  INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, before_data, after_data, reason)
  VALUES (
    v_admin_id,
    'UPDATE_PARTNER_STATUS',
    'partner_profiles',
    p_partner_id::text,
    to_jsonb(v_before),
    to_jsonb(v_updated),
    p_reason
  );

  RETURN jsonb_build_object('success', true, 'partner', to_jsonb(v_updated));
END;
$$;

-- 9. RPC: admin_moderate_car
CREATE OR REPLACE FUNCTION public.admin_moderate_car(
  p_car_id uuid,
  p_status text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_before record;
  v_updated record;
BEGIN
  IF NOT public.is_admin(v_admin_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT * INTO v_before FROM public.cars WHERE id = p_car_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Car listing not found');
  END IF;

  UPDATE public.cars
  SET status = p_status
  WHERE id = p_car_id
  RETURNING * INTO v_updated;

  INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, before_data, after_data, reason)
  VALUES (
    v_admin_id,
    'MODERATE_CAR_LISTING',
    'cars',
    p_car_id::text,
    to_jsonb(v_before),
    to_jsonb(v_updated),
    p_reason
  );

  RETURN jsonb_build_object('success', true, 'car', to_jsonb(v_updated));
END;
$$;

-- 10. RPC: admin_resolve_sos
CREATE OR REPLACE FUNCTION public.admin_resolve_sos(
  p_safety_event_id uuid,
  p_resolution_notes text DEFAULT 'Resolved by admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_before record;
  v_updated record;
BEGIN
  IF NOT public.is_admin(v_admin_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT * INTO v_before FROM public.ride_safety_events WHERE id = p_safety_event_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'SOS event not found');
  END IF;

  UPDATE public.ride_safety_events
  SET 
    status = 'resolved',
    resolved_at = now(),
    resolved_by = v_admin_id,
    message = COALESCE(message, '') || ' [Admin note: ' || COALESCE(p_resolution_notes, 'Resolved') || ']'
  WHERE id = p_safety_event_id
  RETURNING * INTO v_updated;

  INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, before_data, after_data, reason)
  VALUES (
    v_admin_id,
    'RESOLVE_SOS_INCIDENT',
    'ride_safety_events',
    p_safety_event_id::text,
    to_jsonb(v_before),
    to_jsonb(v_updated),
    p_resolution_notes
  );

  RETURN jsonb_build_object('success', true, 'event', to_jsonb(v_updated));
END;
$$;

-- 11. RPC: admin_get_ecosystem_stats
CREATE OR REPLACE FUNCTION public.admin_get_ecosystem_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users integer := 0;
  v_total_partners integer := 0;
  v_online_partners integer := 0;
  v_pending_partners integer := 0;
  v_total_cars integer := 0;
  v_active_rides integer := 0;
  v_today_rides integer := 0;
  v_completed_rides integer := 0;
  v_cancelled_rides integer := 0;
  v_active_sos integer := 0;
  v_unresolved_sos integer := 0;
  v_total_leads integer := 0;
  v_total_revenue numeric := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  -- Users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    SELECT count(*) INTO v_total_users FROM public.profiles;
  END IF;

  -- Partners
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_profiles') THEN
    SELECT count(*) INTO v_total_partners FROM public.partner_profiles;
    SELECT count(*) INTO v_online_partners FROM public.partner_profiles WHERE is_online = true;
    SELECT count(*) INTO v_pending_partners FROM public.partner_profiles WHERE status = 'pending' OR is_verified = false;
  END IF;

  -- Cars
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cars') THEN
    SELECT count(*) INTO v_total_cars FROM public.cars;
  END IF;

  -- Rides
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_bookings') THEN
    SELECT count(*) INTO v_active_rides FROM public.ride_bookings WHERE status IN ('searching', 'driver_assigned', 'arriving', 'started');
    SELECT count(*) INTO v_today_rides FROM public.ride_bookings WHERE created_at >= date_trunc('day', now());
    SELECT count(*) INTO v_completed_rides FROM public.ride_bookings WHERE status = 'completed';
    SELECT count(*) INTO v_cancelled_rides FROM public.ride_bookings WHERE status = 'cancelled';
    SELECT COALESCE(sum(COALESCE(final_fare, estimated_fare)), 0) INTO v_total_revenue FROM public.ride_bookings WHERE status = 'completed';
  END IF;

  -- Safety
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ride_safety_events') THEN
    SELECT count(*) INTO v_active_sos FROM public.ride_safety_events WHERE status IN ('active', 'acknowledged');
    SELECT count(*) INTO v_unresolved_sos FROM public.ride_safety_events WHERE status != 'resolved';
  END IF;

  -- Leads sum
  SELECT (
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'insurance_leads') THEN (SELECT count(*) FROM public.insurance_leads) ELSE 0 END) +
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finance_leads') THEN (SELECT count(*) FROM public.finance_leads) ELSE 0 END) +
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_requests') THEN (SELECT count(*) FROM public.service_requests) ELSE 0 END) +
    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inquiries') THEN (SELECT count(*) FROM public.inquiries) ELSE 0 END)
  ) INTO v_total_leads;

  RETURN jsonb_build_object(
    'total_users', v_total_users,
    'total_partners', v_total_partners,
    'online_partners', v_online_partners,
    'pending_partners', v_pending_partners,
    'total_cars', v_total_cars,
    'active_rides', v_active_rides,
    'today_rides', v_today_rides,
    'completed_rides', v_completed_rides,
    'cancelled_rides', v_cancelled_rides,
    'active_sos', v_active_sos,
    'unresolved_sos', v_unresolved_sos,
    'total_leads', v_total_leads,
    'total_revenue', v_total_revenue
  );
END;
$$;
