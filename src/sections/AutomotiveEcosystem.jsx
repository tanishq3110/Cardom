import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { EcosystemNode, EcosystemMobileCard } from '@/components/EcosystemNode'
import { ECOSYSTEM_SERVICES } from '@/data/ecosystem'
import { cn } from '@/lib/utils'

// ─── Section Divider ─────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-4 mb-20">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.07]" />
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 ring-4 ring-orange-500/10 flex-shrink-0" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.07]" />
    </div>
  )
}

// ─── Center Hub Component ───────────────────────────────────────────────────

function CentralHub({ activeService }) {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 select-none">
      {/* Outer ambient glow */}
      <motion.div
        animate={{
          scale: activeService ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: activeService ? 0.35 : 0.15,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-500 blur-[60px] pointer-events-none"
      />

      {/* Central Core Card */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        className={cn(
          'relative w-48 h-48 rounded-full flex flex-col items-center justify-center p-4 text-center',
          'bg-gradient-to-b from-[#181818]/90 via-[#0f0f0f]/95 to-[#080808]',
          'border border-white/10 backdrop-blur-xl',
          'shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]',
          'transition-all duration-300',
          activeService
            ? 'border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.25)]'
            : 'hover:border-orange-500/30',
        )}
      >
        {/* Animated concentric border ring */}
        <div
          aria-hidden="true"
          className="absolute inset-2 rounded-full border border-dashed border-white/[0.08] animate-[spin_60s_linear_infinite]"
        />

        {/* Cardom Logo Icon */}
        <div className="relative mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.6)]">
            <Zap className="w-5 h-5 text-white fill-white" strokeWidth={0} />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
        </div>

        {/* Brand Name */}
        <h3 className="text-lg font-extrabold tracking-tight text-white leading-none">
          Card<span className="text-orange-500">om</span>
        </h3>

        {/* Dynamic Status / Subtext */}
        <div className="mt-2 min-h-[32px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeService ? (
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <span className="text-[10px] font-mono tracking-wider uppercase text-orange-400 font-semibold">
                  {activeService.title}
                </span>
                <span className="text-[9px] text-zinc-400">
                  Active Connection
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400">
                  Automotive Core
                </span>
                <span className="text-[9px] text-zinc-500">
                  9 Integrated Nodes
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// ─── SVG Orbital Connections & Circuit Grid ─────────────────────────────────

function NetworkCanvas({ activeServiceId, radiusX = 40, radiusY = 38 }) {
  // Center is (50, 50) in percentage viewBox 0 0 100 100
  const cx = 50
  const cy = 50

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 w-full h-full"
    >
      <defs>
        {/* Orange Glow Filter */}
        <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradient for active line */}
        <linearGradient id="active-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#fb923c" stopOpacity="1" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Orbital Ellipses / Tracks */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={radiusX}
        ry={radiusY}
        fill="none"
        stroke="rgba(255, 255, 255, 0.04)"
        strokeWidth="0.2"
        strokeDasharray="1.5 2.5"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={radiusX * 0.65}
        ry={radiusY * 0.65}
        fill="none"
        stroke="rgba(255, 255, 255, 0.03)"
        strokeWidth="0.15"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={radiusX * 0.35}
        ry={radiusY * 0.35}
        fill="none"
        stroke="rgba(249, 115, 22, 0.08)"
        strokeWidth="0.2"
      />

      {/* Connection lines from center to each node */}
      {ECOSYSTEM_SERVICES.map((s) => {
        const rad = (s.angle * Math.PI) / 180
        const nx = cx + radiusX * Math.cos(rad)
        const ny = cy + radiusY * Math.sin(rad)
        const isActive = activeServiceId === s.id

        return (
          <g key={s.id}>
            {/* Base line */}
            <line
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke={isActive ? 'url(#active-line-gradient)' : 'rgba(255, 255, 255, 0.06)'}
              strokeWidth={isActive ? '0.6' : '0.2'}
              strokeDasharray={isActive ? 'none' : '1 2'}
              filter={isActive ? 'url(#node-glow)' : 'none'}
              className="transition-all duration-300"
            />

            {/* Active connection pulse line */}
            {isActive && (
              <line
                x1={cx}
                y1={cy}
                x2={nx}
                y2={ny}
                stroke="#ffffff"
                strokeWidth="0.4"
                strokeDasharray="4 16"
                className="animate-[dash_1.5s_linear_infinite]"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Main Section ───────────────────────────────────────────────────────────

export function AutomotiveEcosystem() {
  const [activeServiceId, setActiveServiceId] = useState(null)
  const headerRef = useRef(null)
  const isInView = useInView(headerRef, { once: true, margin: '-80px' })

  const activeService = ECOSYSTEM_SERVICES.find((s) => s.id === activeServiceId) || null

  return (
    <section
      id="ecosystem"
      aria-label="The Cardom Automotive Ecosystem"
      className="relative bg-[#080808] py-24 sm:py-32 overflow-hidden"
    >
      {/* ── Background Grid & Ambient Glow ── */}
      <GridPattern
        squareSize={40}
        strokeWidth={0.25}
        className="text-white/[0.015] fill-none"
      />

      {/* Ambient center aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full bg-orange-500/[0.045] blur-[150px]"
      />

      {/* Top subtle border divider line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Divider ── */}
        <SectionDivider />

        {/* ── Section Header ── */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full',
                'text-[11px] font-semibold tracking-widest uppercase',
                'border border-orange-500/20 bg-orange-500/[0.07] text-orange-400',
              )}>
                <Layers className="w-3.5 h-3.5" />
                The Cardom Ecosystem
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight text-white mb-5">
              Everything Around{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                Your Car.
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              From finding your next vehicle to keeping it running, Cardom brings
              the entire automotive journey together.
            </p>
          </motion.div>
        </div>

        {/* ── Desktop Radial Ecosystem Composition (lg+) ── */}
        <div className="hidden lg:block relative w-full max-w-5xl mx-auto h-[660px] rounded-3xl border border-white/[0.06] bg-[#0b0b0b]/60 backdrop-blur-sm overflow-hidden shadow-2xl">
          {/* Subtle tech coordinate marks */}
          <div className="absolute top-5 left-6 text-[10px] font-mono text-zinc-600 tracking-wider">
            CARDOM NETWORK // SYS.09
          </div>
          <div className="absolute top-5 right-6 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ALL NODES SYNCHRONIZED
          </div>
          <div className="absolute bottom-5 left-6 text-[10px] font-mono text-zinc-600">
            RADIAL INTERACTION: HOVER TO INSPECT
          </div>
          <div className="absolute bottom-5 right-6 text-[10px] font-mono text-orange-400/80">
            {activeService ? `SELECTED: ${activeService.title.toUpperCase()}` : 'READY'}
          </div>

          {/* Canvas for connection lines & orbital rings */}
          <NetworkCanvas activeServiceId={activeServiceId} radiusX={38} radiusY={37} />

          {/* Center Hub */}
          <CentralHub activeService={activeService} />

          {/* 9 Orbital Nodes */}
          {ECOSYSTEM_SERVICES.map((service, index) => (
            <EcosystemNode
              key={service.id}
              service={service}
              index={index}
              radiusX={38}
              radiusY={37}
              isActive={activeServiceId === service.id}
              isDimmed={activeServiceId !== null && activeServiceId !== service.id}
              onHover={setActiveServiceId}
              onClick={setActiveServiceId}
            />
          ))}
        </div>

        {/* ── Mobile / Tablet Responsive Layout (< lg) ── */}
        <div className="lg:hidden flex flex-col gap-6">
          {/* Mobile Central Hub Banner */}
          <div className="p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#14120f] via-[#0e0e0e] to-[#080808] flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_18px_rgba(249,115,22,0.5)]">
                <Zap className="w-6 h-6 text-white fill-white" strokeWidth={0} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Card<span className="text-orange-500">om</span> Core
                </h3>
                <p className="text-xs text-zinc-400">
                  9 Integrated Automotive Capabilities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </div>
          </div>

          {/* Responsive Card Grid (2 cols on sm, 1 col on xs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ECOSYSTEM_SERVICES.map((service, index) => (
              <EcosystemMobileCard
                key={service.id}
                service={service}
                index={index}
                isActive={activeServiceId === service.id}
                onSelect={(id) => setActiveServiceId(activeServiceId === id ? null : id)}
              />
            ))}
          </div>
        </div>

        {/* ── Bottom Ecosystem Action & Summary Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-orange-400 flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                One Account. Every Automotive Service.
              </p>
              <p className="text-xs text-zinc-400">
                Seamless data handover between buying, servicing, financing, and ownership.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <ShimmerButton size="md" className="w-full sm:w-auto">
              Explore The Platform
              <ArrowRight className="w-4 h-4" />
            </ShimmerButton>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080808] to-transparent"
      />
    </section>
  )
}

