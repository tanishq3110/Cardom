-- ============================================================
-- CARDOM PHASE 5: DIRECT UPI & CASH PAYMENTS + RIDE RECEIPTS
-- Migration: 20261001_ride_payments.sql
-- ============================================================

-- 1. Add final_fare and payment_confirmed_at to public.ride_bookings
ALTER TABLE public.ride_bookings
  ADD COLUMN IF NOT EXISTS final_fare numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;

-- 2. Add UPI payment fields to public.partner_profiles
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS upi_id text,
  ADD COLUMN IF NOT EXISTS upi_qr_url text;

-- 3. Create public.ride_payments table
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

-- Enable RLS
ALTER TABLE public.ride_payments ENABLE ROW LEVEL SECURITY;

-- Customer can read payment record for their own rides
DROP POLICY IF EXISTS "Customers can view payments for their rides" ON public.ride_payments;
CREATE POLICY "Customers can view payments for their rides"
  ON public.ride_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ride_bookings b
      WHERE b.id = ride_payments.ride_id
        AND b.user_id = auth.uid()
    )
  );

-- Partner can read payment record for assigned rides
DROP POLICY IF EXISTS "Partners can view payments for assigned rides" ON public.ride_payments;
CREATE POLICY "Partners can view payments for assigned rides"
  ON public.ride_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ride_assignments a
      WHERE a.ride_id = ride_payments.ride_id
        AND a.partner_id = auth.uid()
    )
  );

-- 4. RPC: Customer marks payment as paid (Cash or UPI)
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
  -- Verify caller owns the ride
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

  -- Update ride_bookings
  UPDATE public.ride_bookings
  SET
    payment_status = 'customer_marked_paid',
    payment_method = v_method,
    final_fare = v_amount,
    updated_at = now()
  WHERE id = p_ride_id;

  -- Upsert ride_payments
  INSERT INTO public.ride_payments (
    ride_id,
    payment_method,
    amount,
    status,
    customer_marked_paid_at,
    updated_at
  )
  VALUES (
    p_ride_id,
    v_method,
    v_amount,
    'customer_marked_paid',
    now(),
    now()
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

-- 5. RPC: Partner confirms receipt of payment
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
  -- Verify partner is assigned to this ride
  SELECT * INTO v_assignment
  FROM public.ride_assignments
  WHERE ride_id = p_ride_id
    AND partner_id = auth.uid()
    AND partner_status NOT IN ('rejected', 'cancelled');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized to confirm payment for this ride';
  END IF;

  SELECT * INTO v_booking
  FROM public.ride_bookings
  WHERE id = p_ride_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride booking not found';
  END IF;

  v_amount := coalesce(v_booking.final_fare, v_booking.estimated_fare, 0);

  -- Update ride_bookings
  UPDATE public.ride_bookings
  SET
    payment_status = 'confirmed',
    payment_confirmed_at = now(),
    final_fare = v_amount,
    updated_at = now()
  WHERE id = p_ride_id;

  -- Upsert / Update ride_payments
  INSERT INTO public.ride_payments (
    ride_id,
    payment_method,
    amount,
    status,
    partner_confirmed_at,
    updated_at
  )
  VALUES (
    p_ride_id,
    coalesce(v_booking.payment_method, 'cash'),
    v_amount,
    'confirmed',
    now(),
    now()
  )
  ON CONFLICT (ride_id) DO UPDATE SET
    status = 'confirmed',
    partner_confirmed_at = now(),
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'ride_id', p_ride_id,
    'payment_status', 'confirmed',
    'payment_confirmed_at', now()
  );
END;
$$;

-- 6. RPC: Securely fetch assigned partner payment info for user
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
  v_assignment record;
  v_profile record;
BEGIN
  -- Check caller is either customer or assigned partner
  SELECT * INTO v_booking
  FROM public.ride_bookings
  WHERE id = p_ride_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found';
  END IF;

  IF v_booking.user_id <> auth.uid() THEN
    -- Check if caller is the assigned partner
    IF NOT EXISTS (
      SELECT 1 FROM public.ride_assignments
      WHERE ride_id = p_ride_id AND partner_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;
  END IF;

  -- Get assigned partner
  SELECT a.*, p.business_name, p.authorized_contact_name, p.upi_id, p.upi_qr_url
  INTO v_assignment
  FROM public.ride_assignments a
  JOIN public.partner_profiles p ON p.id = a.partner_id
  WHERE a.ride_id = p_ride_id
    AND a.partner_status NOT IN ('rejected', 'cancelled')
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'upi_id', null,
      'upi_qr_url', null,
      'partner_name', 'Cardom Driver'
    );
  END IF;

  RETURN jsonb_build_object(
    'upi_id', v_assignment.upi_id,
    'upi_qr_url', v_assignment.upi_qr_url,
    'partner_name', coalesce(v_assignment.authorized_contact_name, v_assignment.business_name, 'Cardom Driver')
  );
END;
$$;

