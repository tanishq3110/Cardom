import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Search,
  BarChart2,
  CheckSquare,
  Navigation,
  Sparkles,
} from 'lucide-react'
import { GridPattern }  from '@/components/vengeance/GridPattern'
import { ProcessStep }  from '@/components/ProcessStep'
import { cn } from '@/lib/utils'

// ─── Step data ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id:          'discover',
    number:      '01',
    accentLabel: 'Discover',
    title:       'Discover',
    description: 'Explore cars, services, financing, and insurance options tailored to your needs and budget — all from one place.',
    Icon:        Search,
    visual: {
      ring1: 'rgba(249,115,22,0.14)',
      ring2: 'rgba(249,115,22,0.07)',
      ring3: 'rgba(249,115,22,0.03)',
      glow:  'rgba(249,115,22,0.18)',
    },
  },
  {
    id:          'compare',
    number:      '02',
    accentLabel: 'Compare',
    title:       'Compare',
    description: 'Side-by-side comparisons of vehicles, pricing, service costs, and financing options to help you decide with confidence.',
    Icon:        BarChart2,
    visual: {
      ring1: 'rgba(249,115,22,0.20)',
      ring2: 'rgba(249,115,22,0.10)',
      ring3: 'rgba(249,115,22,0.05)',
      glow:  'rgba(249,115,22,0.22)',
    },
  },
  {
    id:          'choose',
    number:      '03',
    accentLabel: 'Choose',
    title:       'Choose',
    description: 'Select the car or automotive service that perfectly matches your preferences and lock in your choice with full transparency.',
    Icon:        CheckSquare,
    visual: {
      ring1: 'rgba(249,115,22,0.26)',
      ring2: 'rgba(249,115,22,0.13)',
      ring3: 'rgba(249,115,22,0.06)',
      glow:  'rgba(249,115,22,0.28)',
    },
  },
  {
    id:          'drive',
    number:      '04',
    accentLabel: 'Drive',
    title:       'Drive',
    description: 'Complete the process, get behind the wheel, and manage your entire automotive journey from one unified Cardom dashboard.',
    Icon:        Navigation,
    visual: {
      ring1: 'rgba(249,115,22,0.35)',
      ring2: 'rgba(249,115,22,0.18)',
      ring3: 'rgba(249,115,22,0.08)',
      glow:  'rgba(249,115,22,0.38)',
    },
  },
]

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

// ─── Animated ring ────────────────────────────────────────────────────────────

function PulseRing({ size, color, delay, duration }) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-full border"
      style={{
        width:       size,
        height:      size,
        borderColor: color,
      }}
      animate={{
        scale:   [1, 1.03, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration,
        delay,
        repeat:     Infinity,
        ease:       'easeInOut',
      }}
    />
  )
}

// ─── Cardinal position dots (N / E / S / W on the outer ring) ────────────────

function CardinalDots({ activeStep }) {
  const r = 148   // same as outer ring radius
  const dots = Array.from({ length: 4 }, (_, i) => {
    const angle = (i * 90 - 90) * (Math.PI / 180)
    return {
      x:      Math.cos(angle) * r,
      y:      Math.sin(angle) * r,
      active: i <= activeStep,
    }
  })

  return (
    <>
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="absolute w-2 h-2 rounded-full -translate-x-1 -translate-y-1"
          style={{
            left: `calc(50% + ${dot.x}px)`,
            top:  `calc(50% + ${dot.y}px)`,
          }}
          animate={{
            backgroundColor: dot.active
              ? 'rgba(249,115,22,1)'
              : 'rgba(255,255,255,0.1)',
            boxShadow: dot.active
              ? '0 0 8px rgba(249,115,22,0.7)'
              : 'none',
          }}
          transition={{ duration: 0.4 }}
        />
      ))}
    </>
  )
}

// ─── Dashboard gauge arc (bottom decorative element) ─────────────────────────

