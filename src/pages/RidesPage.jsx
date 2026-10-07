import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getRides } from '@/services/adminRidesApi'
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react'

export function RidesPage() {
  const navigate = useNavigate()

  const [rides, setRides] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [rideType, setRideType] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  const limit = 15

  const fetchRides = async () => {
    setLoading(true)
    const { data, total: count } = await getRides({
      page,
      limit,
      search,
      status,
      rideType,
      paymentStatus,
    })
    setRides(data)
    setTotal(count)
    setLoading(false)
  }

  useEffect(() => {
    fetchRides()
  }, [page, status, rideType, paymentStatus])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRides()
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Ride Operations Management"
      subtitle="Complete database of all city rides, bookings, and customer trips"
      actions={
        <button
          onClick={fetchRides}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors"
          title="Refresh Rides"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, pickup, driver..."
            className="w-full bg-[#141414] border border-[#282828] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Ride Statuses</option>
            <option value="searching">Searching</option>
            <option value="driver_assigned">Driver Assigned</option>
            <option value="arriving">Arriving</option>
            <option value="started">Started</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Ride Type */}
          <select
            value={rideType}
            onChange={(e) => {
              setRideType(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Vehicle Types</option>
            <option value="economy">Economy</option>
            <option value="comfort">Comfort</option>
            <option value="xl">Cardom XL</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="customer_marked_paid">Marked Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Rides Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
            <p className="text-xs text-zinc-400">Loading ride operations records...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MapPin className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Rides Found</p>
            <p className="text-xs text-zinc-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-[#101010]">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Driver / Vehicle</th>
                  <th className="py-3 px-4">Pickup & Drop</th>
                  <th className="py-3 px-4">Fare</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {rides.map((r) => (
                  <tr key={r.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">{r.booking_reference}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-zinc-300">
                      {r.ride_type}
                    </td>
                    <td className="py-3 px-4">
                      {r.driver_name ? (
                        <div>
                          <div className="font-semibold text-white">{r.driver_name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{r.vehicle_number || r.vehicle_name}</div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[11px] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-zinc-200 truncate font-medium">{r.pickup_address}</div>
                      <div className="text-zinc-500 truncate text-[11px]">{r.drop_address}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ₹{Number(r.final_fare || r.estimated_fare || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.payment_status} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/rides/${r.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-orange-400 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
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
