import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ComparisonProvider } from '@/context/ComparisonContext'
import { FloatingCompareBar } from '@/components/common/FloatingCompareBar'
import { HomePage } from '@/pages/HomePage'
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
import { AccountPage } from '@/pages/AccountPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { EditCarPage } from '@/pages/EditCarPage'
import { MyInquiriesPage } from '@/pages/MyInquiriesPage'

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

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps the entire app so all components can access auth state */}
      <AuthProvider>
        <ComparisonProvider>
          <ScrollToTop />
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<HomePage />} />
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
            <Route path="/account" element={<AccountPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/my-listings/:id/edit" element={<EditCarPage />} />
            <Route path="/my-inquiries" element={<MyInquiriesPage />} />
          </Routes>
          <FloatingCompareBar />
        </ComparisonProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