function GaugeArc({ activeStep }) {
  // The arc fill progresses as activeStep increases (0→3)
  const progress = activeStep / (STEPS.length - 1)

  // Arc math: semi-circle, r=90, cx=cy=100
  const r  = 90
  const cx = 100
  const cy = 100
  const circumference = Math.PI * r  // half circle

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 110"
      className="w-[220px] h-[120px] absolute bottom-8 left-1/2 -translate-x-1/2"
    >
      {/* Track arc */}
      <path
        d={`M ${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <motion.path
        d={`M ${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none"
        stroke="rgba(249,115,22,0.7)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: circumference * (1 - progress) }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Tick marks */}
      {Array.from({ length: 9 }, (_, i) => {
        const a   = Math.PI - (Math.PI / 8) * i
        const x1  = cx + r       * Math.cos(a)
        const y1  = cy - r       * Math.sin(a)
        const x2  = cx + (r - 8) * Math.cos(a)
        const y2  = cy - (r - 8) * Math.sin(a)
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i <= Math.round(progress * 8) ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)'}
            strokeWidth="1"
            strokeLinecap="round"
          />
        )
      })}
      {/* Centre dot */}
      <circle cx={cx} cy={cy} r="3" fill="rgba(249,115,22,0.5)" />
    </svg>
  )
}

// ─── Step visual panel (sticky left on desktop) ───────────────────────────────

