import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { AdminLeafletMap } from '@/components/maps/AdminLeafletMap'
import { getPartnerDetails, updatePartnerStatus } from '@/services/adminPartnersApi'
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Star,
  RefreshCw,
  Phone,
  Radio,
} from 'lucide-react'

export function PartnerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rides') // 'rides', 'reviews', 'location'

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    targetStatus: '',
    isVerified: null,
    title: '',
    message: '',
    variant: 'primary',
  })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDetails = async () => {
    setLoading(true)
    const res = await getPartnerDetails(id)
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDetails()
  }, [id])

  const handleActionClick = (targetStatus, isVerified, title, message, variant = 'primary') => {
    setModalConfig({
      isOpen: true,
      targetStatus,
      isVerified,
      title,
      message,
      variant,
    })
  }

  const handleConfirmAction = async () => {
    setActionLoading(true)
    const res = await updatePartnerStatus(
      id,
      modalConfig.targetStatus || data?.profile?.status,
      modalConfig.isVerified,
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
          <p className="text-xs text-zinc-400">Loading partner profile and performance audit...</p>
        </div>
      </AdminLayout>
    )
  }

  const profile = data?.profile || {}
  const stats = data?.stats || {}
  const location = data?.location || null

  const locationMarkers = location?.latitude && location?.longitude ? [
    {
      lat: location.latitude,
      lng: location.longitude,
      type: 'driver',
      title: profile.business_name,
      description: `Current availability location • ${profile.is_online ? 'ONLINE' : 'OFFLINE'}`,
      extra: `Updated: ${new Date(location.updated_at).toLocaleTimeString()}`,
    },
  ] : []

  return (
    <AdminLayout
      title={`Partner Profile — ${profile.business_name || 'Partner'}`}
      subtitle={`Partner ID: ${id}`}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/partners')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Partners
          </button>
        </div>
      }
    >
      {/* Header Profile & Quick Action Bar */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-xl flex-shrink-0">
              {profile.business_name?.[0] || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white">{profile.business_name}</h2>
                <StatusBadge status={profile.status} />
                {profile.is_verified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                  </span>
                )}
                {profile.is_online && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE ONLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Category: <span className="text-zinc-200 uppercase font-mono">{profile.partner_category?.replace(/_/g, ' ') || 'General Partner'}</span> • Contact: <span className="text-white font-semibold">{profile.authorized_contact_name}</span>
              </p>
            </div>
          </div>

          {/* Administrative Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {profile.status === 'pending' && (
              <button
                onClick={() =>
                  handleActionClick(
                    'active',
                    true,
                    'Approve & Verify Partner',
                    `Approve ${profile.business_name} for active dispatch and marketplace operations?`,
                    'primary'
                  )
                }
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Approve Partner
              </button>
            )}

            {profile.status === 'active' && (
              <button
                onClick={() =>
                  handleActionClick(
                    'suspended',
                    null,
                    'Suspend Partner Operations',
                    `Suspend ${profile.business_name}? Driver will not receive ride offers or leads.`,
                    'danger'
                  )
                }
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Suspend
              </button>
            )}

            {profile.status === 'suspended' && (
              <button
                onClick={() =>
                  handleActionClick(
                    'active',
                    null,
                    'Reactivate Partner',
                    `Reactivate ${profile.business_name} and restore driver access?`,
                    'primary'
                  )
                }
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Reactivate Partner
              </button>
            )}

            {!profile.is_verified && profile.status === 'active' && (
              <button
                onClick={() =>
                  handleActionClick(
                    'active',
                    true,
                    'Verify Credentials',
                    `Mark ${profile.business_name} as verified?`,
                    'primary'
                  )
                }
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Verify
              </button>
            )}
          </div>
        </div>

        {/* Details & Performance KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#222222]">
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Completed Rides</span>
            <div className="text-xl font-black text-emerald-400 mt-1">{stats.completedRides || 0}</div>
            <span className="text-[10px] text-zinc-400">{stats.totalAssigned || 0} total offers</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Average Rating</span>
            <div className="text-xl font-black text-yellow-400 mt-1 flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {stats.avgRating || '—'}
            </div>
            <span className="text-[10px] text-zinc-400">{stats.reviewCount || 0} reviews</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Rejected Rides</span>
            <div className="text-xl font-black text-rose-400 mt-1">{stats.rejectedRides || 0}</div>
            <span className="text-[10px] text-zinc-400">Declined offers</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828]">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Safety Incidents</span>
            <div className={`text-xl font-black mt-1 ${stats.safetyIncidents > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {stats.safetyIncidents || 0}
            </div>
            <span className="text-[10px] text-zinc-400">SOS triggers</span>
          </div>
        </div>
      </div>

      {/* Profile Details & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-orange-400" /> Business Credentials
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Registration Number</span>
              <p className="font-mono text-white mt-0.5">{profile.registration_number || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">GSTIN</span>
              <p className="font-mono text-white mt-0.5">{profile.gstin || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">UPI ID</span>
              <p className="font-mono text-emerald-400 mt-0.5">{profile.upi_id || 'Not configured'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-400" /> Contact Information
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Authorized Contact</span>
              <p className="text-white mt-0.5">{profile.authorized_contact_name}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Phone</span>
              <p className="font-mono text-white mt-0.5">{profile.phone || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Email</span>
              <p className="text-white mt-0.5 truncate">{profile.email || '—'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Operating Address
          </h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Street Address</span>
              <p className="text-white mt-0.5">{profile.address || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">City / State / Pincode</span>
              <p className="text-white mt-0.5">
                {[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] pt-2">
        <button
          onClick={() => setActiveTab('rides')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'rides' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Assigned Rides ({data?.assignments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'reviews' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" /> Customer Reviews ({data?.ratings?.length || 0})
        </button>
        {location?.latitude && location?.longitude && (
          <button
            onClick={() => setActiveTab('location')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'location' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> GPS Location Map
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5">
        {activeTab === 'rides' && (
          <div className="space-y-3">
            {data?.assignments?.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No ride assignments on record for this partner.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#202020] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Assigned Date</th>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Partner Status</th>
                      <th className="py-2.5 px-3">Pickup</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D1D1D]">
                    {data.assignments.map((a) => (
                      <tr key={a.id} className="hover:bg-[#1A1A1A]">
                        <td className="py-3 px-3 font-mono text-zinc-400">
                          {new Date(a.assigned_at).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {a.ride_bookings?.booking_reference || a.ride_id}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={a.partner_status} />
                        </td>
                        <td className="py-3 px-3 text-zinc-300 max-w-xs truncate">
                          {a.ride_bookings?.pickup_address || '—'}
                        </td>
                        <td className="py-3 px-3 text-zinc-300 max-w-xs truncate">
                          {a.ride_bookings?.drop_address || '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => navigate(`/rides/${a.ride_id}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#222] hover:bg-[#2C2C2C] text-orange-400 font-semibold"
                          >
                            Inspect Ride
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {data?.ratings?.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No reviews received yet.</p>
            ) : (
              <div className="space-y-3">
                {data.ratings.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-[#1A1A1A] border border-[#292929] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}`} />
                        ))}
                        <span className="ml-1 text-xs font-bold text-white font-mono">{r.rating}/5</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    {r.review && <p className="text-xs text-zinc-300">"{r.review}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'location' && locationMarkers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">
                Coordinates: {location.latitude}, {location.longitude}
              </span>
              <span className="text-xs text-zinc-500">
                Last updated: {new Date(location.updated_at).toLocaleString('en-IN')}
              </span>
            </div>
            <AdminLeafletMap
              center={[location.latitude, location.longitude]}
              zoom={14}
              markers={locationMarkers}
            />
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
        onConfirm={handleConfirmAction}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </AdminLayout>
  )
}
