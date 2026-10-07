import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { KpiCard } from '@/components/common/KpiCard'
import { getNotifications, getPushDeliveryMetrics } from '@/services/adminNotificationsApi'
import {
  Bell,
  Smartphone,
  CheckCircle,
  RefreshCw,
  Send,
} from 'lucide-react'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [notifsRes, metricsRes] = await Promise.all([
      getNotifications({ limit: 30 }),
      getPushDeliveryMetrics(),
    ])
    setNotifications(notifsRes.data || [])
    setMetrics(metricsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const deliveryStats = metrics?.deliveryStats || {}

  return (
    <AdminLayout
      title="Notifications & Push Delivery Telemetry"
      subtitle="In-app alerts and native Android Firebase Cloud Messaging (FCM) token metrics"
      actions={
        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh Notifications"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Device & Push Delivery KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Registered Devices"
          value={metrics?.totalDevices || 0}
          subtitle={`${metrics?.activeDevices || 0} currently active`}
          icon={Smartphone}
          color="blue"
        />
        <KpiCard
          title="User App Devices"
          value={metrics?.userDevices || 0}
          subtitle="com.cardom.user"
          icon={Smartphone}
          color="cyan"
        />
        <KpiCard
          title="Partner App Devices"
          value={metrics?.partnerDevices || 0}
          subtitle="com.cardom.partner"
          icon={Smartphone}
          color="orange"
        />
        <KpiCard
          title="Delivered Pushes"
          value={deliveryStats.sent || 0}
          subtitle={`${deliveryStats.failed || 0} delivery failures`}
          icon={CheckCircle}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In-App Notifications Feed */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" /> In-App Notification Stream
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Latest 30 records</span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
              <p className="text-xs text-zinc-400">Loading notification stream...</p>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-zinc-500 py-12 text-center">No system notifications found.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{n.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(n.created_at).toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{n.message}</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500 font-mono">
                    <span className="uppercase">{n.type}</span>
                    <span>•</span>
                    <span>{n.is_read ? 'Read by recipient' : 'Unread'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Push Notification Delivery Logs */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" /> Native FCM Push Dispatch Logs
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Android delivery tracking</span>
          </div>

          {!metrics?.recentDeliveries?.length ? (
            <p className="text-xs text-zinc-500 py-12 text-center">No push notification dispatch events recorded yet.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {metrics.recentDeliveries.map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#282828] flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.status} />
                      <span className="font-mono text-zinc-400 text-[11px]">Attempts: {d.attempts || 1}</span>
                    </div>
                    {d.error_message && (
                      <p className="text-xs text-rose-400 mt-1">{d.error_message}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(d.created_at).toLocaleTimeString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
