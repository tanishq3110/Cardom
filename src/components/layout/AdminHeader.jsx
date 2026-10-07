import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminAuth } from '@/context/AdminAuthContext'
import {
  Search,
  Bell,
  AlertOctagon,
  LogOut,
  User,
  Shield,
  X,
  ChevronDown,
  Car,
  Briefcase,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminHeader({ isCollapsed, activeSosCount = 0 }) {
  const { adminProfile, role, logout } = useAdminAuth()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0)

  const menuRef = useRef(null)

  // Fetch unread notifications count
  useEffect(() => {
    async function fetchNotifs() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      setUnreadNotifsCount(count || 0)
    }
    fetchNotifs()
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global search handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const q = searchQuery.trim()

      try {
        const [usersRes, partnersRes, ridesRes, carsRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email, phone').or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`).limit(4),
          supabase.from('partner_profiles').select('id, business_name, authorized_contact_name, phone').or(`business_name.ilike.%${q}%,phone.ilike.%${q}%`).limit(4),
          supabase.from('ride_bookings').select('id, booking_reference, pickup_address, drop_address, status').or(`booking_reference.ilike.%${q}%,pickup_address.ilike.%${q}%`).limit(4),
          supabase.from('cars').select('id, brand, model, price, status').or(`brand.ilike.%${q}%,model.ilike.%${q}%`).limit(4),
        ])

        setSearchResults({
          users: usersRes.data || [],
          partners: partnersRes.data || [],
          rides: ridesRes.data || [],
          cars: carsRes.data || [],
        })
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectResult = (path) => {
    setShowSearchModal(false)
    setSearchQuery('')
    navigate(path)
  }

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-[#0E0E0E]/95 backdrop-blur-md border-b border-[#222222] transition-all duration-300 flex items-center justify-between px-6 ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchModal(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global search (Users, Partners, Rides, Cars)..."
            className="w-full bg-[#161616] border border-[#262626] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchModal && searchQuery.trim().length >= 2 && (
          <div className="absolute top-12 left-0 right-0 bg-[#161616] border border-[#2D2D2D] rounded-2xl p-3 shadow-2xl space-y-3 z-50 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              <span>Search Results</span>
              {isSearching && <span>Searching...</span>}
            </div>

            {/* Users */}
            {searchResults?.users?.length > 0 && (
              <div>
                <p className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-blue-400" /> Users
                </p>
                <div className="space-y-1">
                  {searchResults.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectResult(`/users/${u.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white">{u.full_name || 'Cardom User'}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{u.email || u.phone}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Partners */}
            {searchResults?.partners?.length > 0 && (
              <div>
                <p className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-amber-400" /> Partners
                </p>
                <div className="space-y-1">
                  {searchResults.partners.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectResult(`/partners/${p.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white">{p.business_name}</div>
                        <div className="text-[10px] text-zinc-400">{p.authorized_contact_name} • {p.phone}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rides */}
            {searchResults?.rides?.length > 0 && (
              <div>
                <p className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-orange-400" /> Rides
                </p>
                <div className="space-y-1">
                  {searchResults.rides.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectResult(`/rides/${r.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white font-mono">{r.booking_reference}</div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-xs">{r.pickup_address} → {r.drop_address}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cars */}
            {searchResults?.cars?.length > 0 && (
              <div>
                <p className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Car className="w-3 h-3 text-emerald-400" /> Cars
                </p>
                <div className="space-y-1">
                  {searchResults.cars.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectResult(`/cars/${c.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white">{c.brand} {c.model}</div>
                        <div className="text-[10px] text-zinc-400">₹{Number(c.price || 0).toLocaleString()} • {c.status}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isSearching &&
              !searchResults?.users?.length &&
              !searchResults?.partners?.length &&
              !searchResults?.rides?.length &&
              !searchResults?.cars?.length && (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No matching records found across Cardom ecosystem.
                </div>
              )}
          </div>
        )}
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3">
        {/* Active SOS Indicator */}
        <Link
          to="/safety"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            activeSosCount > 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse hover:bg-rose-500/25'
              : 'bg-[#161616] border-[#262626] text-zinc-400 hover:text-white'
          }`}
          title="SOS Incidents Command"
        >
          <AlertOctagon className={`w-4 h-4 ${activeSosCount > 0 ? 'text-rose-500' : 'text-zinc-500'}`} />
          <span className="hidden sm:inline">SOS</span>
          {activeSosCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-mono">
              {activeSosCount}
            </span>
          )}
        </Link>

        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl bg-[#161616] border border-[#262626] text-zinc-400 hover:text-white hover:border-[#383838] transition-colors"
          title="Notifications Stream"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-black text-[9px] font-black flex items-center justify-center">
              {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
            </span>
          )}
        </Link>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-[#161616] border border-[#262626] hover:border-[#383838] transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
              {adminProfile?.full_name?.[0] || 'A'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-white leading-tight">
                {adminProfile?.full_name || 'Admin'}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-orange-400" />
                {role || 'ADMIN'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#161616] border border-[#2D2D2D] p-1.5 shadow-2xl space-y-1 z-50">
              <div className="px-3 py-2 border-b border-[#262626]">
                <p className="text-xs font-bold text-white">{adminProfile?.full_name || 'Administrator'}</p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">{adminProfile?.email}</p>
              </div>

              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-[#202020] transition-colors"
              >
                <Shield className="w-4 h-4 text-orange-400" />
                Admin Settings
              </Link>

              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  logout()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
