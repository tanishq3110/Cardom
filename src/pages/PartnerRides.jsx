import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PartnerLayout } from '@/components/PartnerLayout'
import {
  Navigation, Car, Clock, ChevronRight,
  AlertCircle, RefreshCw, Loader2, CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  getAvailableRides,
  getPartnerRides,
  requestRide,
  acceptRide,
  rejectRide,
  subscribeToPartnerAssignments,
} from '@/services/partnerRideApi'
import { getActiveOffer, subscribeToPartnerOffers } from '@/services/partnerDispatchApi'
import { RideOfferModal } from '@/components/dispatch/RideOfferModal'

const RIDE_TYPE_LABELS = {
  economy: 'Cardom Go',
  comfort: 'Cardom Comfort',
  xl: 'Cardom Executive XL',
}

const PARTNER_STATUS_LABELS = {
  new:       'Requested',
  accepted:  'Driver Assigned',
  started:   'Ride In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected:  'Rejected',
}

function RideStatusBadge({ status }) {
  const map = {
    new:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    accepted:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
    started:   'bg-orange-500/15 text-orange-400 border-orange-500/30',
    completed: 'bg-green-500/15 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
    rejected:  'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  }
  const label = PARTNER_STATUS_LABELS[status] || status || '—'
  const style = map[status] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${style}`}>
      {label}
    </span>
  )
}

function AvailableRideCard({ ride, onAccepted, onRejected }) {
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [cardError, setCardError] = useState(null)

  const formattedTime = ride.created_at
    ? new Date(ride.created_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : '—'

  const handleAccept = async () => {
    setCardError(null)
    setAccepting(true)
    const reqResult = await requestRide(ride.id)
    if (reqResult.error && reqResult.error !== 'Already accepted') {
      setCardError(reqResult.error)
      setAccepting(false)
      return
    }
    const accResult = await acceptRide(ride.id)
    if (accResult.error) {
      setCardError(accResult.error)
    } else {
      onAccepted(ride.id)
    }
    setAccepting(false)
  }

  const handleReject = async () => {
    setCardError(null)
    setRejecting(true)
    await requestRide(ride.id)
    const result = await rejectRide(ride.id)
    if (result.error) {
      setCardError(result.error)
    } else {
      onRejected(ride.id)
    }
    setRejecting(false)
  }

  return (
    <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-4 space-y-3 hover:border-[#333] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{RIDE_TYPE_LABELS[ride.ride_type] || ride.ride_type}</p>
            <p className="text-[10px] text-[#A1A1AA] font-mono">{ride.booking_reference}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-black text-orange-400">
            ₹{Number(ride.estimated_fare || 0).toLocaleString('en-IN')}
          </p>
          {ride.estimated_distance_km && (
            <p className="text-[10px] text-[#A1A1AA]">{ride.estimated_distance_km} km</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[#A1A1AA] flex-shrink-0">Pickup:</span>
          <span className="text-white truncate">{ride.pickup_address}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <span className="text-[#A1A1AA] flex-shrink-0">Drop:</span>
          <span className="text-white truncate">{ride.drop_address}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-[#555]">
        <Clock className="w-3 h-3" />
        <span>Requested {formattedTime}</span>
      </div>

      {cardError && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{cardError}</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleReject}
          disabled={accepting || rejecting}
          className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#333] text-xs font-semibold text-[#A1A1AA] hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
        >
          {rejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Reject'}
        </button>
        <button
          onClick={handleAccept}
          disabled={accepting || rejecting}
          className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70"
        >
          {accepting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <><CheckCircle className="w-3.5 h-3.5" />Accept</>}
        </button>
      </div>
    </div>
  )
}

function AssignedRideCard({ assignment, onClick }) {
  const ride = assignment.ride_bookings
  if (!ride) return null

  const formattedDate = ride.created_at
    ? new Date(ride.created_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : '—'

  return (
    <div
      onClick={onClick}
      className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-4 space-y-3 hover:border-orange-500/30 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{RIDE_TYPE_LABELS[ride.ride_type] || ride.ride_type}</p>
            <p className="text-[10px] text-[#A1A1AA] font-mono">{ride.booking_reference}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <RideStatusBadge status={assignment.partner_status} />
          <p className="text-xs font-bold text-orange-400">
            ₹{Number(ride.final_fare || ride.estimated_fare || 0).toLocaleString('en-IN')}
          </p>
          {assignment.partner_status === 'completed' && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              ride.payment_status === 'confirmed' || ride.payment_status === 'paid'
                ? 'bg-green-500/15 text-green-400'
                : ride.payment_status === 'customer_marked_paid'
                ? 'bg-cyan-500/15 text-cyan-400'
                : 'bg-yellow-500/15 text-yellow-400'
            }`}>
              {ride.payment_status === 'confirmed' || ride.payment_status === 'paid'
                ? `${(ride.payment_method || 'CASH').toUpperCase()} • Paid`
                : ride.payment_status === 'customer_marked_paid'
                ? `${(ride.payment_method || 'CASH').toUpperCase()} • Marked Paid`
                : `${(ride.payment_method || 'CASH').toUpperCase()} • Pending`}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-white truncate">{ride.pickup_address}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <span className="text-white truncate">{ride.drop_address}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#2A2A2A]">
        <span className="text-[10px] text-[#555]">{formattedDate}</span>
        <ChevronRight className="w-4 h-4 text-[#555]" />
      </div>
    </div>
  )
}

