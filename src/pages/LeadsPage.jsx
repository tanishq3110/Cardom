import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getUnifiedLeads } from '@/services/adminLeadsApi'
import {
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Shield,
  CreditCard,
  Wrench,
  Car,
} from 'lucide-react'

export function LeadsPage() {
  const navigate = useNavigate()

  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  const limit = 20

  const fetchLeads = async () => {
    setLoading(true)
    const { data, total: count } = await getUnifiedLeads({
      page,
      limit,
      type,
      status,
      search,
    })
    setLeads(data)
    setTotal(count)
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [page, type, status])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchLeads()
  }

  const getTypeIcon = (leadType) => {
    switch (leadType) {
      case 'insurance':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />
      case 'finance':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
      case 'service':
        return <Wrench className="w-3.5 h-3.5 text-amber-400" />
      default:
        return <Car className="w-3.5 h-3.5 text-purple-400" />
    }
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Unified Leads & Customer Requests"
      subtitle="Comprehensive view of Insurance, Finance, Service, and Marketplace Inquiries"
      actions={
        <button
          onClick={fetchLeads}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors"
          title="Refresh Leads"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, phone, vehicle..."
            className="w-full bg-[#141414] border border-[#282828] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Lead Types</option>
            <option value="insurance">Insurance Leads</option>
            <option value="finance">Finance Leads</option>
            <option value="service">Service Requests</option>
            <option value="inquiry">Car Inquiries</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="unread">Unread</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
            <p className="text-xs text-zinc-400">Loading incoming leads pipeline...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Leads Found</p>
            <p className="text-xs text-zinc-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-[#101010]">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {leads.map((l) => (
                  <tr key={`${l.type}-${l.id}`} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202020] border border-[#2C2C2C] text-[11px] font-bold uppercase tracking-wider text-white">
                        {getTypeIcon(l.type)}
                        {l.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {l.customer}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-zinc-300">{l.phone || '—'}</div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-xs">{l.email}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-md truncate">
                      {l.details}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[10px]">
                      {new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/leads/${l.type}/${l.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-orange-400 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
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
