import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PartnerLayout } from '@/components/PartnerLayout'
import {
  Navigation, Car, MapPin, ArrowLeft, Loader2,
  AlertCircle, CheckCircle, Phone, User,
  Hash, CreditCard, Clock, ShieldAlert,
  QrCode, Banknote, ShieldCheck, X, Eye,
} from 'lucide-react'
import {
  getRideById,
  startRide,
  completeRide,
  subscribeToRideDetails,
} from '@/services/partnerRideApi'
import {
  startDriverLocationTracking,
  stopDriverLocationTracking,
  checkAndRequestLocationPermission,
} from '@/services/partnerLocationApi'
import { confirmPartnerPayment } from '@/services/partnerPaymentApi'
import { getPartnerProfile } from '@/services/partnerProfileApi'
import { buildUpiUri, generateQrDataUrl } from '@/utils/upiQr'
import { RideMap } from '@/components/map/RideMap'
import { calculateDistanceKm, formatDistance, calculateEta } from '@/utils/geoUtils'

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
  const [driverCoords, setDriverCoords] = useState(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)

  // Payment states
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [paymentActionError, setPaymentActionError] = useState(null)
  const [partnerUpi, setPartnerUpi] = useState({ upi_id: null, upi_qr_url: null })
  const [qrModal, setQrModal] = useState(null) // { src: string, title: string, subtitle: string }

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

    // Fetch partner UPI details
    getPartnerProfile().then(({ data }) => {
      if (data) {
        setPartnerUpi({
          upi_id: data.upi_id,
          upi_qr_url: data.upi_qr_url,
        })
      }
    })

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

    // Fallback polling every 4s
    const interval = setInterval(async () => {
      const { data } = await getRideById(id)
      if (data) {
        setAssignment((prev) => {
          if (!prev) return data
          if (
            prev.partner_status !== data.partner_status ||
            prev.ride_bookings?.status !== data.ride_bookings?.status ||
            prev.ride_bookings?.payment_status !== data.ride_bookings?.payment_status
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
      stopDriverLocationTracking()
    }
  }, [id, loadRide])

  // GPS Tracking lifecycle based on partnerStatus
  useEffect(() => {
    const partnerStatus = assignment?.partner_status
    const isLive = ['accepted', 'started'].includes(partnerStatus)

    if (isLive && id) {
      startDriverLocationTracking(
        id,
        (coords) => {
          setDriverCoords(coords)
          setLocationPermissionDenied(false)
        },
        (err) => {
          console.warn('[Partner GPS] Tracking warning/error:', err)
          if (err.message && (err.message.includes('permission') || err.message.includes('denied'))) {
            setLocationPermissionDenied(true)
          }
        }
      )
    } else {
      stopDriverLocationTracking()
    }

    return () => {
      stopDriverLocationTracking()
    }
  }, [id, assignment?.partner_status])

  const handleRequestPermission = async () => {
    const perm = await checkAndRequestLocationPermission()
    if (perm.granted) {
      setLocationPermissionDenied(false)
      if (id) {
        startDriverLocationTracking(
          id,
          (coords) => setDriverCoords(coords),
          () => setLocationPermissionDenied(true)
        )
      }
    }
  }

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
      stopDriverLocationTracking()
      await loadRide()
    }
    setActionLoading(false)
  }

  const handleConfirmPayment = async () => {
    setConfirmingPayment(true)
    setPaymentActionError(null)
    const result = await confirmPartnerPayment(id)
    if (result.error) {
      setPaymentActionError(result.error)
    } else {
      await loadRide()
    }
    setConfirmingPayment(false)
  }

  const handleViewQr = async () => {
    const ride = assignment?.ride_bookings
    const finalFare = ride?.final_fare || ride?.estimated_fare || 0

    if (partnerUpi.upi_qr_url) {
      setQrModal({
        src: partnerUpi.upi_qr_url,
        title: 'Driver Custom QR',
        subtitle: `UPI ID: ${partnerUpi.upi_id || 'Apex Motor Works'} • Amount: ₹${finalFare}`,
      })
      return
    }

    if (partnerUpi.upi_id) {
      const uri = buildUpiUri({
        upiId: partnerUpi.upi_id,
        payeeName: ride?.driver_name || 'Cardom Driver',
        amount: finalFare,
        note: `Cardom Ride ${ride?.booking_reference || ''}`,
      })
      const qrData = await generateQrDataUrl(uri)
      if (qrData) {
        setQrModal({
          src: qrData,
          title: 'Direct UPI Payment QR',
          subtitle: `Scan to pay ₹${finalFare} to ${partnerUpi.upi_id}`,
        })
      }
    } else {
      setPaymentActionError('Please configure your UPI ID in Profile to view QR code.')
    }
  }

  const ride = assignment?.ride_bookings
  const partnerStatus = assignment?.partner_status

  // Dynamic distance calculation
  let dynamicDistance = null
  let dynamicEta = null

  if (driverCoords?.latitude && driverCoords?.longitude && ride) {
    if (partnerStatus === 'accepted') {
      const dist = calculateDistanceKm(
        driverCoords.latitude,
        driverCoords.longitude,
        ride.pickup_latitude,
        ride.pickup_longitude
      )
      if (dist !== null) {
        dynamicDistance = formatDistance(dist)
        dynamicEta = calculateEta(dist, driverCoords.speed)
      }
    } else if (partnerStatus === 'started') {
      const dist = calculateDistanceKm(
        driverCoords.latitude,
        driverCoords.longitude,
        ride.drop_latitude,
        ride.drop_longitude
      )
      if (dist !== null) {
        dynamicDistance = formatDistance(dist)
        dynamicEta = calculateEta(dist, driverCoords.speed)
      }
    }
  }

  const finalFare = Number(ride?.final_fare || ride?.estimated_fare || 0)
  const isPaid = ride?.payment_status === 'confirmed' || ride?.payment_status === 'paid'
  const isCustomerMarked = ride?.payment_status === 'customer_marked_paid'
  const paymentMethod = ride?.payment_method?.toLowerCase() === 'cash' ? 'cash' : 'upi'

  return (
    <PartnerLayout title="Ride Details" subtitle="Live tracking and operations">
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
            {/* ── Location Permission Warning Banner (if denied) ── */}
            {locationPermissionDenied && ['accepted', 'started'].includes(partnerStatus) && (
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-300">Location Permission Required</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Enable GPS permission so the customer can track your arrival in real time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex-shrink-0 cursor-pointer"
                >
                  Enable Location
                </button>
              </div>
            )}

            {/* ── Prominent Interactive Map ── */}
            <div className="relative">
              <RideMap
                pickupLat={ride.pickup_latitude}
                pickupLng={ride.pickup_longitude}
                dropLat={ride.drop_latitude}
                dropLng={ride.drop_longitude}
                driverLat={driverCoords?.latitude || null}
                driverLng={driverCoords?.longitude || null}
                heading={driverCoords?.heading || 0}
                height="260px"
              />

              {/* Live Distance / Target Indicator */}
              {dynamicDistance && (
                <div className="absolute top-3 left-3 z-[1000] bg-black/85 backdrop-blur-md border border-orange-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-xs font-bold text-white">
                    {partnerStatus === 'accepted' ? `To Pickup: ${dynamicDistance}` : `To Drop: ${dynamicDistance}`}
                  </span>
                  {dynamicEta && (
                    <span className="text-xs text-orange-400 font-extrabold border-l border-white/20 pl-2">
                      {dynamicEta}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Main Status & Route Card ── */}
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
                  <span className="text-white font-medium truncate">{ride.pickup_address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span className="text-[#A1A1AA] w-14 flex-shrink-0">Drop</span>
                  <span className="text-white font-medium truncate">{ride.drop_address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                <span className="text-xs text-[#A1A1AA]">
                  {partnerStatus === 'completed' ? 'Final Fare' : 'Estimated Fare'}
                </span>
                <span className="text-xl font-black text-orange-400">
                  ₹{finalFare.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* ── Operational Action Buttons ── */}
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
                className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-colors shadow-lg shadow-orange-500/20 active:scale-[0.98]"
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
                className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-colors shadow-lg shadow-green-500/20 active:scale-[0.98]"
              >
                {actionLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><CheckCircle className="w-5 h-5" />Complete Ride</>}
              </button>
            )}

            {/* ── Phase 5: Payment Settlement Card (When Ride is Completed) ── */}
            {partnerStatus === 'completed' && (
              <div className="bg-[#181818] border border-orange-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">Payment Settlement</p>
                      {isPaid ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                          Confirmed
                        </span>
                      ) : isCustomerMarked ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse">
                          Customer Marked Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-black text-white mt-1">₹{finalFare.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222] border border-[#333] text-xs font-semibold text-white">
                    {paymentMethod === 'cash' ? (
                      <><Banknote className="w-4 h-4 text-emerald-400" />Cash</>
                    ) : (
                      <><QrCode className="w-4 h-4 text-orange-400" />UPI</>
                    )}
                  </div>
                </div>

                {/* Status Notice */}
                {isPaid ? (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-green-400">Payment Confirmed</p>
                      <p className="text-[11px] text-green-300/80 mt-0.5">
                        ₹{finalFare} collected via {paymentMethod.toUpperCase()}. Transaction recorded.
                      </p>
                    </div>
                  </div>
                ) : isCustomerMarked ? (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-cyan-300">Customer marked payment as PAID</p>
                      <p className="text-[11px] text-zinc-300 mt-0.5">
                        {paymentMethod === 'upi'
                          ? 'Please verify the ₹' + finalFare + ' credit in your UPI/Bank app (GPay/PhonePe/Paytm) before confirming.'
                          : 'Please confirm that you have collected ₹' + finalFare + ' in cash from the passenger.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-yellow-300">Awaiting Customer Payment</p>
                      <p className="text-[11px] text-zinc-300 mt-0.5">
                        Customer will pay ₹{finalFare} via {paymentMethod.toUpperCase()}.
                      </p>
                    </div>
                  </div>
                )}

                {paymentActionError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{paymentActionError}</span>
                  </div>
                )}

                {/* Operational Buttons */}
                {!isPaid && (
                  <div className="space-y-2 pt-1">
                    {paymentMethod === 'upi' && (
                      <button
                        type="button"
                        onClick={handleViewQr}
                        className="w-full py-3 rounded-xl bg-[#242424] hover:bg-[#2C2C2C] border border-[#3A3A3A] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Eye className="w-4 h-4 text-orange-400" />
                        View Driver QR Code
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={confirmingPayment}
                      className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-colors shadow-lg shadow-green-600/20 active:scale-[0.98]"
                    >
                      {confirmingPayment ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {paymentMethod === 'cash' ? 'Confirm Cash Received' : 'Confirm Payment Received'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {partnerStatus === 'cancelled' && (
              <div className="p-5 rounded-2xl border border-red-500/25 bg-red-500/10 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-400">Ride Cancelled</p>
                  <p className="text-xs text-red-300/70 mt-0.5">This ride assignment was cancelled. No payment required.</p>
                </div>
              </div>
            )}

            {/* ── Ride Info Details ── */}
            <div className="bg-[#202020] border border-[#2A2A2A] rounded-2xl px-4 py-2">
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider py-3 border-b border-[#2A2A2A]">
                Ride Information
              </p>
              <InfoRow icon={Hash}       label="Booking Reference"    value={ride.booking_reference} />
              <InfoRow icon={Car}        label="Ride Type"            value={RIDE_TYPE_LABELS[ride.ride_type]} />
              <InfoRow icon={MapPin}     label="Distance (Estimate)"  value={ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : null} />
              <InfoRow icon={CreditCard} label="Payment Method"       value={ride.payment_method?.toUpperCase()} />
              <InfoRow icon={Clock}      label="Requested At"         value={formatDate(ride.created_at)} />
              {assignment.accepted_at && (
                <InfoRow icon={Clock}    label="Accepted At"          value={formatDate(assignment.accepted_at)} />
              )}
              {assignment.started_at && (
                <InfoRow icon={Clock}    label="Started At"           value={formatDate(assignment.started_at)} />
              )}
              {assignment.completed_at && (
                <InfoRow icon={Clock}    label="Completed At"         value={formatDate(assignment.completed_at)} />
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
          </>
        )}
      </div>

      {/* QR Code Modal for Partner */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
              <h3 className="text-sm font-bold text-white">{qrModal.title}</h3>
              <button
                onClick={() => setQrModal(null)}
                className="w-7 h-7 rounded-full bg-[#242424] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <img
                src={qrModal.src}
                alt="UPI QR Code"
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <p className="text-xs text-[#A1A1AA] font-mono break-all">{qrModal.subtitle}</p>

            <button
              onClick={() => setQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </PartnerLayout>
  )
}
