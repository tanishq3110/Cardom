import { useState, useEffect, useCallback } from 'react'
import { PartnerLayout } from '@/components/PartnerLayout'
import { LeadCard } from '@/components/LeadCard'
import { Search, RefreshCw, AlertCircle, Inbox } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getPartnerLeads, updatePartnerLeadStatus } from '@/services/partnerLeadsApi'

const STATUS_FILTERS = ['All', 'new', 'contacted', 'in_progress', 'completed', 'cancelled']
const STATUS_LABELS = { All: 'All', new: 'New', contacted: 'Contacted', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' }
const TYPE_FILTERS = ['All Types', 'Insurance', 'Finance', 'Service']

export function PartnerLeads() {
  const { partnerProfile } = useAuth()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null) // assignmentId being updated

  const category = partnerProfile?.partner_category

  const fetchLeads = useCallback(async () => {
    if (!category) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await getPartnerLeads(category)
    if (err) {
      setError(err.message || 'Failed to load leads.')
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }, [category])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleStatusChange = async (assignmentId, newStatus) => {
    setUpdating(assignmentId)
    const { error: err } = await updatePartnerLeadStatus(assignmentId, { partner_status: newStatus })
    if (!err) {
      setLeads((prev) =>
        prev.map((l) =>
          l.assignmentId === assignmentId ? { ...l, partnerStatus: newStatus } : l
        )
      )
    }
    setUpdating(null)
  }

  const filtered = leads.filter((l) => {
    const matchStatus = statusFilter === 'All' || l.partnerStatus === statusFilter
    const matchType = typeFilter === 'All Types' || l.type === typeFilter
    const matchSearch =
      !search ||
      (l.customer || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.vehicle || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.city || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchType && matchSearch
  })

  return (
    <PartnerLayout title="Leads" subtitle={loading ? 'Loading…' : `${filtered.length} of ${leads.length} leads`}>
      <div className="px-4 sm:px-6 py-6 space-y-4">

        {/* Search + Refresh */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search by customer, vehicle, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="w-10 h-10 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center justify-center hover:border-orange-500/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#A1A1AA] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                statusFilter === f
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                  : 'bg-[#181818] text-[#A1A1AA] border-[#2A2A2A] hover:border-[#333] hover:text-white'
              }`}
            >
              {STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                typeFilter === f
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-transparent text-[#A1A1AA] border-transparent hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-300">Failed to load leads</p>
              <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            </div>
            <button onClick={fetchLeads} className="ml-auto text-xs text-red-300 underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center">
              <Inbox className="w-7 h-7 text-[#555]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">No leads assigned yet</p>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs">
                Leads will appear here once assigned to your account by the Cardom team.
              </p>
            </div>
          </div>
        )}

        {/* No filter match */}
        {!loading && !error && leads.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-[#A1A1AA] text-sm">
            No leads match your current filters.
          </div>
        )}

        {/* Lead List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.assignmentId}
                lead={lead}
                onStatusChange={handleStatusChange}
                updating={updating === lead.assignmentId}
              />
            ))}
          </div>
        )}

        {/* Car Dealer message */}
        {!loading && category === 'car_dealer' && (
          <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-xs text-blue-400/80">
            🚗 Car Dealer lead integration will be available in a subsequent phase.
          </div>
        )}

      </div>
    </PartnerLayout>
  )
}
