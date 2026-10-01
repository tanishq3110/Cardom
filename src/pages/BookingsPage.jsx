import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Car,
  Wrench,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MapPin,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchBuyerInquiries } from '@/services/inquiriesApi'
import { getMyRideBookings } from '@/services/rideBookingApi'
import { getRideType } from '@/config/rideTypes'
import { cn } from '@/lib/utils'

// ─── Status badge matching reference image ────────────────────────────────────
function StatusPill({ status }) {
  const s = (status || 'scheduled').toLowerCase()
  const map = {
    scheduled:       { label: 'Scheduled',      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    in_progress:     { label: 'In Progress',    bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    completed:       { label: 'Completed',      bg: 'bg-green-500/15 text-green-400 border-green-500/30' },
    cancelled:       { label: 'Cancelled',      bg: 'bg-red-500/15 text-red-400 border-red-500/30' },
    new:             { label: 'Pending',        bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    read:            { label: 'Acknowledged',   bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    searching:       { label: 'Searching',      bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    driver_assigned: { label: 'Driver Assigned',bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    arriving:        { label: 'Arriving',       bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    started:         { label: 'Ride Started',   bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  }
  const config = map[s] || { label: status, bg: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider', config.bg)}>
      {config.label}
    </span>
  )
}

export function BookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [rides, setRides] = useState([])

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      if (user?.id) {
        const { data: sData } = await supabase
          .from('service_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (sData) setServices(sData)

        const { data: inqData } = await fetchBuyerInquiries(user.id)
        if (inqData) setInquiries(inqData)

        const { data: rideData } = await getMyRideBookings()
        if (rideData) setRides(rideData)
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadBookings()
    if (user?.id) {
      const channel = supabase
        .channel(`bookings_page_rides_${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_bookings', filter: `user_id=eq.${user.id}` }, () => { loadBookings() })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [loadBookings, user?.id])

  const allItems = [
    ...services.map((s) => ({ ...s, _type: 'service', _date: s.created_at || s.scheduled_date })),
    ...inquiries.map((i) => ({ ...i, _type: 'inquiry', _date: i.created_at })),
    ...rides.map((r) => ({ ...r, _type: 'ride', _date: r.created_at })),
  ].sort((a, b) => new Date(b._date || 0) - new Date(a._date || 0))

  const TABS = [
    { id: 'all', label: 'All', count: allItems.length },
    { id: 'rides', label: 'Rides', count: rides.length },
    { id: 'services', label: 'Services', count: services.length },
    { id: 'inquiries', label: 'Cars', count: inquiries.length },
  ]

  const filteredItems = allItems.filter((item) => {
    if (activeTab === 'all') return true
    if (activeTab === 'services') return item._type === 'service'
    if (activeTab === 'inquiries') return item._type === 'inquiry'
    if (activeTab === 'rides') return item._type === 'ride'
    return true
  })

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white flex flex-col pb-24">
      {/* ── Sticky Header + Tabs ── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-12 pb-0">
        <h1 className="text-2xl font-black text-white mb-4">My Bookings</h1>

        {/* Tab Bar matching reference image */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border',
                activeTab === tab.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-[0_2px_10px_rgba(249,115,22,0.3)]'
                  : 'bg-[#111111] border-[#2A2A2A] text-[#A1A1AA]',
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn('px-1.5 rounded-full text-[9px] font-black', activeTab === tab.id ? 'bg-black/25 text-white' : 'bg-[#222] text-[#666]')}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#111] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item, idx) => {
              if (item._type === 'ride') {
                const rideType = getRideType(item.ride_type)
                const formattedDate = item.created_at
                  ? new Date(item.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => navigate(`/ride/${item.id}`)}
                    className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-all hover:border-[#333]"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Navigation className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{formattedDate}</p>
                          <p className="text-[#A1A1AA] text-[11px] capitalize">{rideType?.name || item.ride_type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusPill status={item.status} />
                        <span className="text-orange-400 font-black text-sm">
                          ₹{Number(item.final_fare || item.estimated_fare || 0).toLocaleString('en-IN')}
                        </span>
                        {item.status === 'completed' && (
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                            item.payment_status === 'confirmed' || item.payment_status === 'paid'
                              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                              : item.payment_status === 'customer_marked_paid'
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                              : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                          )}>
                            {item.payment_status === 'confirmed' || item.payment_status === 'paid'
                              ? `${item.payment_method?.toUpperCase() || 'CASH'} • Paid`
                              : item.payment_status === 'customer_marked_paid'
                              ? `${item.payment_method?.toUpperCase() || 'CASH'} • Marked Paid`
                              : `${item.payment_method?.toUpperCase() || 'CASH'} • Payment Due`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <span className="text-[#555]">Pickup:</span>
                        <span className="text-white truncate">{item.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <span className="text-[#555]">Drop:</span>
                        <span className="text-white truncate">{item.drop_address}</span>
                      </div>
                    </div>
                  </div>
                )
              }

              if (item._type === 'service') {
                return (
                  <div
                    key={item.id || idx}
                    className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 hover:border-[#333] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{item.vehicle_name || 'Vehicle Service'}</p>
                          <p className="text-[#A1A1AA] text-[11px]">{item.service_center_name || 'Service Center'}</p>
                        </div>
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                    {(item.scheduled_date || item.total_amount) && (
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#1E1E1E] text-xs">
                        <span className="text-[#A1A1AA]">{item.scheduled_date} {item.scheduled_time}</span>
                        {item.total_amount && (
                          <span className="text-orange-400 font-bold">
                            ₹{Number(item.total_amount).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              // Inquiry
              return (
                <div
                  key={item.id || idx}
                  className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 hover:border-[#333] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{item.car?.model || 'Vehicle Inquiry'}</p>
                        <p className="text-[#A1A1AA] text-[11px]">Car Inquiry</p>
                      </div>
                    </div>
                    <StatusPill status={item.status} />
                  </div>
                  {item.car_id && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#1E1E1E]">
                      <Link to={`/cars/${item.car_id}`} className="text-orange-400 text-xs font-semibold flex items-center gap-1">
                        View Vehicle <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">No Bookings Yet</h3>
            <p className="text-[#A1A1AA] text-sm mb-6 max-w-xs">
              Book a ride, service, or inquire about a car to see your activity here.
            </p>
            <div className="flex gap-3">
              <Link
                to="/ride"
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
              >
                Book a Ride
              </Link>
              <Link
                to="/service"
                className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white font-semibold text-sm"
              >
                Services
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
