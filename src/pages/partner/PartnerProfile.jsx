import { useState } from 'react'
import { PartnerLayout } from '@/components/partner/PartnerLayout'
import { Building2, Mail, Phone, MapPin, User, Pencil, Check, X } from 'lucide-react'
import { usePartnerAuth } from '@/context/PartnerAuthContext'

export function PartnerProfile() {
  const { partnerUser } = usePartnerAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    businessName: 'ABC Motors',
    contactName: 'Rahul Sharma',
    email: partnerUser?.email || 'partner@example.com',
    phone: '+91 98765 43210',
    partnerType: 'Car Dealer',
    address: '12, Auto Hub Complex, Andheri West, Mumbai – 400058',
  })

  const InfoRow = ({ icon: Icon, label, value, field }) => (
    <div className="flex items-start gap-3 py-3 border-b border-[#2A2A2A] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-widest mb-0.5">{label}</p>
        {editing && field ? (
          <input
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full text-sm text-white bg-[#2A2A2A] border border-[#333] rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500"
          />
        ) : (
          <p className="text-sm text-white">{value || form[field]}</p>
        )}
      </div>
    </div>
  )

  return (
    <PartnerLayout title="Profile" subtitle="Your business information">
      <div className="px-4 sm:px-6 py-6 space-y-4">

        {/* Avatar + badge */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center">
            <span className="text-black font-black text-2xl">{form.businessName[0]}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{form.businessName}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/25">
              {form.partnerType}
            </span>
          </div>
          <button
            onClick={() => editing ? setEditing(false) : setEditing(true)}
            className="ml-auto p-2 rounded-lg bg-[#202020] border border-[#2A2A2A] hover:border-[#333] text-[#A1A1AA] hover:text-white transition-colors"
          >
            {editing ? <Check className="w-4 h-4 text-green-400" /> : <Pencil className="w-4 h-4" />}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl px-4">
          <InfoRow icon={Building2} label="Business Name" field="businessName" />
          <InfoRow icon={User} label="Contact Person" field="contactName" />
          <InfoRow icon={Mail} label="Email" field="email" />
          <InfoRow icon={Phone} label="Phone" field="phone" />
          <InfoRow icon={MapPin} label="Business Address" field="address" />
        </div>

        <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 text-xs text-orange-400/80">
          💾 Profile persistence via Supabase coming in Phase 2.
        </div>
      </div>
    </PartnerLayout>
  )
}
