import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ArrowLeft, CheckCheck, Navigation, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getMyNotifications, markNotificationsRead, markAllNotificationsRead } from '@/services/notificationsApi'

const TYPE_ICON_COLOR = {
  driver_assigned: 'bg-blue-500/20 text-blue-400',
  arriving: 'bg-cyan-500/20 text-cyan-400',
  started: 'bg-orange-500/20 text-orange-400',
  completed: 'bg-green-500/20 text-green-400',
  payment_confirmed: 'bg-emerald-500/20 text-emerald-400',
  customer_marked_paid: 'bg-cyan-500/20 text-cyan-400',
  cancelled: 'bg-red-500/20 text-red-400',
  rating_reminder: 'bg-yellow-500/20 text-yellow-400',
  default: 'bg-orange-500/20 text-orange-400',
}

function timeAgo(dateStr) {
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

export function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getMyNotifications(60)
    setNotifications(data || [])
    setLoading(false)
    // Mark all as read automatically
    const unread = (data || []).filter(n => !n.is_read).map(n => n.id)
    if (unread.length > 0) {
      await markNotificationsRead(unread)
    }
  }, [user])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const handleTap = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationsRead([notification.id])
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n))
    }
    // Navigate
    if (notification.ride_id) {
      navigate(`/ride/${notification.ride_id}`)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-orange-400">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-[#111] border border-[#2A2A2A] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">No Notifications Yet</h3>
            <p className="text-[#A1A1AA] text-sm">Ride updates will appear here.</p>
          </div>
        )}

        {!loading && notifications.map(notification => {
          const colorClass = TYPE_ICON_COLOR[notification.type] || TYPE_ICON_COLOR.default
          return (
            <button
              key={notification.id}
              onClick={() => handleTap(notification)}
              className={`w-full text-left flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                notification.is_read
                  ? 'bg-[#0F0F0F] border-[#1A1A1A] hover:border-[#2A2A2A]'
                  : 'bg-[#141414] border-[#2A2A2A] hover:border-[#333]'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${notification.is_read ? 'text-[#A1A1AA]' : 'text-white'}`}>
                    {notification.title}
                  </p>
                  <span className="text-[10px] text-[#555] flex-shrink-0 mt-0.5">{timeAgo(notification.created_at)}</span>
                </div>
                <p className="text-xs text-[#666] mt-0.5 leading-snug">{notification.message}</p>
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
