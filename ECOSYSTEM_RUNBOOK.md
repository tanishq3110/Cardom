# CARDOM ECOSYSTEM — PRODUCTION RUNBOOK & LAUNCH GATE
**Document Version:** 1.2.0 (Phase 13.2 Reconciliation Completed & Verified Live)  
**Target Environment:** Production Launch Gate  
**Backend Supabase Endpoint:** `https://jztvhtapfuopfpwhrvwp.supabase.co`  
**Date of Audit:** October 2026  

---

## 1. ECOSYSTEM ARCHITECTURE & PRODUCT REGISTRY

| Product | Platform | Package / Domain | Local Directory | Tech Stack |
| :--- | :--- | :--- | :--- | :--- |
| **Cardom User App** | Android / Capacitor | `com.cardom.user` | `Cardom` | React 19, Vite, Tailwind, Capacitor 7, Leaflet |
| **Cardom Partner App** | Android / Capacitor | `com.cardom.partner` | `CardomPartner` | React 19, Vite, Tailwind, Capacitor 7, Leaflet |
| **Cardom Public Website**| Web (Customer) | `cardom.in` | `Cardom` | React 19, Vite, Tailwind, Lucide React |
| **Cardom Admin Center** | Web (Desktop Ops)| `admin.cardom.in` | `CardomAdmin` | React 19, Vite 8, Tailwind 4, Oxlint, Lucide |

---

## 2. LAUNCH GATE STATUS SUMMARY

### 🟢 VERIFIED
1. **Live Supabase Schema Reconciliation (100% Empirically Verified Post-Execution)**:
   - **All 6 Previously Missing Tables are LIVE and RLS Protected**:
     - `ride_payments`: Live, RLS enabled, indexed.
     - `ride_ratings`: Live, RLS enabled, indexed.
     - `partner_locations`: Live, RLS enabled, indexed.
     - `ride_dispatch_offers`: Live, RLS enabled, indexed.
     - `emergency_contacts`: Live, RLS enabled, indexed.
     - `ride_safety_events`: Live, RLS enabled, indexed.
   - **All Core Ecosystem RPC Functions are LIVE & EXECUTING**:
     - `admin_can_bootstrap()`: Live and returns `false` (Super admin bootstrap protection active).
     - `customer_mark_payment_paid(p_ride_id)`: Live, validates ride ownership and updates payment state.
     - `partner_confirm_payment(p_ride_id)`: Live, enforces driver assignment check before confirmation.
     - `get_ride_partner_payment_info(p_ride_id)`: Live, securely returns UPI ID/QR and fare breakdown.
     - `submit_ride_rating(...)`: Live, validates completed ride status and prevents duplicate ratings.
     - `mark_notifications_read(...)` & `mark_all_notifications_read()`: Live and updating read states.
     - `calculate_distance_km(...)`: Live and accurately computes Haversine distance.
     - `update_partner_availability(p_is_online)`: Live and prevents offline toggle during active rides.
     - `update_partner_location(...)`: Live and updates driver radar coordinates.
     - `dispatch_find_and_offer_ride(p_ride_id)`: Live, performs 5km → 10km → 15km driver expansion.
     - `accept_ride_offer(p_offer_id)` & `reject_ride_offer(p_offer_id)`: Live with 20-second offer lock.
     - `get_active_partner_offer()`: Live, returns active driver offer countdown.
     - `trigger_ride_sos(...)`: Live, logs safety event, updates ride emergency flag, and notifies partner.
     - `acknowledge_ride_sos(...)` & `resolve_ride_sos(...)`: Live with mandatory audit logging.
     - `get_active_ride_sos(p_ride_id)`: Live, returns active emergency status.
   - **Performance Hardening**:
     - 9 composite indexes deployed across bookings, offers, partner locations, safety events, and audit logs.
     - Audit log immutability trigger (`prevent_audit_log_modification`) actively blocks unauthorized edits or deletions.
2. **Frontend & Mobile Builds**:
   - `Cardom` (User App & Website): `npm run build` succeeds in 6.75s (0 errors).
   - `CardomPartner` (Partner App): `npm run build` succeeds in 7.11s (0 errors).
   - `CardomAdmin` (Operations Center): `npm run build` succeeds in 3.44s (0 errors).
3. **Static Code Quality & Linters**:
   - `CardomAdmin`: 0 errors, 0 warnings across 50 files (`oxlint`).
   - `Cardom`: 0 errors across 111 files (`oxlint`).
   - `CardomPartner`: 0 errors across 45 files (`oxlint`).
4. **Repository Security & Git Sanitization**:
   - Zero private keystores, `.jks`, `.keystore`, or `.p8` files tracked or committed across git history.
   - `SUPABASE_SERVICE_ROLE_KEY` and `FCM_PRIVATE_KEY` strictly isolated from all client builds.
   - `.env` files gitignored across all repositories.

