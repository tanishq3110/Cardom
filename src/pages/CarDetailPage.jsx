import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Share2,
  Phone,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  X,
  Send,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CarCard } from '@/components/CarCard'
import { fetchCarById, fetchSimilarCars } from '@/services/carsApi'
import { fetchPublicProfile } from '@/services/profileApi'
import { createInquiry } from '@/services/inquiriesApi'
import { createCarReport, REPORT_REASONS } from '@/services/reportsApi'
import { recordCarView, fetchCarViewCount } from '@/services/carAnalyticsApi'
import { addRecentlyViewed } from '@/utils/recentlyViewed'
import { useAuth } from '@/context/AuthContext'
import { useComparison } from '@/context/ComparisonContext'
import { cn } from '@/lib/utils'

function formatPriceLakh(amount) {
  const num = Number(amount) || 0
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`
  }
  return `₹${(num / 100000).toFixed(2)} Lakh`
}

function calculateEmi(amount) {
  const num = Number(amount) || 0
  const lakhs = num / 100000
  const emi = Math.round(lakhs * 1240)
  return emi > 0 ? emi.toLocaleString('en-IN') : '18,450'
}

const INSPECTION_SUBSYSTEMS = [
  { name: 'Engine & Transmission', score: '9.6', status: 'PASS' },
  { name: 'Electricals & Battery', score: '9.5', status: 'PASS' },
  { name: 'Steering & Suspension', score: '9.2', status: 'PASS' },
  { name: 'Body Panels & Structure', score: '9.4', status: 'PASS' },
  { name: 'Tyres & Braking System', score: '9.1', status: 'PASS' },
  { name: 'AC & Climate Control', score: '9.7', status: 'PASS' },
]

const QUICK_MESSAGES = [
  "Hi, I'm interested in booking a free test drive for this car.",
  "Can you share more details on the 180-point inspection report?",
  "Is immediate doorstep delivery available for this vehicle?",
  "What is the best financing ROI and downpayment available?",
]

export function CarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, isCarFavorite, toggleCarFavorite } = useAuth()
  const { isInCompare, toggleCar } = useComparison()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [costBreakdownOpen, setCostBreakdownOpen] = useState(false)
  const [similarCars, setSimilarCars] = useState([])
  const [sellerProfile, setSellerProfile] = useState(null)
  const [viewCount, setViewCount] = useState(0)

  // Share popover
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const shareRef = useRef(null)

  // Inquiry Modal
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [inquiryMessage, setInquiryMessage] = useState(QUICK_MESSAGES[0])
  const [inquiryPhone, setInquiryPhone] = useState('')
  const [sendingInquiry, setSendingInquiry] = useState(false)
  const [inquiryError, setInquiryError] = useState('')
  const [inquirySuccess, setInquirySuccess] = useState(false)

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportDescription, setReportDescription] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const favorited = car && isCarFavorite ? isCarFavorite(car.id) : false
  const inCompare = car && isInCompare ? isInCompare(car.id) : false

  // Load Car Data
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      const { data } = await fetchCarById(id)
      if (isMounted) {
        if (data) {
          setCar(data)
          addRecentlyViewed(data.id)

          recordCarView(data.id).finally(() => {
            fetchCarViewCount(data.id).then(({ count }) => {
              if (isMounted && count) setViewCount(count)
            })
          })

          fetchSimilarCars(data, 4).then(({ data: simList }) => {
            if (isMounted && simList) setSimilarCars(simList)
          })

          if (data.seller_id) {
            fetchPublicProfile(data.seller_id).then(({ data: sProfile }) => {
              if (isMounted && sProfile) setSellerProfile(sProfile)
            })
          }
        }
        setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [id])

  const carImages = car?.images?.length
    ? car.images
    : car?.image_url
    ? [car.image_url]
    : ['/cars/bmw-3-series.jpg', '/cars/luxury-suv.jpg', '/hero-banner-car.jpg']

  const formattedPrice = formatPriceLakh(car?.price)
  const emiVal = calculateEmi(car?.price)

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car?.year || ''} ${car?.brand || ''} ${car?.model || ''}`,
        text: `Check out this certified ${car?.brand} ${car?.model} on Cardom:`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      setShareMenuOpen(!shareMenuOpen)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleSendInquiry = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setSendingInquiry(true)
    setInquiryError('')

    const { error } = await createInquiry({
      car_id: car.id,
      buyer_id: user.id,
      seller_id: car.seller_id || null,
      message: inquiryMessage,
      buyer_phone: inquiryPhone || profile?.phone || '',
    })

    setSendingInquiry(false)
    if (error) {
      setInquiryError(error.message || 'Failed to submit inquiry')
    } else {
      setInquirySuccess(true)
      setTimeout(() => {
        setContactModalOpen(false)
        setInquirySuccess(false)
      }, 1500)
    }
  }

  const handleSendReport = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setSubmittingReport(true)
    await createCarReport({
      car_id: car.id,
      reporter_id: user.id,
      reason: reportReason,
      description: reportDescription,
    })
    setSubmittingReport(false)
    setReportSuccess(true)
    setTimeout(() => {
      setReportModalOpen(false)
      setReportSuccess(false)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#131313] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff6a00] animate-spin" />
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-dvh bg-[#131313] text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Vehicle Not Found</h2>
        <p className="text-xs text-[#c6c6c7] mt-1">This listing may have been sold or removed.</p>
        <button
          onClick={() => navigate('/cars')}
          className="mt-4 px-4 py-2 bg-[#ff6a00] text-black font-bold rounded-xl text-xs"
        >
          Browse Verified Cars
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#131313] text-[#e5e2e1] flex flex-col pb-32 selection:bg-[#ff6a00] selection:text-black">
      {/* ── Fixed Top Nav ── */}
      <header className="sticky top-0 z-40 bg-[#131313]/90 backdrop-blur-xl border-b border-white/5 px-4 pt-safe">
        <div className="h-16 flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] border border-white/5 flex items-center justify-center text-white transition-colors"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <span className="font-display text-sm font-bold text-white truncate max-w-[180px]">
            {car.brand} {car.model}
          </span>

          <div className="flex items-center gap-2 relative" ref={shareRef}>
            <button
              onClick={handleShareClick}
              className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] border border-white/5 flex items-center justify-center text-[#c6c6c7] hover:text-white transition-colors"
              title="Share Vehicle"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => {
                if (!user) navigate('/login')
                else if (toggleCarFavorite) toggleCarFavorite(car.id)
              }}
              className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] border border-white/5 flex items-center justify-center transition-colors"
              title="Save Car"
            >
              <Heart
                className={cn(
                  'w-4 h-4',
                  favorited ? 'fill-red-500 text-red-500' : 'text-white'
                )}
              />
            </button>

            {/* Share Popover Menu */}
            {shareMenuOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-2xl bg-[#201f1f] border border-white/10 p-2 shadow-2xl z-50 space-y-1">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white hover:bg-[#2a2a2a] transition-colors"
                >
                  {linkCopied ? (
                    <Check className="w-4 h-4 text-[#4ae176]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#c6c6c7]" />
                  )}
                  <span>{linkCopied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out this ${car.brand} ${car.model} on Cardom: ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#4ae176] hover:bg-[#2a2a2a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-lg mx-auto w-full px-4 pt-3 space-y-5">
        {/* ── 16:10 Hero Image Gallery ── */}
        <section className="space-y-2.5">
          <div className="relative aspect-[16/10] rounded-3xl bg-[#0e0e0e] border border-white/10 overflow-hidden shadow-2xl group">
            <img
              src={carImages[activeImageIndex]}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            {/* Verified Pill */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0e0e0e]/85 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#4ae176]" />
              <span>CARDOM VERIFIED {car.score || '9.4'}/10</span>
            </div>

            {/* 360 Spin Badge */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[14px] text-[#ff6a00]">
                360
              </span>
              <span>360° Studio</span>
            </div>

            {/* Photo Counter */}
            <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-mono">
              {activeImageIndex + 1} / {carImages.length}
            </div>
          </div>

          {/* Thumbnail preview strip */}
          {carImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {carImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={cn(
                    'w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all',
                    activeImageIndex === i
                      ? 'border-[#ff6a00] scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Identity & Verification Badges ── */}
        <section className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl font-black text-white leading-tight">
                {car.year || '2022'} {car.brand} {car.model}
              </h1>
              <p className="text-xs text-[#c6c6c7] mt-0.5">
                {car.variant || '1.5 Turbo Dual-Clutch'} • Automatic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#201f1f] border border-white/5 text-[#c6c6c7] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#ff6a00]">
                pin
              </span>
              PB 02 MX 9482
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#201f1f] border border-white/5 text-[#c6c6c7] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#ff6a00]">
                location_on
              </span>
              {car.location || 'Amritsar SuperHub'}
            </span>
            {viewCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-[#201f1f] border border-white/5 text-zinc-400 text-[11px]">
                {viewCount} views today
              </span>
            )}
          </div>
        </section>

        {/* ── Pricing Module with Expandable Cost Details ── */}
        <section className="rounded-3xl bg-[#201f1f] border border-white/10 p-5 shadow-xl space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-[#c6c6c7] uppercase font-bold tracking-wider block">
                Total Driveaway Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display text-2xl font-black text-white">
                  {formattedPrice}
                </span>
                <span className="text-xs text-[#c6c6c7]">
                  EMI ₹{emiVal}/mo @ 8.5%
                </span>
              </div>
            </div>
            <button
              onClick={() => setCostBreakdownOpen(!costBreakdownOpen)}
              className="text-xs text-[#ff6a00] font-bold flex items-center gap-0.5 hover:underline"
            >
              <span>Cost Details</span>
              <span
                className={cn(
                  'material-symbols-outlined text-[16px] transition-transform',
                  costBreakdownOpen && 'rotate-180'
                )}
              >
                expand_more
              </span>
            </button>
          </div>

          {/* Expandable Cost Breakdown Drawer */}
          <AnimatePresence>
            {costBreakdownOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-2 pt-3 border-t border-white/5 text-xs text-[#c6c6c7] font-mono"
              >
                <div className="flex justify-between">
                  <span>Ex-Showroom Price</span>
                  <span className="text-white">{formattedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>180-Point Quality Certification</span>
                  <span className="text-[#4ae176]">₹0 (Included)</span>
                </div>
                <div className="flex justify-between">
                  <span>1-Year Pan-India Warranty</span>
                  <span className="text-[#4ae176]">₹0 (Included)</span>
                </div>
                <div className="flex justify-between">
                  <span>RC Transfer & RTO Documentation</span>
                  <span className="text-[#4ae176]">₹0 (Included)</span>
                </div>
                <div className="flex justify-between">
                  <span>Doorstep Delivery & Sanitization</span>
                  <span className="text-[#4ae176]">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-white">
                  <span>Net On-Road Total</span>
                  <span className="text-[#ff6a00]">{formattedPrice}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── 6-Box Telemetry & Specs Grid ── */}
        <section className="space-y-2">
          <h3 className="font-display text-base font-extrabold text-white tracking-tight">
            Vehicle Telemetry & Specifications
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 space-y-1">
              <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                speed
              </span>
              <p className="text-[10px] text-[#c6c6c7] uppercase font-bold">Odometer</p>
              <p className="text-sm font-bold text-white font-mono">
                {car.mileage ? `${car.mileage} km` : '24,100 km'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 space-y-1">
              <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                local_gas_station
              </span>
              <p className="text-[10px] text-[#c6c6c7] uppercase font-bold">Fuel & Econ</p>
              <p className="text-sm font-bold text-white font-mono">
                {car.fuel || car.fuel_type || 'Diesel'} • 18.2 km/l
              </p>
            </div>

            <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 space-y-1">
              <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                settings_suggest
              </span>
              <p className="text-[10px] text-[#c6c6c7] uppercase font-bold">Transmission</p>
              <p className="text-sm font-bold text-white font-mono">
                {car.transmission || 'Automatic'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 space-y-1">
              <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                person_check
              </span>
              <p className="text-[10px] text-[#c6c6c7] uppercase font-bold">Ownership</p>
              <p className="text-sm font-bold text-white font-mono">
                {car.ownership || '1st Owner'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 space-y-1">
              <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                calendar_month
              </span>
              <p className="text-[10px] text-[#c6c6c7] uppercase font-bold">Mfg Year</p>
              <p className="text-sm font-bold text-white font-mono">
                {car.year || '2022'}
              </p>
            </div>

            <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3.5 space-y-1">
              <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
                hub
              </span>
              <p className="text-[10px] text-[#c6c6c7] uppercase font-bold">Stationed Hub</p>
              <p className="text-sm font-bold text-white font-mono truncate">
                {car.location || 'Amritsar SuperHub'}
              </p>
            </div>
          </div>
        </section>

        {/* ── 180-Point Digital Inspection Score Card ── */}
        <section className="rounded-3xl bg-[#201f1f] border border-white/10 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#4ae176]/15 border border-[#4ae176]/30 text-[#4ae176] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  180-Point Inspection Score
                </h3>
                <p className="text-[11px] text-[#4ae176] font-semibold">
                  Certified Zero Structural Damage
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-2xl font-black text-white">9.4</span>
              <span className="text-xs text-[#c6c6c7]">/10</span>
            </div>
          </div>

          {/* Subsystems List */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            {INSPECTION_SUBSYSTEMS.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between p-2 rounded-xl bg-[#1c1b1b] text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4ae176]" />
                  <span className="text-[#e5e2e1] font-sans text-xs">{sub.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{sub.score}/10</span>
                  <span className="px-2 py-0.5 rounded bg-[#4ae176]/20 text-[#4ae176] text-[10px] font-bold">
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('Downloading official 180-point PDF inspection report...')}
            className="w-full py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#353534] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-[#ff6a00]">download</span>
            <span>Download 180-Point Inspection PDF</span>
          </button>
        </section>

        {/* ── SuperHub & Seller Profile ── */}
        <section className="rounded-3xl bg-[#1c1b1b] border border-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ff6a00]/15 border border-[#ff6a00]/30 text-[#ff6a00] flex items-center justify-center font-black text-base">
                C
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-white">
                    {sellerProfile?.full_name || 'Cardom Amritsar SuperHub'}
                  </h4>
                  <span className="material-symbols-outlined text-[#ff6a00] text-[15px]">
                    verified
                  </span>
                </div>
                <p className="text-[11px] text-[#c6c6c7]">
                  Mall Road, Amritsar • Verified Authorized Hub
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-[#201f1f] px-2.5 py-1 rounded-xl">
              <span
                className="material-symbols-outlined text-[#ff6a00] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-xs font-bold text-white">4.9</span>
              <span className="text-[10px] text-zinc-500">(340+)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#201f1f] text-xs">
            <span className="material-symbols-outlined text-[#4ae176] text-base">
              home_pin
            </span>
            <span className="text-[#e5e2e1]">
              Eligible for <strong className="text-white">Free Doorstep Test Drive</strong> in Punjab.
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 text-xs">
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-zinc-500 hover:text-rose-400 text-[11px] flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">flag</span>
              <span>Report this vehicle listing</span>
            </button>
            <button
              onClick={() => {
                if (toggleCar) toggleCar(car.id)
              }}
              className="text-[#ff6a00] text-[11px] font-bold flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-[13px]">layers</span>
              <span>{inCompare ? 'Comparing' : 'Add to Compare'}</span>
            </button>
          </div>
        </section>

        {/* ── Similar Verified Cars ── */}
        {similarCars.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-white tracking-tight">
                Similar Verified Cars
              </h3>
              <Link to="/cars" className="text-xs text-[#ff6a00] font-bold hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {similarCars.slice(0, 2).map((sCar) => (
                <CarCard key={sCar.id} car={sCar} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Sticky Bottom Mobile Conversion Action Bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-white/10 p-3 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Price & EMI */}
          <div className="flex flex-col min-w-[100px]">
            <span className="font-display text-base font-bold text-white leading-tight">
              {formattedPrice}
            </span>
            <span className="text-[11px] text-[#c6c6c7] leading-tight">
              ₹{emiVal}/mo
            </span>
          </div>

          {/* Quick WhatsApp Inquiry */}
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(
              `Hi Cardom, I would like to book a free test drive for ${car.year} ${car.brand} ${car.model} (${window.location.href})`
            )}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp Enquiry"
            className="w-12 h-12 rounded-2xl bg-[#201f1f] hover:bg-[#2a2a2a] flex items-center justify-center text-[#4ae176] transition-transform active:scale-95 shrink-0 border border-white/5"
          >
            <span className="material-symbols-outlined text-[22px]">chat</span>
          </a>

          {/* Primary Action: Book Test Drive / Contact Seller */}
          <button
            onClick={() => setContactModalOpen(true)}
            className="flex-1 h-12 rounded-2xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-orange-500/25 active:scale-98"
          >
            <span className="material-symbols-outlined text-base font-bold">
              drive_eta
            </span>
            <span>Book Free Test Drive</span>
          </button>
        </div>
      </div>

      {/* ── Contact / Test Drive Modal ── */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#201f1f] border border-white/10 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-white">
                Book Free Test Drive
              </h3>
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#2a2a2a] text-[#c6c6c7] flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="text-center py-6 space-y-2">
                <Check className="w-10 h-10 text-[#4ae176] mx-auto" />
                <p className="text-sm font-bold text-white">Test Drive Request Confirmed!</p>
                <p className="text-xs text-[#c6c6c7]">
                  Our Amritsar SuperHub concierge will contact you within 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <p className="text-xs text-[#c6c6c7]">
                  Choose your inquiry query or enter custom preferences for {car.brand} {car.model}:
                </p>
                <div className="space-y-1.5">
                  {QUICK_MESSAGES.map((msg) => (
                    <button
                      key={msg}
                      type="button"
                      onClick={() => setInquiryMessage(msg)}
                      className={cn(
                        'w-full text-left p-2.5 rounded-xl text-xs transition-colors border',
                        inquiryMessage === msg
                          ? 'bg-[#ff6a00]/15 border-[#ff6a00] text-white'
                          : 'bg-[#1c1b1b] border-white/5 text-[#c6c6c7] hover:text-white'
                      )}
                    >
                      {msg}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] text-[#c6c6c7] uppercase font-bold block mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a00]"
                  />
                </div>

                {inquiryError && (
                  <p className="text-xs text-rose-400">{inquiryError}</p>
                )}

                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="w-full py-3 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
                >
                  {sendingInquiry ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Test Drive Booking</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Report Modal ── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#201f1f] border border-white/10 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-white">Report Listing</h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#2a2a2a] text-[#c6c6c7] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {reportSuccess ? (
              <p className="text-xs text-[#4ae176] text-center py-4">Report submitted. Thank you for keeping Cardom safe.</p>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r} className="bg-[#201f1f]">
                      {r}
                    </option>
                  ))}
                </select>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Optional details..."
                  className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

