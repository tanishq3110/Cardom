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
import { MobileServicesPage } from '@/pages/MobileServicesPage'
import { MobileProfilePage } from '@/pages/MobileProfilePage'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { EmailVerificationBanner } from '@/components/common/EmailVerificationBanner'

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

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps the entire app so all components can access auth state */}
      <AuthProvider>
        <ComparisonProvider>
          <ScrollToTop />
          <AndroidBackButton />
          <EmailVerificationBanner />
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
