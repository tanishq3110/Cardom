# Cardom Partner Application

The official partner, driver, and service provider application for the Cardom mobility ecosystem.
- **Android Package**: `com.cardom.partner`
- **Stack**: React 19 + Vite + Tailwind CSS + Capacitor Android + Supabase
- **Ecosystem**: Works with Cardom User (`com.cardom.user`) and Cardom Admin Operations Center.

---

## 🚗 Partner Features & Capabilities

1. **Partner Onboarding & Profiles (Phase 1–3)**:
   - Category registration (Car Dealer, Service Center, Insurance, Finance, Driver).
   - Document verification status tracking (`pending`, `active`, `suspended`, `rejected`).
   - Profile management with GSTIN and business registration numbers.
2. **Ride Operations & Dispatch (Phase 8–9)**:
   - Real-time online/offline toggle with availability GPS streaming.
   - 20-second ride offer window with countdown timer and audio/vibration feedback.
   - Atomic acceptance handling (race-condition protected).
3. **Trip Navigation & State Management (Phase 1–5)**:
   - Trip states: `accepted` → `arriving` → `started` → `completed`.
   - Continuous driver GPS location tracking during active rides.
   - Passenger pickup and dropoff coordinates visualization via Leaflet.
4. **Direct UPI & Cash Settlement (Phase 5)**:
   - Instant UPI QR generation using partner's configured UPI ID.
   - Payment confirmation controls for Cash and UPI payments.
5. **Rating & Performance Scorecard (Phase 6–7)**:
   - Average star rating, total review counts, and customer feedback.
6. **Push Notifications & FCM (Phase 10)**:
   - Background and heads-up ride offer notifications with vibration alerts.
7. **Emergency Assistance & SOS (Phase 11)**:
   - Flashing high-priority passenger SOS alert banner with live coordinates.
   - Immediate SOS acknowledgment and resolution controls.
   - One-tap emergency police dialing (112).

---

## 🛠 Setup & Development

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL=https://jztvhtapfuopfpwhrvwp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_6LnDUgnCTktBqawYdDZ2Bg_VOceIRvM
```
> **Security Rule**: Never expose service role keys or Firebase private credentials in mobile/client code.

### 2. Local Web Development
```bash
npm install
npm run dev
```

### 3. Production Web Build
```bash
npm run build
```

---

## 📱 Android Build & Release Guide

### Sync Capacitor Assets
```bash
npm run build
npx cap sync android
```

### Debug Build
```bash
cd android
.\gradlew assembleDebug
```

### Production Release Build (APK & AAB)
Set your keystore environment variables (optional for signed builds):
```powershell
$env:KEYSTORE_PATH="C:\path\to\your\partner-release.keystore"
$env:KEYSTORE_PASSWORD="your-keystore-password"
$env:KEY_ALIAS="cardom-partner-alias"
$env:KEY_PASSWORD="your-key-password"

.\gradlew assembleRelease
.\gradlew bundleRelease
```
Outputs:
- **Release APK**: `android/app/build/outputs/apk/release/app-release-unsigned.apk` (or signed)
- **Release AAB (Play Store Bundle)**: `android/app/build/outputs/bundle/release/app-release.aab`
