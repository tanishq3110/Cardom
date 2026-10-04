import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Power, AlertCircle, Loader2, Navigation, CheckCircle2 } from 'lucide-react'
import { setPartnerOnline, setPartnerOffline } from '@/services/partnerAvailabilityApi'

export function PartnerAvailabilityCard({
  isOnline,
  isBusy,
  activeRideId,
  onAvailabilityChange,
}) {
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successNotice, setSuccessNotice] = useState(null)

  const handleToggleOnline = async () => {
    setErrorMessage(null)
    setSuccessNotice(null)
    setUpdating(true)

    if (isOnline) {
      // Going offline
      if (isBusy) {
        setErrorMessage('You have an active ride in progress. Complete or cancel it before going offline.')
        setUpdating(false)
        return
      }

      const res = await setPartnerOffline()
      if (!res.success) {
        setErrorMessage(res.error || 'Unable to update availability. Check your connection.')
      } else {
        onAvailabilityChange?.(false)
        setSuccessNotice('You are now Offline. You will not receive new ride offers.')
        setTimeout(() => setSuccessNotice(null), 3000)
      }
    } else {
      // Going online
      const res = await setPartnerOnline()
      if (!res.success) {
        setErrorMessage(res.error || 'Unable to update availability. Check your connection.')
      } else {
        onAvailabilityChange?.(true)
        setSuccessNotice('You are now Online and available for nearby rides!')
        setTimeout(() => setSuccessNotice(null), 3000)
      }
    }

    setUpdating(false)
  }

  // Derive status badge
  let statusColor = 'bg-red-500/15 border-red-500/30 text-red-400'
  let dotColor = 'bg-red-500'
  let statusText = 'OFFLINE'
  let subtitleText = 'You are currently not receiving new rides.'

  if (isOnline) {
    if (isBusy) {
      statusColor = 'bg-orange-500/15 border-orange-500/30 text-orange-400'
      dotColor = 'bg-orange-500 animate-pulse'
      statusText = 'BUSY'
      subtitleText = 'Active ride in progress. Unavailable for new offers.'
    } else {
      statusColor = 'bg-green-500/15 border-green-500/30 text-green-400'
      dotColor = 'bg-green-500'
      statusText = 'ONLINE'
      subtitleText = 'You are available and receiving nearby ride requests.'
    }
  }

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center">
            <Power className={`w-4 h-4 ${isOnline ? 'text-green-400' : 'text-[#888]'}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Ride Availability</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">{subtitleText}</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {statusText}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center gap-2 text-xs text-green-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="flex items-center gap-2.5 pt-0.5">
        {isBusy && activeRideId ? (
          <button
            onClick={() => navigate(`/rides/${activeRideId}`)}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-500/20"
          >
            <Navigation className="w-3.5 h-3.5" />
            View Active Ride
          </button>
        ) : (
          <button
            onClick={handleToggleOnline}
            disabled={updating}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
              isOnline
                ? 'bg-[#222] border border-[#333] text-[#CCC] hover:text-white hover:bg-[#282828]'
                : 'bg-green-600 hover:bg-green-500 active:scale-[0.99] text-white shadow-md shadow-green-600/20'
            }`}
          >
            {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        )}
      </div>
    </div>
  )
}

