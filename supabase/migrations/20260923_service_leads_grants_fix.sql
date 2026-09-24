-- Fix: Grant INSERT to anon role for all three lead tables
-- Run this in Supabase Dashboard > SQL Editor

GRANT SELECT, INSERT, UPDATE ON public.insurance_leads TO authenticated;
GRANT INSERT ON public.insurance_leads TO anon;

GRANT SELECT, INSERT, UPDATE ON public.finance_leads TO authenticated;
GRANT INSERT ON public.finance_leads TO anon;

GRANT SELECT, INSERT, UPDATE ON public.service_requests TO authenticated;
GRANT INSERT ON public.service_requests TO anon;

