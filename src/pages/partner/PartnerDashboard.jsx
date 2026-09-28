import { PartnerLayout } from '@/components/partner/PartnerLayout'
import { StatCard } from '@/components/partner/StatCard'
import { LeadCard } from '@/components/partner/LeadCard'
import { FileText, Clock, Activity, CheckCircle } from 'lucide-react'

// ── Demo data — replace with Supabase queries in Phase 2 ──────────────────
const DEMO_STATS = [
  { label: 'Total Leads', value: '24', trend: 1, trendLabel: '12% this week', icon: FileText, color: 'orange' },
  { label: 'Pending', value: '8', trend: 0, trendLabel: 'No change', icon: Clock, color: 'yellow' },
  { label: 'In Progress', value: '11', trend: 1, trendLabel: '3 updated today', icon: Activity, color: 'blue' },
  { label: 'Completed', value: '5', trend: 1, trendLabel: '2 this week', icon: CheckCircle, color: 'green' },
]

const DEMO_RECENT_LEADS = [
  { id: 'demo-1', customer: 'Rahul Sharma', vehicle: 'Honda City', type: 'Service', status: 'New', date: 'Today' },
  { id: 'demo-2', customer: 'Aman Verma', vehicle: 'Hyundai Creta', type: 'Finance', status: 'In Progress', date: 'Today' },
  { id: 'demo-3', customer: 'Priya Singh', vehicle: 'Maruti Swift', type: 'Insurance', status: 'Contacted', date: 'Yesterday' },
  { id: 'demo-4', customer: 'Vikram Patel', vehicle: 'Tata Nexon', type: 'Service', status: 'Completed', date: '2 days ago' },
]
// ─────────────────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function PartnerDashboard() {
  return (
    <PartnerLayout title="Dashboard" subtitle="Your business overview">
      <div className="px-4 sm:px-6 py-6 space-y-6">

        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-white">{getGreeting()}, Partner 👋</h2>
          <p className="text-sm text-[#A1A1AA] mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Recent Leads */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Recent Leads</h3>
            <span className="text-xs text-orange-400 cursor-pointer hover:text-orange-300">View all</span>
          </div>
          <div className="space-y-2">
            {DEMO_RECENT_LEADS.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>

        {/* Demo notice */}
        <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 text-xs text-orange-400/80">
          📋 Demo data shown — real leads will appear after Supabase integration in Phase 2.
        </div>

      </div>
    </PartnerLayout>
  )
}
