import { useState } from 'react'
import { PartnerLayout } from '@/components/partner/PartnerLayout'
import { LeadCard } from '@/components/partner/LeadCard'
import { Search } from 'lucide-react'

// ── Demo data ─────────────────────────────────────────────────────────────
const DEMO_LEADS = [
  { id: 'demo-1', customer: 'Rahul Sharma', vehicle: 'Honda City 2022', type: 'Service', status: 'New', date: 'Today' },
  { id: 'demo-2', customer: 'Aman Verma', vehicle: 'Hyundai Creta', type: 'Finance', status: 'In Progress', date: 'Today' },
  { id: 'demo-3', customer: 'Priya Singh', vehicle: 'Maruti Swift', type: 'Insurance', status: 'Contacted', date: 'Yesterday' },
  { id: 'demo-4', customer: 'Vikram Patel', vehicle: 'Tata Nexon EV', type: 'Service', status: 'Completed', date: '2 days ago' },
  { id: 'demo-5', customer: 'Neha Gupta', vehicle: 'Kia Seltos', type: 'Finance', status: 'New', date: '3 days ago' },
  { id: 'demo-6', customer: 'Suresh Kumar', vehicle: 'Toyota Fortuner', type: 'Insurance', status: 'Rejected', date: '4 days ago' },
  { id: 'demo-7', customer: 'Anjali Mehta', vehicle: 'MG Hector', type: 'Service', status: 'Contacted', date: '5 days ago' },
  { id: 'demo-8', customer: 'Deepak Roy', vehicle: 'Honda Amaze', type: 'Finance', status: 'Completed', date: '1 week ago' },
]
// ─────────────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['All', 'New', 'Contacted', 'In Progress', 'Completed', 'Rejected']
const TYPE_FILTERS = ['All Types', 'Service', 'Finance', 'Insurance']

export function PartnerLeads() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [search, setSearch] = useState('')

  const filtered = DEMO_LEADS.filter((l) => {
    const matchStatus = statusFilter === 'All' || l.status === statusFilter
    const matchType = typeFilter === 'All Types' || l.type === typeFilter
    const matchSearch = !search || l.customer.toLowerCase().includes(search.toLowerCase()) || l.vehicle.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchType && matchSearch
  })

  return (
    <PartnerLayout title="Leads" subtitle={`${filtered.length} leads`}>
      <div className="px-4 sm:px-6 py-6 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors ${
                statusFilter === f
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                  : 'bg-[#181818] text-[#A1A1AA] border-[#2A2A2A] hover:border-[#333] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                typeFilter === f
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-transparent text-[#A1A1AA] border-transparent hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lead List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#A1A1AA] text-sm">No leads match your filters.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        )}

        <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 text-xs text-orange-400/80">
          📋 Demo data — real leads from Supabase in Phase 2.
        </div>
      </div>
    </PartnerLayout>
  )
}
