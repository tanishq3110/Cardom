import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { getPartners, updatePartnerStatus } from '@/services/adminPartnersApi'
import {
  Search,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'

export function PartnersPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [partners, setPartners] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  // Confirmation modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    partnerId: null,
    partnerName: '',
    targetStatus: '',
    isVerified: null,
    title: '',
    message: '',
    variant: 'primary',
  })
  const [actionLoading, setActionLoading] = useState(false)

  const limit = 15

  const fetchPartners = async () => {
    setLoading(true)
    const { data, total: count } = await getPartners({
      page,
      limit,
      search,
      status,
      category,
    })
    setPartners(data)
    setTotal(count)
    setLoading(false)
  }

  useEffect(() => {
    fetchPartners()
  }, [page, status, category])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchPartners()
  }

  const promptStatusChange = (partner, targetStatus, isVerified = null, title, message, variant = 'primary') => {
    setModalConfig({
      isOpen: true,
      partnerId: partner.id,
      partnerName: partner.business_name,
      targetStatus,
      isVerified,
      title,
      message,
      variant,
    })
  }

  const handleConfirmStatusChange = async () => {
    setActionLoading(true)
    const res = await updatePartnerStatus(
      modalConfig.partnerId,
      modalConfig.targetStatus,
      modalConfig.isVerified,
      `Admin changed status of ${modalConfig.partnerName} to ${modalConfig.targetStatus}`
    )
    setActionLoading(false)

    if (res.success) {
      setModalConfig((prev) => ({ ...prev, isOpen: false }))
      fetchPartners()
    } else {
      alert(`Error updating partner: ${res.error}`)
    }
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Partner Operations & Fleet Management"
      subtitle="Drivers, service centers, dealerships, and accredited Cardom partners"
      actions={
        <button
          onClick={fetchPartners}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors"
          title="Refresh Partners"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, phone, city..."
            className="w-full bg-[#141414] border border-[#282828] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Categories</option>
            <option value="car_dealer">Car Dealer</option>
            <option value="service_center">Service Center</option>
            <option value="insurance">Insurance Partner</option>
            <option value="finance">Finance Partner</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
            <p className="text-xs text-zinc-400">Loading partner fleet...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Briefcase className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Partners Found</p>
            <p className="text-xs text-zinc-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-[#101010]">
                  <th className="py-3 px-4">Partner Business</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Online</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {p.business_name?.[0] || 'P'}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {p.business_name}
                            {p.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <div className="text-[10px] text-zinc-400">{p.authorized_contact_name} • {p.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 uppercase text-[10px]">
                      {p.partner_category ? p.partner_category.replace(/_/g, ' ') : 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4">
                      {p.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {p.is_online ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">Offline</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {p.city ? `${p.city}, ${p.state || 'India'}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === 'pending' && (
                          <button
                            onClick={() =>
                              promptStatusChange(
                                p,
                                'active',
                                true,
                                'Approve & Verify Partner',
                                `Approve ${p.business_name} and grant immediate driver/dispatch access?`,
                                'primary'
                              )
                            }
                            className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            title="Approve Partner"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {p.status === 'active' && (
                          <button
                            onClick={() =>
                              promptStatusChange(
                                p,
                                'suspended',
                                null,
                                'Suspend Partner',
                                `Are you sure you want to suspend ${p.business_name}? They will be blocked from receiving rides and dispatch offers.`,
                                'danger'
                              )
                            }
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Suspend Partner"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/partners/${p.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-orange-400 font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#222222] flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Confirm Action"
        confirmVariant={modalConfig.variant}
        isLoading={actionLoading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </AdminLayout>
  )
}
