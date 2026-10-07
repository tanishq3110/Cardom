import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { KpiCard } from '@/components/common/KpiCard'
import { getDispatchOffers, getDispatchStats } from '@/services/adminDispatchApi'
import {
  GitPullRequest,
  CheckCircle,
  XCircle,
  Clock,
  Navigation,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Radio,
  Timer,
} from 'lucide-react'

export function DispatchPage() {
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [stats, setStats] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  const limit = 20

  const fetchData = async () => {
    setLoading(true)
    const [offersRes, statsRes] = await Promise.all([
      getDispatchOffers({ page, limit, status }),
      getDispatchStats(),
    ])
    setOffers(offersRes.data || [])
    setTotal(offersRes.total || 0)
    setStats(statsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page, status])

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Smart Dispatch & Driver Matching Center"
      subtitle="Monitoring radius expansion (5km → 10km → 15km) and 20-second offer lifecycle"
      actions={
        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors"
          title="Refresh Dispatch Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Dispatch Architecture Explanation Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#181818] to-[#121212] border border-[#262626] p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
          <GitPullRequest className="w-4 h-4" />
          Cardom Deterministic Dispatch Engine
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed max-w-4xl">
          Cardom uses a strictly explainable, deterministic ride matching system. When a passenger books a ride, available online drivers are evaluated in three sequential concentric geofences:
          <span className="text-white font-mono font-bold"> 5 km (Immediate)</span> →
          <span className="text-white font-mono font-bold"> 10 km (Expanded)</span> →
          <span className="text-white font-mono font-bold"> 15 km (Maximum Perimeter)</span>.
          Each driver receives a synchronized <span className="text-amber-400 font-mono font-bold">20-second</span> exclusive offer window before fallback expansion occurs.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Total Offers"
          value={stats?.totalOffers || 0}
          subtitle="All dispatch attempts"
          icon={Radio}
          color="orange"
        />
        <KpiCard
          title="Accepted"
          value={stats?.accepted || 0}
          subtitle="Trips claimed"
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Declined / Rejected"
          value={stats?.rejected || 0}
          subtitle="Declined by driver"
          icon={XCircle}
          color="red"
        />
        <KpiCard
          title="Expired Windows"
          value={stats?.expired || 0}
          subtitle="Timed out after 20s"
          icon={Clock}
          color="purple"
        />
        <KpiCard
          title="Avg Radius"
          value={`${stats?.avgDistanceKm || 0} km`}
          subtitle="Distance to pickup"
          icon={Navigation}
          color="cyan"
        />
        <KpiCard
          title="Avg Driver Latency"
          value={`${stats?.avgResponseSecs || 0}s`}
          subtitle="Driver response time"
          icon={Timer}
          color="blue"
        />
      </div>

      {/* Offers Filter and Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Live & Historical Dispatch Offers</h3>
            <p className="text-xs text-zinc-400">Chronological telemetry of partner offer distributions</p>
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Offer States</option>
            <option value="offered">Active / Pending Response</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired (20s timeout)</option>
          </select>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
            <p className="text-xs text-zinc-400">Loading dispatch offer stream...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <GitPullRequest className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Dispatch Offers Found</p>
            <p className="text-xs text-zinc-500">Dispatch offers appear as rides are requested.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Ride Reference</th>
                  <th className="py-3 px-3">Offered Partner</th>
                  <th className="py-3 px-3">Distance to Pickup</th>
                  <th className="py-3 px-3">Offer Status</th>
                  <th className="py-3 px-3">Dispatched At</th>
                  <th className="py-3 px-3">Responded At</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D]">
                {offers.map((o) => (
                  <tr key={o.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white">
                        {o.ride_bookings?.booking_reference || o.ride_id}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-xs">
                        {o.ride_bookings?.pickup_address}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">
                        {o.partner_profiles?.business_name || `Partner ${o.partner_id}`}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {o.partner_profiles?.authorized_contact_name} • {o.partner_profiles?.phone}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-zinc-300">
                      {o.distance_to_pickup_km ? `${Number(o.distance_to_pickup_km).toFixed(1)} km` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {new Date(o.created_at).toLocaleTimeString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {o.responded_at ? new Date(o.responded_at).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/rides/${o.ride_id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#282828] text-orange-400 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Ride
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-2 border-t border-[#222222] flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
