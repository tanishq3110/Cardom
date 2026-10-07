import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getSafetyEvents } from '@/services/adminSafetyApi'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react'

export function SafetyHistoryPage() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  const limit = 20

  const fetchEvents = async () => {
    setLoading(true)
    const { data, total: count } = await getSafetyEvents({
      page,
      limit,
      status,
    })
    setEvents(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [page, status])

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Safety Incidents History & Audit Archives"
      subtitle="Complete chronological log of all emergency activations, acknowledgements, and recorded resolution notes"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/safety')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Active Command
          </button>
          <button
            onClick={fetchEvents}
            className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Filter Bar */}
      <div className="flex items-center justify-between pb-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Incident Statuses</option>
          <option value="resolved">Resolved</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <span className="text-xs font-mono text-zinc-500">
          Total archived safety events: {total}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
            <p className="text-xs text-zinc-400">Loading safety archives...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertOctagon className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Safety Events Found</p>
            <p className="text-xs text-zinc-500">Safety incidents will appear here once resolved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-[#101010]">
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Ride Reference</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Resolution Details</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                      {new Date(e.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {e.ride_bookings?.booking_reference || 'Ride'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{e.profiles?.full_name || 'Passenger'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{e.profiles?.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{e.partner_profiles?.business_name || 'Driver'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{e.partner_profiles?.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-xs truncate">
                      {e.message || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/rides/${e.ride_id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-orange-400 font-semibold text-xs"
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
        <div className="p-4 border-t border-[#222222] flex items-center justify-between">
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
