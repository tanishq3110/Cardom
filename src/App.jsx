import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { PartnerLogin } from '@/pages/PartnerLogin'
import { PartnerSignup } from '@/pages/PartnerSignup'
import { PartnerDashboard } from '@/pages/PartnerDashboard'
import { PartnerLeads } from '@/pages/PartnerLeads'
import { PartnerServices } from '@/pages/PartnerServices'
import { PartnerProfile } from '@/pages/PartnerProfile'
import { PartnerSettings } from '@/pages/PartnerSettings'
import { PartnerRides } from '@/pages/PartnerRides'
import { PartnerRideDetails } from '@/pages/PartnerRideDetails'
import { PartnerNotifications } from '@/pages/PartnerNotifications'
import { NotificationsGlobalToast } from '@/components/NotificationsGlobalToast'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AndroidBackButton() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const handler = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1)
      } else {
        CapApp.exitApp()
      }
    })
    return () => {
      handler.then((h) => h.remove())
    }
  }, [navigate])
  return null
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AndroidBackButton />
        <NotificationsGlobalToast />
        <Routes>
          {/* Default entry */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth routes (redirect to /dashboard if already logged in) */}
          <Route path="/login" element={<PublicRoute><PartnerLogin /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><PartnerSignup /></PublicRoute>} />
          <Route path="/partner" element={<Navigate to="/login" replace />} />
          <Route path="/partner/login" element={<PublicRoute><PartnerLogin /></PublicRoute>} />
          <Route path="/partner/signup" element={<PublicRoute><PartnerSignup /></PublicRoute>} />

          {/* Protected partner routes */}
          <Route path="/dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><PartnerLeads /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><PartnerServices /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PartnerProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PartnerSettings /></ProtectedRoute>} />
          <Route path="/rides" element={<ProtectedRoute><PartnerRides /></ProtectedRoute>} />
          <Route path="/rides/:id" element={<ProtectedRoute><PartnerRideDetails /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><PartnerNotifications /></ProtectedRoute>} />

          {/* Dual alias support: /partner/* maps directly to protected views */}
          <Route path="/partner/dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
          <Route path="/partner/leads" element={<ProtectedRoute><PartnerLeads /></ProtectedRoute>} />
          <Route path="/partner/services" element={<ProtectedRoute><PartnerServices /></ProtectedRoute>} />
          <Route path="/partner/profile" element={<ProtectedRoute><PartnerProfile /></ProtectedRoute>} />
          <Route path="/partner/settings" element={<ProtectedRoute><PartnerSettings /></ProtectedRoute>} />
          <Route path="/partner/rides" element={<ProtectedRoute><PartnerRides /></ProtectedRoute>} />
          <Route path="/partner/rides/:id" element={<ProtectedRoute><PartnerRideDetails /></ProtectedRoute>} />
          <Route path="/partner/notifications" element={<ProtectedRoute><PartnerNotifications /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
