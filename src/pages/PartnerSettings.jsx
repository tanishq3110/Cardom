import { useState } from 'react'
import { PartnerLayout } from '@/components/PartnerLayout'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  User, Shield, Bell, Palette, LogOut, ChevronRight, Loader2
} from 'lucide-react'

const SETTINGS_SECTIONS = [
  {
    id: 'account', label: 'Account & Business Entity', icon: User, description: 'Manage corporate profile, GST credentials, and verified contacts',
  },
  {
    id: 'security', label: 'Security & Access', icon: Shield, description: 'Password, two-factor authentication, and active sessions',
  },
  {
    id: 'notifications', label: 'Lead & Alert Preferences', icon: Bell, description: 'Configure instant push, SMS, and email alerts for fresh inquiries',
  },
  {
    id: 'appearance', label: 'Display & Aesthetics', icon: Palette, description: 'Dark automotive theme settings and layout controls',
  },
]

export function PartnerSettings() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [notifLeads, setNotifLeads] = useState(true)
  const [notifAudio, setNotifAudio] = useState(true)
  const [notifSystem, setNotifSystem] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
    navigate('/login', { replace: true })
  }

  return (
    <PartnerLayout title="Settings" subtitle="App configurations and security">
      <div className="px-4 sm:px-6 py-6 space-y-5 max-w-3xl">

        {/* Settings Sections */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon, description }, i) => (
            <button
              key={id}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#202020] transition-colors cursor-pointer ${
                i < SETTINGS_SECTIONS.length - 1 ? 'border-b border-[#2A2A2A]' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#202020] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-[#A1A1AA] truncate mt-0.5">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A1A1AA] flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl px-5 py-2">
          <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider py-3 border-b border-[#2A2A2A]">
            Notification Controls
          </p>

          <div className="flex items-center justify-between py-4 border-b border-[#2A2A2A]">
            <div>
              <p className="text-sm font-semibold text-white">Instant Lead Notifications</p>
              <p className="text-xs text-[#A1A1AA] mt-0.5">Receive notifications immediately when a customer submits an inquiry</p>
            </div>
            <button
              onClick={() => setNotifLeads(!notifLeads)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                notifLeads ? 'bg-orange-500' : 'bg-[#2A2A2A]'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                notifLeads ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-[#2A2A2A]">
            <div>
              <p className="text-sm font-semibold text-white">Audio Alert on New Lead</p>
              <p className="text-xs text-[#A1A1AA] mt-0.5">Play alert sound for high-priority service & insurance bookings</p>
            </div>
            <button
              onClick={() => setNotifAudio(!notifAudio)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                notifAudio ? 'bg-orange-500' : 'bg-[#2A2A2A]'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                notifAudio ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-semibold text-white">System & Maintenance Bulletins</p>
              <p className="text-xs text-[#A1A1AA] mt-0.5">Platform uptime updates, policy revisions, and feature rollouts</p>
            </div>
            <button
              onClick={() => setNotifSystem(!notifSystem)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                notifSystem ? 'bg-orange-500' : 'bg-[#2A2A2A]'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                notifSystem ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-all font-semibold text-sm cursor-pointer disabled:opacity-50"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          <span>{loggingOut ? 'SIGNING OUT...' : 'SIGN OUT OF PARTNER ACCOUNT'}</span>
        </button>

      </div>
    </PartnerLayout>
  )
}
