import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Navigation,
  Car,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  Wifi,
  WifiOff,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { useAuth } from '@/context/AuthContext'
import { getRideBookingById, cancelRideBooking, subscribeToRideBooking } from '@/services/rideBookingApi'
import { getRideType } from '@/config/rideTypes'
import { cn } from '@/lib/utils'

// Timeline stage definitions
const TIMELINE_STAGES = [
  { key: 'searching', label: 'Searching Driver', description: 'Matching with nearby partners' },
  { key: 'driver_assigned', label: 'Driver Assigned', description: 'Partner confirmed and on the way' },
  { key: 'started', label: 'Ride Started', description: 'En route to destination' },
  { key: 'completed', label: 'Ride Completed', description: 'Arrived safely at destination' },
]

function getStageIndex(status) {
  switch (status) {
    case 'searching':
      return 0
    case 'driver_assigned':
    case 'arriving':
      return 1
    case 'started':
      return 2
    case 'completed':
      return 3
    default:
      return 0
  }
}

function RideTimeline({ currentStatus }) {
  const isCancelled = currentStatus === 'cancelled'
  const currentIndex = getStageIndex(currentStatus)

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Ride Cancelled</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">This ride booking has been cancelled.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-[#141414] border border-[#222] space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Trip Progress</p>
        {currentStatus === 'searching' && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            Finding Driver
          </span>
        )}
        {currentStatus === 'arriving' && (
          <span className="text-[10px] font-bold uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            Driver Arriving
          </span>
        )}
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2A2A2A]">
        {TIMELINE_STAGES.map((stage, idx) => {
          const isDone = currentIndex > idx || currentStatus === 'completed'
          const isCurrent = currentIndex === idx && currentStatus !== 'completed'

          return (
            <div key={stage.key} className="relative flex items-start gap-3">
              <span
                className={cn(
                  'absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                  isDone && 'bg-emerald-500 text-black border-emerald-500',
                  isCurrent && 'bg-orange-500 text-black border-orange-500 animate-pulse',
                  !isDone && !isCurrent && 'bg-[#1A1A1A] text-zinc-600 border-[#333]'
                )}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </span>
              <div>
                <p
                  className={cn(
                    'text-xs font-bold leading-none',
                    isCurrent && 'text-orange-400',
                    isDone && 'text-white',
                    !isDone && !isCurrent && 'text-zinc-500'
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">{stage.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DriverCard({ ride }) {
  const driverName = ride.driver_name || 'Cardom Partner'
  const vehicleName = ride.vehicle_name || 'Registered Fleet Vehicle'
  const phone = ride.driver_phone

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1C1C1C] to-[#141414] border border-[#2A2A2A] space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg flex-shrink-0">
            {driverName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">{driverName}</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{vehicleName}</p>
            {ride.vehicle_number && (
              <p className="text-[11px] font-mono font-bold text-zinc-300 mt-0.5 tracking-wide">
                {ride.vehicle_number}
              </p>
            )}
          </div>
        </div>

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
        )}
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
        <span>Payment Method</span>
        <span className="font-mono font-bold text-white uppercase">{ride.payment_method || 'UPI'}</span>
      </div>
    </div>
  )
}

export function RideDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [connectionState, setConnectionState] = useState('connecting') // 'live' | 'reconnecting' | 'offline'

  const unsubscribeRef = useRef(null)

  const loadRide = useCallback(async () => {
    if (!id) return
    setError(null)
    const { data, error: err } = await getRideBookingById(id)
    if (err) {
      setError(err.message || 'Failed to load ride details.')
    } else if (!data) {
      setError('Ride booking not found.')
    } else {
      setRide(data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadRide()

    // 1. Setup Supabase Realtime subscription
    unsubscribeRef.current = subscribeToRideBooking(
      id,
      (updatedRide) => {
        // Immediate local state update upon realtime UPDATE event
        setRide((prev) => ({ ...prev, ...updatedRide }))
      },
      (status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('live')
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setConnectionState('reconnecting')
        } else if (status === 'CLOSED') {
          setConnectionState('offline')
        }
      }
    )

    // 2. Resilient fallback background sync (every 4s while ride is searching/active)
    const interval = setInterval(async () => {
      const { data } = await getRideBookingById(id)
      if (data) {
        setRide((prev) => {
          if (!prev) return data
          // Only update if status or driver info changed to prevent unnecessary re-renders
          if (
            prev.status !== data.status ||
            prev.driver_name !== data.driver_name ||
            prev.driver_phone !== data.driver_phone ||
            prev.vehicle_name !== data.vehicle_name
          ) {
            return { ...prev, ...data }
          }
          return prev
        })
      }
    }, 4000)

    return () => {
      clearInterval(interval)
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [id, loadRide])

  const handleCancelConfirm = async () => {
    setIsCancelling(true)
    const { data, error: cancelErr } = await cancelRideBooking(id)
    if (cancelErr) {
      setError(cancelErr.message || 'Unable to cancel ride.')
    } else if (data) {
      setRide(data)
      setConfirmCancelOpen(false)
    }
    setIsCancelling(false)
  }

  const rideType = ride ? getRideType(ride.ride_type) : null

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 md:pb-20 max-w-xl mx-auto w-full">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/bookings"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Bookings</span>
          </Link>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#181818] border border-[#2A2A2A]">
            {connectionState === 'live' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold">Live</span>
              </>
            ) : connectionState === 'reconnecting' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                <span className="text-yellow-400">Reconnecting</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-zinc-500" />
                <span className="text-zinc-500">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <p className="text-xs text-zinc-400">Fetching live ride status...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <button
              onClick={loadRide}
              className="px-4 py-2 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Main Ride Content ── */}
        {!loading && ride && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Ride Reference</p>
                <h1 className="text-lg font-black text-white tracking-tight">{ride.booking_reference}</h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Fare</p>
                <p className="text-lg font-black text-orange-400">
                  ₹{Number(ride.estimated_fare).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Timeline component */}
            <RideTimeline currentStatus={ride.status} />

            {/* Driver Card (if assigned or beyond) */}
            {['driver_assigned', 'arriving', 'started', 'completed'].includes(ride.status) && (
              <DriverCard ride={ride} />
            )}

            {/* Route & Details Card */}
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#222] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{rideType?.name || ride.ride_type}</h3>
                    <p className="text-[10px] text-zinc-400">{ride.estimated_distance_km || 10} km estimated</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {new Date(ride.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-500">Pickup</span>
                    <p className="text-zinc-200">{ride.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-500">Destination</span>
                    <p className="text-zinc-200">{ride.drop_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions based on state */}
            {ride.status === 'searching' && (
              <div className="pt-2">
                <button
                  onClick={() => setConfirmCancelOpen(true)}
                  disabled={isCancelling}
                  className="w-full py-3.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling Ride...' : 'Cancel Ride'}
                </button>
              </div>
            )}

            {ride.status === 'completed' && (
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  View Ride History
                </button>
              </div>
            )}

            {ride.status === 'cancelled' && (
              <div className="pt-2">
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full py-3.5 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#333] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Back to Bookings
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Cancel Confirmation Modal ── */}
        <AnimatePresence>
          {confirmCancelOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm p-6 rounded-2xl bg-[#181818] border border-[#2A2A2A] space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Cancel this ride?</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Are you sure you want to cancel your search?</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setConfirmCancelOpen(false)}
                    disabled={isCancelling}
                    className="flex-1 py-2.5 rounded-xl border border-[#333] bg-[#202020] text-xs font-semibold text-zinc-300 hover:text-white"
                  >
                    Keep Searching
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    disabled={isCancelling}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
