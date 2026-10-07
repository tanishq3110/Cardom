import { useState } from 'react'
import {
  AlertOctagon,
  Phone,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { acknowledgeRideSos, resolveRideSos } from '@/services/partnerSafetyApi'

export function PartnerEmergencyAlert({
  safetyEvent,
  ride,
  onEventUpdated,
}) {
  const [loadingAction, setLoadingAction] = useState(false)
  const [actionError, setActionError] = useState(null)

  const isAcknowledged = safetyEvent.status === 'acknowledged'

  const handleAcknowledge = async () => {
    setLoadingAction(true)
    setActionError(null)

    const { data, error } = await acknowledgeRideSos(safetyEvent.id)
    setLoadingAction(false)

    if (error) {
      setActionError(error)
    } else {
      onEventUpdated?.({
        ...safetyEvent,
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
      })
    }
  }

  const handleResolve = async () => {
    setLoadingAction(true)
    setActionError(null)

    const { error } = await resolveRideSos(
      safetyEvent.id,
      'Driver verified passenger safety on scene'
    )
    setLoadingAction(false)

    if (error) {
      setActionError(error)
    } else {
      onEventUpdated?.(null)
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/50 space-y-4 shadow-xl shadow-rose-950/30 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                PASSENGER EMERGENCY SOS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {safetyEvent.status}
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-0.5">
              Immediate Driver Attention Required
            </h4>
          </div>
        </div>
      </div>

      <p className="text-xs text-rose-200/90 leading-relaxed">
        {safetyEvent.message || 'Passenger has activated the emergency SOS distress signal.'}
      </p>

      {safetyEvent.latitude && safetyEvent.longitude && (
        <div className="text-[11px] font-mono text-rose-300 bg-rose-500/20 p-2 rounded-lg">
          GPS Coordinates: {safetyEvent.latitude.toFixed(6)}, {safetyEvent.longitude.toFixed(6)}
        </div>
      )}

      {actionError && (
        <p className="text-xs text-rose-300 font-medium">{actionError}</p>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Call Passenger */}
        {ride?.customer_phone && (
          <a
            href={`tel:${ride.customer_phone}`}
            className="py-2.5 px-3 rounded-xl bg-[#202020] hover:bg-[#2C2C2C] border border-[#333] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            Call Passenger
          </a>
        )}

        {/* Call Police */}
        <a
          href="tel:112"
          className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Police (112)
        </a>

        {/* Acknowledge or Resolve */}
        {!isAcknowledged ? (
          <button
            onClick={handleAcknowledge}
            disabled={loadingAction}
            className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            Acknowledge SOS
          </button>
        ) : (
          <button
            onClick={handleResolve}
            disabled={loadingAction}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Resolve SOS (Safe)
          </button>
        )}
      </div>
    </div>
  )
}

