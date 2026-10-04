import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { AuthProvider } from '@/context/AuthContext'
import { ComparisonProvider } from '@/context/ComparisonContext'
import { FloatingCompareBar } from '@/components/common/FloatingCompareBar'
import { HomePage } from '@/pages/HomePage'
import { MobileHomePage } from '@/pages/MobileHomePage'
import { SplashPage } from '@/pages/SplashPage'
import { CarsPage } from '@/pages/CarsPage'
import { CarDetailPage } from '@/pages/CarDetailPage'
import { ComparePage } from '@/pages/ComparePage'
import { SellCarPage } from '@/pages/SellCarPage'
import { InsurancePage } from '@/pages/InsurancePage'
import { FinancePage } from '@/pages/FinancePage'
import { SubscriptionPage } from '@/pages/SubscriptionPage'
import { ServicePage } from '@/pages/ServicePage'
import { RoadsidePage } from '@/pages/RoadsidePage'
import { SparePartsPage } from '@/pages/SparePartsPage'
import { AboutPage } from '@/pages/AboutPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { ContactPage } from '@/pages/ContactPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { CookiePage } from '@/pages/CookiePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { AccountPage } from '@/pages/AccountPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { EditCarPage } from '@/pages/EditCarPage'
import { MyInquiriesPage } from '@/pages/MyInquiriesPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { RideBookingPage } from '@/pages/RideBookingPage'
import { RideDetailsPage } from '@/pages/RideDetailsPage'
import { RideReceiptPage } from '@/pages/RideReceiptPage'
import { MobileServicesPage } from '@/pages/MobileServicesPage'
import { MobileProfilePage } from '@/pages/MobileProfilePage'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { EmailVerificationBanner } from '@/components/common/EmailVerificationBanner'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { NotificationsGlobalToast } from '@/components/notifications/NotificationsGlobalToast'
import { SafetyCenterPage } from '@/pages/SafetyCenterPage'

/**
 * ScrollToTop helper — ensures navigating to a new route scrolls to the top.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/**
 * AndroidBackButton — handles the Android hardware back button inside Capacitor WebView.
 * On the web this component is a complete no-op (Capacitor.isNativePlatform() returns false).
 * On Android: navigate(-1) if history exists, otherwise exit the app gracefully.
 */
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
      handler.then(h => h.remove())
    }
  }, [navigate])
  return null
}

/**
 * PushNotificationRouter — routes user to the target screen when tapping an FCM push notification.
 */
function PushNotificationRouter() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    // Dynamic import to avoid issues on web
    import('@capacitor/push-notifications').then(({ PushNotifications }) => {
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const data = action?.notification?.data || {}
        console.log('[PushRouter] Tapped notification:', data)
        if (data.target_route) {
          navigate(data.target_route)
        } else if (data.ride_id) {
          navigate(`/ride/${data.ride_id}`)
        }
      })
    }).catch(err => console.warn('[PushRouter] Listener setup error:', err))
  }, [navigate])
  return null
}


function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps the entire app so all components can access auth state */}
      <AuthProvider>
        <ComparisonProvider>
          <ScrollToTop />
          <AndroidBackButton />
          <PushNotificationRouter />
          <EmailVerificationBanner />
          <NotificationsGlobalToast />
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/home" element={<MobileHomePage />} />
            <Route path="/" element={<MobileHomePage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/sell" element={<SellCarPage />} />
            <Route path="/insurance" element={<InsurancePage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/roadside" element={<RoadsidePage />} />
            <Route path="/parts" element={<SparePartsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/safety" element={<SafetyCenterPage />} />
            <Route path="/safety-center" element={<SafetyCenterPage />} />

            {/* ── Auth & Account routes ── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/profile" element={<AccountPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/my-listings/:id/edit" element={<EditCarPage />} />
            <Route path="/my-inquiries" element={<MyInquiriesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/ride" element={<RideBookingPage />} />
            <Route path="/ride-booking" element={<RideBookingPage />} />
            <Route path="/ride/:id" element={<RideDetailsPage />} />
            <Route path="/ride/:id/receipt" element={<RideReceiptPage />} />
            {/* ── Mobile-first routes ── */}
            <Route path="/services" element={<MobileServicesPage />} />
            <Route path="/mobile-profile" element={<MobileProfilePage />} />
          </Routes>
          <FloatingCompareBar />
          <MobileBottomNav />
        </ComparisonProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
