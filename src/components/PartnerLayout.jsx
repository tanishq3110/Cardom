import { PartnerSidebar } from './PartnerSidebar'
import { PartnerHeader } from './PartnerHeader'
import { PartnerBottomNav } from './PartnerBottomNav'

export function PartnerLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <PartnerSidebar />
      <PartnerHeader title={title} subtitle={subtitle} />
      <main className="lg:ml-60 pb-20 lg:pb-8">
        {children}
      </main>
      <PartnerBottomNav />
    </div>
  )
}
