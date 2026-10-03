import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

export function NotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => onDismiss?.(), 4000)
    return () => clearTimeout(timer)
  }, [notification, onDismiss])

  if (!notification) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl p-3.5 shadow-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold leading-tight">{notification.title}</p>
          <p className="text-[#A1A1AA] text-xs mt-0.5 leading-snug">{notification.message}</p>
        </div>
        <button
          onClick={() => onDismiss?.()}
          className="flex-shrink-0 text-[#555] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
