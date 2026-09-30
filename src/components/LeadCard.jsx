import { useState } from 'react'
import { ArrowRight, Car, Shield, CreditCard, Wrench, ChevronDown, Loader2, Phone, Mail } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

const TYPE_ICON = { Insurance: Shield, Finance: CreditCard, Service: Wrench, Inquiry: Car }
const TYPE_COLOR = {
  Insurance: 'text-blue-400',
  Finance: 'text-green-400',
  Service: 'text-orange-400',
  Inquiry: 'text-purple-400',
}

const PARTNER_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <span className="text-[10px] text-[#555] uppercase tracking-wider">{label}</span>
      <p className="text-xs text-white font-medium mt-0.5 break-words">{value}</p>
    </div>
  )
}

export function LeadCard({ lead, onStatusChange, onView, updating }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = TYPE_ICON[lead.type] || Car
  const typeColor = TYPE_COLOR[lead.type] || 'text-zinc-400'

  const handleStatusSelect = (e) => {
    e.stopPropagation()
    const newStatus = e.target.value
    if (newStatus !== lead.partnerStatus && onStatusChange) {
      onStatusChange(lead.assignmentId, newStatus)
    }
  }

  const assignedDate = lead.assignedAt
    ? new Date(lead.assignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const createdDate = lead.createdAt
    ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#333] transition-colors">
      {/* Main row */}
      <div
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
          <Icon className={`w-5 h-5 ${typeColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-white truncate">{lead.vehicle || lead.customer}</span>
            <span className={`text-xs font-medium flex-shrink-0 ${typeColor}`}>{lead.type}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lead.customer && lead.customer !== lead.vehicle && (
              <span className="text-xs text-[#A1A1AA] truncate">{lead.customer}</span>
            )}
            {lead.city && <span className="text-xs text-[#555]">{lead.city}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={lead.partnerStatus} />
          <ChevronDown className={`w-4 h-4 text-[#555] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="border-t border-[#2A2A2A] px-4 pb-4 pt-3 space-y-4">

          {/* Contact Actions */}
          {(lead.phone || lead.email) && (
            <div className="flex gap-2">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              )}
            </div>
          )}

          {/* Lead Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Customer" value={lead.customer !== lead.vehicle ? lead.customer : null} />
            <DetailRow label="Phone" value={lead.phone} />
            <DetailRow label="Email" value={lead.email} />
            <DetailRow label="City" value={lead.city} />
            <DetailRow label="Vehicle" value={lead.vehicle} />
            <DetailRow label="Vehicle Detail" value={lead.vehicleDetail} />
            {/* Insurance-specific */}
            <DetailRow label="Previous Policy" value={lead.previousPolicy} />
            {/* Finance-specific */}
            <DetailRow label="Loan Amount" value={lead.loanAmount ? `₹${Number(lead.loanAmount).toLocaleString('en-IN')}` : null} />
            <DetailRow label="Monthly EMI" value={lead.monthlyEmi ? `₹${Number(lead.monthlyEmi).toLocaleString('en-IN')}/mo` : null} />
            <DetailRow label="Employment" value={lead.employmentType} />
            <DetailRow label="Annual Income" value={lead.annualIncome} />
            {/* Service-specific */}
            <DetailRow label="Booking Ref" value={lead.leadType === 'service' ? lead.customer : null} />
            <DetailRow label="Service Center" value={lead.serviceCenter} />
            <DetailRow
              label="Scheduled"
              value={lead.scheduledDate ? `${lead.scheduledDate}${lead.scheduledTime ? ' ' + lead.scheduledTime : ''}` : null}
            />
            <DetailRow label="Total Amount" value={lead.totalAmount ? `₹${Number(lead.totalAmount).toLocaleString('en-IN')}` : null} />
            <DetailRow label="Doorstep Valet" value={lead.doorsepValet === true ? 'Yes' : lead.doorsepValet === false ? 'No' : null} />
            {/* Dates */}
            <DetailRow label="Lead Created" value={createdDate} />
            <DetailRow label="Assigned On" value={assignedDate} />
          </div>

          {/* Source Status vs Partner Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Source Status</p>
              <StatusBadge status={lead.sourceStatus} />
            </div>
            <div>
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Partner Status</p>
              <StatusBadge status={lead.partnerStatus} />
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Notes</p>
              <p className="text-xs text-[#A1A1AA]">{lead.notes}</p>
            </div>
          )}

          {/* Update Status */}
          {onStatusChange && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#555] flex-shrink-0">Update status:</span>
              <div className="relative flex-1">
                <select
                  value={lead.partnerStatus}
                  onChange={handleStatusSelect}
                  disabled={updating}
                  className="w-full appearance-none bg-[#1A1A1A] border border-[#333] text-white text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50"
                >
                  {PARTNER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {updating
                  ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-orange-400 animate-spin" />
                  : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#555] pointer-events-none" />}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onView?.(lead) }}
                className="w-8 h-8 rounded-lg bg-[#2A2A2A] hover:bg-orange-500/20 border border-[#333] hover:border-orange-500/40 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
              >
                <ArrowRight className="w-4 h-4 text-[#A1A1AA]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
