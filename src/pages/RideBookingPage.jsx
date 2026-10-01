import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Car,
  CheckCircle2,
  Crosshair,
  AlertCircle,
  Loader2,
  CreditCard,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createRideBooking } from '@/services/rideBookingApi'
import { RIDE_TYPES, calcEstimatedFare } from '@/config/rideTypes'
import { cn } from '@/lib/utils'

// Placeholder distance until real map integration
const PLACEHOLDER_DISTANCE_KM = 12.4

const PAYMENT_METHODS = [
  { id: 'upi', label: 'Direct UPI (Partner QR)', icon: '🔷' },
  { id: 'cash', label: 'Cash to Driver', icon: '💵' },
]

export function RideBookingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropCoords, setDropCoords] = useState(null)
  const [selectedTierId, setSelectedTierId] = useState('economy')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [isLocating, setIsLocating] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const selectedTier = RIDE_TYPES.find((t) => t.id === selectedTierId) || RIDE_TYPES[0]
  const estimatedFare = calcEstimatedFare(selectedTierId, PLACEHOLDER_DISTANCE_KM)

  const handleUseCurrentLocation = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickup('Current Location (GPS)')
          setPickupCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          setIsLocating(false)
        },
        () => {
          setPickup('Current Location')
          setPickupCoords({ latitude: 31.634, longitude: 74.8723 })
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 6000 }
      )
    } else {
      setPickup('Current Location')
      setPickupCoords({ latitude: 31.634, longitude: 74.8723 })
      setIsLocating(false)
    }
  }

  const handleConfirmBooking = async () => {
    setError(null)
    if (!user) {
      navigate('/login')
      return
    }
    if (!pickup.trim()) {
      setError('Please enter a pickup location.')
      return
    }
    if (!drop.trim()) {
      setError('Please enter a destination.')
      return
    }

    setIsBooking(true)
    const pLat = pickupCoords?.latitude || 31.634
    const pLng = pickupCoords?.longitude || 74.8723
    const dLat = dropCoords?.latitude || (pLat + 0.035)
    const dLng = dropCoords?.longitude || (pLng + 0.028)

    const { data, error: bookingError } = await createRideBooking({
      pickupAddress: pickup.trim(),
      dropAddress: drop.trim(),
      pickupLatitude: pLat,
      pickupLongitude: pLng,
      dropLatitude: dLat,
      dropLongitude: dLng,
      rideType: selectedTierId,
      estimatedFare,
      estimatedDistanceKm: PLACEHOLDER_DISTANCE_KM,
      paymentMethod,
    })

    if (bookingError) {
      setError(bookingError.message || 'Booking failed. Please try again.')
      setIsBooking(false)
      return
    }

    setConfirmedBooking(data)
    setIsBooking(false)
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white flex flex-col pb-28">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-base font-bold text-white">Ride Booking</h1>
          <Link to="/bookings" className="text-orange-400 text-xs font-semibold">
            My Rides
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4">
        <AnimatePresence mode="wait">
          {confirmedBooking ? (
            /* ── Booking Confirmed Screen ── */
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pt-4 space-y-4 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-[#555] uppercase tracking-widest font-mono mb-1">
                  {confirmedBooking.booking_reference}
                </p>
                <h2 className="text-2xl font-black text-white">Searching Driver</h2>
                <p className="text-[#A1A1AA] text-sm mt-1">
                  Finding the best driver near you…
                </p>
              </div>

              {/* Ride Summary */}
              <div className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <Car className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-white font-bold text-sm capitalize">{confirmedBooking.ride_type}</span>
                  </div>
                  <span className="text-orange-400 font-black text-base">
                    ₹{Number(confirmedBooking.estimated_fare).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-white text-xs truncate">{confirmedBooking.pickup_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-white text-xs truncate">{confirmedBooking.drop_address}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirmedBooking(null)
                    setPickup('')
                    setDrop('')
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-sm font-semibold text-white"
                >
                  Book Another
                </button>
                <button
                  onClick={() => navigate(`/ride/${confirmedBooking.id}`)}
                  className="flex-1 py-3.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-[0_4px_20px_rgba(249,115,22,0.3)]"
                >
                  Track Ride
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Booking Form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Map placeholder */}
              <div className="relative h-44 bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden flex items-center justify-center">
                {/* Simplified map grid */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, #2A2A2A 0px, #2A2A2A 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #2A2A2A 0px, #2A2A2A 1px, transparent 1px, transparent 40px)',
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-[#A1A1AA] text-xs">Map view coming soon</p>
                </div>
                {/* Route line visual */}
                <div className="absolute left-1/2 top-8 bottom-8 w-0.5 bg-orange-500/20" style={{ transform: 'translateX(-50%)' }} />
              </div>

              {/* Pickup & Drop inputs */}
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                {/* Pickup */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2A2A2A]">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Pickup Location"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#555] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="flex-shrink-0 text-orange-400"
                  >
                    {isLocating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crosshair className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Drop */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                    placeholder="Drop Location"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#555] focus:outline-none"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Ride Type Cards */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider px-0.5">Select Ride Type</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {RIDE_TYPES.map((tier) => {
                    const isSelected = selectedTierId === tier.id
                    const fare = calcEstimatedFare(tier.id, PLACEHOLDER_DISTANCE_KM)
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all active:scale-95',
                          isSelected
                            ? 'bg-orange-500/15 border-orange-500/50 shadow-[0_0_16px_rgba(249,115,22,0.2)]'
                            : 'bg-[#111111] border-[#2A2A2A] hover:border-[#333]',
                        )}
                      >
                        {/* Icon */}
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center',
                          isSelected ? 'bg-orange-500' : 'bg-[#1A1A1A]'
                        )}>
                          <Car className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-[#A1A1AA]')} />
                        </div>
                        <span className={cn('text-[11px] font-bold capitalize', isSelected ? 'text-orange-400' : 'text-white')}>
                          {tier.name}
                        </span>
                        <span className={cn('text-sm font-black', isSelected ? 'text-white' : 'text-[#A1A1AA]')}>
                          ₹{fare}
                        </span>
                        <span className="text-[9px] text-[#555]">{tier.etaMinutes} min</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#2A2A2A]">
                  <p className="text-xs text-[#555] uppercase tracking-wider font-bold">Payment Method</p>
                </div>
                {PAYMENT_METHODS.map((pm, idx) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 transition-colors',
                      idx < PAYMENT_METHODS.length - 1 && 'border-b border-[#1E1E1E]',
                      paymentMethod === pm.id ? 'bg-orange-500/5' : 'hover:bg-[#1A1A1A]',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{pm.icon}</span>
                      <span className="text-sm font-medium text-white">{pm.label}</span>
                    </div>
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                      paymentMethod === pm.id ? 'border-orange-500' : 'border-[#444]',
                    )}>
                      {paymentMethod === pm.id && (
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Book Button */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full py-4 rounded-2xl bg-orange-500 text-white font-black text-base shadow-[0_6px_24px_rgba(249,115,22,0.35)] disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking…
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Book Ride · ₹{estimatedFare}
                  </>
                )}
              </button>

              {!user && (
                <p className="text-center text-xs text-[#A1A1AA]">
                  <Link to="/login" className="text-orange-400 font-semibold">Sign in</Link> to book a ride
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
