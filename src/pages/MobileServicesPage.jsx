import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  CreditCard,
  Wrench,
  Sparkles,
  AlertTriangle,
  Package,
  Search,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

// ─── All service cards matching reference image ───────────────────────────────
const SERVICES = [
  {
    id: 'insurance',
    label: 'Insurance',
    desc: 'Get the best insurance plans',
    to: '/insurance',
    icon: Shield,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.22)',
  },
  {
    id: 'finance',
    label: 'Finance',
    desc: 'Flexible loan options for your dream car',
    to: '/finance',
    icon: CreditCard,
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.22)',
  },
  {
    id: 'service',
    label: 'Service & Repair',
    desc: 'Expert care for your vehicle',
    to: '/service',
    icon: Wrench,
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.22)',
  },
  {
    id: 'detailing',
    label: 'Detailing',
    desc: 'Keep your car looking new',
    to: '/service',
    icon: Sparkles,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.22)',
  },
  {
    id: 'roadside',
    label: 'Roadside Assistance',
    desc: '24/7 support on the road',
    to: '/roadside',
    icon: AlertTriangle,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.22)',
  },
  {
    id: 'parts',
    label: 'Spare Parts',
    desc: 'Genuine parts & accessories',
    to: '/parts',
    icon: Package,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.22)',
  },
]

export function MobileServicesPage() {
  const [query, setQuery] = useState('')

  const filtered = SERVICES.filter(
    (s) =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.desc.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white flex flex-col pb-24">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-12 pb-4">
        <h1 className="text-2xl font-black text-white mb-4">Services</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 px-4 pt-5">
        {/* Services Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((service) => {
              const Icon = service.icon
              return (
                <Link
                  key={service.id}
                  to={service.to}
                  className="flex flex-col gap-3 p-4 rounded-2xl active:scale-[0.98] transition-all"
                  style={{
                    background: service.bg,
                    border: `1px solid ${service.border}`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${service.border}`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: service.color }} />
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{service.label}</p>
                    <p className="text-[#A1A1AA] text-[11px] mt-1 leading-snug">{service.desc}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="text-[11px] font-semibold" style={{ color: service.color }}>
                      Explore
                    </span>
                    <ChevronRight className="w-3 h-3" style={{ color: service.color }} />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-white font-semibold">No services found</p>
            <p className="text-[#A1A1AA] text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-6 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Need help choosing?</p>
            <p className="text-[#A1A1AA] text-[11px] mt-0.5">Our team is ready to assist</p>
          </div>
          <Link to="/contact" className="flex items-center gap-1 text-orange-400 text-xs font-semibold flex-shrink-0">
            Contact <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
