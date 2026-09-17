import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * EcosystemNode — represents a service node in the Cardom Automotive Ecosystem network.
 * 
 * Used in two modes:
 *  - 'radial': Desktop orbital position with radial coordinates (angle, radiusX, radiusY)
 *  - 'card': Responsive mobile / tablet card representation
 */
export function EcosystemNode({
  service,
  isActive,
  isDimmed,
  onHover,
  onClick,
  radiusX = 40, // percent
  radiusY = 38, // percent
  index = 0,
}) {
  const { title, label, description, Icon, angle, badge } = service

  // Calculate percentage positions from angle
  const rad = (angle * Math.PI) / 180
  const posX = 50 + radiusX * Math.cos(rad)
  const posY = 50 + radiusY * Math.sin(rad)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        delay: 0.15 + index * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => onHover && onHover(service.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onClick && onClick(service.id)}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={cn(
        'absolute z-20 cursor-pointer select-none',
        'transition-all duration-300',
        isDimmed ? 'opacity-35 blur-[0.4px]' : 'opacity-100',
      )}
    >
      <motion.div
        animate={{
          scale: isActive ? 1.08 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl backdrop-blur-md',
          'transition-all duration-300',
          // Default surface
          'bg-[#0f0f0f]/90 border border-white/[0.08]',
          // Active state glow and border
          isActive
            ? 'bg-[#18120d] border-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.35),0_0_0_1px_rgba(249,115,22,0.5)]'
            : 'hover:border-white/20 hover:bg-[#151515]',
        )}
      >
        {/* Active top highlight line */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute top-0 left-3 right-3 h-px rounded-full transition-opacity duration-300',
            isActive ? 'opacity-100 bg-gradient-to-r from-transparent via-orange-400 to-transparent' : 'opacity-0',
          )}
        />

        {/* Icon box */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300',
            isActive
              ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
              : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06]',
          )}
        >
          <Icon className="w-4 h-4" strokeWidth={1.8} />
        </div>

        {/* Label & Title */}
        <div className="flex flex-col text-left whitespace-nowrap pr-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-[10px] font-mono tabular-nums transition-colors duration-200',
                isActive ? 'text-orange-400 font-semibold' : 'text-zinc-500',
              )}
            >
              {badge}
            </span>
            <span
              className={cn(
                'text-[13px] font-semibold transition-colors duration-200',
                isActive ? 'text-white' : 'text-zinc-200',
              )}
            >
              {title}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 max-w-[120px] truncate">
            {label}
          </span>
        </div>

        {/* Active Node Tooltip Popout (shows description on hover) */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-30',
              'w-56 p-3 rounded-xl bg-[#0c0c0c] border border-orange-500/30',
              'shadow-[0_12px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(249,115,22,0.15)]',
              'pointer-events-none text-left',
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-orange-400">
                {title}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

/**
 * EcosystemMobileCard — used for clean vertical/grid presentation on smaller screens.
 */
export function EcosystemMobileCard({
  service,
  isActive,
  onSelect,
  index = 0,
}) {
  const { title, label, description, Icon, badge } = service

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        delay: index * 0.05,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => onSelect(service.id)}
      className={cn(
        'group relative flex flex-col p-4 rounded-xl cursor-pointer',
        'transition-all duration-300',
        'bg-[#0f0f0f] border',
        isActive
          ? 'border-orange-500/50 bg-[#16110c] shadow-[0_0_24px_rgba(249,115,22,0.15)]'
          : 'border-white/[0.07] hover:border-white/15',
      )}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200',
              isActive
                ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]'
                : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] group-hover:text-zinc-200',
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
              {title}
            </h4>
            <p className="text-[10px] text-zinc-400 font-medium">
              {label}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border',
            isActive
              ? 'border-orange-500/30 text-orange-400 bg-orange-500/10'
              : 'border-white/[0.06] text-zinc-600 bg-white/[0.02]',
          )}
        >
          {badge}
        </span>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed mt-1">
        {description}
      </p>

      {/* Subtle indicator bar */}
      <div
        className={cn(
          'mt-3 h-0.5 w-full rounded-full transition-all duration-300',
          isActive
            ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-transparent'
            : 'bg-transparent group-hover:bg-white/[0.06]',
        )}
      />
    </motion.div>
  )
}

