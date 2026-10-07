import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { KpiCard } from '@/components/common/KpiCard'
import { getAnalyticsData } from '@/services/adminAnalyticsApi'
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  IndianRupee,
  RefreshCw,
  Car,
  Briefcase,
  Layers,
  AlertOctagon,
} from 'lucide-react'

export function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    setLoading(true)
    const res = await getAnalyticsData()
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const rides = data?.rides || {}
  const partners = data?.partners || {}
  const leads = data?.leads || {}
  const safety = data?.safety || {}

  return (
    <AdminLayout
      title="Business Analytics & Operations Intelligence"
      subtitle="Comprehensive metrics derived directly from real database transactions and ecosystem telemetry"
      actions={
        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Completion Rate"
          value={`${rides.completionRate || 0}%`}
          subtitle={`${rides.completed || 0} completed of ${rides.total || 0}`}
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Cancellation Rate"
          value={`${rides.cancellationRate || 0}%`}
          subtitle={`${rides.cancelled || 0} cancellations`}
          icon={XCircle}
          color="red"
        />
        <KpiCard
          title="Total Gross Revenue"
          value={`₹${Number(rides.totalRevenue || 0).toLocaleString()}`}
          subtitle="Ride trip settlements"
          icon={IndianRupee}
          color="orange"
        />
        <KpiCard
          title="Fleet Verification"
          value={`${partners.verified || 0} / ${partners.total || 0}`}
          subtitle={`${partners.online || 0} partners currently online`}
          icon={Briefcase}
          color="cyan"
        />
      </div>

      {/* 7-Day Ride Trends & Revenue Chart (Pure CSS/SVG clean responsive bar chart) */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" /> 7-Day Ride Volume & Trend Pipeline
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Daily volume of completed vs cancelled city trips</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded-md bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded-md bg-rose-500" /> Cancelled
            </span>
          </div>
        </div>

        {/* Bar chart representation */}
        <div className="pt-4">
          <div className="grid grid-cols-7 gap-3 items-end h-44 border-b border-[#242424] pb-2">
            {(rides.dailyTrends || []).map((day, idx) => {
              const maxCount = Math.max(1, ...rides.dailyTrends.map((d) => d.completed + d.cancelled + d.other))
              const compHeight = ((day.completed || 0) / maxCount) * 100
              const cancHeight = ((day.cancelled || 0) / maxCount) * 100

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.completed} trips
                  </div>
                  <div className="w-full max-w-[36px] bg-[#202020] rounded-lg overflow-hidden flex flex-col justify-end p-0.5 gap-0.5">
                    <div
                      className="w-full bg-emerald-500 rounded-sm transition-all duration-500"
                      style={{ height: `${Math.max(4, compHeight)}%` }}
                      title={`Completed: ${day.completed}`}
                    />
                    {cancHeight > 0 && (
                      <div
                        className="w-full bg-rose-500 rounded-sm transition-all duration-500"
                        style={{ height: `${Math.max(2, cancHeight)}%` }}
                        title={`Cancelled: ${day.cancelled}`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1">
                    {day.date ? day.date.slice(5) : `D-${idx}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid of Secondary Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Ride Category Split */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-orange-400" /> Rides by Vehicle Class
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300 font-medium">Economy</span>
              <span className="font-mono font-bold text-white">{rides.ridesByType?.economy || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300 font-medium">Comfort</span>
              <span className="font-mono font-bold text-white">{rides.ridesByType?.comfort || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300 font-medium">Cardom XL</span>
              <span className="font-mono font-bold text-white">{rides.ridesByType?.xl || 0}</span>
            </div>
          </div>
        </div>

        {/* Leads Pipeline Distribution */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Leads Pipeline ({leads.total || 0})
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300 font-medium">Insurance</span>
              <span className="font-mono font-bold text-white">{leads.insurance || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300 font-medium">Finance</span>
              <span className="font-mono font-bold text-white">{leads.finance || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300 font-medium">Services</span>
              <span className="font-mono font-bold text-white">{leads.services || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300 font-medium">Inquiries</span>
              <span className="font-mono font-bold text-white">{leads.inquiries || 0}</span>
            </div>
          </div>
        </div>

        {/* Partner Categories */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Partner Category Fleet
          </h4>
          <div className="space-y-3">
            {Object.entries(partners.categories || {}).length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No categories registered yet.</p>
            ) : (
              Object.entries(partners.categories || {}).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
                  <span className="text-zinc-300 font-medium uppercase font-mono">{cat.replace(/_/g, ' ')}</span>
                  <span className="font-mono font-bold text-white">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety Resolution KPI */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Emergency Resolution
          </h4>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Total Incidents on Record</span>
              <div className="text-2xl font-black text-white mt-1">{safety.totalIncidents || 0}</div>
            </div>
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300">Resolved & Safe</span>
              <span className="font-mono font-bold text-emerald-400">{safety.resolved || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
              <span className="text-zinc-300">Currently Unresolved</span>
              <span className={`font-mono font-bold ${safety.active > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {safety.active || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
