import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatusBadge } from '@/components/common/StatusBadge'
import { KpiCard } from '@/components/common/KpiCard'
import { getPayments, getPaymentStats } from '@/services/adminPaymentsApi'
import {
  CreditCard,
  IndianRupee,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  QrCode,
  Banknote,
} from 'lucide-react'

export function PaymentsPage() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [method, setMethod] = useState('all')
  const [loading, setLoading] = useState(true)

  const limit = 20

  const fetchData = async () => {
    setLoading(true)
    const [paymentsRes, statsRes] = await Promise.all([
      getPayments({ page, limit, status, method }),
      getPaymentStats(),
    ])
    setPayments(paymentsRes.data || [])
    setTotal(paymentsRes.total || 0)
    setStats(statsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page, status, method])

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Payment Operations & Settlements"
      subtitle="Monitoring Cash, Direct Driver UPI QR settlements, and ride receipt records"
      actions={
        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh Payments"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Confirmed Volume"
          value={`₹${Number(stats?.confirmedVolume || 0).toLocaleString()}`}
          subtitle={`${stats?.confirmedCount || 0} completed settlements`}
          icon={IndianRupee}
          color="green"
        />
        <KpiCard
          title="Gross Volume"
          value={`₹${Number(stats?.totalVolume || 0).toLocaleString()}`}
          subtitle="All transactions"
          icon={CreditCard}
          color="orange"
        />
        <KpiCard
          title="Pending Settlements"
          value={stats?.pendingCount || 0}
          subtitle="Awaiting partner confirmation"
          icon={Clock}
          color="cyan"
        />
        <KpiCard
          title="UPI vs Cash Mix"
          value={`${stats?.upiCount || 0} / ${stats?.cashCount || 0}`}
          subtitle="Direct UPI vs Cash"
          icon={QrCode}
          color="purple"
        />
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Payment Transaction Ledger</h3>
            <p className="text-xs text-zinc-400">Database records from completed and active trips</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="customer_marked_paid">Marked Paid by Customer</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value)
                setPage(1)
              }}
              className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI QR</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
            <p className="text-xs text-zinc-400">Loading ledger records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CreditCard className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Payment Records Found</p>
            <p className="text-xs text-zinc-500">Payments are generated as rides complete.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Ride Reference</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Customer Marked</th>
                  <th className="py-3 px-3">Partner Confirmed</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {p.ride_bookings?.booking_reference || p.ride_id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-mono uppercase text-[11px] font-bold text-zinc-300">
                        {p.payment_method === 'upi' ? <QrCode className="w-3.5 h-3.5 text-emerald-400" /> : <Banknote className="w-3.5 h-3.5 text-amber-400" />}
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                      ₹{Number(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {p.customer_marked_paid_at ? new Date(p.customer_marked_paid_at).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {p.partner_confirmed_at ? new Date(p.partner_confirmed_at).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/rides/${p.ride_id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#282828] text-orange-400 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-2 border-t border-[#222222] flex items-center justify-between">
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
    </AdminLayout>
  )
}
