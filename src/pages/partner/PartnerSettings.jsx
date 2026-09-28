import { useState } from 'react'
import { PartnerLayout } from '@/components/partner/PartnerLayout'
import { usePartnerAuth } from '@/context/PartnerAuthContext'
import { useNavigate } from 'react-router-dom'
import {
  User, Shield, Bell, Palette, LogOut, ChevronRight
} from 'lucide-react'

const SETTINGS_SECTIONS = [
  {
    id: 'account', label: 'Account', icon: User, description: 'Manage your business account details',
  },
  {
    id: 'security', label: 'Security', icon: Shield, description: 'Password, 2FA and session management',
  },
  {
    id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure lead and system alerts',
  },
  {
    id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display preferences',
  },
]

export function PartnerSettings() {
  const { partnerSignOut } = usePartnerAuth()
  const navigate = useNavigate()
  const [notifLeads, setNotifLeads] = useState(true)
  const [notifSystem, setNotifSystem] = useState(false)

  const handleLogout = async () => {
    await partnerSignOut()
    navigate('/partner/login')
  }

  return (
    <PartnerLayout title="Settings" subtitle="App preferences">
      <div className="px-4 sm:px-6 py-6 space-y-4">

        {/* Settings Items */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl overflow-hidden">
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon, description }, i) => (
            <button
              key={id}
              className={`w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-[#202020] transition-colors ${
                i < SETTINGS_SECTIONS.length - 1 ? 'border-b border-[#2A2A2A]' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-[#A1A1AA]">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A1A1AA]" />
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl px-4">
          <div className="flex items-center justify-between py-4 border-b border-[#2A2A2A]">
            <div>
              <p className="text-sm font-semibold text-white">Lead Notifications</p>
              <p className="text-xs text-[#A1A1AA]">Get alerted on new leads</p>
            </div>
            <button
              onClick={() => setNotifLeads(!notifLeads)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifLeads ? 'bg-orange-500' : 'bg-[#2A2A2A]'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                notifLeads ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-semibold text-white">System Alerts</p>
              <p className="text-xs text-[#A1A1AA]">Maintenance & update notices</p>
            </div>
            <button
              onClick={() => setNotifSystem(!notifSystem)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifSystem ? 'bg-orange-500' : 'bg-[#2A2A2A]'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                notifSystem ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">Logout</span>
        </button>

      </div>
    </PartnerLayout>
  )
}
