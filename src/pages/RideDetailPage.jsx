import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AdminLeafletMap } from '@/components/maps/AdminLeafletMap'
import { getRideDetails } from '@/services/adminRidesApi'
import {
  ArrowLeft,
  MapPin,
  User,
  Briefcase,
  AlertOctagon,
  Star,
  RefreshCw,
  Clock,
  Radio,
} from 'lucide-react'

export function RideDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDetails = async () => {
    setLoading(true)
    const res = await getRideDetails(id)
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDetails()
  }, [id])

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
          <p className="text-xs text-zinc-400">Loading complete ride telemetry and dispatch records...</p>
        </div>
      </AdminLayout>
    )
  }

  const booking = data?.booking || {}
  const passenger = data?.passenger || {}
  const assignment = data?.assignment || null
  const driverLoc = data?.driverLocation || null
  const offers = data?.offers || []
  const safetyEvents = data?.safetyEvents || []
  const rating = data?.rating || null

  // Map markers
  const markers = []
  if (booking.pickup_latitude && booking.pickup_longitude) {
    markers.push({
      lat: booking.pickup_latitude,
      lng: booking.pickup_longitude,
      type: 'pickup',
      title: 'Pickup Location',
      description: booking.pickup_address,
      iconText: 'P',
    })
  }

  if (booking.drop_latitude && booking.drop_longitude) {
    markers.push({
      lat: booking.drop_latitude,
      lng: booking.drop_longitude,
      type: 'drop',
      title: 'Destination',
      description: booking.drop_address,
      iconText: 'D',
    })
  }

  if (driverLoc?.latitude && driverLoc?.longitude) {
    markers.push({
      lat: driverLoc.latitude,
      lng: driverLoc.longitude,
      type: 'driver',
      title: `Driver: ${booking.driver_name || 'Assigned Driver'}`,
      description: `Live coordinates • Updated: ${new Date(driverLoc.updated_at).toLocaleTimeString()}`,
      iconText: '🚗',
    })
  }

  const mapCenter = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [28.6139, 77.2090]

  return (
    <AdminLayout
      title={`Ride Dossier — ${booking.booking_reference}`}
      subtitle={`Created on ${new Date(booking.created_at).toLocaleString('en-IN')}`}
      actions={
        <button
          onClick={() => navigate('/rides')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Rides
        </button>
      }
    >
      {/* Top Banner Status Bar */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-white font-mono">{booking.booking_reference}</span>
                <StatusBadge status={booking.status} />
                <StatusBadge status={booking.payment_status} />
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded-md bg-[#222222] text-zinc-300">
                  {booking.ride_type}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Estimated Fare: <span className="font-bold text-white">₹{Number(booking.estimated_fare || 0).toLocaleString()}</span>
                {booking.final_fare && (
                  <> • Final Fare: <span className="font-bold text-emerald-400">₹{Number(booking.final_fare).toLocaleString()}</span></>
                )}
                {booking.estimated_distance_km && (
                  <> • Distance: <span className="text-zinc-200">{booking.estimated_distance_km} km</span></>
                )}
              </p>
            </div>
          </div>

          {safetyEvents.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold animate-pulse">
              <AlertOctagon className="w-4 h-4" />
              <span>SOS Emergency Triggered on this Ride</span>
            </div>
          )}
        </div>
      </div>

      {/* Map & Telemetry Row */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-400" /> Route & GPS Telemetry
          </h3>
          {driverLoc && (
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Driver Position Available
            </span>
          )}
        </div>

        <AdminLeafletMap
          center={mapCenter}
          zoom={13}
          markers={markers}
          className="h-80 w-full rounded-xl overflow-hidden border border-[#262626]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
            <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Pickup Address</span>
            <p className="text-white mt-1 leading-snug">{booking.pickup_address}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
            <span className="text-[10px] text-rose-400 uppercase font-mono font-bold">Drop Address</span>
            <p className="text-white mt-1 leading-snug">{booking.drop_address}</p>
          </div>
        </div>
      </div>

      {/* Passenger & Driver Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passenger Card */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-blue-400" /> Passenger Details
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Passenger Name</span>
              <p className="text-white font-semibold mt-0.5">{passenger?.full_name || 'Cardom Customer'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Contact</span>
              <p className="text-zinc-300 font-mono mt-0.5">{passenger?.email || '—'} • {passenger?.phone || 'No phone'}</p>
            </div>
            {passenger?.id && (
              <div className="pt-2 border-t border-[#222222]">
                <button
                  onClick={() => navigate(`/users/${passenger.id}`)}
                  className="text-xs text-orange-400 hover:underline"
                >
                  Inspect User Profile →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Partner / Driver Card */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Driver / Partner Details
          </h3>
          {assignment ? (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Business Name</span>
                <p className="text-white font-semibold mt-0.5">{assignment.partner_profiles?.business_name || booking.driver_name}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Driver & Vehicle</span>
                <p className="text-zinc-300 mt-0.5">
                  {booking.driver_name} • <span className="font-mono font-bold text-white">{booking.vehicle_number}</span> ({booking.vehicle_name})
                </p>
              </div>
              <div className="pt-2 border-t border-[#222222]">
                <button
                  onClick={() => navigate(`/partners/${assignment.partner_id}`)}
                  className="text-xs text-orange-400 hover:underline"
                >
                  Inspect Partner Fleet Profile →
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No driver assigned to this ride booking yet.</p>
          )}
        </div>
      </div>

      {/* Dispatch Offers & Timeline */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-purple-400" /> Dispatch Attempts & Offers History ({offers.length})
        </h3>

        {offers.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">No dispatch offer events recorded for this ride.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#202020] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Offered Partner</th>
                  <th className="py-2.5 px-3">Distance to Pickup</th>
                  <th className="py-2.5 px-3">Offer Status</th>
                  <th className="py-2.5 px-3">Offered At</th>
                  <th className="py-2.5 px-3">Responded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D]">
                {offers.map((o) => (
                  <tr key={o.id} className="hover:bg-[#1A1A1A]">
                    <td className="py-3 px-3 font-semibold text-white">
                      {o.partner_profiles?.business_name || `Partner ${o.partner_id}`}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      {o.distance_to_pickup_km ? `${o.distance_to_pickup_km} km` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400">
                      {new Date(o.created_at).toLocaleTimeString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400">
                      {o.responded_at ? new Date(o.responded_at).toLocaleTimeString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safety & SOS Section (if exists) */}
      {safetyEvents.length > 0 && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 space-y-4">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" /> Active Emergency / SOS Log
          </h3>

          <div className="space-y-3">
            {safetyEvents.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-[#141414] border border-[#2D2D2D] space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={s.status} />
                  <span className="text-xs font-mono text-zinc-400">{new Date(s.created_at).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-white">{s.message || 'Emergency assistance triggered.'}</p>
                {s.latitude && s.longitude && (
                  <p className="text-[11px] font-mono text-zinc-400">
                    Trigger coordinates: {s.latitude}, {s.longitude}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating & Review Section (if exists) */}
      {rating && (
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-yellow-400" /> Customer Ride Feedback
          </h3>
          <div className="flex items-center gap-2 text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}`} />
            ))}
            <span className="text-sm font-bold text-white font-mono ml-1">{rating.rating}/5</span>
          </div>
          {rating.review && (
            <p className="text-xs text-zinc-300 italic">"{rating.review}"</p>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
