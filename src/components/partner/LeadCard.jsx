import { ArrowRight, Car, Shield, CreditCard, Wrench } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

const TYPE_ICON = {
  Insurance: Shield,
  Finance: CreditCard,
  Service: Wrench,
  Inquiry: Car,
}

const TYPE_COLOR = {
  Insurance: 'text-blue-400',
  Finance: 'text-green-400',
  Service: 'text-orange-400',
  Inquiry: 'text-purple-400',
}

export function LeadCard({ lead, onView }) {
  const Icon = TYPE_ICON[lead.type] || Car
  const typeColor = TYPE_COLOR[lead.type] || 'text-zinc-400'

  return (
    <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-4 hover:border-[#333] transition-colors group">
      <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
        <Icon className={`w-5 h-5 ${typeColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white truncate">{lead.vehicle}</span>
          <span className={`text-xs font-medium ${typeColor}`}>{lead.type}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A1A1AA] truncate">Customer: {lead.customer}</span>
          <span className="text-xs text-[#A1A1AA]">{lead.date}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={lead.status} />
        <button
          onClick={() => onView?.(lead)}
          className="w-8 h-8 rounded-lg bg-[#2A2A2A] hover:bg-orange-500/20 border border-[#333] hover:border-orange-500/40 flex items-center justify-center transition-all group-hover:border-orange-500/20"
        >
          <ArrowRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-orange-400" />
        </button>
      </div>
    </div>
  )
}
