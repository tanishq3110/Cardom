import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Car,
  Tag,
  Shield,
  CreditCard,
  Repeat2,
  Wrench,
  PhoneCall,
  Package,
  ArrowUpRight,
  Layers,
} from 'lucide-react'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { BorderBeam }  from '@/components/vengeance/BorderBeam'
import { cn } from '@/lib/utils'

// ─── Service data ─────────────────────────────────────────────────────────────

const SERVICES = [
  {
    number:      '01',
    Icon:        Car,
    title:       'Buy a Car',
    accent:      'Marketplace',
    description: 'Browse thousands of certified pre-owned and new vehicles with transparent pricing and verified seller histories.',
    cta:         'Browse cars',
    href:        '/cars',
  },
  {
    number:      '02',
    Icon:        Tag,
    title:       'Sell Your Car',
    accent:      'Listings',
    description: 'List your vehicle in minutes. Receive competitive offers from verified buyers across the country.',
    cta:         'Sell now',
    href:        '/sell',
  },
  {
    number:      '03',
    Icon:        Shield,
    title:       'Insurance',
    accent:      'Protection',
    description: 'Compare plans from top insurers, get instant quotes, and activate your policy on the same day.',
    cta:         'Get a quote',
    href:        '/insurance',
  },
  {
    number:      '04',
    Icon:        CreditCard,
    title:       'Car Financing',
    accent:      'Finance',
    description: 'Flexible EMI options and competitive interest rates from leading banks and NBFCs.',
    cta:         'Check eligibility',
    href:        '/finance',
  },
  {
    number:      '05',
    Icon:        Repeat2,
    title:       'Car Subscription',
    accent:      'Subscription',
    description: 'Drive any car, switch anytime. Monthly plans with zero long-term commitment or ownership hassle.',
    cta:         'Explore plans',
    href:        '/subscription',
  },
  {
    number:      '06',
    Icon:        Wrench,
    title:       'Service & Repair',
    accent:      'Maintenance',
    description: 'Book certified mechanics for everything from routine oil changes to complex engine repairs.',
    cta:         'Book service',
    href:        '/service',
  },
  {
    number:      '07',
    Icon:        PhoneCall,
    title:       'Roadside Assistance',
    accent:      'Emergency',
    description: '24/7 emergency help wherever you are — towing, battery jump-start, flat tyre, and fuel delivery.',
    cta:         'Get assistance',
    href:        '/roadside',
  },
  {
    number:      '08',
    Icon:        Package,
    title:       'Spare Parts',
    accent:      'Parts',
    description: 'Genuine OEM and quality aftermarket parts delivered fast, right to your doorstep or garage.',
    cta:         'Shop parts',
    href:        '/parts',
  },
]

// ─── Animation config ─────────────────────────────────────────────────────────

/**
 * Per-card stagger: cards in the same row reveal offset by column index.
 * On small screens (< md) we treat it as 1-col so all use 0 delay.
 */
function cardVariants(colIndex) {
  return {
    hidden: { opacity: 0, y: 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay:    colIndex * 0.07,
        duration: 0.55,
        ease:     [0.22, 1, 0.36, 1],
      },
    },
  }
}

