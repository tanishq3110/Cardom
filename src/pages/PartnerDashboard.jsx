import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PartnerLayout } from '@/components/PartnerLayout'
import { StatCard } from '@/components/StatCard'
import { LeadCard } from '@/components/LeadCard'
import { FileText, Clock, Activity, CheckCircle, Navigation, Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getPartnerDashboardStats, getPartnerRecentLeads } from '@/services/partnerLeadsApi'
import { getAvailableRides, getPartnerRides } from '@/services/partnerRideApi'
import { getPartnerRatingStats } from '@/services/partnerRatingsApi'
import { getPartnerAvailability } from '@/services/partnerAvailabilityApi'
import {
  startPartnerAvailabilityLocationTracking,
  stopPartnerAvailabilityLocationTracking,
} from '@/services/partnerLocationApi'
import { getActiveOffer, subscribeToPartnerOffers } from '@/services/partnerDispatchApi'
import { PartnerAvailabilityCard } from '@/components/availability/PartnerAvailabilityCard'
import { RideOfferModal } from '@/components/dispatch/RideOfferModal'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function PartnerDashboard() {
  const { user, partnerProfile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [rideStats, setRideStats] = useState({ available: 0, active: 0, completed: 0 })
  const [rideLoading, setRideLoading] = useState(true)
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 })
  const [isOnline, setIsOnline] = useState(false)
  const [activeRideId, setActiveRideId] = useState(null)
  const [currentOffer, setCurrentOffer] = useState(null)

  const category = partnerProfile?.partner_category
  const businessName = partnerProfile?.business_name || 'Partner'
  const isVerified = partnerProfile?.is_verified ?? false

  const fetchData = useCallback(async () => {
    if (!category) return
    setLoading(true)
    const [statsRes, recentRes] = await Promise.all([
      getPartnerDashboardStats(),
      getPartnerRecentLeads(category),
    ])
    if (!statsRes.error) setStats(statsRes.data)
    if (!recentRes.error) setRecentLeads(recentRes.data || [])
    setLoading(false)
  }, [category])

  const fetchRideStats = useCallback(async () => {
    setRideLoading(true)
    const [availRes, assignedRes, ratingsRes] = await Promise.all([
      getAvailableRides(),
      getPartnerRides(),
      getPartnerRatingStats(),
    ])
    const availCount = availRes.data?.length || 0
    const assigned = assignedRes.data || []
    const active = assigned.find(a => ['accepted', 'started'].includes(a.partner_status))
    const activeCount = assigned.filter(a => ['accepted', 'started'].includes(a.partner_status)).length
    const completedCount = assigned.filter(a => a.partner_status === 'completed').length

    setActiveRideId(active?.ride_id || null)
    setRideStats({ available: availCount, active: activeCount, completed: completedCount })
    if (ratingsRes) {
      setRatingStats(ratingsRes)
    }
    setRideLoading(false)
  }, [])

  const fetchAvailabilityAndOffers = useCallback(async () => {
    const avail = await getPartnerAvailability()
    setIsOnline(avail.isOnline)

    if (avail.isOnline) {
      startPartnerAvailabilityLocationTracking()
      const offerRes = await getActiveOffer()
      setCurrentOffer(offerRes.offer || null)
    } else {
      stopPartnerAvailabilityLocationTracking()
      setCurrentOffer(null)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchRideStats()
    fetchAvailabilityAndOffers()
  }, [fetchData, fetchRideStats, fetchAvailabilityAndOffers])

  // Realtime subscription for incoming dispatch offers
  useEffect(() => {
    if (!user?.id) return
    const unsub = subscribeToPartnerOffers(user.id, (payload) => {
      if (payload.eventType === 'INSERT' || payload.new?.status === 'offered') {
        getActiveOffer().then(res => setCurrentOffer(res.offer || null))
      } else if (payload.new?.status && payload.new.status !== 'offered') {
        setCurrentOffer(null)
      }
    })
    return () => unsub()
  }, [user?.id])

  const handleAvailabilityChange = (newStatus) => {
    setIsOnline(newStatus)
    if (newStatus) {
      startPartnerAvailabilityLocationTracking()
      getActiveOffer().then(res => setCurrentOffer(res.offer || null))
    } else {
      stopPartnerAvailabilityLocationTracking()
      setCurrentOffer(null)
    }
  }

  const statCards = stats
    ? [
        { label: 'Total Leads', value: String(stats.total), trend: 0, trendLabel: 'Assigned to you', icon: FileText, color: 'orange' },
        { label: 'New', value: String(stats.new), trend: 0, trendLabel: 'Awaiting action', icon: Clock, color: 'yellow' },
        { label: 'In Progress', value: String(stats.inProgress), trend: 0, trendLabel: 'Active', icon: Activity, color: 'blue' },
        { label: 'Completed', value: String(stats.completed), trend: 0, trendLabel: 'Closed out', icon: CheckCircle, color: 'green' },
      ]
    : [
        { label: 'Total Leads', value: '—', trend: 0, trendLabel: '', icon: FileText, color: 'orange' },
        { label: 'New', value: '—', trend: 0, trendLabel: '', icon: Clock, color: 'yellow' },
        { label: 'In Progress', value: '—', trend: 0, trendLabel: '', icon: Activity, color: 'blue' },
        { label: 'Completed', value: '—', trend: 0, trendLabel: '', icon: CheckCircle, color: 'green' },
      ]

  return (
    <PartnerLayout title="Dashboard" subtitle="Your business overview">
      <div className="px-4 sm:px-6 py-6 space-y-6">

        {/* Verification Status Banner */}
        {!isVerified && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Account Status: Verification Pending
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Your business profile has been registered. You can access all dashboard tabs while documents are verified.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pending Review
            </span>
          </div>
        )}

        {/* Availability Card */}
        <PartnerAvailabilityCard
          isOnline={isOnline}
          isBusy={Boolean(activeRideId)}
          activeRideId={activeRideId}
          onAvailabilityChange={handleAvailabilityChange}
        />

        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-white">
            {getGreeting()}, {businessName} 👋
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        )}

        {/* Secondary Stats: Contacted & Cancelled */}
        {stats && (
          <div className="flex gap-3">
            <div className="flex-1 bg-[#202020] border border-[#2A2A2A] rounded-xl p-3 text-center">
              <div className="text-lg font-black text-yellow-400">{stats.contacted}</div>
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Contacted</div>
            </div>
            <div className="flex-1 bg-[#202020] border border-[#2A2A2A] rounded-xl p-3 text-center">
              <div className="text-lg font-black text-red-400">{stats.cancelled}</div>
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Cancelled</div>
            </div>
          </div>
        )}

        {/* Recent Leads */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Recent Leads</h3>
          </div>

          {loading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] animate-pulse" />
              ))}
            </div>
          )}

          {!loading && recentLeads.length === 0 && (
            <div className="p-6 rounded-xl border border-[#2A2A2A] bg-[#181818] text-center">
              <p className="text-sm text-[#A1A1AA]">No leads assigned yet.</p>
              <p className="text-xs text-[#555] mt-1">Leads will appear here once assigned by the Cardom team.</p>
            </div>
          )}

          {!loading && recentLeads.length > 0 && (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <LeadCard key={lead.assignmentId} lead={lead} />
              ))}
            </div>
          )}
        </div>

        {/* Ride Requests Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-orange-400" />
              Ride Requests
            </h3>
            <button
              onClick={() => navigate('/rides')}
              className="text-xs text-orange-400 hover:underline cursor-pointer"
            >
              View all →
            </button>
          </div>

          {rideLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] animate-pulse" />
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-3 gap-3 cursor-pointer"
              onClick={() => navigate('/rides')}
            >
              <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-3 text-center hover:border-orange-500/30 transition-colors">
                <div className="text-lg font-black text-orange-400">{rideStats.available}</div>
                <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Requests</div>
              </div>
              <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-3 text-center hover:border-blue-500/30 transition-colors">
                <div className="text-lg font-black text-blue-400">{rideStats.active}</div>
                <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Active</div>
              </div>
              <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-3 text-center hover:border-green-500/30 transition-colors">
                <div className="text-lg font-black text-green-400">{rideStats.completed}</div>
                <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Completed</div>
              </div>
            </div>
          )}
        </div>

        {/* Rating KPI */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Your Ratings
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-3 text-center">
              <div className="text-xl font-black text-yellow-400">
                {ratingStats.average > 0 ? `${ratingStats.average} ★` : '— ★'}
              </div>
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Average Rating</div>
            </div>
            <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-3 text-center">
              <div className="text-xl font-black text-white">{ratingStats.count}</div>
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Total Reviews</div>
            </div>
          </div>
        </div>

      </div>

      {/* Incoming Ride Offer Modal */}
      {currentOffer && (
        <RideOfferModal
          offer={currentOffer}
          onOfferClosed={() => {
            setCurrentOffer(null)
            fetchRideStats()
          }}
        />
      )}
    </PartnerLayout>
  )
}
