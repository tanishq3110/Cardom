import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getLeadDetails } from '@/services/adminLeadsApi'
import {
  ArrowLeft,
  Layers,
  User,
  Briefcase,
  RefreshCw,
} from 'lucide-react'

export function LeadDetailPage() {
  const { type, id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDetails = async () => {
    setLoading(true)
    const res = await getLeadDetails(type, id)
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDetails()
  }, [type, id])

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
          <p className="text-xs text-zinc-400">Loading lead submission records...</p>
        </div>
      </AdminLayout>
    )
  }

  const lead = data?.lead || {}
  const userProfile = data?.userProfile || null
  const assignment = data?.assignment || null

  return (
    <AdminLayout
      title={`Lead Dossier — ${String(type).toUpperCase()} #${String(id).slice(0, 8)}`}
      subtitle={`Created on ${new Date(lead.created_at).toLocaleString('en-IN')}`}
      actions={
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Leads
        </button>
      }
    >
      {/* Top Summary Banner */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-lg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white uppercase">{type} Lead</span>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Submitted by: <span className="text-white font-semibold">{lead.contact_name || lead.customer || 'Customer'}</span>
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-400">
            ID: <span className="text-white">{id}</span>
          </div>
        </div>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Contact */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-blue-400" /> Customer Information
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Full Name</span>
              <p className="text-white font-semibold mt-0.5">{lead.contact_name || lead.customer || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Phone Number</span>
              <p className="text-white font-mono mt-0.5">{lead.contact_phone || lead.phone || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Email</span>
              <p className="text-white mt-0.5">{lead.contact_email || '—'}</p>
            </div>
            {userProfile && (
              <div className="pt-2 border-t border-[#222222]">
                <button
                  onClick={() => navigate(`/users/${userProfile.id}`)}
                  className="text-xs text-orange-400 hover:underline flex items-center gap-1"
                >
                  View linked user profile →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lead Specific Parameters */}
        <div className="md:col-span-2 rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Lead Specific Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {type === 'insurance' && (
              <>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Vehicle</span>
                  <p className="text-white font-bold mt-1">{lead.car_brand} {lead.car_model}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Year & Fuel</span>
                  <p className="text-white font-bold mt-1">{lead.registration_year || '—'} • {lead.fuel_type || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">City</span>
                  <p className="text-white font-bold mt-1">{lead.city || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Previous Policy</span>
                  <p className="text-white font-bold mt-1">{lead.previous_policy_status || '—'}</p>
                </div>
              </>
            )}

            {type === 'finance' && (
              <>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Car Price / Down Payment</span>
                  <p className="text-white font-bold mt-1">₹{Number(lead.car_price || 0).toLocaleString()} (Down: ₹{Number(lead.down_payment || 0).toLocaleString()})</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Loan Amount Requested</span>
                  <p className="text-emerald-400 font-bold mt-1 font-mono">₹{Number(lead.loan_amount || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Tenure & Est. EMI</span>
                  <p className="text-white font-bold mt-1">{lead.tenure_years} yrs • ₹{Number(lead.monthly_emi || 0).toLocaleString()}/mo</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Employment & Income</span>
                  <p className="text-white font-bold mt-1">{lead.employment_type || '—'} • {lead.annual_income || '—'}</p>
                </div>
              </>
            )}

            {type === 'service' && (
              <>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Vehicle Name</span>
                  <p className="text-white font-bold mt-1">{lead.vehicle_name} ({lead.vehicle_fuel || '—'})</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Center & City</span>
                  <p className="text-white font-bold mt-1">{lead.service_center_name} ({lead.service_center_city})</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Total Quote</span>
                  <p className="text-emerald-400 font-bold mt-1 font-mono">₹{Number(lead.total_amount || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Doorstep Valet</span>
                  <p className="text-white font-bold mt-1">{lead.doorstep_valet ? 'Yes' : 'No'}</p>
                </div>
              </>
            )}

            {type === 'inquiry' && (
              <div className="sm:col-span-2 p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Buyer Message</span>
                <p className="text-white text-xs mt-1 leading-relaxed">"{lead.message}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partner Assignment Status */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Partner Assignment Status
        </h3>

        {assignment ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-[#282828]">
            <div>
              <div className="font-bold text-white">{assignment.partner_profiles?.business_name || 'Assigned Partner'}</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                Status: <span className="font-semibold text-white">{assignment.partner_status}</span> • Assigned at: {new Date(assignment.assigned_at).toLocaleString('en-IN')}
              </div>
            </div>
            <button
              onClick={() => navigate(`/partners/${assignment.partner_id}`)}
              className="px-3 py-1.5 rounded-lg bg-[#242424] text-xs font-semibold text-orange-400 hover:text-white"
            >
              Inspect Partner
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">This lead is currently unassigned or handled via public web dispatch.</p>
        )}
      </div>
    </AdminLayout>
  )
}
