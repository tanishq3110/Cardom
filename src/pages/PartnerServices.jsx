import { useState, useEffect, useCallback } from 'react'
import { PartnerLayout } from '@/components/PartnerLayout'
import { LeadCard } from '@/components/LeadCard'
import { Wrench, Inbox, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getPartnerLeads, updatePartnerLeadStatus } from '@/services/partnerLeadsApi'

const STATUS_FILTERS = ['All', 'scheduled', 'in_progress', 'completed', 'cancelled']
const STATUS_LABELS = { All: 'All', scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' }

/**
 * PartnerServices — shown only for service_center category.
 * Displays real service_requests assigned to this partner.
 * All other categories see a "not applicable" message.
 */
export function PartnerServices() {
  const { partnerProfile } = useAuth()
  const category = partnerProfile?.partner_category

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)

  const fetchRequests = useCallback(async () => {
    if (category !== 'service_center') {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await getPartnerLeads('service_center')
    if (err) {
      setError(err.message || 'Failed to load service requests.')
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }, [category])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleStatusChange = async (assignmentId, newStatus) => {
    setUpdating(assignmentId)
    const { error: err } = await updatePartnerLeadStatus(assignmentId, { partner_status: newStatus })
    if (!err) {
      setRequests((prev) =>
        prev.map((r) =>
          r.assignmentId === assignmentId ? { ...r, partnerStatus: newStatus } : r
        )
      )
    }
    setUpdating(null)
  }

  // Filter by partner_status (mapped from sourceStatus for service requests)
  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === 'All' || r.sourceStatus === statusFilter || r.partnerStatus === statusFilter
    const matchSearch =
      !search ||
      (r.vehicle || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.serviceCenter || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.customer || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  // ── Non-service-center partners ───────────────────────────────────────────
  if (category !== 'service_center') {
    return (
      <PartnerLayout title="Services" subtitle="Service requests">
        <div className="px-4 sm:px-6 py-6">
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center">
              <Wrench className="w-7 h-7 text-[#555]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Not applicable</p>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs">
                The Services tab is available for Service Center partners only.
              </p>
            </div>
          </div>
        </div>
      </PartnerLayout>
    )
  }

  // ── Service Center view ───────────────────────────────────────────────────
  return (
    <PartnerLayout
      title="Service Requests"
      subtitle={loading ? 'Loading…' : `${filtered.length} of ${requests.length} requests`}
    >
      <div className="px-4 sm:px-6 py-6 space-y-4">

        {/* Search + Refresh */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by vehicle, booking ref, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={fetchRequests}
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300">Failed to load service requests</p>
              <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            </div>
            <button onClick={fetchRequests} className="text-xs text-red-300 underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center">
              <Inbox className="w-7 h-7 text-[#555]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">No service requests assigned</p>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs">
                Service requests will appear here once assigned to your service center.
              </p>
            </div>
          </div>
        )}

        {/* No filter match */}
        {!loading && !error && requests.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-[#A1A1AA] text-sm">
            No requests match your current filters.
          </div>
        )}

        {/* Request List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((req) => (
              <LeadCard
                key={req.assignmentId}
                lead={req}
                onStatusChange={handleStatusChange}
                updating={updating === req.assignmentId}
              />
            ))}
          </div>
        )}

      </div>
    </PartnerLayout>
  )
}