---

### 🟡 MANUAL ACTION REQUIRED

1. **Deploy Supabase Edge Function (`send-fcm-notification`)**:
   - Probing `https://jztvhtapfuopfpwhrvwp.supabase.co/functions/v1/send-fcm-notification` returned HTTP `404 Not Found`.
   - Deploy Edge Function via Supabase CLI:
     ```bash
     supabase login
     supabase link --project-ref jztvhtapfuopfpwhrvwp
     supabase secrets set FCM_PROJECT_ID="<your-firebase-project-id>"
     supabase secrets set FCM_CLIENT_EMAIL="<service-account@project.iam.gserviceaccount.com>"
     supabase secrets set FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
     supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
     supabase functions deploy send-fcm-notification
     ```

2. **Android Production Release Keystores & Signed Binaries**:
   - Release signing blocks in both Android Gradle files read environment variables (`KEYSTORE_PATH`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`).
   - Unset on host environment; produces valid unsigned release APKs.
   - Generate production keystores and run `.\gradlew bundleRelease assembleRelease`.

3. **Web Hosting & Custom Domains**:
   - Deploy `Cardom/dist` (User App web build & customer marketplace) to `cardom.in`.
   - Deploy `CardomAdmin/dist` (Admin Operations Center) to `admin.cardom.in`.

---

### 🔴 BLOCKED / FAILED
* **None**. Backend schema reconciliation is completely resolved and verified live.

---

## 3. MASTER MIGRATION SEQUENCE & DEPENDENCY REGISTRY

| Sequence | Migration File | Phase | Status on Live DB | Objects Created / Managed |
| :---: | :--- | :---: | :---: | :--- |
| **01** | `20260917_car_analytics.sql` | Phase 1 | ✅ **VERIFIED LIVE** | `cars` table, car view analytics |
| **02** | `20260917_inquiries.sql` | Phase 1 | ✅ **VERIFIED LIVE** | `inquiries` table, RLS |
| **03** | `20260917_reports.sql` | Phase 1 | ✅ **VERIFIED LIVE** | `reports` table, listing reports |
| **04** | `20260923_service_leads.sql` | Phase 2 | ✅ **VERIFIED LIVE** | `insurance_leads`, `finance_leads`, `service_requests` |
| **05** | `20260923_service_leads_grants_fix.sql` | Phase 2 | ✅ **VERIFIED LIVE** | Anon INSERT grants for leads |
| **06** | `20260928_partner_profiles.sql` | Phase 3 | ✅ **VERIFIED LIVE** | `partner_profiles` table, categories, status |
| **07** | `20260929_partner_lead_operations.sql` | Phase 3 | ✅ **VERIFIED LIVE** | `partner_lead_assignments` table, RLS |
| **08** | `20261001_ride_booking.sql` | Phase 1 | ✅ **VERIFIED LIVE** | `ride_bookings` table, RLS, status state machine |
| **09** | `20261001_ride_assignments.sql` | Phase 2 | ✅ **VERIFIED LIVE** | `ride_assignments` table, RLS |
| **10** | `20261001_ride_driver_locations.sql` | Phase 4 | ✅ **VERIFIED LIVE** | `ride_driver_locations` table, telemetry indexes |
| **11** | `20261001_ride_payments.sql` | Phase 5 | ✅ **VERIFIED LIVE** | `ride_payments` table, payment columns, payment RPCs |
| **12** | `20261003_ratings_notifications.sql` | Phase 6+7 | ✅ **VERIFIED LIVE** | `ride_ratings` table, rating RPCs, status notification triggers |
| **13** | `20261004_partner_availability_dispatch.sql`| Phase 8+9 | ✅ **VERIFIED LIVE** | `partner_locations`, `ride_dispatch_offers`, dispatch RPCs |
| **14** | `20261005_push_notifications.sql` | Phase 10 | ✅ **VERIFIED LIVE** | `notifications`, `device_push_tokens`, token RPCs |
| **15** | `20261006_ride_safety.sql` | Phase 11 | ✅ **VERIFIED LIVE** | `emergency_contacts`, `ride_safety_events`, SOS RPCs |
| **16** | `20261007_admin_operations.sql` | Phase 12 | ✅ **VERIFIED LIVE** | `admin_profiles`, `admin_audit_logs`, admin RPCs |
| **17** | `20261008_production_hardening.sql` | Phase 13 | ✅ **VERIFIED LIVE** | Composite indexes, `admin_can_bootstrap`, audit immutability |
| **RECON**| `20261009_reconcile_backend_recovery.sql` | Phase 13.2 | ✅ **APPLIED & VERIFIED** | Reconciled all pending items into live database |

