import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import {
  Car,
  Tag,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Headphones,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
  X,
  MapPin,
  Gauge,
  Layers,
  FileText,
  Eye,
  AlertCircle,
  Loader2,
  Star,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createCar, updateCar } from '@/services/carsApi'
import {
  uploadCarImage,
  validateImageFile,
  MAX_IMAGES_PER_LISTING,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/services/carImagesApi'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { cn } from '@/lib/utils'

// ─── Constants & Options ──────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR - i)

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
const TRANSMISSION_OPTIONS = ['Automatic', 'Manual', 'AMT', 'CVT', 'DCT']

const WHY_SELL_FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Verified Buyers',
    description: 'Connect with buyers through a trusted automotive platform with verified identity checks.',
  },
  {
    Icon: TrendingUp,
    title: 'Fair Pricing',
    description: "Understand your vehicle's value before you list using real-time market valuations.",
  },
  {
    Icon: FileCheck2,
    title: 'Digital Paperwork',
    description: 'Keep the selling process organized and digital with zero hassle documentation and transfer.',
  },
  {
    Icon: Headphones,
    title: 'End-to-End Support',
    description: 'Get dedicated support throughout your selling journey from inspection to escrow payment.',
  },
]

const TRUST_POINTS = [
  { Icon: Eye, label: 'Transparent Process' },
  { Icon: FileText, label: 'Digital Documentation' },
  { Icon: ShieldCheck, label: 'Verified Vehicle Details' },
  { Icon: Layers, label: 'Connected Automotive Services' },
]

function formatPriceDisplay(amount) {
  const num = Number(amount) || 0
  if (num >= 10_000_000) {
    return `₹${(num / 10_000_000).toFixed(2)} Cr`
  }
  if (num >= 100_000) {
    return `₹${(num / 100_000).toFixed(1)} Lakh`
  }
  return num > 0 ? `₹${num.toLocaleString('en-IN')}` : ''
}

// ─── Main SellCarPage Component ──────────────────────────────────────────────

