import { useState } from 'react'
import {
  AlertOctagon,
  ShieldAlert,
  Phone,
  CheckCircle2,
  Loader2,
  X,
  Share2,
} from 'lucide-react'
import { triggerRideSos, resolveRideSos } from '@/services/rideSafetyApi'

export function RideSafetyCard({
  ride,
  driverCoords,
  activeSos,
  onSosChange,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleTriggerSos = async () => {
    setLoading(true)
    setError(null)

    let lat = null
    let lng = null
    let acc = null

    // Attempt geolocation
    try {
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          })
        })
        lat = pos.coords.latitude
        lng = pos.coords.longitude
        acc = pos.coords.accuracy
      }
    } catch {
      // Fall back to driver or ride coords if user GPS fails
      lat = driverCoords?.latitude || ride?.pickup_latitude || null
      lng = driverCoords?.longitude || ride?.pickup_longitude || null
    }

    const { data, error: triggerErr } = await triggerRideSos({
      rideId: ride.id,
      latitude: lat,
      longitude: lng,
      accuracyMeters: acc,
      message: `Emergency SOS triggered during ride ${ride.booking_reference}`,
    })

    setLoading(false)

    if (triggerErr) {
      setError(triggerErr)
    } else {
      setShowConfirmModal(false)
      if (data?.safety_event_id) {
        onSosChange?.({
          id: data.safety_event_id,
          status: 'active',
          ride_id: ride.id,
          created_at: new Date().toISOString(),
        })
      }
    }
  }

  const handleResolveSos = async () => {
    if (!activeSos?.id) return
    setLoading(true)
    setError(null)

    const { error: resErr } = await resolveRideSos(
      activeSos.id,
      'Passenger marked safe in app'
    )
    setLoading(false)

    if (resErr) {
      setError(resErr)
    } else {
      onSosChange?.(null)
    }
  }

  const handleShareTrip = async () => {
    const text = `I'm on a Cardom ride (${ride?.booking_reference || ''}) from ${ride?.pickup_address || ''} to ${ride?.drop_address || ''}. Vehicle: ${ride?.vehicle_number || 'Cardom'}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Cardom Ride Details',
          text,
          url: window.location.href,
        })
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Ride Safety & Assistance
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">24/7 Monitored</span>
      </div>

      {/* Active SOS State Banner */}
      {activeSos ? (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-300">
                EMERGENCY SOS IS ACTIVE
              </h4>
              <p className="text-xs text-rose-200/80 mt-0.5">
                {activeSos.status === 'acknowledged'
                  ? 'Your driver has acknowledged and is assisting.'
                  : 'Emergency alert dispatched to driver & Cardom Operations.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <a
              href="tel:112"
              className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call Police (112)
            </a>
            <button
              onClick={handleResolveSos}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg bg-[#222] hover:bg-[#333] border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              I Am Safe Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Emergency SOS Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 group-hover:bg-rose-500/30 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-xs font-bold text-white">Emergency SOS</span>
            <span className="text-[10px] text-rose-300">Tap for help</span>
          </button>

          {/* Share Live Ride Trip */}
          <button
            onClick={handleShareTrip}
            className="p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222] border border-[#2D2D2D] text-zinc-300 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center">
              <Share2 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-white">Share Ride Details</span>
            <span className="text-[10px] text-zinc-500">
              {copied ? 'Copied to clipboard!' : 'With friends & family'}
            </span>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#161616] border border-rose-500/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertOctagon className="w-5 h-5" />
                <span>Confirm Emergency SOS</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This will trigger an immediate emergency alert with your live coordinates to the driver and Cardom Safety Operations.
            </p>

            {error && (
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleTriggerSos}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertOctagon className="w-4 h-4" />}
                Yes, Trigger Emergency SOS
              </button>

              <a
                href="tel:112"
                className="w-full py-2.5 rounded-xl bg-[#222] hover:bg-[#2C2C2C] border border-[#333] text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-rose-400" />
                Call Police (112) Directly
              </a>

              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

