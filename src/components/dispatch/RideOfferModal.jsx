import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Clock, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { acceptOffer, rejectOffer, expireOffer } from '@/services/partnerDispatchApi'
import { formatDistance } from '@/utils/geoUtils'

export function RideOfferModal({ offer, onOfferClosed }) {
  const navigate = useNavigate()
  const [secondsRemaining, setSecondsRemaining] = useState(20)
  const [acting, setActing] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    if (!offer?.expires_at) return

    const calculateRemaining = () => {
      const diffMs = new Date(offer.expires_at).getTime() - Date.now()
      const secs = Math.max(0, Math.ceil(diffMs / 1000))
      return secs
    }

    setSecondsRemaining(calculateRemaining())

    const interval = setInterval(() => {
      const remaining = calculateRemaining()
      setSecondsRemaining(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        // Automatically expire offer
        expireOffer(offer.id)
        onOfferClosed?.('expired')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [offer, onOfferClosed])

  if (!offer) return null

  const handleAccept = async () => {
    setActing(true)
    setErrorMsg(null)

    const res = await acceptOffer(offer.id)
    if (!res.success) {
      setErrorMsg(res.error || 'Ride is no longer available.')
      setActing(false)
      // Auto-dismiss after 2.5s if not available
      setTimeout(() => onOfferClosed?.('dismissed'), 2500)
    } else {
      onOfferClosed?.('accepted')
      if (res.rideId) {
        navigate(`/rides/${res.rideId}`)
      }
    }
  }

  const handleReject = async () => {
    setActing(true)
    await rejectOffer(offer.id)
    setActing(false)
    onOfferClosed?.('rejected')
  }

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 20) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#161616] border border-orange-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Countdown Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#252525]">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000 linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                Incoming Request
              </span>
              <h2 className="text-base font-black text-white">New Ride Offer</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202020] border border-[#333] text-xs font-mono font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
          </div>
        </div>

        {/* Fare & Distance KPI Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1F1F1F] border border-[#2D2D2D] rounded-2xl p-3 text-center">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">Estimated Fare</span>
            <span className="text-xl font-black text-white">
              ₹{Number(offer.estimated_fare || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-[#1F1F1F] border border-[#2D2D2D] rounded-2xl p-3 text-center">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">Pickup Distance</span>
            <span className="text-xl font-black text-orange-400">
              {offer.distance_to_pickup_km != null ? formatDistance(offer.distance_to_pickup_km) : 'Nearby'}
            </span>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-[#1F1F1F] border border-[#2D2D2D] rounded-2xl p-3.5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[#777] uppercase tracking-wider block">Pickup</span>
              <p className="text-xs font-bold text-white truncate">{offer.pickup_address || 'Current Location'}</p>
            </div>
          </div>

          <div className="border-t border-[#2A2A2A]" />

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[#777] uppercase tracking-wider block">Destination</span>
              <p className="text-xs font-bold text-white truncate">{offer.drop_address || 'Destination'}</p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleReject}
            disabled={acting}
            className="flex-1 py-3.5 rounded-2xl bg-[#222] hover:bg-[#282828] active:scale-[0.99] border border-[#333] text-[#AAA] hover:text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            Reject
          </button>

          <button
            onClick={handleAccept}
            disabled={acting}
            className="flex-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {acting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Accept Ride
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

