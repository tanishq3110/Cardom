import { useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { subscribeToSafetyEvents, getActiveSosIncidents } from '@/services/adminSafetyApi'

export function AdminLayout({ title, subtitle, actions, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeSosCount, setActiveSosCount] = useState(0)

  // Fetch initial active SOS and subscribe to realtime updates
  useEffect(() => {
    let isMounted = true

    async function loadSos() {
      const { data } = await getActiveSosIncidents()
      if (isMounted) {
        setActiveSosCount(data?.length || 0)
      }
    }

    loadSos()

    const unsubscribe = subscribeToSafetyEvents(() => {
      loadSos()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        activeSosCount={activeSosCount}
      />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 flex flex-col ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
        {/* Header */}
        <AdminHeader
          isCollapsed={isCollapsed}
          activeSosCount={activeSosCount}
        />

        {/* Page Content Container */}
        <main className="flex-1 pt-20 px-8 pb-12 max-w-7xl w-full mx-auto space-y-6">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
              <div>
                {title && <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>}
                {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  )
}
