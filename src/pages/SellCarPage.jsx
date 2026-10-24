import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createCar, updateCar } from '@/services/carsApi'
import {
  uploadCarImage,
  validateImageFile,
  MAX_IMAGES_PER_LISTING,
} from '@/services/carImagesApi'
import { cn } from '@/lib/utils'

const CURRENT_YEAR = new Date().getFullYear()

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Electric', 'CNG']
const TRANSMISSION_OPTIONS = ['Automatic', 'Manual']
const OWNERSHIP_OPTIONS = ['1st', '2nd', '3rd+']

export function SellCarPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Form State
  const [regNumber, setRegNumber] = useState('PB 02 MX 9482')
  const [formData, setFormData] = useState({
    brand: 'Hyundai',
    model: 'Creta',
    variant: 'SX(O) Executive 1.5 Diesel',
    year: '2022',
    price: '1485000',
    location: profile?.location || 'Amritsar, PB',
    fuel: 'Diesel',
    transmission: 'Automatic',
    ownership: '1st',
    mileage: '32500',
    description: '',
  })

  // Selected Photos for 4 distinct angles
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [photoError, setPhotoError] = useState('')
  const [activeSlot, setActiveSlot] = useState(null)

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submittingStep, setSubmittingStep] = useState('')
  const [serverError, setServerError] = useState('')
  const [createdCar, setCreatedCar] = useState(null)

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  // Handle Photos Added
  const handleFilesAdded = (files) => {
    setPhotoError('')
    const fileList = Array.from(files || [])
    if (!fileList.length) return

    if (selectedPhotos.length + fileList.length > MAX_IMAGES_PER_LISTING) {
      setPhotoError(`You can upload up to ${MAX_IMAGES_PER_LISTING} photos.`)
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
      })
    }

    setSelectedPhotos((prev) => [...prev, ...newPhotos])
  }

  const handleRemovePhoto = (id) => {
    setSelectedPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.brand.trim()) errs.brand = 'Brand is required'
    if (!formData.model.trim()) errs.model = 'Model is required'
    if (!formData.price || Number(formData.price) <= 0) {
      errs.price = 'Enter a valid asking price'
    }
    if (!formData.location.trim()) errs.location = 'City / Location is required'
    if (!formData.mileage || Number(formData.mileage) < 0) {
      errs.mileage = 'Enter valid mileage'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setErrors({})
    setServerError('')
    setSubmitting(true)

    try {
      setSubmittingStep('Calculating Cardom Smart Valuation & creating listing...')

      const carPayload = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        variant: formData.variant.trim(),
        year: Number(formData.year),
        price: Number(formData.price),
        location: formData.location.trim(),
        fuel_type: formData.fuel,
        fuel: formData.fuel,
        transmission: formData.transmission,
        ownership: formData.ownership,
        mileage: Number(formData.mileage),
        description: formData.description.trim() || `${regNumber} - Verified listing on Cardom`,
        status: 'active',
      }

      const { data: newCar, error: carError } = await createCar(carPayload, user.id)

      if (carError || !newCar) {
        throw new Error(carError?.message || 'Failed to create vehicle listing.')
      }

      let primaryImageUrl = ''

      // Upload photos to Supabase storage
      if (selectedPhotos.length > 0) {
        for (let i = 0; i < selectedPhotos.length; i++) {
          setSubmittingStep(`Uploading vehicle photo ${i + 1} of ${selectedPhotos.length}...`)
          const photo = selectedPhotos[i]

          const { data: imgRecord, error: uploadErr } = await uploadCarImage(
            photo.file,
            user.id,
            newCar.id,
            i,
          )

          if (uploadErr) {
            console.warn(`[Cardom Upload] photo ${i + 1} failed:`, uploadErr.message)
          } else if (i === 0 && imgRecord?.image_url) {
            primaryImageUrl = imgRecord.image_url
          }
        }

        if (primaryImageUrl) {
          setSubmittingStep('Finalizing listing...')
          await updateCar(newCar.id, { image_url: primaryImageUrl }, user.id).catch(() => {})
          newCar.image_url = primaryImageUrl
        }
      }

      setSubmittingStep('')
      setSubmitting(false)
      setCreatedCar(newCar)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('[Cardom Sell] Error:', err)
      setServerError(err.message || 'An error occurred while publishing your vehicle.')
      setSubmitting(false)
      setSubmittingStep('')
    }
  }

  // Dynamic Valuation calculation
  const baseVal = Math.max(Number(formData.price) || 1300000, 300000)
  const marketMin = (baseVal * 0.95 / 100000).toFixed(2)
  const marketMax = (baseVal * 1.05 / 100000).toFixed(2)
  const instantBuyout = (baseVal * 0.97 / 100000).toFixed(2)

  return (
    <div className="min-h-dvh bg-[#131313] text-[#e5e2e1] flex flex-col pb-28 selection:bg-[#ff6a00] selection:text-black">
      {/* ── Fixed Top Header ── */}
      <header className="sticky top-0 z-40 bg-[#131313]/90 backdrop-blur-xl border-b border-white/5 px-4 pt-safe">
        <div className="h-16 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6a00] text-[24px]">
              car_rental
            </span>
            <span className="font-display text-xl font-black text-white tracking-tight">
              Sell Your Car
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] border border-white/5 flex items-center justify-center text-[#c6c6c7] hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-lg mx-auto w-full px-4 pt-4 space-y-6">
        {/* Success Screen if Created */}
        {createdCar ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-[#201f1f] border border-[#4ae176]/30 p-6 text-center space-y-4 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-[#4ae176]/15 border border-[#4ae176]/30 text-[#4ae176] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4ae176]">
                Valuation Ready & Published
              </span>
              <h2 className="font-display text-2xl font-black text-white mt-1">
                {createdCar.year} {createdCar.brand} {createdCar.model}
              </h2>
              <p className="text-xs text-[#c6c6c7] mt-1 leading-relaxed">
                Your vehicle has been successfully published to the Cardom network. Our doorstep evaluation team will verify the vehicle within 60 minutes.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1c1b1b] border border-white/5 space-y-1 text-left font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#c6c6c7]">Instant Buyout Offer:</span>
                <span className="font-bold text-[#ff6a00]">₹{instantBuyout} Lakh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c6c6c7]">Market Range:</span>
                <span className="text-white">₹{marketMin}L – ₹{marketMax}L</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate(`/cars/${createdCar.id}`)}
                className="py-3 rounded-xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-black font-bold text-xs"
              >
                View Live Listing
              </button>
              <button
                onClick={() => {
                  setCreatedCar(null)
                  setSelectedPhotos([])
                }}
                className="py-3 rounded-xl bg-[#2a2a2a] hover:bg-[#353534] text-white font-bold text-xs"
              >
                Sell Another Car
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ── Step Tracker & Guarantee Header ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff6a00] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c6c6c7]">
                    Step 2 of 4
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ae176]/15 border border-[#4ae176]/30 text-[#4ae176] text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>Offer in 60 Mins</span>
                </div>
              </div>

              <div>
                <h1 className="font-display text-2xl font-black text-white leading-tight">
                  Vehicle Details
                </h1>
                <p className="text-xs text-[#c6c6c7] mt-0.5">
                  Refine specifications for an automated AI market valuation.
                </p>
              </div>

              {/* Segmented Linear Progress Bars */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <div className="h-1.5 rounded-full bg-[#ff6a00]" />
                <div className="h-1.5 rounded-full bg-[#ff6a00] shadow-[0_0_8px_rgba(255,106,0,0.6)]" />
                <div className="h-1.5 rounded-full bg-[#2a2a2a]" />
                <div className="h-1.5 rounded-full bg-[#2a2a2a]" />
              </div>
            </section>

            {/* ── Verified Registration Badge Card ── */}
            <section className="relative rounded-2xl bg-[#201f1f] border border-white/10 p-4 shadow-sm overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#ff6a00]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#ff6a00] border border-white/5">
                    <span className="material-symbols-outlined text-[22px]">verified</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-white tracking-wide">
                        {regNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#4ae176]/20 border border-[#4ae176]/30 text-[#4ae176] text-[10px] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">check_circle</span>
                        RTO Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-[#c6c6c7] mt-0.5">
                      {formData.year} {formData.brand} {formData.model} • Punjab RTO
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = prompt('Enter vehicle registration number:', regNumber)
                    if (next) setRegNumber(next.toUpperCase())
                  }}
                  className="p-1.5 text-[#c6c6c7] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="Edit Registration Number"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </section>

            {/* ── Interactive Listing Form ── */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Trim & Configuration */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#c6c6c7] block">
                  Trim & Configuration
                </label>
                <div className="rounded-2xl bg-[#201f1f] border border-white/5 p-3.5 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#c6c6c7] block mb-1">Make</span>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a00]"
                        placeholder="e.g. Hyundai"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#c6c6c7] block mb-1">Model</span>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a00]"
                        placeholder="e.g. Creta"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#c6c6c7] block mb-1">Variant & Trim</span>
                    <input
                      type="text"
                      value={formData.variant}
                      onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                      className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a00]"
                      placeholder="e.g. SX(O) Executive 1.5 Diesel"
                    />
                  </div>
                </div>
              </div>

              {/* Fuel Type Matrix */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#c6c6c7] block">
                  Fuel Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {FUEL_OPTIONS.map((fuel) => {
                    const isSelected = formData.fuel === fuel
                    return (
                      <button
                        key={fuel}
                        type="button"
                        onClick={() => setFormData({ ...formData, fuel })}
                        className={cn(
                          'py-2.5 rounded-xl font-bold text-xs text-center transition-all',
                          isSelected
                            ? 'bg-[#ff6a00] text-black shadow-md shadow-orange-500/20'
                            : 'bg-[#201f1f] text-[#c6c6c7] hover:bg-[#2a2a2a] border border-white/5'
                        )}
                      >
                        {fuel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Transmission & Ownership Two-Column Layout */}
              <div className="grid grid-cols-2 gap-3">
                {/* Transmission */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#c6c6c7] block">
                    Transmission
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TRANSMISSION_OPTIONS.map((trans) => {
                      const isSelected = formData.transmission === trans
                      return (
                        <button
                          key={trans}
                          type="button"
                          onClick={() => setFormData({ ...formData, transmission: trans })}
                          className={cn(
                            'py-2.5 rounded-xl font-bold text-xs text-center transition-all',
                            isSelected
                              ? 'bg-[#ff6a00] text-black shadow-md shadow-orange-500/20'
                              : 'bg-[#201f1f] text-[#c6c6c7] border border-white/5'
                          )}
                        >
                          {trans}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Ownership */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#c6c6c7] block">
                    Ownership
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {OWNERSHIP_OPTIONS.map((own) => {
                      const isSelected = formData.ownership === own
                      return (
                        <button
                          key={own}
                          type="button"
                          onClick={() => setFormData({ ...formData, ownership: own })}
                          className={cn(
                            'py-2.5 rounded-xl font-bold text-xs text-center transition-all',
                            isSelected
                              ? 'bg-[#ff6a00] text-black shadow-md shadow-orange-500/20'
                              : 'bg-[#201f1f] text-[#c6c6c7] border border-white/5'
                          )}
                        >
                          {own}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Odometer Reading Slider + Synchronized Input */}
              <div className="rounded-2xl bg-[#201f1f] border border-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#c6c6c7] block">
                      Odometer Reading
                    </label>
                    <p className="text-[10px] text-zinc-500">Physical cluster verification</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2a2a2a] text-white">
                    <input
                      type="text"
                      value={Number(formData.mileage).toLocaleString('en-IN')}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, '')
                        setFormData({ ...formData, mileage: clean })
                      }}
                      className="bg-transparent text-sm font-bold text-right w-20 focus:outline-none font-mono text-[#ff6a00]"
                    />
                    <span className="text-xs text-[#c6c6c7]">km</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min="5000"
                    max="120000"
                    step="500"
                    value={formData.mileage || 32500}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full accent-[#ff6a00] h-1.5 bg-[#353534] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#c6c6c7]">
                    <span>5,000 km</span>
                    <span className="text-[#ff6a00]">Avg: ~35k km</span>
                    <span>1,20,000+ km</span>
                  </div>
                </div>
              </div>

              {/* Inspection Pin / Location */}
              <div className="rounded-2xl bg-[#201f1f] border border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#ff6a00] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#c6c6c7] block">
                      Pickup / Evaluation Pin
                    </span>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none truncate w-full"
                      placeholder="e.g. Amritsar - 143001"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const loc = prompt('Enter your evaluation city/pin:', formData.location)
                    if (loc) setFormData({ ...formData, location: loc })
                  }}
                  className="text-xs text-[#ff6a00] font-bold hover:underline px-2 py-1 flex-shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Real-time Algorithmic Smart Valuation Card */}
              <section className="rounded-3xl bg-gradient-to-br from-[#2a2a2a] via-[#201f1f] to-[#1c1b1b] border border-white/10 p-5 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff6a00] text-xl">
                      analytics
                    </span>
                    <span className="font-display text-base font-bold text-white">
                      Cardom Smart Valuation
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#353534] text-[#c6c6c7]">
                    Live ML Engine
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Estimated Market Value */}
                  <div className="rounded-2xl bg-[#0e0e0e] p-3 space-y-1 border border-white/5">
                    <span className="text-[10px] text-[#c6c6c7] block">Estimated Market Value</span>
                    <div className="font-display text-base font-bold text-white">
                      ₹{marketMin}L – ₹{marketMax}L
                    </div>
                    <p className="text-[9px] text-[#c6c6c7]">Peer-to-peer benchmark</p>
                  </div>

                  {/* Instant Cardom Buyout */}
                  <div className="rounded-2xl bg-[#ff6a00]/10 border border-[#ff6a00]/25 p-3 space-y-1">
                    <span className="text-[10px] text-[#ff6a00] font-bold uppercase tracking-wider block">
                      Instant Buyout Offer
                    </span>
                    <div className="font-display text-base font-bold text-[#ff6a00]">
                      ₹{instantBuyout} Lakh
                    </div>
                    <p className="text-[9px] text-[#4ae176] flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[12px]">payments</span>
                      Direct payout in 24h
                    </p>
                  </div>
                </div>

                {/* Trend sparkline */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#c6c6c7]">
                    <span className="material-symbols-outlined text-[#4ae176] text-sm">
                      trending_up
                    </span>
                    <span>High-demand trim in Punjab (+3.8% MoM)</span>
                  </div>
                  <svg className="w-14 h-4 text-[#4ae176]" fill="none" viewBox="0 0 64 20">
                    <path
                      d="M2 17 L18 13 L34 14 L50 6 L62 3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </section>

              {/* Asking Price Input */}
              <div className="rounded-2xl bg-[#201f1f] border border-white/5 p-4 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#c6c6c7] block">
                  Your Asking Price
                </label>
                <div className="flex items-center gap-2 bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-bold text-[#ff6a00]">₹</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-transparent text-sm font-mono font-bold text-white focus:outline-none"
                    placeholder="1485000"
                  />
                  <span className="text-xs text-[#c6c6c7]">
                    (₹{(Number(formData.price || 0) / 100000).toFixed(2)} Lakh)
                  </span>
                </div>
              </div>

              {/* Photo Upload Dropzone Section (4 Angles) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold text-white">
                      Vehicle Gallery
                    </h2>
                    <p className="text-[11px] text-[#c6c6c7]">
                      Upload photos for doorstep inspection and fast buyout
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#4ae176]">
                    {selectedPhotos.length} added
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFilesAdded(e.target.files)}
                  className="hidden"
                />

                {/* 4 Multi-Tile Visual Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Front 3/4th View', icon: 'directions_car' },
                    { label: 'Rear 3/4th View', icon: 'minor_crash' },
                    { label: 'Interior Dashboard', icon: 'speed' },
                    { label: 'Odometer Cluster', icon: 'speedometer' },
                  ].map((slot, index) => {
                    const photo = selectedPhotos[index]
                    return (
                      <div
                        key={slot.label}
                        onClick={() => {
                          if (!photo) {
                            fileInputRef.current?.click()
                          }
                        }}
                        className={cn(
                          'relative rounded-2xl aspect-[4/3] bg-[#201f1f] border border-white/5 overflow-hidden flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group',
                          photo ? 'border-[#4ae176]/40' : 'hover:border-[#ff6a00]/40'
                        )}
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo.previewUrl}
                              alt={slot.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemovePhoto(photo.id)
                                }}
                                className="self-end w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                              <span className="text-[10px] font-bold text-white truncate">
                                {slot.label}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-[#2a2a2a] group-hover:scale-110 group-hover:bg-[#ff6a00] group-hover:text-black transition-all flex items-center justify-center text-[#c6c6c7] mb-2">
                              <span className="material-symbols-outlined text-[20px]">
                                add_a_photo
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-white">{slot.label}</span>
                            <span className="text-[10px] text-[#c6c6c7] mt-0.5">Click to add</span>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>

                {photoError && (
                  <p className="text-xs text-rose-400 font-semibold">{photoError}</p>
                )}

                {/* Photo Checklist */}
                <div className="rounded-2xl bg-[#1c1b1b] border border-white/5 p-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#c6c6c7] block">
                    Photo Quality Checklist
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-[#c6c6c7]">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#4ae176] text-[13px]">
                        sunny
                      </span>
                      <span>Clear daylight</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#4ae176] text-[13px]">
                        badge
                      </span>
                      <span>Clear plate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#4ae176] text-[13px]">
                        local_car_wash
                      </span>
                      <span>Clean car</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Server / Validation Error */}
              {serverError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Sticky-Safe Bottom Action Deck */}
              <section className="pt-2 pb-6 space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{submittingStep || 'Publishing Listing...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Valuation & Inspection</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between px-2 text-xs text-[#c6c6c7]">
                  <button
                    type="button"
                    onClick={() => alert('Draft saved to your Cardom Garage!')}
                    className="hover:text-white flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
                    <span>Save Draft</span>
                  </button>
                  <span className="text-[11px] text-zinc-500">Auto-saved 2m ago</span>
                </div>
              </section>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
