import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getUnifiedLeads } from '@/services/adminLeadsApi'
import { getCars } from '@/services/adminCarsApi'
import {
  Globe,
  Car,
  Shield,
  CreditCard,
  Wrench,
  MessageSquare,
  RefreshCw,
} from 'lucide-react'

export function WebsitePage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine active subsection based on pathname
  const path = location.pathname
  let initialTab = 'overview'
  if (path.includes('/website/inquiries')) initialTab = 'inquiries'
  if (path.includes('/website/sell-listings')) initialTab = 'sell-listings'
  if (path.includes('/website/insurance')) initialTab = 'insurance'
  if (path.includes('/website/finance')) initialTab = 'finance'
  if (path.includes('/website/services')) initialTab = 'services'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [data, setData] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    if (activeTab === 'sell-listings') {
      const res = await getCars({ limit: 25 })
      setCars(res.data || [])
    } else {
      const typeMap = {
        inquiries: 'inquiry',
        insurance: 'insurance',
        finance: 'finance',
        services: 'service',
        overview: 'all',
      }
      const res = await getUnifiedLeads({ type: typeMap[activeTab] || 'all', limit: 25 })
      setData(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const handleTabChange = (tab, route) => {
    setActiveTab(tab)
    navigate(route)
  }

  return (
    <AdminLayout
      title="Public Website Management"
      subtitle="Visibility into the customer-facing Cardom Web Platform, marketplace, and inbound funnels"
    >
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange('overview', '/website')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'overview' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> All Website Activity
        </button>
        <button
          onClick={() => handleTabChange('inquiries', '/website/inquiries')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'inquiries' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Car Inquiries
        </button>
        <button
          onClick={() => handleTabChange('sell-listings', '/website/sell-listings')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'sell-listings' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Car className="w-3.5 h-3.5" /> Sell Submissions
        </button>
        <button
          onClick={() => handleTabChange('insurance', '/website/insurance')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'insurance' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Insurance Quotes
        </button>
        <button
          onClick={() => handleTabChange('finance', '/website/finance')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'finance' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Finance Applications
        </button>
        <button
          onClick={() => handleTabChange('services', '/website/services')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'services' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Vehicle Services
        </button>
      </div>

      {/* Content Section */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden p-5 space-y-4">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
            <p className="text-xs text-zinc-400">Loading website records...</p>
          </div>
        ) : activeTab === 'sell-listings' ? (
          // Cars view
          cars.length === 0 ? (
            <p className="text-xs text-zinc-500 py-12 text-center">No car sell submissions recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D1D1D]">
                  {cars.map((c) => (
                    <tr key={c.id} className="hover:bg-[#181818]">
                      <td className="py-3 px-3 font-semibold text-white">
                        {c.brand} {c.model} ({c.year || '—'})
                      </td>
                      <td className="py-3 px-3 font-bold text-white font-mono">
                        ₹{Number(c.price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{c.location || 'India'}</td>
                      <td className="py-3 px-3"><StatusBadge status={c.status} /></td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/cars/${c.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#282828] text-orange-400 font-semibold"
                        >
                          Inspect Listing
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Unified Leads view
          data.length === 0 ? (
            <p className="text-xs text-zinc-500 py-12 text-center">No website submissions found in this category.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Customer Contact</th>
                    <th className="py-2.5 px-3">Submission Details</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Submitted</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D1D1D]">
                  {data.map((l) => (
                    <tr key={`${l.type}-${l.id}`} className="hover:bg-[#181818]">
                      <td className="py-3 px-3 uppercase font-bold text-white text-[11px] font-mono">
                        {l.type}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{l.customer}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{l.phone}</div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300 max-w-md truncate">
                        {l.details}
                      </td>
                      <td className="py-3 px-3"><StatusBadge status={l.status} /></td>
                      <td className="py-3 px-3 font-mono text-zinc-500 text-[10px]">
                        {new Date(l.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/leads/${l.type}/${l.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#282828] text-orange-400 font-semibold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </AdminLayout>
  )
}
