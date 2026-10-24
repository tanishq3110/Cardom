# React + Vite
# Cardom User Application & Public Web Platform

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.
A production-ready automotive marketplace and on-demand ride booking platform.
- **Android Package**: `com.cardom.user`
- **Stack**: React 19 + Vite + Tailwind CSS + Capacitor Android + Supabase
- **Ecosystem**: Integrated with Cardom Partner (`com.cardom.partner`) and Cardom Admin Operations Center.

Currently, two official plugins are available:
---

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
## 🚀 Capabilities & Implemented Phases

## React Compiler
1. **Marketplace & Public Platform**: Used car listings, advanced search/filters, specifications, seller contact, buy inquiries, sell car submissions.
2. **Value-Added Services**: Auto insurance quotes, car finance EMI calculators, scheduled doorstep service bookings.
3. **Ride Booking & Dispatch (Phase 1–9)**:
   - Economy, Comfort, and Cardom XL ride categories.
   - Interactive Leaflet pickup/drop geocoding.
   - Smart deterministic dispatch: 5km → 10km → 15km progressive radius expansion with 20s offer windows.
   - Atomic ride assignment protection (first-accept-wins).
4. **Live GPS & Telemetry (Phase 4)**: Real-time driver tracking and arrival ETA calculations.
5. **Direct Driver Payments (Phase 5)**: Cash payments and driver-owned UPI QR code settlement with customer "I've Paid" and driver confirmation.
6. **Ratings & Reviews (Phase 6)**: 1–5 star driver feedback and reviews.
7. **Push Notifications & FCM (Phase 10)**: Foreground/background FCM push notifications via native Capacitor plugins.
8. **Ride Safety & Emergency SOS (Phase 11)**:
   - 24/7 Safety Center with direct emergency helplines (112, 100, 102, 1091).
   - Trusted emergency contacts management.
   - Active-ride Emergency SOS trigger broadcasting GPS coordinates to driver and Cardom Admin Operations Center.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
---

## Expanding the Oxlint configuration
## 🛠 Setup & Development

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL=https://jztvhtapfuopfpwhrvwp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_6LnDUgnCTktBqawYdDZ2Bg_VOceIRvM
```
> **Security Rule**: Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

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
$env:KEYSTORE_PATH="C:\path\to\your\release.keystore"
$env:KEYSTORE_PASSWORD="your-keystore-password"
$env:KEY_ALIAS="cardom-key-alias"
$env:KEY_PASSWORD="your-key-password"

.\gradlew assembleRelease
.\gradlew bundleRelease
```
Outputs:
- **Release APK**: `android/app/build/outputs/apk/release/app-release-unsigned.apk` (or signed)
- **Release AAB (Play Store Bundle)**: `android/app/build/outputs/bundle/release/app-release.aab`
