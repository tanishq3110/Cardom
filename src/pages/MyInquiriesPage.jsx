import { useState, useEffect, useCallback, useMemo } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Car,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Archive,
  RotateCcw,
  ExternalLink,
  Loader2,
  AlertCircle,
  Inbox,
  Send,
  Eye,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  fetchSellerInquiries,
  fetchBuyerInquiries,
  markInquiryAsRead,
  archiveInquiry,
  unarchiveInquiry,
  formatRelativeTime,
  subscribeToInquiries,
} from '@/services/inquiriesApi'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { cn } from '@/lib/utils'

function formatPrice(amount) {
  const num = Number(amount) || 0
  if (num >= 10_000_000) {
    return `₹${(num / 10_000_000).toFixed(2)} Cr`
  }
  return `₹${(num / 100_000).toFixed(0)} Lakh`
}

function formatFullDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MyInquiriesPage() {
  const {
    user,
    loading: authLoading,
    setUnreadInquiriesCount,
    refreshUnreadInquiries,
  } = useAuth()

  // Tab State: 'received' (seller) | 'sent' (buyer)
  const [activeTab, setActiveTab] = useState('received')

  // Status Filter for Received tab: 'all' | 'unread' | 'read' | 'archived'
  const [statusFilter, setStatusFilter] = useState('all')

  // Inquiries State
  const [receivedInquiries, setReceivedInquiries] = useState([])
  const [sentInquiries, setSentInquiries] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [actionInProgress, setActionInProgress] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. Fetch Inquiries Data
  const loadInquiries = useCallback(
    async (silent = false) => {
      if (!user?.id) return
      if (!silent) setLoadingData(true)
      setErrorMsg('')

      const [sellerRes, buyerRes] = await Promise.all([
        fetchSellerInquiries(user.id),
        fetchBuyerInquiries(user.id),
      ])

      if (sellerRes.error && buyerRes.error) {
        setErrorMsg('Unable to load inquiries. Please refresh the page.')
      } else {
        setReceivedInquiries(sellerRes.data || [])
        setSentInquiries(buyerRes.data || [])

        // Also sync unread count in AuthContext
        if (sellerRes.data) {
          const unreadCount = sellerRes.data.filter((i) => i.status === 'unread').length
          if (typeof setUnreadInquiriesCount === 'function') {
            setUnreadInquiriesCount(unreadCount)
          }
        }
      }

      if (!silent) setLoadingData(false)
    },
    [user?.id, setUnreadInquiriesCount],
  )

  useEffect(() => {
    if (user?.id) {
      loadInquiries(false)
    }
  }, [user?.id, loadInquiries])

  // 2. Realtime Listener: updates list instantly when inquiries are created or updated
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = subscribeToInquiries({
      userId: user.id,
      onChange: () => {
        // Silently refresh both received and sent inquiries in background
        loadInquiries(true)
      },
    })

    return () => {
      unsubscribe()
    }
  }, [user?.id, loadInquiries])

  // 3. Action Handlers with immediate optimistic updates
  const handleMarkAsRead = async (inquiryId) => {
    if (!user?.id || actionInProgress) return
    setActionInProgress(inquiryId)

    // Immediate optimistic update
    setReceivedInquiries((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: 'read' } : inq)),
    )
    if (typeof setUnreadInquiriesCount === 'function') {
      setUnreadInquiriesCount((c) => Math.max(0, c - 1))
    }

    const { success, error } = await markInquiryAsRead(inquiryId, user.id)
    if (!success) {
      // Revert if API failed
      loadInquiries(true)
      alert(error?.message || 'Could not update inquiry status.')
    }
    setActionInProgress(null)
  }

  const handleArchive = async (inquiryId) => {
    if (!user?.id || actionInProgress) return
    setActionInProgress(inquiryId)

    const targetInq = receivedInquiries.find((i) => i.id === inquiryId)
    const wasUnread = targetInq?.status === 'unread'

    // Immediate optimistic update
    setReceivedInquiries((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: 'archived' } : inq)),
    )
    if (wasUnread && typeof setUnreadInquiriesCount === 'function') {
      setUnreadInquiriesCount((c) => Math.max(0, c - 1))
    }

    const { success, error } = await archiveInquiry(inquiryId, user.id)
    if (!success) {
      loadInquiries(true)
      alert(error?.message || 'Could not archive inquiry.')
    }
    setActionInProgress(null)
  }

  const handleUnarchive = async (inquiryId) => {
    if (!user?.id || actionInProgress) return
    setActionInProgress(inquiryId)

    // Immediate optimistic update to 'read'
    setReceivedInquiries((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: 'read' } : inq)),
    )

    const { success, error } = await unarchiveInquiry(inquiryId, user.id)
    if (!success) {
      loadInquiries(true)
      alert(error?.message || 'Could not restore inquiry.')
    }
    setActionInProgress(null)
  }

  // 4. Status Counts for Seller Received Tab
  const counts = useMemo(() => {
    const unread = receivedInquiries.filter((i) => i.status === 'unread').length
    const read = receivedInquiries.filter((i) => i.status === 'read').length
    const archived = receivedInquiries.filter((i) => i.status === 'archived').length
    return {
      all: receivedInquiries.length,
      unread,
      read,
      archived,
    }
  }, [receivedInquiries])

  // Filtered List based on status filter
  const displayedReceivedInquiries = useMemo(() => {
    if (statusFilter === 'all') return receivedInquiries
    return receivedInquiries.filter((i) => i.status === statusFilter)
  }, [receivedInquiries, statusFilter])

  // Protected Route: redirect to login if unauthenticated
  if (!authLoading && !user) {
    return <Navigate to="/login?redirect=/my-inquiries" replace />
  }

  return (
    <div className="bg-[#080808] min-h-dvh flex flex-col text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Background Grid & Ambient Glow */}
        <GridPattern
          squareSize={40}
          strokeWidth={0.2}
          className="text-white/[0.015] fill-none pointer-events-none"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-orange-500/[0.06] blur-[140px]"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-orange-500/20 bg-orange-500/[0.08] text-orange-400 mb-3">
              <MessageSquare className="w-3.5 h-3.5" />
              Inquiry Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Vehicle Inquiries & Messages
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Manage prospective buyer leads for your car listings and track the status of messages
              you have sent to verified sellers across Cardom.
            </p>
          </div>

          {/* Top Main Tab Toggle: Received vs Sent */}
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                activeTab === 'received'
                  ? 'bg-orange-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.35)]'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:text-white',
              )}
            >
              <Inbox className="w-4 h-4" />
              <span>Received for My Listings</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
                {receivedInquiries.length}
              </span>
              {counts.unread > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {counts.unread} unread
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                activeTab === 'sent'
                  ? 'bg-orange-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.35)]'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:text-white',
              )}
            >
              <Send className="w-4 h-4" />
              <span>Sent Inquiries</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
                {sentInquiries.length}
              </span>
            </button>
          </div>

          {/* Sub-Filters for Received tab (All / Unread / Read / Archived) */}
          {activeTab === 'received' && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[
                { label: 'All', key: 'all', count: counts.all },
                { label: 'Unread', key: 'unread', count: counts.unread },
                { label: 'Read', key: 'read', count: counts.read },
                { label: 'Archived', key: 'archived', count: counts.archived },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setStatusFilter(pill.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                    statusFilter === pill.key
                      ? 'bg-white/10 text-white border border-white/20 font-semibold'
                      : 'bg-white/[0.02] text-zinc-400 border border-white/[0.05] hover:text-white hover:border-white/10',
                  )}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>
          )}

          {/* Content Body */}
          {loadingData ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
              <p className="text-xs text-zinc-400">Loading your inquiries...</p>
            </div>
          ) : errorMsg ? (
            <div className="py-16 px-6 rounded-3xl border border-red-500/20 bg-red-500/[0.04] text-center max-w-lg mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Unable to Load Inquiries</h3>
              <p className="text-xs text-zinc-400 mb-6">{errorMsg}</p>
              <button
                type="button"
                onClick={() => loadInquiries(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : activeTab === 'received' ? (
            /* ── Received Tab Listing ── */
            displayedReceivedInquiries.length > 0 ? (
              <div className="space-y-4">
                {displayedReceivedInquiries.map((inq) => {
                  const isUnread = inq.status === 'unread'
                  const isArchived = inq.status === 'archived'
                  const isBusy = actionInProgress === inq.id

                  return (
                    <motion.div
                      key={inq.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 text-left overflow-hidden',
                        isUnread
                          ? 'border-orange-500/40 bg-[#0e0c0a] shadow-[0_0_24px_rgba(249,115,22,0.09)] ring-1 ring-orange-500/20'
                          : 'border-white/[0.07] bg-[#0c0c0c] hover:border-white/15',
                      )}
                    >
                      {/* Visual Indicator for Unread Leads */}
                      {isUnread && (
                        <div
                          aria-hidden="true"
                          className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600"
                        />
                      )}

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pl-1 sm:pl-0">
                        {/* Left: Car & Buyer Info */}
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          {/* Car Thumbnail */}
                          <div className="w-20 h-16 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex-shrink-0">
                            {inq.car?.image_url ? (
                              <img
                                src={inq.car.image_url}
                                alt={`${inq.car.brand} ${inq.car.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                🚗
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Link
                                to={`/cars/${inq.car.id}`}
                                className="text-sm font-bold text-white hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
                              >
                                <span>
                                  {inq.car.brand} {inq.car.model} ({inq.car.year})
                                </span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </Link>
                              <span className="text-xs font-mono text-orange-400 font-semibold">
                                {formatPrice(inq.car.price)}
                              </span>

                              {/* Status Badges */}
                              {isUnread && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  NEW
                                </span>
                              )}
                              {inq.status === 'read' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Read
                                </span>
                              )}
                              {isArchived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-white/10">
                                  <Archive className="w-3 h-3" />
                                  Archived
                                </span>
                              )}
                            </div>

                            {/* Buyer identification */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-2">
                              <span className="flex items-center gap-1.5 text-zinc-200 font-medium">
                                <User className="w-3.5 h-3.5 text-orange-400" />
                                {inq.buyer.name}
                              </span>
                              <a
                                href={`mailto:${inq.buyer.email}`}
                                className="flex items-center gap-1.5 hover:text-white transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                {inq.buyer.email}
                              </a>
                              {inq.phone && (
                                <a
                                  href={`tel:${inq.phone}`}
                                  className="flex items-center gap-1.5 text-orange-400/90 hover:text-orange-400 font-mono transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  {inq.phone}
                                </a>
                              )}
                              <span
                                title={formatFullDate(inq.created_at)}
                                className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono"
                              >
                                <Clock className="w-3 h-3 text-zinc-600" />
                                {formatRelativeTime(inq.created_at)}
                              </span>
                            </div>

                            {/* Message Bubble */}
                            <div className="mt-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs text-zinc-200 leading-relaxed">
                              &ldquo;{inq.message}&rdquo;
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex md:flex-col items-center justify-end gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                          {isUnread && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleMarkAsRead(inq.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white transition-colors cursor-pointer w-full"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Mark Read</span>
                            </button>
                          )}

                          {!isArchived ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleArchive(inq.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer w-full"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>Archive</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUnarchive(inq.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer w-full"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                          )}

                          <Link
                            to={`/cars/${inq.car.id}`}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors w-full"
                          >
                            <span>View Car</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="py-20 px-6 rounded-3xl border border-white/[0.06] bg-[#0d0d0d] text-center max-w-md mx-auto my-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-orange-400">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Inquiries Found</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {statusFilter === 'all'
                    ? 'When prospective buyers contact you about your vehicle listings, their inquiries will appear here.'
                    : `You have no ${statusFilter} inquiries.`}
                </p>
                <Link
                  to="/sell"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  <Car className="w-3.5 h-3.5" />
                  List Another Vehicle
                </Link>
              </div>
            )
          ) : (
            /* ── Sent Tab Listing ── */
            sentInquiries.length > 0 ? (
              <div className="space-y-4">
                {sentInquiries.map((inq) => {
                  return (
                    <motion.div
                      key={inq.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/[0.07] bg-[#0c0c0c] p-5 sm:p-6 text-left"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div className="w-16 h-14 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex-shrink-0">
                            {inq.car?.image_url ? (
                              <img
                                src={inq.car.image_url}
                                alt={`${inq.car.brand} ${inq.car.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                🚗
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Link
                                to={`/cars/${inq.car.id}`}
                                className="text-sm font-bold text-white hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
                              >
                                <span>
                                  {inq.car.brand} {inq.car.model} ({inq.car.year})
                                </span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </Link>
                              <span className="text-xs font-mono text-orange-400 font-semibold">
                                {formatPrice(inq.car.price)}
                              </span>

                              {/* Feature 4: Sent Inquiry Status Display */}
                              {inq.status === 'unread' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  <Clock className="w-3 h-3" />
                                  Sent (Pending Seller Review)
                                </span>
                              )}
                              {inq.status === 'read' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Read by Seller
                                </span>
                              )}
                              {inq.status === 'archived' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-white/10">
                                  <Archive className="w-3 h-3" />
                                  Archived by Seller
                                </span>
                              )}
                            </div>

                            <p
                              title={formatFullDate(inq.created_at)}
                              className="text-xs text-zinc-400 flex items-center gap-1 font-mono"
                            >
                              <Clock className="w-3 h-3 text-zinc-500" />
                              Sent {formatRelativeTime(inq.created_at)}
                            </p>

                            <div className="mt-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-zinc-300 leading-relaxed">
                              &ldquo;{inq.message}&rdquo;
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <Link
                            to={`/cars/${inq.car.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white transition-colors cursor-pointer"
                          >
                            <span>View Listing</span>
                            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="py-20 px-6 rounded-3xl border border-white/[0.06] bg-[#0d0d0d] text-center max-w-md mx-auto my-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-orange-400">
                  <Send className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Sent Inquiries</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  You haven&apos;t sent any vehicle inquiries yet. Browse the marketplace and
                  contact verified sellers directly.
                </p>
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  <Car className="w-3.5 h-3.5" />
                  Explore Marketplace
                </Link>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
