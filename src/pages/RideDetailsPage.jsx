import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  Phone,
  Car,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  RefreshCw,
  User,
  Star,
  Wifi,
  WifiOff,
  Compass,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getRideBookingById, cancelRideBooking, subscribeToRideBooking } from '@/services/rideBookingApi'
import { getDriverLocation, subscribeToDriverLocation } from '@/services/rideLocationApi'
import { calculateDistanceKm, formatDistance, calculateEta } from '@/utils/geoUtils'
import { RideMap } from '@/components/map/RideMap'
import { getRideType } from '@/config/rideTypes'
import { cn } from '@/lib/utils'

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  searching: {
    label: 'Finding a driver...',
    sublabel: 'Matching with the nearest available partner',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/25',
    icon: RefreshCw,
    animate: true,
  },
  driver_assigned: {
    label: 'Driver Assigned',
    sublabel: 'Partner accepted your ride',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/25',
    icon: Car,
    animate: false,
  },
  arriving: {
    label: 'Driver is arriving',
    sublabel: 'On the way to your pickup point',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/25',
    icon: Navigation,
    animate: true,
  },
  started: {
    label: 'Ride in Progress',
    sublabel: 'En route to your destination',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/25',
    icon: Navigation,
    animate: true,
  },
  completed: {
    label: 'Ride Completed',
    sublabel: 'Thank you for riding with Cardom',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/25',
    icon: CheckCircle2,
    animate: false,
  },
  cancelled: {
    label: 'Ride Cancelled',
    sublabel: 'This ride booking was cancelled',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/25',
    icon: XCircle,
    animate: false,
  },
}

// ─── Timeline step ─────────────────────────────────────────────────────────────
function TimelineStep({ label, done, active, last }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500',
            done
              ? 'bg-green-500 border-green-500'
              : active
              ? 'bg-orange-500 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
              : 'bg-[#1A1A1A] border-[#333]',
          )}
        >
          {done && <CheckCircle2 className="w-3 h-3 text-white" />}
          {active && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        </div>
        {!last && (
          <div
            className={cn(
              'w-0.5 h-6 mt-1 transition-all duration-500',
              done ? 'bg-green-500/50' : 'bg-[#2A2A2A]',
            )}
          />
        )}
      </div>
      <p
        className={cn(
          'text-sm pt-0.5 transition-colors',
          done ? 'text-green-400 font-medium' : active ? 'text-white font-semibold' : 'text-[#555]',
        )}
      >
        {label}
      </p>
    </div>
  )
}

