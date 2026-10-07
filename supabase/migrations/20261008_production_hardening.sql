-- ============================================================
-- CARDOM — PHASE 13: PRODUCTION READINESS & SECURITY HARDENING
-- Migration: 20261008_production_hardening.sql
-- ============================================================

-- ── 1. Composite & Performance Indexes for Production High-Throughput ──

-- Fast ride filtering by status and date (used by Dashboard, Rides page, Live Radar)
CREATE INDEX IF NOT EXISTS idx_ride_bookings_status_created 
  ON public.ride_bookings (status, created_at DESC);

-- Fast active ride lookup by driver
CREATE INDEX IF NOT EXISTS idx_ride_bookings_driver_status 
  ON public.ride_bookings (driver_id, status) 
  WHERE driver_id IS NOT NULL;

-- Fast dispatch offer timeout evaluation and status queries
CREATE INDEX IF NOT EXISTS idx_ride_dispatch_offers_status_expires 
  ON public.ride_dispatch_offers (status, expires_at);

-- Fast partner availability & location radar queries
CREATE INDEX IF NOT EXISTS idx_partner_locations_updated 
  ON public.partner_locations (updated_at DESC);

-- Fast safety and emergency incident queue queries
CREATE INDEX IF NOT EXISTS idx_ride_safety_events_status_created 
  ON public.ride_safety_events (status, created_at DESC);

-- Fast audit log filtering by action, timestamp, and target
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_created 
  ON public.admin_audit_logs (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target 
  ON public.admin_audit_logs (target_type, target_id);

-- Fast active push token lookup by user
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user_active 
  ON public.device_push_tokens (user_id, is_active) 
  WHERE is_active = true;

-- Fast partner profiles category and verification filter
CREATE INDEX IF NOT EXISTS idx_partner_profiles_cat_status 
  ON public.partner_profiles (partner_category, status, is_verified);


-- ── 2. Safe RPC: admin_can_bootstrap ─────────────────────────
-- Allows the login screen to safely query if initial setup is permitted
-- without exposing internal tables or triggering RLS permission errors.
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


-- ── 3. Hardened Audit Log Immutability Constraint ─────────────
-- Ensure that audit logs cannot be modified or deleted by anyone
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
