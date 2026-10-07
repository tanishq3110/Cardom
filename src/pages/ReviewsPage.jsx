import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getReviews, getReviewsSummary } from '@/services/adminReviewsApi'
import {
  Star,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'

export function ReviewsPage() {
  const navigate = useNavigate()

  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [rating, setRating] = useState('all')
  const [loading, setLoading] = useState(true)

  const limit = 20

  const fetchData = async () => {
    setLoading(true)
    const [reviewsRes, summaryRes] = await Promise.all([
      getReviews({ page, limit, rating }),
      getReviewsSummary(),
    ])
    setReviews(reviewsRes.data || [])
    setTotal(reviewsRes.total || 0)
    setSummary(summaryRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page, rating])

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <AdminLayout
      title="Ratings & Passenger Feedback"
      subtitle="Moderation and review of passenger trip ratings and driver scorecards"
      actions={
        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-[#3D3D3D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Refresh Reviews"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
        </button>
      }
    >
      {/* Top Rating Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#141414] border border-[#242424] p-6 flex flex-col justify-center items-center text-center space-y-2">
          <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Ecosystem Rating</span>
          <div className="text-4xl font-black text-white flex items-center gap-2">
            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            {summary?.averageRating || '—'}
          </div>
          <p className="text-xs text-zinc-400">Based on {summary?.totalReviews || 0} customer reviews</p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 rounded-2xl bg-[#141414] border border-[#242424] p-5 space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Rating Distribution</h4>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary?.distribution?.[stars] || 0
            const pct = summary?.totalReviews > 0 ? ((count / summary.totalReviews) * 100).toFixed(0) : 0
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-zinc-400 font-mono flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#202020] overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-zinc-500 font-mono text-[11px]">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter and Reviews Table */}
      <div className="rounded-2xl bg-[#141414] border border-[#242424] overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Submitted Reviews Feed</h3>

          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value)
              setPage(1)
            }}
            className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
            <p className="text-xs text-zinc-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Star className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Reviews Found</p>
            <p className="text-xs text-zinc-500">Trip reviews will appear once passengers rate rides.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Passenger</th>
                  <th className="py-3 px-3">Partner / Driver</th>
                  <th className="py-3 px-3">Review Feedback</th>
                  <th className="py-3 px-3 text-right">Ride</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D]">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{r.profiles?.full_name || 'Passenger'}</div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-xs">{r.profiles?.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{r.partner_profiles?.business_name || 'Partner'}</div>
                      <div className="text-[10px] text-zinc-500">{r.partner_profiles?.authorized_contact_name}</div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300 max-w-md truncate">
                      {r.review ? `"${r.review}"` : <span className="text-zinc-600 italic">No written comment</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/rides/${r.ride_id}`)}
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
