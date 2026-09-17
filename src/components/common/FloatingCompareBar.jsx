import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Layers, Plus, AlertCircle, Trash2 } from 'lucide-react'
import { useComparison } from '@/context/ComparisonContext'
import { cn } from '@/lib/utils'

export function FloatingCompareBar() {
  const { compareIds, compareCars, removeCar, clearAll, notice, maxAllowed } = useComparison()
  const location = useLocation()
  const navigate = useNavigate()

  // Hide on /compare page or if no cars selected
  if (location.pathname === '/compare' || compareIds.length === 0) {
    return (
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-900 border border-orange-500/40 text-orange-400 text-xs font-semibold shadow-2xl flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span>{notice}</span>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none flex flex-col items-center">
      {/* Notice Toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 pointer-events-auto px-4 py-2 rounded-full bg-zinc-900/95 border border-orange-500/40 text-orange-400 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span>{notice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Comparison Bar */}
      <motion.aside
        aria-label="Vehicle comparison drawer"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'pointer-events-auto w-full max-w-3xl rounded-2xl sm:rounded-3xl',
          'bg-[#101010]/95 backdrop-blur-xl border border-white/[0.12]',
          'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_24px_rgba(249,115,22,0.12)]',
          'p-3 sm:p-4 text-white',
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left: Selected vehicles thumbnails and pills */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold text-zinc-400 pr-1">
              <Layers className="w-4 h-4 text-orange-400" />
              <span className="hidden xs:inline">Compare</span>
              <span className="px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-mono">
                {compareIds.length}/{maxAllowed}
              </span>
            </div>

            {/* Car Cards / Slots */}
            <div className="flex items-center gap-2">
              {compareIds.map((id) => {
                const car = compareCars.find((c) => String(c.id) === String(id))
                return (
                  <div
                    key={id}
                    className="group relative flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] transition-colors max-w-[140px] sm:max-w-[170px]"
                  >
                    {/* Thumbnail */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      <img
                        src={car?.image_url || car?.image || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=150&q=80'}
                        alt={car ? `${car.brand} ${car.model}` : 'Vehicle'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=150&q=80'
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white truncate leading-tight">
                        {car ? `${car.brand} ${car.model}` : 'Loading...'}
                      </p>
                      {car && (
                        <p className="text-[10px] text-zinc-400 truncate">
                          {car.year}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCar(id)}
                      className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove car"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}

              {/* Empty placeholder slot if < 3 */}
              {compareIds.length < maxAllowed && (
                <button
                  type="button"
                  onClick={() => navigate('/cars')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-white/15 hover:border-orange-500/40 bg-white/[0.02] hover:bg-white/[0.05] text-[11px] font-medium text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer whitespace-nowrap"
                  title="Add another car from marketplace"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Car</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Clear all cars"
            >
              Clear
            </button>

            <Link
              to="/compare"
              className={cn(
                'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.35)]',
                'flex-1 sm:flex-initial text-center',
              )}
            >
              <span>Compare Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.aside>
    </div>
  )
}

