import { cn } from '@/lib/utils'

export function LegalSection({
  id,
  number,
  title,
  children,
  highlightText = null,
}) {
  return (
    <article
      id={id}
      className="scroll-mt-32 rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-md p-6 sm:p-8 space-y-4 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        {number && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 shrink-0">
            {number}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>

      <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-3.5 pt-1">
        {children}
      </div>

      {highlightText && (
        <div className="mt-4 p-3.5 rounded-xl border border-orange-500/30 bg-orange-500/[0.04] text-xs text-orange-200 font-mono">
          <strong className="text-orange-400">NOTE: </strong>
          {highlightText}
        </div>
      )}
    </article>
  )
}

