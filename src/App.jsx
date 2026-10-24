import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

// Pages
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { UserDetailPage } from '@/pages/UserDetailPage'
import { PartnersPage } from '@/pages/PartnersPage'
import { PartnerDetailPage } from '@/pages/PartnerDetailPage'
import { CarsPage } from '@/pages/CarsPage'
import { CarDetailPage } from '@/pages/CarDetailPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { LeadDetailPage } from '@/pages/LeadDetailPage'
import { RidesPage } from '@/pages/RidesPage'
import { RideDetailPage } from '@/pages/RideDetailPage'
import { LiveRidesPage } from '@/pages/LiveRidesPage'
import { DispatchPage } from '@/pages/DispatchPage'
import { SafetyPage } from '@/pages/SafetyPage'
import { SafetyHistoryPage } from '@/pages/SafetyHistoryPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { ReviewsPage } from '@/pages/ReviewsPage'
import { WebsitePage } from '@/pages/WebsitePage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { AuditLogsPage } from '@/pages/AuditLogsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <ProtectedRoute>
              <PartnersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners/:id"
          element={
            <ProtectedRoute>
              <PartnerDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars"
          element={
            <ProtectedRoute>
              <CarsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <LeadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:type/:id"
          element={
            <ProtectedRoute>
              <LeadDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rides"
          element={
            <ProtectedRoute>
              <RidesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rides/:id"
          element={
            <ProtectedRoute>
              <RideDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-rides"
          element={
            <ProtectedRoute>
              <LiveRidesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatch"
          element={
            <ProtectedRoute>
              <DispatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety"
          element={
            <ProtectedRoute>
              <SafetyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety/history"
          element={
            <ProtectedRoute>
              <SafetyHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <ReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/website"
          element={
            <ProtectedRoute>
              <WebsitePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/website/*"
          element={
            <ProtectedRoute>
              <WebsitePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback — redirect any unmatched path (including bare /admin) to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
