# Cardom Ecosystem — Production Operations & Disaster Recovery Runbook

This runbook documents production operations, database backup & disaster recovery, secret management, FCM push configuration, and Android release procedures across the Cardom ecosystem:
1. **Cardom User App** (`com.cardom.user`)
2. **Cardom Partner App** (`com.cardom.partner`)
3. **Cardom Public Marketplace / Website**
4. **Cardom Admin Operations Center**

---

## 1. 🔐 Secrets & Key Separation Strategy

| Secret / Key | Usage Scope | Storage Location | Allowed in Frontend? |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | All client apps | `.env` | **YES** (Public) |
| `VITE_SUPABASE_ANON_KEY` | All client apps | `.env` | **YES** (Public, guarded by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions only | Supabase Vault / Secrets | ❌ **STRICTLY PROHIBITED** |
| `FCM_PROJECT_ID` | FCM HTTP v1 API | Supabase Edge Function Secrets | ❌ **SERVER-ONLY** |
| `FCM_CLIENT_EMAIL` | FCM Service Account | Supabase Edge Function Secrets | ❌ **SERVER-ONLY** |
| `FCM_PRIVATE_KEY` | FCM Service Account | Supabase Edge Function Secrets | ❌ **SERVER-ONLY** |
| Android Signing Keystores | APK / AAB signing | Local secure vault / CI secrets | ❌ **NEVER COMMIT TO GIT** |

### Setting Supabase Edge Function Secrets
To deploy and configure the FCM notification dispatcher:
```bash
npx supabase secrets set FCM_PROJECT_ID="your-firebase-project-id" \
  FCM_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com" \
  FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## 2. 🗄️ Database Backup & Disaster Recovery

### Automated Backups (Supabase Hosted)
- **Daily Physical Backups**: Retained automatically for 7 days on Supabase Free / Pro.
- **Point-in-Time Recovery (PITR)**: Enable PITR in the Supabase Dashboard under *Project Settings -> Database -> Backups* for sub-minute disaster recovery.

### Manual On-Demand Backup (CLI)
To take a full SQL snapshot of the production database:
```bash
pg_dump -h db.jztvhtapfuopfpwhrvwp.supabase.co -U postgres -d postgres \
  --clean --if-exists --no-owner --no-privileges \
  -f "cardom_backup_$(date +%Y%m%d_%H%M%S).sql"
```

### Full Database Restore Procedure
1. Create a clean database target or flush conflicting tables.
2. Apply migrations in sequential timestamp order:
   - `20260917_inquiries.sql`
   - `20260917_reports.sql`
   - `20260917_car_analytics.sql`
   - `20260923_service_leads.sql`
   - `20261001_ride_booking.sql`
   - `20261001_ride_payments.sql`
   - `20261003_ratings_notifications.sql`
   - `20261004_partner_availability_dispatch.sql`
   - `20261005_push_notifications.sql`
   - `20261006_ride_safety.sql`
   - `20261007_admin_operations.sql`
   - `20261008_production_hardening.sql`
3. Restore table data from snapshot if doing disaster recovery.

---

## 3. 🛡️ Security & Access Control Model

### Row Level Security (RLS)
- Every table has RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Standard users can only access their own records (`user_id = auth.uid()`).
- Partners can only access assigned trips and relevant leads (`partner_id = auth.uid()`).
- Administrators access rows through `public.is_admin(user_id)` `SECURITY DEFINER` policies.
- Audit logs in `public.admin_audit_logs` are protected by a trigger preventing any `UPDATE` or `DELETE` operations.

---

## 4. 📱 Android Release & Signing Instructions

### Generating a Production Keystore
```bash
keytool -genkeypair -v -keystore cardom-release.keystore -alias cardom-key \
  -keyalg RSA -keysize 2048 -validity 10000
```

### Building Signed Release APK & Bundle (AAB)
```powershell
$env:KEYSTORE_PATH="C:\path\to\cardom-release.keystore"
$env:KEYSTORE_PASSWORD="password"
$env:KEY_ALIAS="cardom-key"
$env:KEY_PASSWORD="password"

# Cardom User App
cd C:\Users\danish\OneDrive\Desktop\Cardom\android
.\gradlew assembleRelease
.\gradlew bundleRelease

# Cardom Partner App
cd C:\Users\danish\OneDrive\Desktop\CardomPartner\android
.\gradlew assembleRelease
.\gradlew bundleRelease
```

---

## 5. 🌐 Web Platform Deployment (Vercel / Cloudflare Pages / Netlify)

### Cardom Admin (`C:\Users\danish\OneDrive\Desktop\CardomAdmin`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Cardom Public Website (`C:\Users\danish\OneDrive\Desktop\Cardom`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
