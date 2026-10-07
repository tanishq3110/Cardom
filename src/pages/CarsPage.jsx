import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { getCars, moderateCar } from '@/services/adminCarsApi'
import {
  Search,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  RefreshCw,
  Tag,
} from 'lucide-react'

export function CarsPage() {
  const navigate = useNavigate()

  const [cars, setCars] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  // Moderation modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    carId: null,
    carName: '',
    targetStatus: '',
    title: '',
    message: '',
    variant: 'primary',
  })
  const [actionLoading, setActionLoading] = useState(false)

  const limit = 15

  const fetchCars = async () => {
    setLoading(true)
    const { data, total: count } = await getCars({
      page,
      limit,
      search,
      status,
    })
    setCars(data)
    setTotal(count)
    setLoading(false)
  }

  useEffect(() => {
    fetchCars()
  }, [page, status])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchCars()
  }

  const promptModerate = (car, targetStatus, title, message, variant = 'primary') => {
    setModalConfig({
      isOpen: true,
      carId: car.id,
      carName: `${car.brand || ''} ${car.model || ''}`,
      targetStatus,
      title,
      message,
      variant,
    })
  }

  const handleConfirmModerate = async () => {
    setActionLoading(true)
    const res = await moderateCar(
      modalConfig.carId,
      modalConfig.targetStatus,
      `Admin moderated car listing ${modalConfig.carName} to ${modalConfig.targetStatus}`
    )
    setActionLoading(false)

    if (res.success) {
      setModalConfig((prev) => ({ ...prev, isOpen: false }))
      fetchCars()
    } else {
      alert(`Moderation failed: ${res.error}`)
    }
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Car Marketplace Management"
      subtitle="Public website listings, dealer inventory, and consumer sell-car submissions"
      actions={
        <button
          onClick={fetchCars}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors"
          title="Refresh Cars"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search make, model, city..."
            className="w-full bg-[#141414] border border-[#282828] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Listing Statuses</option>
            <option value="active">Active (Live on Website)</option>
            <option value="pending">Pending Moderation</option>
            <option value="inactive">Inactive / Hidden</option>
            <option value="sold">Sold</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Cars Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
            <p className="text-xs text-zinc-400">Loading marketplace listings...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Car className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Listings Found</p>
            <p className="text-xs text-zinc-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-[#101010]">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {cars.map((c) => (
                  <tr key={c.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-[#202020] border border-[#2D2D2D] overflow-hidden flex-shrink-0">
                          {c.image_url || c.image ? (
                            <img src={c.image_url || c.image} alt={c.model} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Car className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {c.brand || c.make} {c.model || c.title}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {c.year || '—'} • ID: {String(c.id).slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ₹{Number(c.price || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {c.fuel_type || c.fuel || '—'} • {c.transmission || '—'} • {c.mileage ? `${Number(c.mileage).toLocaleString()} km` : '—'}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      {c.location || 'India'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status !== 'active' && (
                          <button
                            onClick={() =>
                              promptModerate(
                                c,
                                'active',
                                'Approve & Publish Listing',
                                `Approve ${c.brand} ${c.model} for publication on the public Cardom website?`,
                                'primary'
                              )
                            }
                            className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                            title="Publish Live"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {c.status === 'active' && (
                          <button
                            onClick={() =>
                              promptModerate(
                                c,
                                'inactive',
                                'Hide Listing',
                                `Hide ${c.brand} ${c.model} from the website?`,
                                'warning'
                              )
                            }
                            className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            title="Mark Inactive"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/cars/${c.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-orange-400 font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#222222] flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Confirm"
        confirmVariant={modalConfig.variant}
        isLoading={actionLoading}
        onConfirm={handleConfirmModerate}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </AdminLayout>
  )
}
