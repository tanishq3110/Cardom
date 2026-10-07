import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AdminLeafletMap } from '@/components/maps/AdminLeafletMap'
import {
  getActiveSosIncidents,
  acknowledgeSosIncident,
  resolveSosIncident,
  subscribeToSafetyEvents,
} from '@/services/adminSafetyApi'
import {
  AlertOctagon,
  Phone,
  User,
  Briefcase,
  CheckCircle,
  Eye,
  RefreshCw,
  History,
  ShieldAlert,
  X,
} from 'lucide-react'

export function SafetyPage() {
  const navigate = useNavigate()

  const [incidents, setIncidents] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [loading, setLoading] = useState(true)

  // Resolve modal state
  const [resolveModal, setResolveModal] = useState({
    isOpen: false,
    incidentId: null,
    notes: '',
    isLoading: false,
    error: null,
  })

  const fetchIncidents = async () => {
    setLoading(true)
    const { data } = await getActiveSosIncidents()
    setIncidents(data || [])
    if (data?.length > 0) {
      setSelectedIncident(data[0])
    } else {
      setSelectedIncident(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchIncidents()

    const unsub = subscribeToSafetyEvents(() => {
      fetchIncidents()
    })

    return () => {
      unsub()
    }
  }, [])

  const handleAcknowledge = async (eventId) => {
    const res = await acknowledgeSosIncident(eventId, 'Admin acknowledged SOS via Command Center')
    if (res.success) {
      fetchIncidents()
    } else {
      alert(`Error acknowledging SOS: ${res.error}`)
    }
  }

  const handleOpenResolveModal = (incident) => {
    setResolveModal({
      isOpen: true,
      incidentId: incident.id,
      notes: '',
      isLoading: false,
      error: null,
    })
  }

  const handleConfirmResolve = async () => {
    if (!resolveModal.notes.trim()) {
      setResolveModal((prev) => ({ ...prev, error: 'Please enter resolution notes before resolving.' }))
      return
    }

    setResolveModal((prev) => ({ ...prev, isLoading: true, error: null }))
    const res = await resolveSosIncident(resolveModal.incidentId, resolveModal.notes.trim())

    if (res.success) {
      setResolveModal({ isOpen: false, incidentId: null, notes: '', isLoading: false, error: null })
      fetchIncidents()
    } else {
      setResolveModal((prev) => ({ ...prev, isLoading: false, error: res.error }))
    }
  }

  // Build markers for selected incident
  const markers = []
  if (selectedIncident) {
    if (selectedIncident.latitude && selectedIncident.longitude) {
      markers.push({
        lat: selectedIncident.latitude,
        lng: selectedIncident.longitude,
        type: 'sos',
        title: 'EMERGENCY SOS TRIGGER LOCATION',
        description: selectedIncident.message || 'Passenger triggered SOS',
        extra: `Time: ${new Date(selectedIncident.created_at).toLocaleTimeString()}`,
        iconText: '🚨',
      })
    }

    if (selectedIncident.ride_bookings?.pickup_latitude) {
      markers.push({
        lat: selectedIncident.ride_bookings.pickup_latitude,
        lng: selectedIncident.ride_bookings.pickup_longitude,
        type: 'pickup',
        title: 'Ride Pickup',
        description: selectedIncident.ride_bookings.pickup_address,
        iconText: 'P',
      })
    }
  }

  const mapCenter = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [28.6139, 77.2090]

  return (
    <AdminLayout
      title="SOS Emergency & Safety Command Center"
      subtitle="Immediate response, passenger welfare coordination, and audit resolutions"
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/safety/history"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#3D3D3D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Safety History
          </Link>
          <button
            onClick={fetchIncidents}
            className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Top Threat / Alert Status */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        incidents.length > 0
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
            incidents.length > 0 ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
          }`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {incidents.length > 0
                ? `${incidents.length} Active Emergency Incident${incidents.length > 1 ? 's' : ''} Require Immediate Intervention`
                : 'All City Rides Operating Safely — Zero Active SOS Incidents'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {incidents.length > 0
                ? 'Review incident telematics, coordinate emergency contact, and record resolution audit notes.'
                : 'Realtime monitors are listening for customer emergency triggers across active trips.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-[#121212] border border-[#2A2A2A] text-white">
            ACTIVE ALERTS: {incidents.length}
          </span>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-16 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Safety Center Clear</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No passenger or driver has triggered an active SOS event. Historical safety incidents and audit logs are archived under Safety History.
          </p>
          <div className="pt-2">
            <Link
              to="/safety/history"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#202020] hover:bg-[#282828] text-xs font-semibold text-orange-400"
            >
              <History className="w-3.5 h-3.5" />
              View Historical Resolved Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Feed Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Active Incident Queue ({incidents.length})
            </h4>

            {incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/50 shadow-xl shadow-rose-500/5'
                      : 'bg-[#141414] border-[#262626] hover:border-[#383838]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-mono font-bold text-xs text-white">
                        {inc.ride_bookings?.booking_reference || 'Active Ride'}
                      </span>
                    </div>
                    <StatusBadge status={inc.status} />
                  </div>

                  <p className="text-xs text-rose-200 font-medium">
                    "{inc.message || 'Passenger triggered emergency SOS'}"
                  </p>

                  <div className="space-y-1 text-xs text-zinc-400">
                    <div>
                      Passenger: <strong className="text-white">{inc.profiles?.full_name || 'Passenger'}</strong> ({inc.profiles?.phone || 'No phone'})
                    </div>
                    <div>
                      Partner: <strong className="text-white">{inc.partner_profiles?.business_name || 'Assigned Driver'}</strong> ({inc.partner_profiles?.phone || 'No phone'})
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 pt-1">
                      Triggered: {new Date(inc.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Incident Telemetry & Action Panel */}
          {selectedIncident && (
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#202020]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        Incident #{String(selectedIncident.id).slice(0, 8)}
                      </h3>
                      <StatusBadge status={selectedIncident.status} />
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Ride Ref: <span className="font-mono text-white font-bold">{selectedIncident.ride_bookings?.booking_reference}</span>
                    </p>
                  </div>

                  {/* Incident Action Buttons */}
                  <div className="flex items-center gap-2">
                    {selectedIncident.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledge(selectedIncident.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                      >
                        Acknowledge Alert
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenResolveModal(selectedIncident)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      Resolve Incident
                    </button>

                    <button
                      onClick={() => navigate(`/rides/${selectedIncident.ride_id}`)}
                      className="p-2 rounded-xl bg-[#202020] text-zinc-300 hover:text-white"
                      title="Inspect Full Ride"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Map of Incident Location */}
                <AdminLeafletMap
                  center={mapCenter}
                  zoom={14}
                  markers={markers}
                  className="h-72 w-full rounded-xl overflow-hidden border border-[#262626]"
                />

                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold flex items-center gap-1.5">
                      <User className="w-3 h-3 text-blue-400" /> Passenger Details
                    </span>
                    <p className="text-white font-bold text-sm">{selectedIncident.profiles?.full_name || 'Passenger'}</p>
                    <p className="text-zinc-300 font-mono">{selectedIncident.profiles?.phone || 'No phone number'}</p>
                    {selectedIncident.profiles?.phone && (
                      <a
                        href={`tel:${selectedIncident.profiles.phone}`}
                        className="inline-flex items-center gap-1 text-orange-400 hover:underline pt-1"
                      >
                        <Phone className="w-3 h-3" /> Call Passenger
                      </a>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-amber-400" /> Driver / Partner Details
                    </span>
                    <p className="text-white font-bold text-sm">{selectedIncident.partner_profiles?.business_name || 'Driver'}</p>
                    <p className="text-zinc-300 font-mono">{selectedIncident.partner_profiles?.phone || 'No phone number'}</p>
                    {selectedIncident.partner_profiles?.phone && (
                      <a
                        href={`tel:${selectedIncident.partner_profiles.phone}`}
                        className="inline-flex items-center gap-1 text-orange-400 hover:underline pt-1"
                      >
                        <Phone className="w-3 h-3" /> Call Driver
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Notes Resolve Modal */}
      {resolveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#141414] border border-[#2D2D2D] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Resolve SOS Incident
              </h3>
              <button
                onClick={() => setResolveModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Resolving an SOS incident archives the emergency state. To maintain full administrative integrity, mandatory audit notes are required detailing why this incident is considered safe.
            </p>

            {resolveModal.error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {resolveModal.error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase font-mono">
                Mandatory Resolution Notes
              </label>
              <textarea
                rows={3}
                required
                value={resolveModal.notes}
                onChange={(e) => setResolveModal((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="E.g. Spoke with passenger; false alarm confirmed. Passenger completed trip safely."
                className="w-full bg-[#181818] border border-[#2E2E2E] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResolveModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-[#202020] text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={resolveModal.isLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors"
              >
                {resolveModal.isLoading ? 'Resolving...' : 'Confirm & Archive Incident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
