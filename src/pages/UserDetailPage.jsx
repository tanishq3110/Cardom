import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getUserDetails } from '@/services/adminUsersApi'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  AlertOctagon,
  Star,
  RefreshCw,
  Phone,
  Mail,
} from 'lucide-react'

export function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rides') // 'rides', 'leads', 'safety', 'ratings'

  const fetchDetails = async () => {
    setLoading(true)
    const res = await getUserDetails(id)
    setData(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDetails()
  }, [id])

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
          <p className="text-xs text-zinc-400">Loading comprehensive user records...</p>
        </div>
      </AdminLayout>
    )
  }

  const profile = data?.profile || {}
  const stats = data?.stats || {}

  return (
    <AdminLayout
      title={`Customer Profile — ${profile.full_name || 'Cardom User'}`}
      subtitle={`User ID: ${id}`}
      actions={
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#3D3D3D] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Users
        </button>
      }
    >
      {/* User Header & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* User Card */}
        <div className="md:col-span-1 rounded-2xl bg-[#141414] border border-[#262626] p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-lg">
              {profile.full_name?.[0] || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{profile.full_name || 'Cardom Customer'}</h3>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Customer Account</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#202020] text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="truncate">{profile.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="font-mono">{profile.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span>{profile.location || 'India'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span>Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-[#141414] border border-[#262626] p-4">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Total Rides</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalRides || 0}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">{stats.completedRides || 0} completed</span>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-[#262626] p-4">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Cancellations</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{stats.cancelledRides || 0}</div>
            <span className="text-[10px] text-zinc-500">Total ride cancels</span>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-[#262626] p-4">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Reviews Given</span>
            <div className="text-2xl font-black text-yellow-400 mt-1">{stats.totalRatings || 0}</div>
            <span className="text-[10px] text-zinc-500">Submitted reviews</span>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-[#262626] p-4">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">SOS Triggers</span>
            <div className={`text-2xl font-black mt-1 ${stats.safetyIncidents > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {stats.safetyIncidents || 0}
            </div>
            <span className="text-[10px] text-zinc-500">Emergency events</span>
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
          <MapPin className="w-3.5 h-3.5" />
          Ride History ({data?.rides?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'leads' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Leads & Inquiries
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'safety' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          Safety & SOS ({data?.safetyEvents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'ratings' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          Ratings & Reviews ({data?.ratings?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5">
        {activeTab === 'rides' && (
          <div className="space-y-3">
            {data?.rides?.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No ride bookings found for this customer.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#202020] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Pickup</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Fare</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D1D1D]">
                    {data.rides.map((r) => (
                      <tr key={r.id} className="hover:bg-[#1A1A1A]">
                        <td className="py-3 px-3 font-mono font-bold text-white">{r.booking_reference}</td>
                        <td className="py-3 px-3 uppercase text-zinc-400">{r.ride_type}</td>
                        <td className="py-3 px-3 text-zinc-300 max-w-xs truncate">{r.pickup_address}</td>
                        <td className="py-3 px-3 text-zinc-300 max-w-xs truncate">{r.drop_address}</td>
                        <td className="py-3 px-3 font-bold text-white">₹{Number(r.final_fare || r.estimated_fare || 0).toLocaleString()}</td>
                        <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => navigate(`/rides/${r.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#222] hover:bg-[#2C2C2C] text-orange-400 font-semibold"
                          >
                            Inspect
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

        {activeTab === 'safety' && (
          <div className="space-y-3">
            {data?.safetyEvents?.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No safety or SOS events on record for this customer.</p>
            ) : (
              <div className="space-y-3">
                {data.safetyEvents.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-[#1A1A1A] border border-[#292929] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} />
                        <span className="text-xs font-mono text-zinc-400">{new Date(s.created_at).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-xs text-white mt-1.5">{s.message || 'Emergency assistance triggered on active ride.'}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/rides/${s.ride_id}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#242424] text-xs font-semibold text-orange-400 hover:text-white"
                    >
                      View Ride
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-3">
            {data?.ratings?.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No ride reviews submitted by this customer.</p>
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

        {activeTab === 'leads' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Submitted Website Inquiries & Leads</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Insurance Leads</span>
                <div className="text-lg font-bold text-white mt-1">{data?.leads?.insurance?.length || 0}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Finance Leads</span>
                <div className="text-lg font-bold text-white mt-1">{data?.leads?.finance?.length || 0}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Service Requests</span>
                <div className="text-lg font-bold text-white mt-1">{data?.leads?.services?.length || 0}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#282828]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Car Inquiries</span>
                <div className="text-lg font-bold text-white mt-1">{data?.leads?.inquiries?.length || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
