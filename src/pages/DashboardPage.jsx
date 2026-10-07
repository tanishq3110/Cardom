import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { KpiCard } from '@/components/common/KpiCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import {
  getDashboardOverview,
  getRideStatusDistribution,
  getLeadsDistribution,
  getRecentRides,
} from '@/services/adminDashboardApi'
import {
  Briefcase,
  Car,
  Radio,
  MapPin,
  AlertOctagon,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  IndianRupee,
} from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [rideStats, setRideStats] = useState(null)
  const [leadsStats, setLeadsStats] = useState(null)
  const [recentRides, setRecentRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    setRefreshing(true)
    try {
      const [ovRes, rStatsRes, lStatsRes, recRes] = await Promise.all([
        getDashboardOverview(),
        getRideStatusDistribution(),
        getLeadsDistribution(),
        getRecentRides(6),
      ])

      setOverview(ovRes.data)
      setRideStats(rStatsRes.data)
      setLeadsStats(lStatsRes.data)
      setRecentRides(recRes.data || [])
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <AdminLayout
      title="Ecosystem Mission Control"
      subtitle="Real-time administrative visibility across Users, Partners, Rides, and Public Website"
      actions={
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
          <span>Refresh Live Data</span>
        </button>
      }
    >
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
          <p className="text-xs text-zinc-400">Loading ecosystem operations data...</p>
        </div>
      ) : (
        <>
          {/* Top Critical Alert Bar if Active SOS */}
          {overview?.active_sos > 0 && (
        <div
          onClick={() => navigate('/safety')}
          className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between cursor-pointer hover:bg-rose-500/20 transition-colors animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-300">
                CRITICAL: {overview.active_sos} Active SOS Safety Incident{overview.active_sos > 1 ? 's' : ''} Requiring Attention
              </h4>
              <p className="text-xs text-rose-200/80 mt-0.5">
                A passenger has triggered emergency assistance on an active ride. Click to open Safety Command.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
            <span>View Incident Center</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Active Live Rides"
          value={overview?.active_rides ?? 0}
          subtitle="Currently on road"
          icon={Radio}
          color="orange"
          onClick={() => navigate('/live-rides')}
        />
        <KpiCard
          title="Online Partners"
          value={overview?.online_partners ?? 0}
          subtitle={`${overview?.total_partners ?? 0} total registered`}
          icon={Briefcase}
          color="green"
          onClick={() => navigate('/partners')}
        />
        <KpiCard
          title="Pending Approvals"
          value={overview?.pending_partners ?? 0}
          subtitle="Requires document review"
          icon={Clock}
          color="cyan"
          onClick={() => navigate('/partners?status=pending')}
        />
        <KpiCard
          title="Total Cars"
          value={overview?.total_cars ?? 0}
          subtitle="Marketplace listings"
          icon={Car}
          color="blue"
          onClick={() => navigate('/cars')}
        />
        <KpiCard
          title="Total Leads"
          value={overview?.total_leads ?? 0}
          subtitle="Insurance, Finance, Service"
          icon={Layers}
          color="purple"
          onClick={() => navigate('/leads')}
        />
        <KpiCard
          title="Ride Volume"
          value={`₹${Number(overview?.total_revenue ?? 0).toLocaleString()}`}
          subtitle={`${overview?.completed_rides ?? 0} completed rides`}
          icon={IndianRupee}
          color="green"
          onClick={() => navigate('/payments')}
        />
      </div>

      {/* Ride & Partner Operations Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ride Status Distribution */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              Ride Operations Pipeline
            </h3>
            <button
              onClick={() => navigate('/rides')}
              className="text-xs text-orange-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Searching</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{rideStats?.searching ?? 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Driver Assigned</span>
              <div className="text-xl font-bold text-blue-400 mt-1">{rideStats?.driver_assigned ?? 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Arriving</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">{rideStats?.arriving ?? 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Started (Trip)</span>
              <div className="text-xl font-bold text-orange-400 mt-1">{rideStats?.started ?? 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Completed</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{rideStats?.completed ?? 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Cancelled</span>
              <div className="text-xl font-bold text-rose-400 mt-1">{rideStats?.cancelled ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Leads Distribution */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Website & Leads Funnel
            </h3>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs text-orange-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-xs text-zinc-300">Car Inquiries (Buy/Sell)</span>
              <span className="text-sm font-bold text-white">{leadsStats?.inquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-xs text-zinc-300">Insurance Policy Quotes</span>
              <span className="text-sm font-bold text-white">{leadsStats?.insurance ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-xs text-zinc-300">Auto Finance & Loans</span>
              <span className="text-sm font-bold text-white">{leadsStats?.finance ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-xs text-zinc-300">Vehicle Service Bookings</span>
              <span className="text-sm font-bold text-white">{leadsStats?.service ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Operations Actions */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <div className="pb-3 border-b border-[#202020]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-500" />
              Quick Operations Command
            </h3>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/live-rides')}
              className="w-full p-3 rounded-xl bg-[#1B1B1B] hover:bg-[#242424] border border-[#2E2E2E] flex items-center justify-between text-left group transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Ride Radar
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Real-time driver GPS & tracking map</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => navigate('/dispatch')}
              className="w-full p-3 rounded-xl bg-[#1B1B1B] hover:bg-[#242424] border border-[#2E2E2E] flex items-center justify-between text-left group transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-white">Smart Dispatch Center</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Monitor radius expansion & 20s offer timer</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => navigate('/safety')}
              className="w-full p-3 rounded-xl bg-[#1B1B1B] hover:bg-[#242424] border border-[#2E2E2E] flex items-center justify-between text-left group transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-white">SOS Incident Command</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Passenger emergency triggers & audit resolutions</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Rides Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Ride Activity</h3>
            <p className="text-xs text-zinc-400">Latest ride requests across the network</p>
          </div>
          <button
            onClick={() => navigate('/rides')}
            className="text-xs font-semibold text-orange-400 hover:underline flex items-center gap-1"
          >
            All Rides <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentRides.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No ride activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#202020] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Pickup Address</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Fare</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D]">
                {recentRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white">{ride.booking_reference}</td>
                    <td className="py-3 px-3 uppercase font-semibold text-zinc-400">{ride.ride_type}</td>
                    <td className="py-3 px-3 text-zinc-300 max-w-xs truncate">{ride.pickup_address}</td>
                    <td className="py-3 px-3 text-zinc-300 max-w-xs truncate">{ride.drop_address}</td>
                    <td className="py-3 px-3 font-bold text-white">₹{Number(ride.final_fare || ride.estimated_fare || 0).toLocaleString()}</td>
                    <td className="py-3 px-3"><StatusBadge status={ride.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/rides/${ride.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-orange-400 font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}
</AdminLayout>
  )
}
