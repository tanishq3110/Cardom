import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { getCarDetails, moderateCar } from '@/services/adminCarsApi'
import {
  ArrowLeft,
  Car,
  CheckCircle,
  XCircle,
  Tag,
  User,
  MessageSquare,
  RefreshCw,
  Phone,
  Mail,
} from 'lucide-react'

export function CarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    targetStatus: '',
    title: '',
    message: '',
    variant: 'primary',
  })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDetails = async () => {
    setLoading(true)
    const res = await getCarDetails(id)
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDetails()
  }, [id])

  const handlePromptModerate = (targetStatus, title, message, variant = 'primary') => {
    setModalConfig({
      isOpen: true,
      targetStatus,
      title,
      message,
      variant,
    })
  }

  const handleConfirmModerate = async () => {
    setActionLoading(true)
    const res = await moderateCar(
      id,
      modalConfig.targetStatus,
      modalConfig.title
    )
    setActionLoading(false)

    if (res.success) {
      setModalConfig((prev) => ({ ...prev, isOpen: false }))
      fetchDetails()
    } else {
      alert(`Action failed: ${res.error}`)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
          <p className="text-xs text-zinc-400">Loading car listing details...</p>
        </div>
      </AdminLayout>
    )
  }

  const car = data?.car || {}
  const seller = data?.seller || null
  const inquiries = data?.inquiries || []

  return (
    <AdminLayout
      title={`Vehicle Listing — ${car.brand || car.make || ''} ${car.model || car.title || ''}`}
      subtitle={`Listing ID: ${id}`}
      actions={
        <button
          onClick={() => navigate('/cars')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Listings
        </button>
      }
    >
      {/* Top Banner & Moderation Actions */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 rounded-xl bg-[#202020] border border-[#2D2D2D] overflow-hidden flex-shrink-0">
              {car.image_url || car.image ? (
                <img src={car.image_url || car.image} alt="Vehicle" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Car className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{car.brand || car.make} {car.model || car.title}</h2>
                <StatusBadge status={car.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 font-mono">
                <span>Year: {car.year || '—'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">₹{Number(car.price || 0).toLocaleString()}</span>
                <span>•</span>
                <span>Location: {car.location || 'India'}</span>
              </div>
            </div>
          </div>

          {/* Moderation Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {car.status !== 'active' && (
              <button
                onClick={() =>
                  handlePromptModerate(
                    'active',
                    'Approve Listing',
                    'Make this vehicle listing active and visible to buyers on the public Cardom website?',
                    'primary'
                  )
                }
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Publish Active
              </button>
            )}

            {car.status === 'active' && (
              <button
                onClick={() =>
                  handlePromptModerate(
                    'inactive',
                    'Hide Listing',
                    'Hide this listing from the public website?',
                    'warning'
                  )
                }
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Tag className="w-4 h-4" /> Hide / Inactive
              </button>
            )}

            {car.status !== 'rejected' && (
              <button
                onClick={() =>
                  handlePromptModerate(
                    'rejected',
                    'Reject Listing',
                    'Reject this listing? It will not appear in search or recommendations.',
                    'danger'
                  )
                }
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Specifications & Seller Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specifications */}
        <div className="md:col-span-2 rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Technical Specifications</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Fuel</span>
              <p className="font-semibold text-white mt-1">{car.fuel_type || car.fuel || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Transmission</span>
              <p className="font-semibold text-white mt-1">{car.transmission || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Mileage</span>
              <p className="font-semibold text-white mt-1">{car.mileage ? `${Number(car.mileage).toLocaleString()} km` : '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Model Year</span>
              <p className="font-semibold text-white mt-1">{car.year || '—'}</p>
            </div>
          </div>

          {car.description && (
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Seller Description</span>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{car.description}</p>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-orange-400" /> Seller Information
          </h3>
          {seller ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center">
                  {seller.full_name?.[0] || 'S'}
                </div>
                <div>
                  <div className="font-bold text-white">{seller.full_name || 'Individual Seller'}</div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate max-w-xs">{seller.id}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#202020] space-y-1.5 text-zinc-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">{seller.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-mono">{seller.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Seller information unavailable or submitted as guest/dealer inventory.</p>
          )}
        </div>
      </div>

      {/* Buyer Inquiries Section */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Buyer Inquiries for this Listing ({inquiries.length})
        </h3>

        {inquiries.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No inquiries submitted for this vehicle yet.</p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-4 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Inquiry #{String(inq.id).slice(0, 8)}</span>
                    <StatusBadge status={inq.status} />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(inq.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">"{inq.message}"</p>
                {inq.phone && (
                  <p className="text-[10px] text-zinc-400 font-mono">Buyer Contact: {inq.phone}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Confirm"
        confirmVariant={modalConfig.variant}
        isLoading={actionLoading}
        onConfirm={handleConfirmModerate}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </AdminLayout>
  )
}