function StepVisual({ activeStep }) {
  const step = STEPS[activeStep]
  const v    = step.visual

  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: 480 }}>

      {/* ── Outer ambient glow ── */}
      <motion.div
        aria-hidden="true"
        animate={{ backgroundColor: v.glow }}
        transition={{ duration: 0.6 }}
        className="absolute w-64 h-64 rounded-full blur-[80px]"
      />

      {/* ── Concentric animated rings ── */}
      <PulseRing size={296} color={v.ring3} delay={0}    duration={4.0} />
      <PulseRing size={212} color={v.ring2} delay={0.7}  duration={3.5} />
      <PulseRing size={130} color={v.ring1} delay={1.4}  duration={3.0} />

      {/* ── Cardinal position dots ── */}
      <CardinalDots activeStep={activeStep} />

      {/* ── Centre icon + number ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, scale: 0.88, y: 10 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.88, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-3"
        >
          {/* Icon box */}
          <motion.div
            animate={{ borderColor: v.ring1, backgroundColor: v.glow }}
            transition={{ duration: 0.5 }}
            className="w-[72px] h-[72px] rounded-2xl border flex items-center justify-center"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <step.Icon className="w-8 h-8 text-orange-400" strokeWidth={1.5} />
          </motion.div>

          {/* Step number — large watermark */}
          <span className="text-[80px] font-black leading-none tabular-nums select-none text-orange-500/10 -mt-2">
            {step.number}
          </span>

          {/* Step label */}
          <span className="text-xs font-bold tracking-[0.16em] uppercase text-orange-400/60">
            {step.accentLabel}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* ── Gauge arc (bottom) ── */}
      <GaugeArc activeStep={activeStep} />

      {/* ── Progress dots row ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width:           i === activeStep ? 20 : 6,
              backgroundColor: i <= activeStep ? 'rgba(249,115,22,1)' : 'rgba(255,255,255,0.12)',
            }}
            transition={{ duration: 0.35 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </div>
  )
}

// ─── Mobile step indicator (simplified) ──────────────────────────────────────

function MobileStepIndicator({ activeStep }) {
  return (
    <div className="flex items-center justify-between mb-10 px-1">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            animate={{
              backgroundColor: i <= activeStep ? 'rgba(249,115,22,1)' : 'rgba(39,39,42,1)',
              borderColor:     i <= activeStep ? 'rgba(249,115,22,1)' : 'rgba(63,63,70,1)',
              boxShadow:       i === activeStep ? '0 0 12px rgba(249,115,22,0.4)' : 'none',
            }}
            transition={{ duration: 0.4 }}
            className="w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          >
            <step.Icon
              className={cn(
                'w-4 h-4 transition-colors duration-300',
                i <= activeStep ? 'text-white' : 'text-zinc-700',
              )}
              strokeWidth={1.75}
            />
          </motion.div>
          {/* Connector line between steps */}
          {i < STEPS.length - 1 && (
            <motion.div
              animate={{
                backgroundColor: i < activeStep ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.06)',
              }}
              transition={{ duration: 0.4 }}
              className="flex-1 h-px mx-2"
              style={{ minWidth: 24 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────

/**
 * Scroll-driven step storytelling section.
 *
 * Architecture (inspired by Skiper UI's "Side Scroll Navigation" pattern):
 *   - Left column: sticky visual panel — changes based on active step
 *   - Right column: scrollable ProcessStep list — each step calls onVisible()
 *     when it crosses the 45% viewport threshold, updating activeStep state
 *
 * This mirrors the pattern used by Skiper UI's skiper60 component, implemented
 * natively with Framer Motion's useInView (skiper60's CLI download requires
 * Pro authentication).
 */
export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  const headerRef = useRef(null)
  const isInView  = useInView(headerRef, { once: true, margin: '-80px' })

  // Stable callback — avoids unnecessary re-renders in child components
  const handleStepVisible = useCallback((index) => {
    setActiveStep(index)
  }, [])

  return (
    <section
      id="how-it-works"
      aria-label="How Cardom Works"
      className="relative bg-[#080808] py-24 sm:py-32 overflow-hidden"
    >
      {/* ── Background ── */}
      <GridPattern
        squareSize={44}
        strokeWidth={0.25}
        className="text-white/[0.012] fill-none"
      />

      {/* Ambient glow — shifts subtly with active step */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: 0.04 + activeStep * 0.015 }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-orange-500 blur-[140px]"
      />

      {/* Section top-edge */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Divider ── */}
        <SectionDivider />

        {/* ── Section header ── */}
        <div ref={headerRef} className="mb-16 lg:mb-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
                'text-[11px] font-semibold tracking-widest uppercase',
                'border border-orange-500/20 bg-orange-500/[0.07] text-orange-400',
              )}>
                <Sparkles className="w-3 h-3" />
                The Cardom Experience
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight text-white mb-5">
              From Search{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                to Drive.
              </span>
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Everything you need to buy, own, maintain, and enjoy your car —
              connected in one ecosystem.
            </p>
          </motion.div>
        </div>

        {/* ── Mobile step indicator ── */}
        <div className="lg:hidden">
          <MobileStepIndicator activeStep={activeStep} />
        </div>

        {/* ── Main layout: sticky visual + scrollable steps ──
            On lg+:  two columns, left is sticky
            On < lg: single column, visual hidden (mobile indicator used instead)
        ── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">

          {/* Left — Sticky visual (desktop only) */}
          <div className="hidden lg:block sticky top-24">
            <div className={cn(
              'rounded-3xl overflow-hidden',
              'border border-white/[0.06]',
              'bg-gradient-to-br from-[#0f0f0f] to-[#080808]',
            )}>
              <StepVisual activeStep={activeStep} />
            </div>

            {/* Step title beneath visual on desktop */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-5 text-center"
              >
                <p className="text-sm font-medium text-zinc-500">
                  <span className="text-orange-500">{STEPS[activeStep].number}</span>
                  {' / '}
                  {String(STEPS.length).padStart(2, '0')}
                  {'  '}
                  <span className="text-zinc-400">{STEPS[activeStep].title}</span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — Scrollable steps */}
          <div className="relative">
            {STEPS.map((step, index) => (
              <ProcessStep
                key={step.id}
                step={step}
                index={index}
                isActive={activeStep === index}
                onVisible={handleStepVisible}
                total={STEPS.length}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080808] to-transparent" />
    </section>
  )
}

