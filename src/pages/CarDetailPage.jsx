import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Fuel,
  Zap,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Share2,
  PhoneCall,
  CreditCard,
  Car,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Send,
  X,
  Phone,
  AlertCircle,
  ExternalLink,
  Edit,
  Flag,
  Copy,
  Check,
  MessageCircle,
  Eye,
  Clock,
  Layers,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { CarCard } from '@/components/CarCard'
import { FEATURED_CARS } from '@/data/cars'
import { fetchCarById, fetchSimilarCars } from '@/services/carsApi'
import { fetchPublicProfile } from '@/services/profileApi'
import { createInquiry } from '@/services/inquiriesApi'
import { createCarReport, REPORT_REASONS } from '@/services/reportsApi'
import { recordCarView, fetchCarViewCount } from '@/services/carAnalyticsApi'
import { formatListingFreshness } from '@/utils/dateUtils'
import { addRecentlyViewed } from '@/utils/recentlyViewed'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { useAuth } from '@/context/AuthContext'
import { useComparison } from '@/context/ComparisonContext'
import { cn } from '@/lib/utils'

const FALLBACK_CAR_IMAGE =
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80'

function formatPrice(amount) {
  const num = Number(amount) || 0
  if (num >= 10_000_000) {
    return `₹${(num / 10_000_000).toFixed(2)} Cr`
  }
  return `₹${(num / 100_000).toFixed(0)} Lakh`
}

const QUICK_MESSAGES = [
  "Hi, I'm interested in this car. Is it still available?",
  "Is the price negotiable for immediate purchase?",
  "Can I schedule an inspection or test drive this week?",
  "Can you share more details about the vehicle's service history?",
]

