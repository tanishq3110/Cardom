import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeToPartnerNotifications } from '@/services/partnerNotificationsApi'
import { NotificationToast } from './NotificationToast'

export function NotificationsGlobalToast() {
  const { user, setUnreadNotificationsCount } = useAuth()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    const unsub = subscribeToPartnerNotifications(user.id, (notification) => {
      setToast(notification)
      setUnreadNotificationsCount?.((prev) => (typeof prev === 'number' ? prev + 1 : 1))
    })
    return () => unsub()
  }, [user?.id, setUnreadNotificationsCount])

  return <NotificationToast notification={toast} onDismiss={() => setToast(null)} />
}
