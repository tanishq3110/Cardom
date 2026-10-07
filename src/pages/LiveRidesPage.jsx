import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AdminLeafletMap } from '@/components/maps/AdminLeafletMap'
import { getLiveRides, subscribeToAllRides } from '@/services/adminRidesApi'
import {
  Radio,
  RefreshCw,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react'

export function LiveRidesPage() {
  const navigate = useNavigate()

  const [rides, setRides] = useState([])
  const [selectedRide, setSelectedRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLive = async () => {
    setRefreshing(true)
    const { data } = await getLiveRides()
    setRides(data || [])
    if (data?.length > 0 && !selectedRide) {
      setSelectedRide(data[0])
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchLive()

    const unsub = subscribeToAllRides(() => {
      fetchLive()
    })

    return () => {
      unsub()
    }
  }, [])

  // Build markers for all active rides or selected ride
  const markers = []

  rides.forEach((r) => {
    // Driver location if available
    if (r.driverLocation?.latitude && r.driverLocation?.longitude) {
      markers.push({
        lat: r.driverLocation.latitude,
        lng: r.driverLocation.longitude,
        type: 'driver',
        title: `Driver: ${r.driver_name || 'Active Driver'}`,
        description: `Ride ${r.booking_reference} • Status: ${r.status}`,
        iconText: '🚗',
      })
    }

    // Pickup
    if (r.pickup_latitude && r.pickup_longitude) {
      markers.push({
        lat: r.pickup_latitude,
        lng: r.pickup_longitude,
        type: 'pickup',
        title: `Pickup (${r.booking_reference})`,
        description: r.pickup_address,
        iconText: 'P',
      })
    }

    // Drop
    if (r.drop_latitude && r.drop_longitude) {
      markers.push({
        lat: r.drop_latitude,
        lng: r.drop_longitude,
        type: 'drop',
        title: `Drop (${r.booking_reference})`,
        description: r.drop_address,
        iconText: 'D',
      })
    }

    // SOS marker if active
    if (r.activeSos?.latitude && r.activeSos?.longitude) {
      markers.push({
        lat: r.activeSos.latitude,
        lng: r.activeSos.longitude,
        type: 'sos',
        title: `EMERGENCY SOS (${r.booking_reference})`,
        description: r.activeSos.message || 'Passenger triggered SOS',
        iconText: '🚨',
      })
    }
  })

  const mapCenter = selectedRide?.driverLocation?.latitude
    ? [selectedRide.driverLocation.latitude, selectedRide.driverLocation.longitude]
    : markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : [28.6139, 77.2090]

  return (
    <AdminLayout
      title="Live Operations Command"
      subtitle="Real-time radar of active trips, driver GPS positions, and live city dispatches"
      actions={
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            REALTIME SYNC ACTIVE
          </span>
          <button
            onClick={fetchLive}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Live Operations"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Rides Feed Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-500" /> Active Trips ({rides.length})
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Searching • Assigned • Started</span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
              <p className="text-xs text-zinc-400">Scanning active fleet...</p>
            </div>
          ) : rides.length === 0 ? (
            <div className="rounded-2xl bg-[#141414] border border-[#242424] p-8 text-center space-y-2">
              <Radio className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-white">No Active Rides on Road</p>
              <p className="text-xs text-zinc-500">All requested rides have completed or been resolved.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {rides.map((r) => {
                const isSelected = selectedRide?.id === r.id
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRide(r)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-[#1C1C1C] border-orange-500/50 shadow-lg shadow-orange-500/5'
                        : 'bg-[#141414] border-[#262626] hover:border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-xs">{r.booking_reference}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        ₹{Number(r.final_fare || r.estimated_fare || 0).toLocaleString()}
                      </span>
                    </div>

                    {r.activeSos && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold animate-pulse">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>EMERGENCY SOS ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-1 text-xs">
                      <div className="text-zinc-300 truncate font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="truncate">{r.pickup_address}</span>
                      </div>
                      <div className="text-zinc-400 truncate text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                        <span className="truncate">{r.drop_address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-[11px] text-zinc-400">
                      <div>
                        {r.driver_name ? (
                          <span>Driver: <strong className="text-white">{r.driver_name}</strong></span>
                        ) : (
                          <span className="italic text-zinc-500">Searching for partner...</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/rides/${r.id}`)
                        }}
                        className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Live Map Radar Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Real-Time Fleet Positioning Radar
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              {markers.length} telemetry points plotted
            </span>
          </div>

          <AdminLeafletMap
            center={mapCenter}
            zoom={12}
            markers={markers}
            className="h-[75vh] w-full rounded-2xl overflow-hidden border border-[#262626]"
          />
        </div>
      </div>
    </AdminLayout>
  )
}