export function CarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, isCarFavorite, toggleCarFavorite } = useAuth()
  const { isInCompare, toggleCar } = useComparison()

  const [reserved, setReserved] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const [car, setCar] = useState(() => FEATURED_CARS.find((c) => c.id === id) || null)
  const inCompare = car?.id ? isInCompare(car.id) : false
  const [loading, setLoading] = useState(!car)
  const [sellerProfile, setSellerProfile] = useState(null)
  const [sellerLoading, setSellerLoading] = useState(false)
  const [similarCars, setSimilarCars] = useState([])
  const [imageErrors, setImageErrors] = useState({})
  const [viewCount, setViewCount] = useState(0)
  const [sellerActiveCount, setSellerActiveCount] = useState(0)

  // Share Popover State
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const shareRef = useRef(null)

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportDescription, setReportDescription] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportError, setReportError] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)

  // Contact Seller Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [inquiryMessage, setInquiryMessage] = useState(QUICK_MESSAGES[0])
  const [inquiryPhone, setInquiryPhone] = useState('')
  const [sendingInquiry, setSendingInquiry] = useState(false)
  const [inquiryError, setInquiryError] = useState('')
  const [inquirySuccess, setInquirySuccess] = useState(false)

  const favorited = car ? isCarFavorite(car.id) : false
  const isOwner = Boolean(user?.id && car?.seller_id && user.id === car.seller_id)
  const isSold = car?.status === 'sold'

  // Close share menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShareMenuOpen(false)
      }
    }
    if (shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [shareMenuOpen])

  // 1. Fetch Car details & record recently viewed & record view
  useEffect(() => {
    let isMounted = true
    async function loadCar() {
      const { data } = await fetchCarById(id)
      if (isMounted) {
        if (data) {
          setCar(data)
          // Track recently viewed in localStorage
          addRecentlyViewed(data.id)

          // Record listing view & fetch view count
          recordCarView(data.id).finally(() => {
            fetchCarViewCount(data.id).then(({ count }) => {
              if (isMounted && count) {
                setViewCount(count)
              }
            })
          })

          // Fetch similar active cars
          fetchSimilarCars(data, 4).then(({ data: simList }) => {
            if (isMounted && simList) {
              setSimilarCars(simList)
            }
          })
        } else {
          setCar(null)
        }
        setLoading(false)
      }
    }
    loadCar()
    return () => {
      isMounted = false
    }
  }, [id])

  // 2. Fetch Seller public profile when seller_id is present
  useEffect(() => {
    let isMounted = true
    async function loadSeller() {
      if (car?.seller_id) {
        setSellerLoading(true)
        const { data } = await fetchPublicProfile(car.seller_id)
        if (isMounted && data) {
          setSellerProfile(data)
        }

        // Fetch seller active listings count for active seller badge
        supabase
          .from('cars')
          .select('id', { count: 'exact', head: true })
          .eq('seller_id', car.seller_id)
          .eq('status', 'active')
          .then(({ count }) => {
            if (isMounted && count !== null) {
              setSellerActiveCount(count)
            }
          })

        if (isMounted) setSellerLoading(false)
      } else {
        setSellerProfile(null)
        setSellerActiveCount(0)
      }
    }
    loadSeller()
    return () => {
      isMounted = false
    }
  }, [car?.seller_id])

  // 3. Prepopulate phone from profile when opening contact modal
  useEffect(() => {
    if (contactModalOpen) {
      setInquiryPhone(profile?.phone || '')
      setInquiryError('')
      setInquirySuccess(false)
    }
  }, [contactModalOpen, profile?.phone])

  // Handle Contact Seller Click
  const handleOpenContactModal = () => {
    if (!user) {
      navigate(`/login?redirect=/cars/${car.id}`)
      return
    }
    setContactModalOpen(true)
  }

  // Handle Open Report Modal
  const handleOpenReportModal = () => {
    if (!user) {
      navigate(`/login?redirect=/cars/${car.id}`)
      return
    }
    setReportReason(REPORT_REASONS[0])
    setReportDescription('')
    setReportError('')
    setReportSuccess(false)
    setReportModalOpen(true)
  }

  // Handle Inquiry Submission
  const handleSendInquiry = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate(`/login?redirect=/cars/${car.id}`)
      return
    }
    if (!inquiryMessage.trim()) {
      setInquiryError('Please enter a message for the seller.')
      return
    }

    setSendingInquiry(true)
    setInquiryError('')

    const { error: err } = await createInquiry({
      carId: car.id,
      buyerId: user.id,
      sellerId: car.seller_id,
      message: inquiryMessage.trim(),
      phone: inquiryPhone.trim() || null,
    })

    setSendingInquiry(false)

    if (err) {
      setInquiryError(err.message || 'Failed to send inquiry. Please try again.')
    } else {
      setInquirySuccess(true)
    }
  }

  // Handle Report Submission
  const handleSubmitReport = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate(`/login?redirect=/cars/${car.id}`)
      return
    }

    setSubmittingReport(true)
    setReportError('')

    const { error: err } = await createCarReport({
      carId: car.id,
      reporterId: user.id,
      reason: reportReason,
      description: reportDescription.trim() || null,
    })

    setSubmittingReport(false)

    if (err) {
      setReportError(err.message || 'Failed to submit report. Please try again.')
    } else {
      setReportSuccess(true)
    }
  }

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    } catch (err) {
      console.warn('Clipboard write failed:', err)
    }
  }

  // Handle WhatsApp Share
  const handleWhatsAppShare = () => {
    if (!car) return
    const text = `Check out this ${car.brand} ${car.model} (${car.year}) on Cardom: ${window.location.href}`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // Handle Native Share
  const handleNativeShare = async () => {
    if (!car) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${car.brand} ${car.model} (${car.year})`,
          text: `Check out this ${car.brand} ${car.model} on Cardom:`,
          url: window.location.href,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  // Handle Image Failure Fallback
  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  if (loading) {
    return (
      <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20 px-4">
          <div className="text-center max-w-md p-8 rounded-3xl border border-white/10 bg-[#0d0d0d]">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-400">Loading vehicle details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Unavailable / Not Found State
  if (!car) {
    return (
      <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20 px-4">
          <div className="text-center max-w-md p-8 rounded-3xl border border-white/10 bg-[#0d0d0d]">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">This vehicle is no longer available.</h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              The listing you are looking for has been removed, marked as sold, or is currently unavailable.
            </p>
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Marketplace
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Specifications Grid using real database fields only
  const specDetails = [
    { label: 'Brand', value: car.brand, Icon: Car },
    { label: 'Model', value: car.model, Icon: Car },
    { label: 'Year', value: String(car.year), Icon: Calendar },
    { label: 'Fuel Type', value: car.fuel_type || car.fuel, Icon: Fuel },
    { label: 'Transmission', value: car.transmission, Icon: Zap },
    {
      label: 'Kilometers Driven',
      value: `${(car.mileage ?? 0).toLocaleString()} km`,
      Icon: Gauge,
    },
    { label: 'Location', value: car.location, Icon: MapPin },
  ]

  const sellerName = sellerProfile?.full_name || 'Verified Cardom Seller'
  const sellerLocation = sellerProfile?.location || car.location || 'India'

  const currentGalleryImage =
    imageErrors[activeImageIndex] || (!car.gallery?.[activeImageIndex] && !car.image_url && !car.image)
      ? FALLBACK_CAR_IMAGE
      : car.gallery?.[activeImageIndex] || car.image_url || car.image

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 pb-28 sm:pb-20">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Breadcrumb & Action Row */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>

            <div className="flex items-center gap-2.5">
              {/* Save Car Button */}
              <button
                type="button"
                onClick={async () => {
                  if (!user) {
                    navigate(`/login?redirect=/cars/${car.id}`)
                    return
                  }
                  await toggleCarFavorite(car.id)
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                  favorited
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white',
                )}
              >
                <Heart className={cn('w-3.5 h-3.5', favorited && 'fill-current text-red-400')} />
                <span>{favorited ? 'Saved in Garage' : 'Save Car'}</span>
              </button>

              {/* Compare Button */}
              <button
                type="button"
                onClick={() => car?.id && toggleCar(car.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                  inCompare
                    ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white',
                )}
                title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
              >
                {inCompare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-orange-400" />
                    <span>Remove from Compare</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>Add to Compare</span>
                  </>
                )}
              </button>

              {/* Share Menu Popover */}
              <div className="relative" ref={shareRef}>
                <button
                  type="button"
                  onClick={() => setShareMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Share Listing"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                <AnimatePresence>
                  {shareMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-[#121212] p-1.5 shadow-2xl shadow-black z-30 space-y-1"
                    >
                      {/* Copy Link Action */}
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-2">
                          {linkCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                          <span>{linkCopied ? 'Link Copied!' : 'Copy Link'}</span>
                        </span>
                      </button>

                      {/* WhatsApp Action */}
                      <button
                        type="button"
                        onClick={() => {
                          handleWhatsAppShare()
                          setShareMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Native Share (if supported) */}
                      {typeof navigator !== 'undefined' && navigator.share && (
                        <button
                          type="button"
                          onClick={() => {
                            handleNativeShare()
                            setShareMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                        >
                          <Share2 className="w-3.5 h-3.5 text-orange-400" />
                          <span>More options...</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Report Listing Button */}
              <button
                type="button"
                onClick={handleOpenReportModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                title="Report this listing"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Gallery (7 cols) + Action Box (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
            {/* Left Multi-Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d0d] group"
                style={{ aspectRatio: '16 / 10' }}
              >
                <img
                  src={currentGalleryImage}
                  alt={`${car.brand} ${car.model}`}
                  onError={() => handleImageError(activeImageIndex)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Sold Watermark / Pill on Image */}
                {isSold && (
                  <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-zinc-900/95 border border-zinc-700 text-xs font-extrabold uppercase tracking-widest text-zinc-200 shadow-xl backdrop-blur-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Sold Vehicle
                  </div>
                )}

                {car.gallery && car.gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? car.gallery.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-orange-500 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer opacity-0 group-hover:opacity-100"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === car.gallery.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-orange-500 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer opacity-0 group-hover:opacity-100"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  Cardom Verified Vehicle
                </div>

                {car.gallery && car.gallery.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
                    {activeImageIndex + 1} / {car.gallery.length}
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {car.gallery && car.gallery.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
                  {car.gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        'relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer bg-zinc-900',
                        activeImageIndex === idx
                          ? 'border-orange-500 ring-2 ring-orange-500/30 scale-[1.02]'
                          : 'border-white/10 opacity-60 hover:opacity-100',
                      )}
                    >
                      <img
                        src={imageErrors[idx] ? FALLBACK_CAR_IMAGE : imgUrl}
                        alt={`${car.brand} thumbnail ${idx + 1}`}
                        onError={() => handleImageError(idx)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action & Pricing Box (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#111111] via-[#0d0d0d] to-[#080808] space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
                    {car.brand}
                  </p>
                  {isSold && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Sold
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  {car.model}
                </h1>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mb-6 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    {car.location} · {car.year} Model
                  </span>
                  {car.created_at && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {formatListingFreshness(car.created_at)}
                      </span>
                    </>
                  )}
                  {viewCount > 0 && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Eye className="w-3.5 h-3.5 text-zinc-500" />
                        {viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1).replace(/\.0$/, '')}K` : viewCount} views
                      </span>
                    </>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] mb-6">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                    Total Estimated Price
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className="text-3xl font-black text-white tracking-tight">
                      {formatPrice(car.price)}
                    </p>
                    {isSold && (
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Marked as Sold
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Listing · Transparent Marketplace Price
                  </p>
                </div>

                {/* ── Seller Information Box ── */}
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Seller Details
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Seller
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-sm text-orange-400 overflow-hidden flex-shrink-0">
                      {sellerProfile?.avatar_url ? (
                        <img
                          src={sellerProfile.avatar_url}
                          alt={sellerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        sellerName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white truncate">{sellerName}</p>
                        {sellerActiveCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active seller
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          {sellerLocation}
                        </span>
                        {sellerProfile?.created_at && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              Member since {new Date(sellerProfile.created_at).getFullYear()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Owner / Contact Buttons */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    {isOwner ? (
                      <Link
                        to={`/my-listings/${car.id}/edit`}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        You Own This Listing — Edit Vehicle
                      </Link>
                    ) : isSold ? (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                        <p className="text-xs font-semibold text-zinc-300">
                          This vehicle has been marked as sold.
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Buyer inquiries are closed for this listing.
                        </p>
                      </div>
                    ) : car.seller_id ? (
                      <button
                        type="button"
                        onClick={handleOpenContactModal}
                        className={cn(
                          'inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer',
                          'bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200',
                          'hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]',
                        )}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Contact Seller Directly
                      </button>
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-1">
                        Seller contact is not available for this listing.
                      </p>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    Secure Direct Inquiry Protection
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    Verified RLS Authentication
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    Direct Buyer-to-Seller Communication
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                {isSold ? (
                  <div className="w-full py-3 rounded-xl text-xs font-bold text-center bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase tracking-wider">
                    Vehicle Sold · Reservations Closed
                  </div>
                ) : (
                  <>
                    <ShimmerButton
                      size="md"
                      onClick={() => setReserved(true)}
                      className="w-full text-center"
                    >
                      {reserved ? '✓ Reserved Successfully' : 'Reserve Online for ₹25,000'}
                    </ShimmerButton>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                        Calculate EMI
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-300 hover:text-white hover:border-orange-500/40 transition-colors cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                        Talk to Expert
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="p-8 rounded-3xl border border-white/[0.08] bg-[#0c0c0c]">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Car className="w-5 h-5 text-orange-400" />
              Technical Specifications & Details
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {specDetails.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]"
                >
                  <Icon className="w-4 h-4 text-orange-400 mb-2" />
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-white mt-0.5 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Similar Cars ("You May Also Like") ── */}
          {similarCars.length > 0 && (
            <div className="mt-14 pt-10 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    You May Also Like
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Similar active vehicles matching {car.brand} and specifications
                  </p>
                </div>
                <Link
                  to="/cars"
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Explore All Cars →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {similarCars.map((simCar, idx) => (
                  <CarCard key={simCar.id} car={simCar} delay={idx * 0.05} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Fixed Bottom Action Bar */}
        {car && (
          <div className="fixed bottom-0 inset-x-0 bg-[#121212]/95 backdrop-blur-md border-t border-[#2A2A2A] p-3 px-4 z-40 lg:hidden flex items-center justify-between gap-3 pb-safe-nav">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">Total Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-white">{formatPrice(car.price)}</span>
                {car.price && (
                  <span className="text-[10px] text-orange-400 font-mono">
                    EMI ~₹{Math.round(car.price * 0.018).toLocaleString('en-IN')}/mo
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isOwner ? (
                <Link
                  to={`/my-listings/${car.id}/edit`}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/25"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Link>
              ) : isSold ? (
                <span className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  Sold Out
                </span>
              ) : (
                <>
                  {sellerProfile?.phone && (
                    <a
                      href={`tel:${sellerProfile.phone}`}
                      className="p-2.5 rounded-xl bg-[#202020] border border-[#2A2A2A] text-zinc-300 hover:text-white"
                      aria-label="Call seller"
                    >
                      <Phone className="w-4 h-4 text-green-400" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenContactModal}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 cursor-pointer active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Contact Seller
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Contact Seller Modal ── */}
      <AnimatePresence>
        {contactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !sendingInquiry && setContactModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8 shadow-2xl shadow-black/80 z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                disabled={sendingInquiry}
                onClick={() => setContactModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {inquirySuccess ? (
                /* Success View */
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Inquiry Sent Successfully</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-8 leading-relaxed">
                    The seller has received your inquiry and contact details. You can track status
                    and follow up directly from your inquiries dashboard.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setContactModalOpen(false)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/10 text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                    >
                      Continue Browsing
                    </button>
                    <Link
                      to="/my-inquiries"
                      onClick={() => setContactModalOpen(false)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      <span>View My Inquiries</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form View */
                <div>
                  {/* Header Vehicle Snapshot */}
                  <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-white/[0.08]">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex-shrink-0">
                      <img
                        src={currentGalleryImage}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono text-orange-400 uppercase tracking-wider">
                        {car.brand}
                      </p>
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {car.model} ({car.year})
                      </h3>
                      <p className="text-xs font-semibold text-zinc-300">
                        {formatPrice(car.price)} · Recipient: {sellerName}
                      </p>
                    </div>
                  </div>

                  {inquiryError && (
                    <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendInquiry} className="space-y-4 text-left">
                    {/* Buyer Identity Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          Sending As
                        </span>
                        <span className="text-xs font-semibold text-white truncate block">
                          {profile?.full_name || user?.user_metadata?.full_name || 'Cardom Buyer'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          Contact Email
                        </span>
                        <span className="text-xs font-medium text-zinc-400 truncate block">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    {/* Quick Suggestions */}
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                        Quick Questions
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_MESSAGES.map((msg, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setInquiryMessage(msg)}
                            className={cn(
                              'text-[11px] px-2.5 py-1 rounded-lg border text-left transition-colors cursor-pointer',
                              inquiryMessage === msg
                                ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                                : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white',
                            )}
                          >
                            {msg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Message Field */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="inquiryMsg"
                          className="text-xs font-semibold text-zinc-300 block"
                        >
                          Message to Seller <span className="text-orange-400">*</span>
                        </label>
                        <span
                          className={cn(
                            'text-[10px] font-mono',
                            inquiryMessage.length > 900 ? 'text-orange-400' : 'text-zinc-500',
                          )}
                        >
                          {inquiryMessage.length} / 1000
                        </span>
                      </div>
                      <textarea
                        id="inquiryMsg"
                        rows={3}
                        maxLength={1000}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Type your message or questions regarding the car..."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="inquiryPhone"
                          className="text-xs font-semibold text-zinc-300 block"
                        >
                          Phone Number <span className="text-zinc-500 font-normal">(Optional)</span>
                        </label>
                        <span className="text-[10px] text-zinc-500">
                          Shared only with this seller
                        </span>
                      </div>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="inquiryPhone"
                          type="tel"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-8 pr-3.5 py-2 rounded-xl text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={sendingInquiry || !inquiryMessage.trim()}
                        className={cn(
                          'w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold cursor-pointer',
                          'bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200',
                          'hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                      >
                        {sendingInquiry ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Inquiry</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Report Listing Modal ── */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submittingReport && setReportModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8 shadow-2xl shadow-black/80 z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                disabled={submittingReport}
                onClick={() => setReportModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {reportSuccess ? (
                /* Report Success View */
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6 leading-relaxed">
                    Thank you for keeping Cardom safe. Our team has received your report for review.
                  </p>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] border border-white/10 text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Report Form View */
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Report Vehicle Listing</h3>
                      <p className="text-xs text-zinc-400 truncate">
                        {car.brand} {car.model} ({car.year})
                      </p>
                    </div>
                  </div>

                  {reportError && (
                    <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{reportError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReport} className="space-y-4">
                    {/* Reason Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Reason for Report <span className="text-orange-400">*</span>
                      </label>
                      <div className="space-y-1.5">
                        {REPORT_REASONS.map((r) => (
                          <label
                            key={r}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors',
                              reportReason === r
                                ? 'bg-orange-500/10 border-orange-500/40 text-white font-medium'
                                : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white',
                            )}
                          >
                            <input
                              type="radio"
                              name="reportReason"
                              value={r}
                              checked={reportReason === r}
                              onChange={() => setReportReason(r)}
                              className="accent-orange-500"
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-zinc-300">
                          Additional Details <span className="text-zinc-500 font-normal">(Optional)</span>
                        </label>
                        <span
                          className={cn(
                            'text-[10px] font-mono',
                            reportDescription.length > 450 ? 'text-orange-400' : 'text-zinc-500',
                          )}
                        >
                          {reportDescription.length} / 500
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Provide details about why you are reporting this vehicle..."
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        disabled={submittingReport}
                        onClick={() => setReportModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReport}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {submittingReport ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit Report</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Sticky Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-white/[0.08] p-3 pb-[max(env(safe-area-inset-bottom,0px),12px)] flex items-center gap-2.5 shadow-2xl">
        <a
          href={sellerProfile?.phone ? `tel:${sellerProfile.phone}` : 'tel:+919876543210'}
          className="flex-1 py-3 rounded-xl border border-white/[0.12] bg-[#1a1a1a] text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/[0.08] transition-colors"
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          Call
        </a>
        <button
          type="button"
          onClick={handleOpenContactModal}
          className="flex-[1.5] py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          Message / Inquire
        </button>
      </div>

      <Footer />
    </div>
  )
}
