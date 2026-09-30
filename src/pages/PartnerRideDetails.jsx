import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PartnerLayout } from '@/components/PartnerLayout'
import {
  Navigation, Car, MapPin, ArrowLeft, Loader2,
  AlertCircle, CheckCircle, Phone, User,
  Hash, CreditCard, Clock,
} from 'lucide-react'
import {
  getRideById,
  startRide,
  completeRide,
  subscribeToRideDetails,
} from '@/services/partnerRideApi'

const RIDE_TYPE_LABELS = {
  economy: 'Cardom Go',
  comfort: 'Cardom Comfort',
  xl: 'Cardom Executive XL',
}

function StatusBadge({ status }) {
  const map = {
    new:       { label: 'Requested',         style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    accepted:  { label: 'Driver Assigned',    style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    started:   { label: 'Ride In Progress',   style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    completed: { label: 'Completed',          style: 'bg-green-500/15 text-green-400 border-green-500/30' },
    cancelled: { label: 'Cancelled',          style: 'bg-red-500/15 text-red-400 border-red-500/30' },
    rejected:  { label: 'Rejected',           style: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
  }
  const config = map[status] || { label: status || '—', style: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.style}`}>
      {config.label}
    </span>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#2A2A2A] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-white break-words font-medium">{value}</p>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function PartnerRideDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const unsubscribeRef = useRef(null)

  const loadRide = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await getRideById(id)
    if (error) {
      setFetchError('Unable to load ride details.')
    } else if (!data) {
      setFetchError('Ride not found or not authorized.')
    } else {
      setAssignment(data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadRide()

    // Realtime subscription for the active ride
    unsubscribeRef.current = subscribeToRideDetails(id, (updatedBooking) => {
      setAssignment((prev) => {
        if (!prev) return prev
        const newPartnerStatus =
          updatedBooking.status === 'started'
            ? 'started'
            : updatedBooking.status === 'completed'
            ? 'completed'
            : updatedBooking.status === 'cancelled'
            ? 'cancelled'
            : prev.partner_status

        return {
          ...prev,
          partner_status: newPartnerStatus,
          ride_bookings: {
            ...prev.ride_bookings,
            ...updatedBooking,
          },
        }
      })
    })

    // Resilient fallback background sync (every 4s while ride is active)
    const interval = setInterval(async () => {
      const { data } = await getRideById(id)
      if (data) {
        setAssignment((prev) => {
          if (!prev) return data
          if (
            prev.partner_status !== data.partner_status ||
            prev.ride_bookings?.status !== data.ride_bookings?.status
          ) {
            return data
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

  const handleStartRide = async () => {
    setActionLoading(true)
    setActionError(null)
    const result = await startRide(id)
    if (result.error) {
      setActionError(result.error)
    } else {
      await loadRide()
    }
    setActionLoading(false)
  }

  const handleCompleteRide = async () => {
    setActionLoading(true)
    setActionError(null)
    const result = await completeRide(id)
    if (result.error) {
      setActionError(result.error)
    } else {
      await loadRide()
    }
    setActionLoading(false)
  }

  const ride = assignment?.ride_bookings
  const partnerStatus = assignment?.partner_status

  return (
    <PartnerLayout title="Ride Details" subtitle="Manage ride status">
      <div className="px-4 sm:px-6 py-6 space-y-4 max-w-2xl">

        <button
          onClick={() => navigate('/rides')}
          className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ride Requests
        </button>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <p className="text-sm text-[#A1A1AA]">Loading ride details…</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="p-8 rounded-2xl border border-red-500/20 bg-[#181818] text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-[#A1A1AA]">{fetchError}</p>
            <button
              onClick={loadRide}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !fetchError && ride && (
          <>
            <div className="bg-[#202020] border border-[#2A2A2A] rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">
                      {RIDE_TYPE_LABELS[ride.ride_type] || ride.ride_type}
                    </h2>
                    <p className="text-[11px] text-[#A1A1AA] font-mono">{ride.booking_reference}</p>
                  </div>
                </div>
                <StatusBadge status={partnerStatus} />
              </div>

              <div className="space-y-2 pt-3 border-t border-[#2A2A2A]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[#A1A1AA] w-14 flex-shrink-0">Pickup</span>
                  <span className="text-white font-medium">{ride.pickup_address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span className="text-[#A1A1AA] w-14 flex-shrink-0">Drop</span>
                  <span className="text-white font-medium">{ride.drop_address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                <span className="text-xs text-[#A1A1AA]">Estimated Fare</span>
                <span className="text-xl font-black text-orange-400">
                  ₹{Number(ride.estimated_fare || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-[#202020] border border-[#2A2A2A] rounded-2xl px-4 py-2">
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider py-3 border-b border-[#2A2A2A]">
                Ride Information
              </p>
              <InfoRow icon={Hash}      label="Booking Reference"    value={ride.booking_reference} />
              <InfoRow icon={Car}       label="Ride Type"            value={RIDE_TYPE_LABELS[ride.ride_type]} />
              <InfoRow icon={MapPin}    label="Distance (Estimate)"  value={ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : null} />
              <InfoRow icon={CreditCard} label="Payment Method"      value={ride.payment_method?.toUpperCase()} />
              <InfoRow icon={Clock}     label="Requested At"         value={formatDate(ride.created_at)} />
              {assignment.accepted_at && (
                <InfoRow icon={Clock}   label="Accepted At"          value={formatDate(assignment.accepted_at)} />
              )}
              {assignment.started_at && (
                <InfoRow icon={Clock}   label="Started At"           value={formatDate(assignment.started_at)} />
              )}
              {assignment.completed_at && (
                <InfoRow icon={Clock}   label="Completed At"         value={formatDate(assignment.completed_at)} />
              )}
            </div>

            {['accepted', 'started', 'completed'].includes(partnerStatus) && (
              <div className="bg-[#202020] border border-[#2A2A2A] rounded-2xl px-4 py-2">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider py-3 border-b border-[#2A2A2A]">
                  Your Driver Information
                </p>
                <InfoRow icon={User}  label="Driver Name"   value={ride.driver_name || '—'} />
                <InfoRow icon={Phone} label="Driver Phone"  value={ride.driver_phone} />
                <InfoRow icon={Car}   label="Vehicle"       value={ride.vehicle_name} />
              </div>
            )}

            {actionError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {partnerStatus === 'accepted' && (
              <button
                onClick={handleStartRide}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-colors shadow-lg shadow-orange-500/20"
              >
                {actionLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><Car className="w-5 h-5" />Start Ride</>}
              </button>
            )}

            {partnerStatus === 'started' && (
              <button
                onClick={handleCompleteRide}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-colors shadow-lg shadow-green-500/20"
              >
                {actionLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><CheckCircle className="w-5 h-5" />Complete Ride</>}
              </button>
            )}

            {partnerStatus === 'completed' && (
              <div className="p-5 rounded-2xl border border-green-500/25 bg-green-500/10 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-400">Ride Completed</p>
                  <p className="text-xs text-green-300/70 mt-0.5">This ride has been successfully completed.</p>
                </div>
              </div>
            )}

            {partnerStatus === 'cancelled' && (
              <div className="p-5 rounded-2xl border border-red-500/25 bg-red-500/10 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-400">Ride Cancelled</p>
                  <p className="text-xs text-red-300/70 mt-0.5">This ride assignment was cancelled.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PartnerLayout>
  )
}
