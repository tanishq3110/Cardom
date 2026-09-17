import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * ProcessStep — individual step in the "How It Works" section.
 *
 * Props:
 *   step       {object}   — { id, number, title, description, Icon }
 *   index      {number}   — 0-based position
 *   isActive   {boolean}  — controlled by parent scroll tracker
 *   onVisible  {function} — called when step enters viewport (for scroll activation)
 *   total      {number}   — total step count (for border logic)
 */
export function ProcessStep({ step, index, isActive, onVisible, total }) {
  const ref = useRef(null)

  // Framer Motion's useInView — fires whenever the element crosses the threshold.
  // We use "once: false" so the active step tracks bidirectional scrolling.
  const inView = useInView(ref, { threshold: 0.45, once: false })

  useEffect(() => {
    if (inView) onVisible(index)
  }, [inView, index, onVisible])

  const Icon = step.Icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        delay:    index * 0.08,
        duration: 0.6,
        ease:     [0.22, 1, 0.36, 1],
      }}
      className={cn(
        'relative flex gap-5 py-10',
        // Vertical connector line (all steps except last)
        index < total - 1 && 'after:absolute after:left-[22px] after:top-[76px] after:bottom-0 after:w-px after:bg-white/[0.07]',
      )}
    >
      {/* ── Left: step indicator column ── */}
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">

        {/* Numbered circle */}
        <motion.div
          animate={{
            backgroundColor: isActive ? 'rgba(249,115,22,1)'    : 'rgba(13,13,13,1)',
            borderColor:     isActive ? 'rgba(249,115,22,1)'    : 'rgba(255,255,255,0.1)',
            boxShadow:       isActive
              ? '0 0 0 4px rgba(249,115,22,0.15), 0 0 20px rgba(249,115,22,0.3)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-11 h-11 rounded-full border-2 flex items-center justify-center relative z-10"
        >
          <motion.span
            animate={{ color: isActive ? '#ffffff' : 'rgba(113,113,122,1)' }}
            transition={{ duration: 0.3 }}
            className="text-sm font-bold tabular-nums"
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>
        </motion.div>
      </div>

      {/* ── Right: step content ── */}
      <div className="flex-1 min-w-0 pb-2">

        {/* Accent tag */}
        <motion.p
          animate={{ color: isActive ? 'rgba(251,146,60,0.9)' : 'rgba(63,63,70,1)' }}
          transition={{ duration: 0.35 }}
          className="text-[10px] font-bold tracking-[0.14em] uppercase mb-2 select-none"
        >
          Step {String(index + 1).padStart(2, '0')} — {step.accentLabel}
        </motion.p>

        {/* Icon + title row */}
        <div className="flex items-start gap-3 mb-3">
          <motion.div
            animate={{
              backgroundColor: isActive ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
              borderColor:     isActive ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.06)',
            }}
            transition={{ duration: 0.4 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-300"
          >
            <Icon
              className={cn(
                'w-[18px] h-[18px] transition-colors duration-300',
                isActive ? 'text-orange-400' : 'text-zinc-700',
              )}
              strokeWidth={1.75}
            />
          </motion.div>

          <motion.h3
            animate={{ color: isActive ? '#ffffff' : 'rgba(63,63,70,1)' }}
            transition={{ duration: 0.35 }}
            className="text-[17px] font-bold leading-snug pt-1.5"
          >
            {step.title}
          </motion.h3>
        </div>

        {/* Description */}
        <motion.p
          animate={{ color: isActive ? 'rgba(161,161,170,1)' : 'rgba(39,39,42,1)' }}
          transition={{ duration: 0.35 }}
          className="text-[14px] leading-relaxed max-w-sm"
        >
          {step.description}
        </motion.p>

        {/* Active state highlight line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
          className="mt-5 h-px w-full max-w-xs bg-gradient-to-r from-orange-500/50 to-transparent"
        />
      </div>
    </motion.div>
  )
}

