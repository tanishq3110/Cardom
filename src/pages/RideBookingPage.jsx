import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Navigation,
  Car,
  Clock,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { useAuth } from '@/context/AuthContext'
import { createRideBooking } from '@/services/rideBookingApi'
import { RIDE_TYPES, calcEstimatedFare } from '@/config/rideTypes'
import { cn } from '@/lib/utils'

// Placeholder distance until real map integration is added
const PLACEHOLDER_DISTANCE_KM = 12.4

export function RideBookingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [selectedTierId, setSelectedTierId] = useState('comfort')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [isLocating, setIsLocating] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState(null)

  // After successful booking
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const selectedTier = RIDE_TYPES.find((t) => t.id === selectedTierId) || RIDE_TYPES[1]
  const estimatedFare = calcEstimatedFare(selectedTierId, PLACEHOLDER_DISTANCE_KM)

  const handleUseCurrentLocation = () => {
    setIsLocating(true)
    // Placeholder until GPS/Maps integration is added in Phase 2
    setTimeout(() => {
      setPickup('Current Location (GPS)')
      setIsLocating(false)
    }, 600)
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
    const { data, error: bookingError } = await createRideBooking({
      pickupAddress: pickup.trim(),
      dropAddress: drop.trim(),
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
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 md:pb-20 max-w-2xl mx-auto w-full">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        {/* ── Top Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-orange-500/20 bg-orange-500/[0.08] text-orange-400 mb-2">
              <Navigation className="w-3.5 h-3.5" />
              On-Demand Transit
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Book a Cardom Ride
            </h1>
          </div>
          <Link
            to="/bookings"
            className="text-xs text-orange-400 font-semibold hover:underline"
          >
            My Rides →
          </Link>
        </div>

        {confirmedBooking ? (
          /* ── Booking Confirmed Screen ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-[#121212] text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                {confirmedBooking.booking_reference}
              </span>
              <h2 className="text-2xl font-black text-white">Searching for Driver</h2>
              <p className="text-xs text-zinc-400 mt-1">
                We&apos;re finding a nearby driver for your ride.
              </p>
            </div>

            {/* Ride Summary Card */}
            <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{selectedTier.name}</p>
                    <p className="text-[10px] text-zinc-400">{selectedTier.carType}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-orange-400">
                  ₹{Number(confirmedBooking.estimated_fare).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-white truncate">{confirmedBooking.pickup_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                  <span className="text-white truncate">{confirmedBooking.drop_address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
                <span className="font-mono">{confirmedBooking.booking_reference}</span>
                <span className="uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold">
                  Searching…
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null)
                  setPickup('')
                  setDrop('')
                }}
                className="flex-1 py-3 rounded-xl bg-[#202020] border border-[#2a2a2a] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
              >
                Book Another
              </button>
              <button
                type="button"
                onClick={() => navigate(`/ride/${confirmedBooking.id}`)}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Booking Form ── */
          <div className="space-y-5">

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Location Inputs */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#2A2A2A] space-y-3 shadow-lg">
              {/* Pickup */}
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup point"
                  className="w-full pl-9 pr-10 py-3 rounded-xl bg-[#1c1c1c] border border-white/[0.08] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-300"
                  title="Detect Current GPS Location"
                >
                  <Crosshair className={cn('w-4 h-4', isLocating && 'animate-spin')} />
                </button>
              </div>

              {/* Drop */}
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#1c1c1c] border border-white/[0.08] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Ride Tier Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Select Ride Category
              </span>

              <div className="space-y-2.5">
                {RIDE_TYPES.map((tier) => {
                  const fare = calcEstimatedFare(tier.id, PLACEHOLDER_DISTANCE_KM)
                  const isSelected = selectedTierId === tier.id

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={cn(
                        'p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 shadow-md shadow-orange-500/10'
                          : 'bg-[#141414] border-[#2A2A2A] hover:border-white/20',
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                            isSelected ? 'bg-orange-500 text-white' : 'bg-[#202020] text-zinc-400',
                          )}
                        >
                          <Car className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{tier.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-orange-400" />
                              {tier.estimatedArrivalMinutes} mins away
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">{tier.carType}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-black text-white block">₹{fare}</span>
                        <span className="text-[10px] text-zinc-500">{tier.seats} seats</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#2A2A2A] space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Payment Option
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI / GPay' },
                  { id: 'wallet', label: 'Cardom Cash' },
                  { id: 'cash', label: 'Pay Cash' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={cn(
                      'py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer',
                      paymentMethod === pm.id
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-[#1c1c1c] border-white/[0.06] text-zinc-300 hover:text-white',
                    )}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isBooking}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming Ride…</span>
                </>
              ) : (
                <>
                  <span>Confirm {selectedTier.name} · ₹{estimatedFare}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Disclaimer */}
            <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
              Fare shown is an estimate based on a placeholder distance.
              Actual fare may vary. Live map integration coming soon.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
