import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { getAdminProfiles } from '@/services/adminAuthApi'
import {
  Shield,
  ShieldCheck,
  LogOut,
  Users,
} from 'lucide-react'

export function SettingsPage() {
  const { adminProfile, role, isSuperAdmin, logout } = useAdminAuth()

  const [admins, setAdmins] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)

  useEffect(() => {
    async function loadAdmins() {
      if (isSuperAdmin) {
        setLoadingAdmins(true)
        const { data } = await getAdminProfiles()
        setAdmins(data || [])
        setLoadingAdmins(false)
      }
    }
    loadAdmins()
  }, [isSuperAdmin])

  return (
    <AdminLayout
      title="Admin System Settings & Governance"
      subtitle="Administrator credentials, role-based authorization, and security controls"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Admin Profile Card */}
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-xl flex-shrink-0">
              {adminProfile?.full_name?.[0] || 'A'}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {adminProfile?.full_name || 'Administrator'}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400">
                  {role || 'ADMIN'}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#202020] text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Authenticated Email</span>
              <p className="font-semibold text-white mt-0.5">{adminProfile?.email}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Admin UUID</span>
              <p className="font-mono text-zinc-400 mt-0.5 text-[11px] truncate">{adminProfile?.id || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Security Level</span>
              <p className="text-zinc-300 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isSuperAdmin ? 'Full Super Admin Privileges' : 'Standard Operations Authority'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#202020]">
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out of Mission Control
            </button>
          </div>
        </div>

        {/* System Security & Architecture */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Security Model & Environment Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Supabase Project Endpoint</span>
                <p className="font-mono text-zinc-300 truncate">https://jztvhtapfuopfpwhrvwp.supabase.co</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Client Credential Mode</span>
                <p className="font-mono text-emerald-400">Anon / Publishable Key (Zero Service Role Exposure)</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Row Level Security (RLS)</span>
                <p className="font-mono text-emerald-400">Enforced via is_admin() Security Definer Function</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#282828] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Governance & Audits</span>
                <p className="font-mono text-orange-400">Append-Only admin_audit_logs Ledger</p>
              </div>
            </div>
          </div>

          {/* Admin Management (for Super Admins) */}
          {isSuperAdmin && (
            <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" /> Authorized Admin Operators ({admins.length})
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">Super Admin View</span>
              </div>

              {loadingAdmins ? (
                <div className="py-6 text-center text-xs text-zinc-500">Loading administrators...</div>
              ) : (
                <div className="space-y-2">
                  {admins.map((adm) => (
                    <div
                      key={adm.id}
                      className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          {adm.full_name}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#262626] text-zinc-300">
                            {adm.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{adm.email}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {adm.is_active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
