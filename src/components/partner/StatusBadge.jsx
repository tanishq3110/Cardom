const STATUS_STYLES = {
  'New': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Contacted': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'In Progress': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Completed': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Rejected': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Scheduled': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style}`}>
      {status}
    </span>
  )
}