export function PartnerRides() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('available')
  const [available, setAvailable] = useState([])
  const [assigned, setAssigned] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [currentOffer, setCurrentOffer] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setPageError(null)
    const [availRes, assignedRes, offerRes] = await Promise.all([
      getAvailableRides(),
      getPartnerRides(),
      getActiveOffer(),
    ])
    if (availRes.error) {
      setPageError('Unable to load ride requests. Please try again.')
    } else {
      setAvailable(availRes.data || [])
    }
    if (!assignedRes.error) {
      setAssigned(assignedRes.data || [])
    }
    setCurrentOffer(offerRes.offer || null)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()

    // Realtime subscription for partner assignments
    let unsubscribe = null
    let unsubOffers = null
    if (user?.id) {
      unsubscribe = subscribeToPartnerAssignments(user.id, () => {
        loadData()
      })
      unsubOffers = subscribeToPartnerOffers(user.id, (payload) => {
        if (payload.eventType === 'INSERT' || payload.new?.status === 'offered') {
          getActiveOffer().then(res => setCurrentOffer(res.offer || null))
        } else if (payload.new?.status && payload.new.status !== 'offered') {
          setCurrentOffer(null)
        }
      })
    }

    return () => {
      if (unsubscribe) unsubscribe()
      if (unsubOffers) unsubOffers()
    }
  }, [loadData, user?.id])

  const activeRides = assigned.filter(a => ['accepted', 'started'].includes(a.partner_status))
  const completedRides = assigned.filter(a => ['completed', 'cancelled'].includes(a.partner_status))

  const handleAccepted = (rideId) => {
    setAvailable(prev => prev.filter(r => r.id !== rideId))
    loadData()
  }
  const handleRejected = (rideId) => {
    setAvailable(prev => prev.filter(r => r.id !== rideId))
  }

  const TABS = [
    { id: 'available', label: 'Available', count: available.length },
    { id: 'active',    label: 'Active',    count: activeRides.length },
    { id: 'completed', label: 'History',   count: completedRides.length },
  ]

  return (
    <PartnerLayout title="Ride Requests" subtitle="Accept and manage customer rides">
      <div className="px-4 sm:px-6 py-6 space-y-4 max-w-3xl">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Ride Requests</p>
              <p className="text-[10px] text-[#A1A1AA]">Accept & manage rides</p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-[#202020] border border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:border-[#333] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-[#202020] border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:border-[#333]'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeTab === tab.id ? 'bg-black/25' : 'bg-white/10'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {pageError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{pageError}</span>
            <button onClick={loadData} className="ml-auto text-red-300 hover:text-white cursor-pointer underline">Retry</button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-36 rounded-xl bg-[#202020] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && activeTab === 'available' && (
          available.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#2A2A2A] bg-[#181818] text-center space-y-2">
              <Navigation className="w-8 h-8 text-[#555] mx-auto" />
              <p className="text-sm font-semibold text-[#A1A1AA]">No new ride requests</p>
              <p className="text-xs text-[#555]">New requests will appear here. Tap refresh to check.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {available.map(ride => (
                <AvailableRideCard
                  key={ride.id}
                  ride={ride}
                  onAccepted={handleAccepted}
                  onRejected={handleRejected}
                />
              ))}
            </div>
          )
        )}

        {!loading && activeTab === 'active' && (
          activeRides.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#2A2A2A] bg-[#181818] text-center space-y-2">
              <Car className="w-8 h-8 text-[#555] mx-auto" />
              <p className="text-sm font-semibold text-[#A1A1AA]">No active rides</p>
              <p className="text-xs text-[#555]">Accept a ride from the Available tab to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRides.map(a => (
                <AssignedRideCard
                  key={a.id}
                  assignment={a}
                  onClick={() => navigate(`/rides/${a.ride_id}`)}
                />
              ))}
            </div>
          )
        )}

        {!loading && activeTab === 'completed' && (
          completedRides.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#2A2A2A] bg-[#181818] text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-[#555] mx-auto" />
              <p className="text-sm font-semibold text-[#A1A1AA]">No completed rides yet</p>
              <p className="text-xs text-[#555]">Completed ride history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedRides.map(a => (
                <AssignedRideCard
                  key={a.id}
                  assignment={a}
                  onClick={() => navigate(`/rides/${a.ride_id}`)}
                />
              ))}
            </div>
          )
        )}
      </div>

      <RideOfferModal
        offer={currentOffer}
        onOfferClosed={() => {
          setCurrentOffer(null)
          loadData()
        }}
      />
    </PartnerLayout>
  )
}

