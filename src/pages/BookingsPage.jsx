import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Car,
  Wrench,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  MapPin,
  FileText,
  CreditCard,
  Phone,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchBuyerInquiries } from '@/services/inquiriesApi'
import { getMyRideBookings } from '@/services/rideBookingApi'
import { getRideType } from '@/config/rideTypes'
import { cn } from '@/lib/utils'

function StatusBadge({ status }) {
  const s = (status || 'scheduled').toLowerCase()
  const map = {
    scheduled:       { label: 'Scheduled',         style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    in_progress:     { label: 'In Progress',        style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    completed:       { label: 'Completed',          style: 'bg-green-500/15 text-green-400 border-green-500/30' },
    cancelled:       { label: 'Cancelled',          style: 'bg-red-500/15 text-red-400 border-red-500/30' },
    new:             { label: 'Pending',            style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    read:            { label: 'Acknowledged',       style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    searching:       { label: 'Searching Driver',   style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    driver_assigned: { label: 'Driver Assigned',    style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    arriving:        { label: 'Arriving',           style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    started:         { label: 'Ride Started',       style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  }
  const config = map[s] || { label: s, style: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider', config.style)}>
      {config.label}
    </span>
  )
}

export function BookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'services' | 'inquiries' | 'rides'
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [rides, setRides] = useState([])

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      if (user?.id) {
        // 1. Fetch real service requests from Supabase
        const { data: sData } = await supabase
          .from('service_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (sData) setServices(sData)

        // 2. Fetch real vehicle inquiries
        const { data: inqData } = await fetchBuyerInquiries(user.id)
        if (inqData) setInquiries(inqData)

        // 3. Fetch real ride bookings
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
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ride_bookings',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadBookings()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [loadBookings, user?.id])

  const allItems = [
    ...services.map((s) => ({ ...s, _type: 'service', _date: s.created_at || s.scheduled_date })),
    ...inquiries.map((i) => ({ ...i, _type: 'inquiry', _date: i.created_at })),
    ...rides.map((r) => ({ ...r, _type: 'ride', _date: r.created_at })),
  ].sort((a, b) => new Date(b._date || 0) - new Date(a._date || 0))

  const filteredItems = allItems.filter((item) => {
    if (activeTab === 'all') return true
    if (activeTab === 'services') return item._type === 'service'
    if (activeTab === 'inquiries') return item._type === 'inquiry'
    if (activeTab === 'rides') return item._type === 'ride'
    return true
  })

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 md:pb-20 max-w-4xl mx-auto w-full">
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        {/* ── Mobile Top Header ── */}
        <div className="mb-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-orange-500/20 bg-orange-500/[0.08] text-orange-400 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            Activity & Bookings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Track your ongoing automotive service appointments, rides, and inquiries
          </p>
        </div>

        {/* ── Segmented Tabs ── */}
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/[0.08] overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: allItems.length },
            { id: 'services', label: 'Services', count: services.length },
            { id: 'rides', label: 'Rides', count: rides.length },
            { id: 'inquiries', label: 'Inquiries', count: inquiries.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5',
                activeTab === tab.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25'
                  : 'bg-[#141414] border-white/[0.08] text-zinc-300 hover:border-white/20 hover:text-white',
              )}
            >
              <span>{tab.label}</span>
              <span className={cn('px-1.5 py-0.2 rounded-full text-[10px] font-mono', activeTab === tab.id ? 'bg-black/30 text-white' : 'bg-white/10 text-zinc-400')}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content List ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-[#141414] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item, idx) => {
              if (item._type === 'service') {
                return (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-2xl bg-[#141414] border border-[#2A2A2A] hover:border-orange-500/40 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{item.vehicle_name || 'Vehicle Service'}</h3>
                          <p className="text-xs text-zinc-400">{item.service_center_name || 'Cardom Authorized Center'}</p>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Booking Ref</span>
                        <span className="text-white font-mono">{item.booking_reference || 'CDM-SVC-LIVE'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Scheduled</span>
                        <span className="text-white">{item.scheduled_date || 'Today'} {item.scheduled_time || ''}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Amount</span>
                        <span className="text-orange-400 font-bold">₹{item.total_amount ? Number(item.total_amount).toLocaleString('en-IN') : '1,450'}</span>
                      </div>
                    </div>
                  </div>
                )
              }

              if (item._type === 'ride') {
                const rideType = getRideType(item.ride_type)
                const formattedDate = item.created_at
                  ? new Date(item.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'
                return (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-2xl bg-[#141414] border border-[#2A2A2A] hover:border-orange-500/40 transition-colors space-y-3 cursor-pointer"
                    onClick={() => navigate(`/ride/${item.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                          <Navigation className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{rideType?.name || item.ride_type}</h3>
                          <p className="text-xs text-zinc-400 font-mono">{item.booking_reference}</p>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-zinc-400 flex-shrink-0">Pickup:</span>
                        <span className="text-white truncate">{item.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                        <span className="text-zinc-400 flex-shrink-0">Drop:</span>
                        <span className="text-white truncate">{item.drop_address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                      <span className="text-zinc-500">{formattedDate}</span>
                      <span className="text-orange-400 font-black text-sm">
                        ₹{item.estimated_fare ? Number(item.estimated_fare).toLocaleString('en-IN') : '—'}
                      </span>
                    </div>
                  </div>
                )
              }

              // Inquiry item
              return (
                <div
                  key={item.id || idx}
                  className="p-5 rounded-2xl bg-[#141414] border border-[#2A2A2A] hover:border-orange-500/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{item.car?.model || item.vehicle_name || 'Vehicle Inquiry'}</h3>
                        <p className="text-xs text-zinc-400">Direct Seller Inquiry</p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <p className="text-xs text-zinc-300 bg-[#1c1c1c] p-3 rounded-xl border border-white/[0.04]">
                    &ldquo;{item.message || 'I am interested in this vehicle listing.'}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 text-zinc-500">
                    <span>Inquiry ID: {item.id?.slice(0, 8) || 'CDM-INQ'}</span>
                    {item.car_id && (
                      <Link
                        to={`/cars/${item.car_id}`}
                        className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                      >
                        View Vehicle
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-16 px-6 rounded-3xl border border-white/[0.08] bg-[#121212] text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-orange-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">No Bookings Found</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              You haven&apos;t scheduled any service center visits, rides, or vehicle inquiries yet.
            </p>
            <div className="flex gap-2 justify-center">
              <Link
                to="/service"
                className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-semibold shadow-lg shadow-orange-500/20"
              >
                Book Service
              </Link>
              <Link
                to="/ride"
                className="px-4 py-2.5 rounded-xl bg-[#202020] border border-[#2A2A2A] text-zinc-300 text-xs font-semibold hover:text-white"
              >
                Book a Ride
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
