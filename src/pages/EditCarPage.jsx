import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  X,
  Star,
  MapPin,
  Gauge,
  FileText,
  Eye,
  ShieldAlert,
  Save,
  RotateCcw,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchCarById, updateCar } from '@/services/carsApi'
import {
  uploadCarImage,
  fetchCarImages,
  deleteCarImage,
  updateCarImageOrder,
  validateImageFile,
  MAX_IMAGES_PER_LISTING,
} from '@/services/carImagesApi'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { cn } from '@/lib/utils'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 37 }, (_, i) => CURRENT_YEAR - i)

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
const TRANSMISSION_OPTIONS = ['Automatic', 'Manual', 'AMT', 'CVT', 'DCT']

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

export function EditCarPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const fileInputRef = useRef(null)

  // Loading & Permissions State
  const [initialLoading, setInitialLoading] = useState(true)
  const [notAuthorized, setNotAuthorized]   = useState(false)
  const [loadError, setLoadError]           = useState('')

  // Form State
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: String(CURRENT_YEAR),
    price: '',
    location: '',
    fuel: 'Petrol',
    transmission: 'Automatic',
    mileage: '',
    description: '',
  })

  // Existing Photos in Database
  const [existingPhotos, setExistingPhotos] = useState([])
  // New Photos selected from file input (not uploaded yet)
  const [newPhotos, setNewPhotos]           = useState([])

  // Cover Photo selection key (e.g. 'existing-0', 'new-1')
  const [coverPhotoKey, setCoverPhotoKey]   = useState('')

  // UI state
  const [errors, setErrors]                 = useState({})
  const [isDragging, setIsDragging]         = useState(false)
  const [photoError, setPhotoError]         = useState('')
  const [saving, setSaving]                 = useState(false)
  const [saveStep, setSaveStep]             = useState('')
  const [serverError, setServerError]       = useState('')
  const [saveSuccess, setSaveSuccess]       = useState(false)
  const [hasChanges, setHasChanges]         = useState(false)

  // 1. Fetch listing details and verify ownership
  const loadListing = useCallback(async () => {
    if (!id || !user) return
    setInitialLoading(true)
    setLoadError('')
    setNotAuthorized(false)

    try {
      const { data: car, error } = await fetchCarById(id)

      if (error || !car) {
        setLoadError('Vehicle listing not found.')
        setInitialLoading(false)
        return
      }

      // Security Check: Verify that the listing belongs to the current user
      if (car.seller_id && String(car.seller_id) !== String(user.id)) {
        setNotAuthorized(true)
        setInitialLoading(false)
        return
      }

      // Populate form
      setFormData({
        brand: car.brand || '',
        model: car.model || '',
        year: String(car.year || CURRENT_YEAR),
        price: String(car.price || ''),
        location: car.location || '',
        fuel: car.fuel || car.fuel_type || 'Petrol',
        transmission: car.transmission || 'Automatic',
        mileage: String(car.mileage ?? ''),
        description: car.description || '',
      })

      // Fetch uploaded photos from car_images
      const { data: images } = await fetchCarImages(id)

      if (images && images.length > 0) {
        setExistingPhotos(images)
        setCoverPhotoKey(`existing-${images[0].id}`)
      } else if (car.image_url || car.image) {
        // Fallback for legacy URL-based listing
        const legacyPhoto = {
          id: 'legacy-cover',
          image_url: car.image_url || car.image,
          storage_path: null,
          isLegacy: true,
        }
        setExistingPhotos([legacyPhoto])
        setCoverPhotoKey('existing-legacy-cover')
      }

      setInitialLoading(false)
      setHasChanges(false)
    } catch (err) {
      console.error('[Cardom Edit] Error loading listing:', err)
      setLoadError('An error occurred while loading this listing.')
      setInitialLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    if (user && !authLoading) {
      loadListing()
    }
  }, [user, authLoading, loadListing])

  // Protected route check: Redirect if unauthenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  // Handle Field Changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    setServerError('')
  }

  // Handle New Photo Selection
  const handleFilesAdded = (files) => {
    setPhotoError('')
    const fileList = Array.from(files || [])
    if (!fileList.length) return

    const totalCurrent = existingPhotos.length + newPhotos.length
    if (totalCurrent + fileList.length > MAX_IMAGES_PER_LISTING) {
      setPhotoError(`You can have a maximum of ${MAX_IMAGES_PER_LISTING} photos per listing.`)
      return
    }

    const added = []
    for (const file of fileList) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setPhotoError(validation.error)
        return
      }

      const tempId = `new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      added.push({
        id: tempId,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
      })
    }

    setNewPhotos((prev) => [...prev, ...added])
    setHasChanges(true)

    // If no cover photo is currently selected, pick the first new one
    if (!coverPhotoKey && added.length > 0) {
      setCoverPhotoKey(added[0].id)
    }
  }

  // Handle Deleting an Existing Photo
  const handleDeleteExistingPhoto = async (photo) => {
    const confirmDelete = window.confirm('Remove this photo from the vehicle gallery?')
    if (!confirmDelete) return

    // If it's a real DB record (not a legacy URL placeholder)
    if (!photo.isLegacy && photo.id) {
      const { success, error } = await deleteCarImage(photo.id, photo.storage_path)
      if (!error && success) {
        setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
        setHasChanges(true)
      } else {
        alert(error?.message || 'Failed to delete photo from storage.')
      }
    } else {
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      setHasChanges(true)
    }

    // Reset cover key if this photo was the cover
    if (coverPhotoKey === `existing-${photo.id}`) {
      setCoverPhotoKey('')
    }
  }

  // Handle Removing a Newly Added (un-uploaded) Photo
  const handleRemoveNewPhoto = (id) => {
    setNewPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
    if (coverPhotoKey === id) {
      setCoverPhotoKey('')
    }
    setHasChanges(true)
    setPhotoError('')
  }

  // Form Validation
  const validateForm = () => {
    const errs = {}

    if (!formData.brand.trim()) errs.brand = 'Brand is required'
    if (!formData.model.trim()) errs.model = 'Model is required'

    const yearNum = Number(formData.year)
    if (!formData.year || isNaN(yearNum) || yearNum < 1980 || yearNum > CURRENT_YEAR) {
      errs.year = `Select a valid year between 1980 and ${CURRENT_YEAR}`
    }

    const priceNum = Number(formData.price)
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errs.price = 'Enter a valid asking price greater than 0'
    }

    if (!formData.location.trim()) errs.location = 'City / Location is required'

    const mileageNum = Number(formData.mileage)
    if (formData.mileage === '' || isNaN(mileageNum) || mileageNum < 0) {
      errs.mileage = 'Enter valid kilometers driven (0 or more)'
    }

    if (!formData.fuel) errs.fuel = 'Select a fuel type'
    if (!formData.transmission) errs.transmission = 'Select a transmission type'

    if (formData.description && formData.description.length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters'
    }

    return errs
  }

  // Handle Save Changes
  const handleSave = async (e) => {
    e.preventDefault()
    if (!user || !id) return

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      window.scrollTo({ top: 150, behavior: 'smooth' })
      return
    }

    setErrors({})
    setServerError('')
    setSaving(true)

    try {
      // ── 1. Upload any newly added photos to Supabase Storage ─────────────
      const newlyUploadedRecords = []
      if (newPhotos.length > 0) {
        for (let i = 0; i < newPhotos.length; i++) {
          setSaveStep(`Uploading photo ${i + 1} of ${newPhotos.length}...`)
          const newPhoto = newPhotos[i]
          const orderIndex = existingPhotos.length + i

          const { data: record, error: uploadErr } = await uploadCarImage(
            newPhoto.file,
            user.id,
            id,
            orderIndex,
          )

          if (uploadErr) {
            console.warn(`[Cardom Edit] Error uploading photo ${i + 1}:`, uploadErr.message)
          } else if (record) {
            newlyUploadedRecords.push({ ...record, tempId: newPhoto.id })
          }
        }
      }

      // Combine existing and newly uploaded photos
      const allPhotos = [
        ...existingPhotos.filter((p) => !p.isLegacy),
        ...newlyUploadedRecords,
      ]

      // Determine which photo is designated as the primary cover
      let primaryCoverUrl = ''

      // Find the chosen cover photo
      if (coverPhotoKey.startsWith('existing-')) {
        const existingId = coverPhotoKey.replace('existing-', '')
        const found = existingPhotos.find((p) => String(p.id) === String(existingId))
        if (found) primaryCoverUrl = found.image_url
      } else if (coverPhotoKey.startsWith('new-')) {
        const found = newlyUploadedRecords.find((r) => r.tempId === coverPhotoKey)
        if (found) primaryCoverUrl = found.image_url
      }

      // Fallback: If no specific cover was flagged, use first photo available
      if (!primaryCoverUrl && allPhotos.length > 0) {
        primaryCoverUrl = allPhotos[0].image_url
      }

      // ── 2. Re-sequence display_order so the cover is 0 ──────────────────
      if (allPhotos.length > 0) {
        setSaveStep('Updating photo gallery ordering...')
        for (let idx = 0; idx < allPhotos.length; idx++) {
          const photo = allPhotos[idx]
          const isCover = photo.image_url === primaryCoverUrl
          const newOrder = isCover ? 0 : (idx === 0 ? 1 : idx + 1)
          await updateCarImageOrder(photo.id, newOrder).catch(() => {})
        }
      }

      // ── 3. Update the vehicle details in public.cars ─────────────────────
      setSaveStep('Updating vehicle details...')

      const updatePayload = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        price: Number(formData.price),
        location: formData.location.trim(),
        fuel_type: formData.fuel,
        fuel: formData.fuel,
        transmission: formData.transmission,
        mileage: Number(formData.mileage),
        description: formData.description.trim(),
        ...(primaryCoverUrl ? { image_url: primaryCoverUrl } : {}),
      }

      const { data: updatedCar, error: updateErr } = await updateCar(id, updatePayload, user.id)

      if (updateErr || !updatedCar) {
        throw new Error(updateErr?.message || 'Failed to update vehicle details.')
      }

      // ── 4. Finish and Show Success Banner ───────────────────────────────
      setSaving(false)
      setSaveStep('')
      setSaveSuccess(true)
      setHasChanges(false)
      // Clean up new photo preview URLs
      newPhotos.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl)
      })
      setNewPhotos([])
      // Reload fresh data from database
      await loadListing()
      window.scrollTo({ top: 100, behavior: 'smooth' })
    } catch (err) {
      console.error('[Cardom Edit] Save error:', err)
      setServerError(err.message || 'An error occurred while saving changes.')
      setSaving(false)
      setSaveStep('')
      window.scrollTo({ top: 100, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-20 max-w-4xl mx-auto w-full">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/[0.04] rounded-full blur-[140px]" />
        </div>

        {/* ── Breadcrumb Back Link ── */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/my-listings"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to My Listings
          </Link>

          <span className="text-[11px] font-mono text-zinc-500">
            Listing ID: {id?.slice(0, 8)}...
          </span>
        </div>

        {initialLoading ? (
          /* ── Loading Skeleton ── */
          <div className="space-y-6 animate-pulse">
            <div className="h-14 rounded-2xl bg-[#111111] border border-white/[0.06]" />
            <div className="h-96 rounded-3xl bg-[#111111] border border-white/[0.06]" />
            <div className="h-56 rounded-3xl bg-[#111111] border border-white/[0.06]" />
          </div>
        ) : notAuthorized ? (
          /* ── Not Authorized Screen ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 px-6 rounded-3xl border border-red-500/20 bg-[#0d0d0d] text-center max-w-md mx-auto my-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              You do not have permission to edit this listing, or it does not exist under your seller account.
            </p>
            <Link
              to="/my-listings"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg"
            >
              <Car className="w-3.5 h-3.5" />
              Return to My Listings
            </Link>
          </motion.div>
        ) : loadError ? (
          /* ── Load Error Screen ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 px-6 rounded-3xl border border-red-500/20 bg-red-500/[0.04] text-center max-w-md mx-auto my-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{loadError}</h2>
            <p className="text-xs text-zinc-400 mb-6">Please check the listing URL and try again.</p>
            <button
              type="button"
              onClick={loadListing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </motion.div>
        ) : (
          /* ── Main Edit Form ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="pb-6 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Edit Vehicle Listing
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Update your vehicle specifications, asking price, and gallery photos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/cars/${id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-400" />
                  View Live
                </Link>
              </div>
            </div>

            {/* Success notification banner */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Listing Updated Successfully!</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Your changes and photo updates are now live across Cardom.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/cars/${id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      View Live Listing
                    </Link>
                    <Link
                      to="/my-listings"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors"
                    >
                      My Listings
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            {serverError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSave} noValidate className="p-6 sm:p-10 rounded-3xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl space-y-8">
              {/* ── 1. Basic Details ── */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  1. Basic Details
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
                      value={formData.brand}
                      onChange={(e) => handleFieldChange('brand', e.target.value)}
                      placeholder="e.g. BMW, Mercedes-Benz, Porsche"
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
                      value={formData.model}
                      onChange={(e) => handleFieldChange('model', e.target.value)}
                      placeholder="e.g. 3 Series, C-Class, 911 Carrera"
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
                      onChange={(e) => handleFieldChange('year', e.target.value)}
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
                      value={formData.price}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      placeholder="e.g. 4500000"
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
                        value={formData.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        placeholder="e.g. Mumbai, Maharashtra"
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

              {/* ── 2. Specifications ── */}
              <div className="pt-6 border-t border-white/[0.06] space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  2. Vehicle Specifications
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
                      onChange={(e) => handleFieldChange('fuel', e.target.value)}
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
                      onChange={(e) => handleFieldChange('transmission', e.target.value)}
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
                      value={formData.mileage}
                      onChange={(e) => handleFieldChange('mileage', e.target.value)}
                      placeholder="e.g. 18500"
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

              {/* ── 3. Vehicle Photos Management ── */}
              <div className="pt-6 border-t border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      3. Vehicle Photos ({existingPhotos.length + newPhotos.length}/{MAX_IMAGES_PER_LISTING})
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Manage gallery photos. Select which photo acts as your marketplace cover.
                    </p>
                  </div>
                  <span className="text-[11px] text-zinc-500">Max 5 MB each</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFilesAdded(e.target.files)}
                  className="hidden"
                />

                {/* Add Photo Button / Drag Zone (if under limit) */}
                {existingPhotos.length + newPhotos.length < MAX_IMAGES_PER_LISTING && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files)
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
                      isDragging
                        ? 'border-orange-500 bg-orange-500/[0.06]'
                        : 'border-white/15 bg-white/[0.01] hover:border-orange-500/40 hover:bg-orange-500/[0.02]',
                    )}
                  >
                    <UploadCloud className="w-5 h-5 text-orange-400" />
                    <span className="text-xs font-semibold text-white">
                      Click or drop to add more photos ({MAX_IMAGES_PER_LISTING - (existingPhotos.length + newPhotos.length)} remaining)
                    </span>
                  </div>
                )}

                {photoError && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}

                {/* Photos Grid */}
                {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {/* Existing Photos */}
                    {existingPhotos.map((photo) => {
                      const isCover = coverPhotoKey === `existing-${photo.id}`
                      return (
                        <div
                          key={`existing-${photo.id}`}
                          className={cn(
                            'relative aspect-video rounded-xl overflow-hidden border bg-zinc-900 group transition-all',
                            isCover ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-white/10',
                          )}
                        >
                          <img
                            src={photo.image_url}
                            alt="Car photo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                          {/* Cover badge */}
                          {isCover ? (
                            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500 text-white shadow-md">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Cover Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCoverPhotoKey(`existing-${photo.id}`)
                                setHasChanges(true)
                              }}
                              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 hover:bg-orange-500 text-white border border-white/10 transition-colors shadow-md cursor-pointer"
                            >
                              Set as Cover
                            </button>
                          )}

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingPhoto(photo)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                            aria-label="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="absolute bottom-1.5 left-2 right-2 text-[10px] text-zinc-400 truncate">
                            {photo.isLegacy ? 'Legacy URL' : 'Saved in Storage'}
                          </div>
                        </div>
                      )
                    })}

                    {/* Newly Added Photos */}
                    {newPhotos.map((photo) => {
                      const isCover = coverPhotoKey === photo.id
                      return (
                        <div
                          key={photo.id}
                          className={cn(
                            'relative aspect-video rounded-xl overflow-hidden border bg-zinc-900 group transition-all',
                            isCover ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-dashed border-orange-500/40',
                          )}
                        >
                          <img
                            src={photo.previewUrl}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                          {/* Cover badge or button */}
                          {isCover ? (
                            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500 text-white shadow-md">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Cover Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCoverPhotoKey(photo.id)
                                setHasChanges(true)
                              }}
                              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 hover:bg-orange-500 text-white border border-white/10 transition-colors shadow-md cursor-pointer"
                            >
                              Set as Cover
                            </button>
                          )}

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveNewPhoto(photo.id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                            aria-label="Remove new photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-orange-300 font-semibold truncate">
                            <span className="truncate max-w-[100px]">{photo.name}</span>
                            <span>Pending Upload</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── 4. Description ── */}
              <div className="pt-6 border-t border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    4. Description & Details
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
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Highlight condition, history, maintenance, and vehicle features..."
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

              {/* ── Save Action Strip ── */}
              <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-zinc-500">
                  {hasChanges ? 'You have unsaved changes' : 'All changes saved to Supabase'}
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/my-listings"
                    className="px-5 py-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-center w-full sm:w-auto"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold',
                      'bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 cursor-pointer',
                      'hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {saveStep || 'Saving Changes...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}

