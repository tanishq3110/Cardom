import { PartnerLayout } from '@/components/partner/PartnerLayout'
import { Wrench, Disc, BatteryCharging, Snowflake, CheckCircle, XCircle } from 'lucide-react'

const SERVICES = [
  { icon: Wrench, name: 'Periodic Maintenance', description: 'Oil change, filters, fluid checks', available: true, price: '₹2,999' },
  { icon: Disc, name: 'Brake Service', description: 'Brake pad replacement & rotor inspection', available: true, price: '₹3,499' },
  { icon: BatteryCharging, name: 'Battery & Electrical', description: 'Battery test, replacement & wiring', available: false, price: '₹1,999' },
  { icon: Snowflake, name: 'AC Service', description: 'AC gas refill, compressor check', available: true, price: '₹2,499' },
  { icon: Wrench, name: 'Engine Diagnostics', description: 'Full OBD scan & fault report', available: true, price: '₹999' },
  { icon: Disc, name: 'Wheel Alignment', description: 'Precision 4-wheel alignment', available: false, price: '₹799' },
]

export function PartnerServices() {
  return (
    <PartnerLayout title="Services" subtitle="Your service offerings">
      <div className="px-4 sm:px-6 py-6 space-y-6">

        {/* Service Center Info */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Cardom Central Hub</h3>
              <p className="text-xs text-[#A1A1AA]">Mumbai, Maharashtra</p>
              <p className="text-xs text-[#A1A1AA] mt-1">Mon – Sat · 9:00 AM – 7:00 PM</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Open
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Service Catalogue</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map(({ icon: Icon, name, description, available, price }) => (
              <div key={name} className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-4 flex gap-3 hover:border-[#333] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">{name}</span>
                    {available
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">{description}</p>
                  <span className="text-xs font-bold text-orange-400 mt-1.5 block">{price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 text-xs text-orange-400/80">
          ⚙️ Service management & booking integration coming in Phase 3.
        </div>
      </div>
    </PartnerLayout>
  )
}
