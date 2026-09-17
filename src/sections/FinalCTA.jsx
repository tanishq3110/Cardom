import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  Car,
  ShieldCheck,
  Zap,
  Gauge,
  Compass,
} from 'lucide-react'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { ShimmerButton } from '@/components/vengeance/ShimmerButton'
import { cn } from '@/lib/utils'

// ─── Reusable Section Divider ─────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-4 mb-16 sm:mb-20">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.07]" />
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 ring-4 ring-orange-500/10 flex-shrink-0" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.07]" />
    </div>
  )
}

// ─── Atmospheric Light Streaks & Aerodynamic Silhouette (SVG) ────────────────

function AutomotiveAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center select-none"
    >
      {/* Primary deep orange core bloom */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.14, 0.22, 0.14],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[700px] sm:w-[950px] h-[380px] rounded-full bg-gradient-to-r from-orange-600/30 via-orange-500/20 to-orange-600/30 blur-[120px]"
      />

      {/* Secondary high-beam horizon glow */}
      <div className="absolute bottom-1/4 w-[500px] h-[120px] rounded-full bg-orange-400/[0.12] blur-[90px]" />

      {/* Ambient Speedometer / Speedline Vectors */}
      <svg
        viewBox="0 0 1200 480"
        className="w-full h-full max-w-6xl object-cover opacity-20"
        fill="none"
      >
        <defs>
          <linearGradient id="streak-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="25%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Aerodynamic roofline silhouette & taillight horizon bar */}
        <path
          d="M 100 340 C 350 340, 480 200, 600 200 C 720 200, 850 340, 1100 340"
          stroke="url(#streak-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 180 345 C 380 345, 500 230, 600 230 C 700 230, 820 345, 1020 345"
          stroke="url(#streak-gradient)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {/* Concentric telemetry arcs */}
        <path
          d="M 320 380 A 300 300 0 0 1 880 380"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
        />
        <path
          d="M 390 380 A 220 220 0 0 1 810 380"
          stroke="rgba(249, 115, 22, 0.08)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />

        {/* Radial tick marks */}
        {Array.from({ length: 17 }, (_, i) => {
          const angle = Math.PI - (Math.PI / 16) * i
          const r = 300
          const cx = 600
          const cy = 380
          const x1 = cx + r * Math.cos(angle)
          const y1 = cy - r * Math.sin(angle)
          const len = i % 4 === 0 ? 14 : 7
          const x2 = cx + (r - len) * Math.cos(angle)
          const y2 = cy - (r - len) * Math.sin(angle)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 4 === 0 ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={i % 4 === 0 ? '1.5' : '1'}
            />
          )
        })}

        {/* Horizon baseline */}
        <line
          x1="150"
          y1="380"
          x2="1050"
          y2="380"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}

// ─── Key Value Reassurance Badges ───────────────────────────────────────────

const ASSURANCES = [
  { Icon: ShieldCheck, label: 'Verified Ownership & Escrow' },
  { Icon: Zap, label: 'Instant Digital Paperwork' },
  { Icon: Gauge, label: 'Nationwide Service Network' },
]

// ─── FinalCTA Section ────────────────────────────────────────────────────────

export function FinalCTA() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-80px' })

  return (
    <section
      id="cta"
      aria-label="Get Started with Cardom"
      className="relative bg-[#080808] py-24 sm:py-36 overflow-hidden"
    >
      {/* ── Background Grid & Edge Dividers ── */}
      <GridPattern
        squareSize={40}
        strokeWidth={0.25}
        className="text-white/[0.012] fill-none"
      />

      {/* Top subtle line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Divider ── */}
        <SectionDivider />

        {/* ── Main Cinematic Box ── */}
        <div
          ref={containerRef}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-[#121212]/90 via-[#0d0d0d]/95 to-[#080808] p-8 sm:p-14 lg:p-20 text-center shadow-2xl"
        >
          {/* Vengeance UI Border Beam on the CTA Container */}
          <BorderBeam
            duration={12}
            colorFrom="rgba(249,115,22,0.85)"
            colorTo="transparent"
            borderWidth={1.2}
          />

          {/* Atmospheric backdrop inside the card */}
          <AutomotiveAtmosphere />

          {/* ── Foreground Content ── */}
          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Small Label Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center mb-6"
            >
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full',
                'text-[11px] font-semibold tracking-widest uppercase',
                'border border-orange-500/20 bg-orange-500/[0.08] text-orange-400',
              )}>
                <Compass className="w-3.5 h-3.5" />
                Your Journey Starts Here
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]',
                'text-white mb-6',
              )}
            >
              Ready to{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                Move Forward?
              </span>
            </motion.h2>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto mb-10 sm:mb-12 font-normal"
            >
              Whether you&apos;re buying your next car, selling your current one,
              or taking care of the vehicle you already own — Cardom brings it all
              together.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-14"
            >
              <Link to="/cars" className="w-full sm:w-auto">
                <ShimmerButton
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] shadow-[0_0_30px_rgba(249,115,22,0.35)]"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>

              <Link
                to="/cars"
                className={cn(
                  'w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center gap-2',
                  'px-7 py-3.5 rounded-lg text-base font-medium',
                  'border border-white/15 bg-white/[0.03] text-zinc-200 backdrop-blur-sm',
                  'hover:border-orange-500/40 hover:text-white hover:bg-orange-500/[0.06]',
                  'transition-all duration-200 active:scale-[0.98]',
                )}
              >
                <Car className="w-4 h-4 text-zinc-400 group-hover:text-orange-400" />
                Explore Cars
              </Link>
            </motion.div>

            {/* Reassurance Feature Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="pt-8 border-t border-white/[0.07] flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs text-zinc-400"
            >
              {ASSURANCES.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-orange-400" />
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom atmospheric fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent"
      />
    </section>
  )
}