const headerVariants = {
  hidden:   { opacity: 0, y: 28 },
  visible:  {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const ctaVariants = {
  hidden:   { opacity: 0, y: 14 },
  visible:  {
    opacity: 1, y: 0,
    transition: { delay: 0.5, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── ServiceCard ─────────────────────────────────────────────────────────────

function ServiceCard({ service, colIndex }) {
  const navigate = useNavigate()
  const { number, Icon, title, accent, description, cta, href } = service

  return (
    <motion.article
      onClick={() => href && navigate(href)}
      variants={cardVariants(colIndex)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -7, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative flex flex-col overflow-hidden',
        'rounded-2xl p-6',
        href ? 'cursor-pointer' : 'cursor-default',
        // Base surface
        'bg-[#0d0d0d]',
        // Border — subtle at rest, orange-tinted on hover
        'border border-white/[0.06]',
        'hover:border-orange-500/25',
        // Shadow — deep on hover with soft orange bloom
        'shadow-none',
        'hover:shadow-[0_0_0_1px_rgba(249,115,22,0.08),0_12px_40px_rgba(0,0,0,0.5),0_0_28px_rgba(249,115,22,0.07)]',
        'transition-[border-color,box-shadow,transform] duration-300',
      )}
    >
      {/* ── Top accent line (orange gradient on hover) ── */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute top-0 left-6 right-6 h-px',
          'bg-gradient-to-r from-transparent via-orange-500/0 to-transparent',
          'group-hover:via-orange-500/60',
          'transition-all duration-500',
        )}
      />

      {/* ── Number watermark ── */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-5 right-5 tabular-nums font-black leading-none select-none',
          'text-5xl text-orange-500/[0.055]',
          'group-hover:text-orange-500/[0.13]',
          'transition-colors duration-300',
        )}
      >
        {number}
      </span>

      {/* ── Icon box ── */}
      <div
        className={cn(
          'mb-5 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          'bg-white/[0.04] border border-white/[0.07]',
          'group-hover:bg-orange-500/10 group-hover:border-orange-500/25',
          'transition-all duration-300',
        )}
      >
        <Icon
          className={cn(
            'w-[18px] h-[18px] text-zinc-500',
            'group-hover:text-orange-400',
            'transition-colors duration-300',
          )}
          strokeWidth={1.75}
        />
      </div>

      {/* ── Text block ── */}
      <div className="flex-1 space-y-2 relative z-10">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-orange-500/50 group-hover:text-orange-500/70 transition-colors duration-200">
          {accent}
        </p>
        <h3 className="text-[15px] font-semibold text-white leading-snug">
          {title}
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed group-hover:text-zinc-500 transition-colors duration-200">
          {description}
        </p>
      </div>

      {/* ── CTA row ── */}
      <div
        className={cn(
          'mt-5 flex items-center gap-1.5 text-[13px] font-medium',
          'text-zinc-600 group-hover:text-orange-400',
          'transition-colors duration-200',
        )}
      >
        <span>{cta}</span>
        <ArrowUpRight
          className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2}
        />
      </div>

      {/* ── Bottom-right corner glow ── */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute bottom-0 right-0 w-20 h-20',
          'bg-orange-500/0 group-hover:bg-orange-500/[0.05]',
          'rounded-tl-full transition-colors duration-300',
        )}
      />
    </motion.article>
  )
}

// ─── SectionDivider — subtle horizontal rule with orange centre dot ───────────

function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-4 mb-20">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.07]" />
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 ring-4 ring-orange-500/10" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.07]" />
    </div>
  )
}

// ─── ServicesShowcase ─────────────────────────────────────────────────────────

export function ServicesShowcase() {
  const headerRef = useRef(null)
  const isInView  = useInView(headerRef, { once: true, margin: '-100px' })

  return (
    <section
      id="services"
      aria-label="Cardom Services"
      className="relative bg-[#080808] py-24 sm:py-32 overflow-hidden"
    >
      {/* ── Background ── */}
      <GridPattern
        squareSize={40}
        strokeWidth={0.3}
        className="text-white/[0.018] fill-none"
      />

      {/* Top edge glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
      />
      {/* Ambient glow blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] rounded-full bg-orange-500/[0.055] blur-[110px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Section divider ── */}
        <SectionDivider />

        {/* ── Header ── */}
        <div ref={headerRef} className="mb-14 lg:mb-16">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold',
                'tracking-widest uppercase',
                'border border-orange-500/20 bg-orange-500/[0.07] text-orange-400',
              )}>
                <Layers className="w-3 h-3" />
                Services
              </span>
            </div>

            {/* Two-column layout on large screens: heading left, body right */}
            <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
              <h2 className={cn(
                'text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight',
                'text-white mb-5 lg:mb-0 max-w-lg',
              )}>
                Everything{' '}
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                  Your Car
                </span>{' '}
                Needs
              </h2>

              <p className="text-base text-zinc-400 leading-relaxed max-w-sm lg:max-w-xs xl:max-w-sm lg:text-right">
                Cardom connects buying, selling, ownership, financing, insurance,
                and vehicle care in one unified ecosystem.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Cards grid ── */}
        {/*
          Layout:
            Mobile  (< sm):  1 col
            Tablet  (sm–lg): 2 cols
            Desktop (≥ lg):  4 cols
          ColIndex for stagger = position within the row (0–3 on desktop, 0–1 on tablet, 0 on mobile)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.title}
              service={service}
              colIndex={index % 4}   /* 0-3 repeats — drives per-row stagger */
            />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          {/* Inline stats teaser */}
          <span className="text-xs text-zinc-600">
            8 services · 1 ecosystem · 0 switching
          </span>
          <span aria-hidden="true" className="hidden sm:block w-px h-4 bg-white/[0.08]" />
          <a
            href="#"
            className={cn(
              'group inline-flex items-center gap-2 text-sm font-medium',
              'text-zinc-500 hover:text-orange-400 transition-colors duration-200',
            )}
          >
            Explore all services
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080808] to-transparent"
      />
    </section>
  )
}

