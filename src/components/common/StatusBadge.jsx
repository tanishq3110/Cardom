export function StatusBadge({ status }) {
  if (!status) return <span className="text-zinc-500">—</span>

  const normalized = String(status).toLowerCase()

  const configMap = {
    // Ride status
    searching: { label: 'Searching', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    driver_assigned: { label: 'Driver Assigned', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    arriving: { label: 'Arriving', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    started: { label: 'In Progress', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    completed: { label: 'Completed', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },

    // Partner status
    active: { label: 'Active', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    pending: { label: 'Pending', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    suspended: { label: 'Suspended', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    rejected: { label: 'Rejected', bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },

    // Car / Lead status
    new: { label: 'New', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    contacted: { label: 'Contacted', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    in_progress: { label: 'In Progress', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    sold: { label: 'Sold', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    inactive: { label: 'Inactive', bg: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20' },

    // Payments
    customer_marked_paid: { label: 'Marked Paid', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    confirmed: { label: 'Confirmed', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    failed: { label: 'Failed', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    refunded: { label: 'Refunded', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },

    // Safety / SOS
    sos_triggered: { label: 'SOS Triggered', bg: 'bg-rose-600/20 text-rose-400 border-rose-500/30 font-bold animate-pulse' },
    acknowledged: { label: 'Acknowledged', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    resolved: { label: 'Resolved', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  }

  const item = configMap[normalized] || {
    label: normalized.replace(/_/g, ' '),
    bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${item.bg}`}>
      {item.label}
    </span>
  )
}