// ─── RideDetailsPage ──────────────────────────────────────────────────────────
export function RideDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [connectionState, setConnectionState] = useState('connected')

  const channelRef = useRef(null)
  const locationSubRef = useRef(null)
  const heartbeatRef = useRef(null)

  const loadBooking = useCallback(async () => {
    const { data, error: err } = await getRideBookingById(id)
    if (err) {
      setError(err.message || 'Unable to load ride details.')
    } else {
      setBooking(data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  // Realtime subscription for ride booking changes + heartbeat polling
  useEffect(() => {
    if (!id) return

    channelRef.current = subscribeToRideBooking(id, (updated) => {
      setBooking(updated)
      setConnectionState('connected')
    })

    heartbeatRef.current = setInterval(async () => {
      const { data } = await getRideBookingById(id)
      if (data) {
        setBooking(data)
        setConnectionState('connected')
      }
    }, 4000)

    return () => {
      if (channelRef.current) {
        try { channelRef.current.unsubscribe?.() } catch (_) {}
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [id])

  // Realtime driver GPS location subscription for active tracking states
  useEffect(() => {
    if (!id || !booking) return

    const status = booking.status
    const isActiveTracking = ['driver_assigned', 'arriving', 'started'].includes(status)

    // Stop tracking when ride completes or cancels
    if (!isActiveTracking) {
      if (locationSubRef.current) {
        try { locationSubRef.current.unsubscribe?.() } catch (_) {}
        locationSubRef.current = null
      }
      return
    }

    // Initial fetch of driver's current position
    getDriverLocation(id).then(({ data }) => {
      if (data) setDriverLocation(data)
    })

    // Realtime subscription to ride_driver_locations
    if (!locationSubRef.current) {
      locationSubRef.current = subscribeToDriverLocation(id, (newLoc) => {
        setDriverLocation(newLoc)
      })
    }

    return () => {
      if (locationSubRef.current) {
        try { locationSubRef.current.unsubscribe?.() } catch (_) {}
        locationSubRef.current = null
      }
    }
  }, [id, booking?.status])

  const handleCancel = async () => {
    setCancelling(true)
    setCancelError(null)
    const { error: err } = await cancelRideBooking(id)
    if (err) {
      setCancelError(err.message || 'Failed to cancel. Please try again.')
      setCancelling(false)
    } else {
      setShowCancelModal(false)
      await loadBooking()
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-dvh bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-white font-bold text-lg mb-2">Ride Not Found</h2>
        <p className="text-[#A1A1AA] text-sm mb-6">{error || 'This ride booking could not be loaded.'}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm"
        >
          Back to Bookings
        </button>
      </div>
    )
  }

  const status = booking.status || 'searching'
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.searching
  const StatusIcon = statusCfg.icon
  const rideType = getRideType(booking.ride_type)

  const TIMELINE_STEPS = [
    { key: 'searching', label: 'Finding your driver' },
    { key: 'driver_assigned', label: 'Driver assigned' },
    { key: 'started', label: 'Ride started' },
    { key: 'completed', label: 'Ride completed' },
  ]

  const statusOrder = ['searching', 'driver_assigned', 'arriving', 'started', 'completed']
  const currentIdx = statusOrder.indexOf(status)

  // Dynamic Distance & ETA Calculations based on live GPS
  let dynamicDistance = null
  let dynamicEta = null

  if (driverLocation?.latitude && driverLocation?.longitude) {
    if (status === 'arriving' || status === 'driver_assigned') {
      // Driver to Pickup
      const distKm = calculateDistanceKm(
        driverLocation.latitude,
        driverLocation.longitude,
        booking.pickup_latitude,
        booking.pickup_longitude
      )
      if (distKm !== null) {
        dynamicDistance = formatDistance(distKm)
        dynamicEta = calculateEta(distKm, driverLocation.speed_mps)
      }
    } else if (status === 'started') {
      // Driver to Destination
      const distKm = calculateDistanceKm(
        driverLocation.latitude,
        driverLocation.longitude,
        booking.drop_latitude,
        booking.drop_longitude
      )
      if (distKm !== null) {
        dynamicDistance = formatDistance(distKm)
        dynamicEta = calculateEta(distKm, driverLocation.speed_mps)
      }
    }
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white flex flex-col pb-28">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-11 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold text-white leading-tight">Live Ride Tracking</h1>
            <p className="text-[10px] text-zinc-500 font-mono">{booking.booking_reference}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#242424] px-2 py-1 rounded-full">
            {connectionState === 'connected' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-500">Reconnecting</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-3 space-y-3.5">
        {/* ── Interactive Live Map with Realtime Driver Marker ── */}
        <div className="relative">
          <RideMap
            pickupLat={booking.pickup_latitude}
            pickupLng={booking.pickup_longitude}
            dropLat={booking.drop_latitude}
            dropLng={booking.drop_longitude}
            driverLat={driverLocation?.latitude || null}
            driverLng={driverLocation?.longitude || null}
            heading={driverLocation?.heading || 0}
            height="260px"
          />

          {/* Floating Live Badge / Distance Pill on Map */}
          {dynamicDistance && (
            <div className="absolute top-3 left-3 z-[1000] bg-black/80 backdrop-blur-md border border-orange-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="text-xs font-bold text-white">{dynamicDistance}</span>
              {dynamicEta && (
                <span className="text-xs text-orange-400 font-extrabold border-l border-white/20 pl-2">
                  {dynamicEta}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Status Banner Card ── */}
        <div className={cn('p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm', statusCfg.bg)}>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', statusCfg.bg)}>
            <StatusIcon
              className={cn('w-5 h-5', statusCfg.color, statusCfg.animate && 'animate-spin')}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn('font-black text-sm', statusCfg.color)}>{statusCfg.label}</p>
            <p className="text-[#A1A1AA] text-xs mt-0.5 truncate">{statusCfg.sublabel}</p>
          </div>
        </div>

        {/* ── Driver Card (when assigned) ── */}
        {booking.driver_name && (
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0 text-orange-400">
              <User className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-sm truncate">{booking.driver_name}</p>
                <div className="flex items-center gap-0.5 bg-yellow-500/10 px-1.5 py-0.2 rounded text-[10px] text-yellow-400 font-bold">
                  <Star className="w-2.5 h-2.5 fill-yellow-400" /> 4.9
                </div>
              </div>
              <p className="text-[#A1A1AA] text-xs mt-0.5 truncate">
                {booking.vehicle_name || 'Cardom Vehicle'}
                {booking.vehicle_number ? ` • ${booking.vehicle_number}` : ''}
              </p>
            </div>
            {booking.driver_phone && (
              <a
                href={`tel:${booking.driver_phone}`}
                className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 hover:bg-green-500/25 flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4 text-green-400" />
              </a>
            )}
          </div>
        )}

        {/* ── Route Addresses Card ── */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <div className="w-0.5 h-9 bg-zinc-700 my-1" />
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Pickup</p>
                <p className="text-white text-xs font-semibold mt-0.5 truncate">{booking.pickup_address}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Destination</p>
                <p className="text-white text-xs font-semibold mt-0.5 truncate">{booking.drop_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Fare & Trip Stats ── */}
        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-3.5 shadow-md">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Fare</p>
              <p className="text-orange-400 font-extrabold text-base mt-0.5">
                ₹{Number(booking.estimated_fare || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-center border-x border-[#222222]">
              <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Ride Type</p>
              <p className="text-white font-bold text-xs mt-1 capitalize">{rideType?.name || booking.ride_type}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Distance</p>
              <p className="text-white font-bold text-xs mt-1">
                {booking.estimated_distance_km ? `${booking.estimated_distance_km} km` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Lifecycle Timeline ── */}
        {status !== 'cancelled' && (
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 shadow-md">
            <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-3.5">
              Ride Progress
            </p>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, idx) => {
                const stepIdx = statusOrder.indexOf(step.key)
                const isDone = currentIdx > stepIdx || status === 'completed'
                const isActive = status === step.key || (step.key === 'driver_assigned' && status === 'arriving')
                const isLast = idx === TIMELINE_STEPS.length - 1
                return (
                  <TimelineStep
                    key={step.key}
                    label={step.label}
                    done={isDone}
                    active={isActive && !isDone}
                    last={isLast}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* ── Cancel Ride Button ── */}
        {(status === 'searching' || status === 'driver_assigned') && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3.5 rounded-2xl border border-red-500/25 bg-red-500/10 text-red-400 font-bold text-xs transition-colors active:scale-[0.98]"
          >
            Cancel Ride
          </button>
        )}

        {/* Back to Bookings Link */}
        <Link
          to="/bookings"
          className="block w-full py-3.5 rounded-2xl border border-[#242424] bg-[#121212] text-center text-[#A1A1AA] font-semibold text-xs active:scale-[0.98]"
        >
          View All Bookings
        </Link>
      </div>

      {/* ── Cancel Confirmation Modal ── */}
      <AnimatePresence>
        {showCancelModal && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#141414] border border-[#262626] rounded-t-3xl p-6 pb-10"
            >
              <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-5" />
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Cancel Ride?</h3>
                <p className="text-[#A1A1AA] text-xs mt-1">This action cannot be undone.</p>
              </div>
              {cancelError && (
                <p className="text-red-400 text-xs text-center mb-3">{cancelError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3.5 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-white font-semibold text-xs"
                >
                  Keep Ride
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

