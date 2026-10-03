import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Star } from 'lucide-react'
import { PartnerLayout } from '@/components/PartnerLayout'
import { useAuth } from '@/context/AuthContext'
import {
  getPartnerNotifications,
  markPartnerNotificationsRead,
  markAllPartnerNotificationsRead,
} from '@/services/partnerNotificationsApi'

const TYPE_COLOR = {
  new_ride_available: 'bg-orange-500/20 text-orange-400',
  customer_marked_paid: 'bg-cyan-500/20 text-cyan-400',
  payment_confirmed: 'bg-green-500/20 text-green-400',
  ride_completed: 'bg-blue-500/20 text-blue-400',
  rating_received: 'bg-yellow-500/20 text-yellow-400',
  customer_cancelled: 'bg-red-500/20 text-red-400',
  default: 'bg-orange-500/20 text-orange-400',
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function PartnerNotifications() {
  const { user, setUnreadNotificationsCount } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getPartnerNotifications(60)
    setNotifications(data || [])
    setLoading(false)

    // Automatically mark all as read when opening notifications page
    const unread = (data || []).filter((n) => !n.is_read).map((n) => n.id)
    if (unread.length > 0) {
      await markPartnerNotificationsRead(unread)
      setUnreadNotificationsCount?.(0)
    }
  }, [user, setUnreadNotificationsCount])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleMarkAllRead = async () => {
    await markAllPartnerNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadNotificationsCount?.(0)
  }

  const handleTap = async (notification) => {
    if (!notification.is_read) {
      await markPartnerNotificationsRead([notification.id])
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      )
      setUnreadNotificationsCount?.((prev) => Math.max(0, (prev || 1) - 1))
    }
    if (notification.ride_id) {
      navigate(`/rides/${notification.ride_id}`)
    }
  }

  return (
    <PartnerLayout title="Notifications" subtitle="Your activity feed">
      <div className="px-4 sm:px-6 py-6 max-w-2xl">
        {notifications.some((n) => !n.is_read) && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 cursor-pointer font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-12 text-center border border-[#2A2A2A] rounded-2xl bg-[#181818]">
            <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">No notifications yet</p>
            <p className="text-xs text-[#A1A1AA] mt-1">Ride requests and updates will appear here.</p>
          </div>
        )}

        <div className="space-y-2">
          {!loading &&
            notifications.map((notification) => {
              const colorClass = TYPE_COLOR[notification.type] || TYPE_COLOR.default
              const isRating = notification.type === 'rating_received'
              return (
                <button
                  key={notification.id}
                  onClick={() => handleTap(notification)}
                  className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    notification.is_read
                      ? 'bg-[#181818] border-[#222] hover:border-[#2A2A2A]'
                      : 'bg-[#1E1E1E] border-[#333] hover:border-orange-500/40 shadow-sm'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    {isRating ? <Star className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-bold ${
                          notification.is_read ? 'text-[#A1A1AA]' : 'text-white'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-[#555] flex-shrink-0 mt-0.5">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#888] mt-0.5 leading-snug line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  )}
                </button>
              )
            })}
        </div>
      </div>
    </PartnerLayout>
  )
}