export function SellCarPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef(null)
  const fileInputRef = useRef(null)

  // Listing Form State
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: String(CURRENT_YEAR),
    price: '',
    location: '',
    fuel: 'Petrol',
    transmission: 'Automatic',
    mileage: '',
    image_url: '',
    description: '',
  })

  // Selected Files State for Upload (up to 6)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isDragging, setIsDragging]         = useState(false)
  const [photoError, setPhotoError]         = useState('')

  const [errors, setErrors]                 = useState({})
  const [submitting, setSubmitting]         = useState(false)
  const [submittingStep, setSubmittingStep] = useState('')
  const [serverError, setServerError]       = useState('')
  const [createdCar, setCreatedCar]         = useState(null)

  // 1. Protected Route check: Require authentication
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle Photo Selection
  const handleFilesAdded = (files) => {
    setPhotoError('')
    const fileList = Array.from(files || [])
    if (!fileList.length) return

    if (selectedPhotos.length + fileList.length > MAX_IMAGES_PER_LISTING) {
      setPhotoError(`You can upload a maximum of ${MAX_IMAGES_PER_LISTING} photos per listing.`)
      return
    }

    const newPhotos = []
    for (const file of fileList) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setPhotoError(validation.error)
        return
      }

      newPhotos.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
      })
    }

    setSelectedPhotos((prev) => [...prev, ...newPhotos])
  }

  const handleRemovePhoto = (id) => {
    setSelectedPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((p) => p.id !== id)
    })
    setPhotoError('')
  }

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files)
    }
  }

  // Field change handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    setServerError('')
  }

  // Form Validation
  const validateForm = () => {
    const errs = {}

    if (!formData.brand.trim()) {
      errs.brand = 'Vehicle brand is required (e.g. BMW, Audi)'
    }
    if (!formData.model.trim()) {
      errs.model = 'Vehicle model is required (e.g. 3 Series, A4)'
    }

    const yearNum = Number(formData.year)
    if (!formData.year || isNaN(yearNum) || yearNum < 1980 || yearNum > CURRENT_YEAR) {
      errs.year = `Select a valid year between 1980 and ${CURRENT_YEAR}`
    }

    const priceNum = Number(formData.price)
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errs.price = 'Enter a valid asking price greater than 0'
    }

    if (!formData.location.trim()) {
      errs.location = 'City / Location is required (e.g. Mumbai, MH)'
    }

    const mileageNum = Number(formData.mileage)
    if (formData.mileage === '' || isNaN(mileageNum) || mileageNum < 0) {
      errs.mileage = 'Enter valid kilometers driven (0 or more)'
    }

    if (!formData.fuel) {
      errs.fuel = 'Select a fuel type'
    }

    if (!formData.transmission) {
      errs.transmission = 'Select a transmission type'
    }

    if (formData.description && formData.description.length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters'
    }

    return errs
  }

  // Submission handler with multi-image upload flow
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      scrollToForm()
      return
    }

    setErrors({})
    setServerError('')
    setSubmitting(true)

    try {
      // ── Step 1: Create listing record in public.cars ─────────────────────────
      setSubmittingStep('Creating vehicle listing...')

      const carPayload = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        price: Number(formData.price),
        location: formData.location.trim(),
        fuel_type: formData.fuel,
        fuel: formData.fuel,
        transmission: formData.transmission,
        mileage: Number(formData.mileage),
        image_url: formData.image_url.trim() || '',
        description: formData.description.trim(),
        status: 'active',
      }

      const { data: newCar, error: carError } = await createCar(carPayload, user.id)

      if (carError || !newCar) {
        throw new Error(carError?.message || 'Failed to create vehicle listing.')
      }

      let primaryImageUrl = newCar.image_url

      // ── Step 2: Upload images to Supabase Storage if files selected ──────────
      if (selectedPhotos.length > 0) {
        for (let i = 0; i < selectedPhotos.length; i++) {
          setSubmittingStep(`Uploading photo ${i + 1} of ${selectedPhotos.length}...`)
          const photo = selectedPhotos[i]

          const { data: imgRecord, error: uploadErr } = await uploadCarImage(
            photo.file,
            user.id,
            newCar.id,
            i,
          )

          if (uploadErr) {
            console.warn(`[Cardom Storage] Image ${i + 1} upload failed:`, uploadErr.message)
          } else if (i === 0 && imgRecord?.image_url) {
            primaryImageUrl = imgRecord.image_url
          }
        }

        // ── Step 3: Set primary uploaded image on the car record ────────────────
        if (primaryImageUrl && primaryImageUrl !== newCar.image_url) {
          setSubmittingStep('Finalizing listing...')
          await updateCar(newCar.id, { image_url: primaryImageUrl }, user.id).catch(() => {})
          newCar.image_url = primaryImageUrl
          newCar.image = primaryImageUrl
        }
      }

      // ── Step 4: Complete and show success card ──────────────────────────────
      setSubmittingStep('')
      setSubmitting(false)
      setCreatedCar(newCar)
      scrollToForm()
    } catch (err) {
      console.error('[Cardom Sell] Submission error:', err)
      setServerError(err.message || 'An error occurred while publishing your vehicle.')
      setSubmitting(false)
      setSubmittingStep('')
      scrollToForm()
    }
  }

  const resetForm = () => {
    // Clean up photo blobs
    selectedPhotos.forEach((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl)
    })
    setSelectedPhotos([])
    setFormData({
      brand: '',
      model: '',
      year: String(CURRENT_YEAR),
      price: '',
      location: '',
      fuel: 'Petrol',
      transmission: 'Automatic',
      mileage: '',
      image_url: '',
      description: '',
    })
    setCreatedCar(null)
    setErrors({})
    setServerError('')
    setPhotoError('')
  }

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        {/* ── 1. Hero Section ── */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/[0.06]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-10 left-1/4 w-[600px] h-[350px] rounded-full bg-orange-500/[0.08] blur-[120px]"
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-orange-500/20 bg-orange-500/[0.08] text-orange-400 mb-6">
                <Tag className="w-3.5 h-3.5" />
                Seller Marketplace
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                List Your Vehicle on{' '}
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                  Cardom.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mb-8">
                Upload real photos, specify verified parameters, and reach serious buyers nationwide with zero dealer fees.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ShimmerButton
                  size="lg"
                  onClick={scrollToForm}
                  className="w-full sm:w-auto min-w-[180px] shadow-[0_0_24px_rgba(249,115,22,0.3)]"
                >
                  Create Listing Now
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>

                <Link
                  to="/my-listings"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-orange-500/40 text-center transition-colors flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4 text-orange-400" />
                  View My Listings
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. The Listing Form Section ── */}
        <section ref={formRef} id="sell-form" className="py-16 sm:py-24 relative">
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {createdCar ? (
                /* ── Success State Screen ── */
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="p-8 sm:p-12 rounded-3xl border border-emerald-500/25 bg-[#0d0d0d] shadow-2xl shadow-black text-center space-y-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Your Car Has Been Listed Successfully!
                    </h2>
                    <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
                      Your vehicle is now live on the Cardom public marketplace and linked to your seller account with uploaded gallery photos.
                    </p>
                  </div>

                  {/* Summary Preview Box */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#121212] p-5 max-w-md mx-auto flex items-center gap-4 text-left">
                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                      <img
                        src={createdCar.image_url || createdCar.image}
                        alt={`${createdCar.brand} ${createdCar.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                        {createdCar.brand}
                      </p>
                      <h4 className="text-base font-bold text-white truncate">
                        {createdCar.model} ({createdCar.year})
                      </h4>
                      <p className="text-sm font-semibold text-zinc-300 mt-0.5">
                        {formatPriceDisplay(createdCar.price)} • {createdCar.location}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/cars/${createdCar.id}`)}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      View Live Listing
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/my-listings')}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-200 transition-colors cursor-pointer"
                    >
                      <Car className="w-4 h-4 text-orange-400" />
                      Go to My Listings
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      List Another Car
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ── Listing Creation Form ── */
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="p-6 sm:p-10 rounded-3xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl space-y-8"
                >
                  <div className="border-b border-white/[0.06] pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Vehicle Listing Form
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      Enter accurate vehicle details and upload high-resolution photos
                    </p>
                  </div>

                  {/* Global Server Error Banner */}
                  {serverError && (
                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* ── Section 1: Basic Information ── */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      1. Basic Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Brand */}
                      <div>
                        <label htmlFor="brand" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                          Brand / Make *
                        </label>
                        <input
                          id="brand"
                          type="text"
                          placeholder="e.g. BMW, Mercedes-Benz, Audi, Porsche"
                          value={formData.brand}
                          onChange={(e) => handleChange('brand', e.target.value)}
                          className={cn(
                            'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors',
                            errors.brand ? 'border-red-500/60 focus:border-red-500' : 'border-white/10',
                          )}
                        />
                        {errors.brand && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.brand}
                          </p>
                        )}
                      </div>

                      {/* Model */}
                      <div>
                        <label htmlFor="model" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                          Model *
                        </label>
                        <input
                          id="model"
                          type="text"
                          placeholder="e.g. 3 Series, C-Class, 911 Carrera"
                          value={formData.model}
                          onChange={(e) => handleChange('model', e.target.value)}
                          className={cn(
                            'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors',
                            errors.model ? 'border-red-500/60 focus:border-red-500' : 'border-white/10',
                          )}
                        />
                        {errors.model && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.model}
                          </p>
                        )}
                      </div>

                      {/* Year */}
                      <div>
                        <label htmlFor="year" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                          Manufacturing Year *
                        </label>
                        <select
                          id="year"
                          value={formData.year}
                          onChange={(e) => handleChange('year', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border border-white/10 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        >
                          {YEAR_OPTIONS.map((yr) => (
                            <option key={yr} value={yr} className="bg-[#111111] text-white">
                              {yr}
                            </option>
                          ))}
                        </select>
                        {errors.year && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.year}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="price" className="text-xs font-semibold text-zinc-300">
                            Asking Price (₹) *
                          </label>
                          {formData.price > 0 && (
                            <span className="text-[11px] font-semibold text-orange-400">
                              {formatPriceDisplay(formData.price)}
                            </span>
                          )}
                        </div>
                        <input
                          id="price"
                          type="number"
                          min="1"
                          placeholder="e.g. 4500000"
                          value={formData.price}
                          onChange={(e) => handleChange('price', e.target.value)}
                          className={cn(
                            'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors',
                            errors.price ? 'border-red-500/60 focus:border-red-500' : 'border-white/10',
                          )}
                        />
                        {errors.price && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.price}
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      <div className="sm:col-span-2">
                        <label htmlFor="location" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                          Location (City / State) *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="location"
                            type="text"
                            placeholder="e.g. Mumbai, Maharashtra or New Delhi"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            className={cn(
                              'w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors',
                              errors.location ? 'border-red-500/60 focus:border-red-500' : 'border-white/10',
                            )}
                          />
                        </div>
                        {errors.location && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2: Vehicle Specifications ── */}
                  <div className="pt-6 border-t border-white/[0.06] space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      2. Specifications
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Fuel Type */}
                      <div>
                        <label htmlFor="fuel" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                          Fuel Type *
                        </label>
                        <select
                          id="fuel"
                          value={formData.fuel}
                          onChange={(e) => handleChange('fuel', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border border-white/10 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        >
                          {FUEL_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#111111] text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Transmission */}
                      <div>
                        <label htmlFor="transmission" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                          Transmission *
                        </label>
                        <select
                          id="transmission"
                          value={formData.transmission}
                          onChange={(e) => handleChange('transmission', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border border-white/10 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        >
                          {TRANSMISSION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#111111] text-white">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Mileage */}
                      <div>
                        <label htmlFor="mileage" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                          Kilometers Driven *
                        </label>
                        <input
                          id="mileage"
                          type="number"
                          min="0"
                          placeholder="e.g. 18500"
                          value={formData.mileage}
                          onChange={(e) => handleChange('mileage', e.target.value)}
                          className={cn(
                            'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors',
                            errors.mileage ? 'border-red-500/60 focus:border-red-500' : 'border-white/10',
                          )}
                        />
                        {errors.mileage && (
                          <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.mileage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Section 3: REAL CAR IMAGE UPLOADS (Supabase Storage) ── */}
                  <div className="pt-6 border-t border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        3. Upload Car Photos ({selectedPhotos.length}/{MAX_IMAGES_PER_LISTING})
                      </h3>
                      <span className="text-[11px] text-zinc-500">
                        Max 5 MB each • JPG, PNG, WEBP
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFilesAdded(e.target.files)}
                      className="hidden"
                    />

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
                        isDragging
                          ? 'border-orange-500 bg-orange-500/[0.06] scale-[1.01]'
                          : 'border-white/15 bg-white/[0.01] hover:border-orange-500/40 hover:bg-orange-500/[0.02]',
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white text-center mb-1">
                        Click or drag & drop car photos here
                      </p>
                      <p className="text-[11px] text-zinc-400 text-center">
                        Upload up to {MAX_IMAGES_PER_LISTING} photos. The 1st photo becomes your primary listing cover.
                      </p>
                    </div>

                    {photoError && (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{photoError}</span>
                      </div>
                    )}

                    {/* Photo Thumbnails Preview Grid */}
                    {selectedPhotos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        {selectedPhotos.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-zinc-900 group"
                          >
                            <img
                              src={photo.previewUrl}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                            {/* Badge */}
                            {idx === 0 ? (
                              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500 text-white shadow-md">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                Cover Photo
                              </span>
                            ) : (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-zinc-300 border border-white/10">
                                Photo #{idx + 1}
                              </span>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemovePhoto(photo.id)
                              }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                              aria-label="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* File info footer */}
                            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-zinc-400 truncate">
                              <span className="truncate max-w-[110px]">{photo.name}</span>
                              <span>{photo.sizeMb} MB</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Backward-compatible Image URL Fallback */}
                    <div className="pt-2">
                      <details className="text-xs text-zinc-500 group">
                        <summary className="cursor-pointer hover:text-zinc-300 transition-colors select-none">
                          Or specify a public Image URL (Optional)
                        </summary>
                        <div className="mt-2.5 space-y-1.5">
                          <input
                            id="image_url"
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={formData.image_url}
                            onChange={(e) => handleChange('image_url', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#111111] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
                          />
                          <p className="text-[10px] text-zinc-500">
                            Used if no photos are uploaded directly.
                          </p>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* ── Section 4: Description & Notes ── */}
                  <div className="pt-6 border-t border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        4. Description & Notes
                      </h3>
                      <span className="text-[11px] text-zinc-500">
                        {formData.description.length} / 1000 characters
                      </span>
                    </div>

                    <div>
                      <textarea
                        id="description"
                        rows={4}
                        maxLength={1000}
                        placeholder="Highlight key features, single-owner history, recent service records, or included accessories..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className={cn(
                          'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#111111] border text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors',
                          errors.description ? 'border-red-500/60 focus:border-red-500' : 'border-white/10',
                        )}
                      />
                      {errors.description && (
                        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Submit Action Strip ── */}
                  <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-500">
                      {selectedPhotos.length > 0
                        ? `${selectedPhotos.length} photos ready for upload to Supabase Storage`
                        : 'Your listing will immediately appear on the Cardom Marketplace'}
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold',
                        'bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 cursor-pointer',
                        'hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {submittingStep || 'Publishing Listing...'}
                        </>
                      ) : (
                        <>
                          Publish Car Listing
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── 3. Why Sell With Cardom Strip ── */}
        <section className="py-16 sm:py-20 border-t border-white/[0.06] relative">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Why Drivers Choose Cardom
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Experience verified automotive transactions built on security and speed
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WHY_SELL_FEATURES.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl border border-white/[0.07] bg-[#0d0d0d] hover:border-orange-500/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Trust Reassurances ── */}
        <section className="py-12 border-t border-white/[0.06] bg-[#070707]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {TRUST_POINTS.map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
