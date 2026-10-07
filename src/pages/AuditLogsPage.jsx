import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getAuditLogs } from '@/services/adminAuditApi'
import {
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  FileCode,
} from 'lucide-react'

export function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('all')
  const [loading, setLoading] = useState(true)

  // Details modal state
  const [selectedLog, setSelectedLog] = useState(null)

  const limit = 25

  const fetchLogs = async () => {
    setLoading(true)
    const { data, total: count } = await getAuditLogs({
      page,
      limit,
      action,
    })
    setLogs(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [page, action])

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Administrative Audit Trail & Governance"
      subtitle="Immutable, append-only security logs capturing all administrative interventions and modifications"
      actions={
        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh Audit Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Filter and Top Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value)
            setPage(1)
          }}
          className="bg-[#141414] border border-[#282828] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 w-full sm:w-auto"
        >
          <option value="all">All Administrative Actions</option>
          <option value="UPDATE_PARTNER_STATUS">Partner Approvals & Suspensions</option>
          <option value="MODERATE_CAR_LISTING">Marketplace Car Moderations</option>
          <option value="RESOLVE_SOS_INCIDENT">SOS Resolutions</option>
          <option value="ACKNOWLEDGE_SOS">SOS Acknowledgements</option>
          <option value="BOOTSTRAP_FIRST_ADMIN">Super Admin Bootstraps</option>
        </select>

        <span className="text-xs font-mono text-zinc-500">
          Total audited events: {total}
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
            <p className="text-xs text-zinc-400">Loading audit records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Audit Records Logged</p>
            <p className="text-xs text-zinc-500">Admin operations will appear here as actions occur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-[#101010]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Type / ID</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-right">Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                      {new Date(l.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {l.admin_profiles?.full_name || 'Admin'}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {l.admin_profiles?.email || l.admin_id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-orange-500/10 border border-orange-500/25 text-orange-400">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-zinc-300 font-semibold">{l.target_type}</div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate max-w-xs">{l.target_id}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-xs truncate">
                      {l.reason || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(l.before_data || l.after_data) && (
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white transition-colors"
                        >
                          <FileCode className="w-3.5 h-3.5 text-orange-400" />
                          Diff
                        </button>
                      )}
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

      {/* JSON Diff / Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#141414] border border-[#2D2D2D] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-orange-400" />
                  Audit Event Payload #{String(selectedLog.id).slice(0, 8)}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedLog.action} on {selectedLog.target_type}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {selectedLog.reason && (
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#262626]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Recorded Reason</span>
                  <p className="text-zinc-200 mt-1">{selectedLog.reason}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Before Data (State Snapshot)</span>
                  <pre className="mt-1 p-3 rounded-xl bg-[#0D0D0D] border border-[#222222] font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-60">
                    {JSON.stringify(selectedLog.before_data, null, 2) || 'null'}
                  </pre>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">After Data (Mutated Snapshot)</span>
                  <pre className="mt-1 p-3 rounded-xl bg-[#0D0D0D] border border-[#222222] font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
                    {JSON.stringify(selectedLog.after_data, null, 2) || 'null'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#242424] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#202020] text-xs font-semibold text-white hover:bg-[#282828]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
