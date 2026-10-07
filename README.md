# Cardom Admin Operations Center

A desktop-first responsive web application for internal administration, dispatch monitoring, safety incident control, and ecosystem management across the entire Cardom platform:
1. **Cardom User App** (`com.cardom.user`)
2. **Cardom Partner App** (`com.cardom.partner`)
3. **Cardom Website** (Public car marketplace, insurance, finance, services, and inquiries)

---

## 🛠 Technology Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 4 with custom dark automotive operations design system
- **Routing**: React Router 7
- **Database & Auth**: Supabase JS (`@supabase/supabase-js`)
- **Mapping & Telemetry**: Leaflet 1.9 with CartoDB Dark Matter tile server
- **Icons**: Lucide React
- **Linter**: Oxlint

---

## 🔐 Security & Authorization Architecture

- **Zero Service-Role Exposure**: The application strictly runs on browser-safe environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
- **Database-Enforced Authorization**: Admin access is verified through Supabase RLS and the PostgreSQL `SECURITY DEFINER` function `public.is_admin(user_id)`.
- **Tamper-Proof Audit Trail**: All privileged actions (e.g. partner approvals, driver suspensions, listing moderations, SOS resolutions) are recorded into the append-only `public.admin_audit_logs` ledger.
- **Controlled SOS Resolution**: Emergency incidents cannot be silently marked safe; they require mandatory audit resolution notes recorded with the resolving admin's UUID.

---

## 🗺 Application Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/login` | Administrator authentication & initial Super Admin bootstrap | Public |
| `/dashboard` | Mission Control ecosystem KPI overview & quick action hub | Admin |
| `/live-rides` | Real-time map radar of active trips, drivers, and GPS telemetry | Admin |
| `/safety` | SOS & Emergency Incident Command Center with live coordinates | Admin |
| `/safety/history` | Historical resolved and cancelled emergency incidents archive | Admin |
| `/dispatch` | Smart dispatch monitor (5km → 10km → 15km expansion & 20s offer timer) | Admin |
| `/users` | Customer & passenger directory with search and pagination | Admin |
| `/users/:id` | 360-degree user dossier (rides, leads, safety incidents, reviews) | Admin |
| `/partners` | Partner fleet directory (drivers, service centers, dealerships) | Admin |
| `/partners/:id` | Partner dossier, credential verification, and suspension controls | Admin |
| `/cars` | Public marketplace inventory moderation & listing controls | Admin |
| `/cars/:id` | Vehicle listing specifications, seller details, and buyer inquiries | Admin |
| `/leads` | Unified inbound customer pipeline (Insurance, Finance, Service, Inquiries) | Admin |
| `/leads/:type/:id` | Detailed customer request dossier and partner assignments | Admin |
| `/rides` | City ride operations log with payment and status filters | Admin |
| `/rides/:id` | Complete trip telemetry, route map, dispatch offers, and fare settlement | Admin |
| `/payments` | Cash vs Direct Driver UPI QR transaction ledger | Admin |
| `/reviews` | Passenger ratings scorecard and driver review moderation | Admin |
| `/website` | Public website activity hub (inquiries, sell submissions, quotes) | Admin |
| `/notifications` | In-app notification stream & FCM push notification delivery health | Admin |
| `/analytics` | Real database-driven business intelligence and 7-day trend graphs | Admin |
| `/audit-logs` | Immutable audit trail capturing all administrative mutations | Admin |
| `/settings` | Admin profile, security configuration, and operator governance | Admin |

---

## 🚀 Setup & Development

### 1. Environment Variables
Create `.env` in the root of `CardomAdmin/`:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Lint
```bash
npm run lint
```
