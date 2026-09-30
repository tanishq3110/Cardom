const STATUS_CONFIG = {
  // partner_status values (lowercase snake_case from DB)
  new:          { label: 'New',         style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  contacted:    { label: 'Contacted',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  in_progress:  { label: 'In Progress', style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  completed:    { label: 'Completed',   style: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled:    { label: 'Cancelled',   style: 'bg-red-500/15 text-red-400 border-red-500/30' },
  // service source statuses
  scheduled:    { label: 'Scheduled',   style: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  quoted:       { label: 'Quoted',      style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  approved:     { label: 'Approved',    style: 'bg-green-500/15 text-green-400 border-green-500/30' },
  rejected:     { label: 'Rejected',    style: 'bg-red-500/15 text-red-400 border-red-500/30' },
  closed:       { label: 'Closed',      style: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
  // legacy Title Case keys for backward compat
  'New':         { label: 'New',         style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  'Contacted':   { label: 'Contacted',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  'In Progress': { label: 'In Progress', style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  'Completed':   { label: 'Completed',   style: 'bg-green-500/15 text-green-400 border-green-500/30' },
  'Rejected':    { label: 'Rejected',    style: 'bg-red-500/15 text-red-400 border-red-500/30' },
  'Scheduled':   { label: 'Scheduled',   style: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status || '—', style: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.style}`}>
      {config.label}
    </span>
  )
}
