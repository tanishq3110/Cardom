import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { GridPattern } from '@/components/vengeance/GridPattern'
import { cn } from '@/lib/utils'

// ─── Social SVG Icons (Clean, lightweight inline SVGs) ───────────────────────

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

// ─── Footer Navigation Links ────────────────────────────────────────────────

const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Buy a Car', href: '#services' },
      { label: 'Sell Your Car', href: '#services' },
      { label: 'Featured Cars', href: '#featured-cars' },
      { label: 'Car Subscription', href: '#services' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Insurance', href: '#services' },
      { label: 'Car Financing', href: '#services' },
      { label: 'Service & Repair', href: '#services' },
      { label: 'Roadside Assistance', href: '#services' },
      { label: 'Spare Parts', href: '#services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Cardom', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
]

const SOCIAL_LINKS = [
  { Icon: TwitterIcon, label: 'X (Twitter)', href: '#' },
  { Icon: LinkedInIcon, label: 'LinkedIn', href: '#' },
  { Icon: InstagramIcon, label: 'Instagram', href: '#' },
  { Icon: GithubIcon, label: 'GitHub', href: '#' },
]

// ─── Footer Component ────────────────────────────────────────────────────────

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 4000)
  }

  return (
    <footer
      aria-label="Cardom Footer"
      className="relative bg-[#060606] text-zinc-400 overflow-hidden border-t border-white/[0.07]"
    >
      {/* ── Background Grid & Ambient Glow ── */}
      <GridPattern
        squareSize={40}
        strokeWidth={0.2}
        className="text-white/[0.01] fill-none"
      />

      {/* Brand area subtle orange glow (bottom-left) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-10 w-[420px] h-[300px] rounded-full bg-orange-500/[0.045] blur-[100px]"
      />

      {/* Top ambient center line glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12">
        {/* ── Top Main Section: Brand + 4 Nav Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-14 border-b border-white/[0.06]">
          {/* 1. Main Brand Area (Col 1-5 on desktop) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Logo / Wordmark */}
              <a href="/" className="inline-flex items-center gap-2.5 group mb-5">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_16px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_22px_rgba(249,115,22,0.6)] transition-shadow duration-300">
                  <Zap className="w-4 h-4 text-white fill-white" strokeWidth={0} />
                </div>
                <span className="text-white font-bold text-xl tracking-tight leading-none">
                  Card<span className="text-orange-500">om</span>
                </span>
              </a>

              {/* Taglines */}
              <p className="text-sm text-zinc-300 font-medium leading-relaxed mb-1.5 max-w-sm">
                Everything automotive, connected in one place.
              </p>
              <p className="text-xs text-zinc-400 tracking-wide font-mono mb-6">
                Buy. Sell. Finance. Protect. Maintain.
              </p>
            </div>

            {/* Social Icons Row */}
            <div>
              <p className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 mb-3">
                Connect With Us
              </p>
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center',
                      'bg-white/[0.03] border border-white/[0.08] text-zinc-400',
                      'hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/[0.06]',
                      'transition-all duration-200 active:scale-95',
                    )}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Footer Navigation Columns (Col 6-12 on desktop) */}
          <div className="md:col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-orange-500" />
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') ? (
                        <Link
                          to={link.href}
                          className={cn(
                            'text-xs text-zinc-400 hover:text-white',
                            'transition-colors duration-200 inline-block py-0.5',
                          )}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className={cn(
                            'text-xs text-zinc-400 hover:text-white',
                            'transition-colors duration-200 inline-block py-0.5',
                          )}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Newsletter / CTA Strip ── */}
        <div className="my-10 p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.02] via-[#0f0f0f] to-white/[0.02] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center lg:text-left max-w-md">
            <h4 className="text-base sm:text-lg font-bold text-white mb-1 tracking-tight flex items-center justify-center lg:justify-start gap-2">
              Stay in the driver&apos;s seat.
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Get automotive insights, new services, and Cardom updates.
            </p>
          </div>

          {/* Subscribe Form */}
          <form
            onSubmit={handleSubscribe}
            className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2.5"
          >
            <div className="relative w-full sm:w-72">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={subscribed}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg text-xs',
                  'bg-black/60 border border-white/10 text-white placeholder:text-zinc-600',
                  'focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500',
                  'transition-all duration-200',
                )}
              />
            </div>

            <button
              type="submit"
              disabled={subscribed}
              className={cn(
                'w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold',
                'bg-orange-500 text-white flex items-center justify-center gap-1.5',
                'hover:bg-orange-600 hover:shadow-[0_0_16px_rgba(249,115,22,0.4)]',
                'active:scale-[0.98] transition-all duration-200 whitespace-nowrap',
              )}
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  Subscribed
                </>
              ) : (
                <>
                  Subscribe
                  <Send className="w-3 h-3 ml-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── 4. Bottom Copyright Row ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Cardom. All rights reserved.</span>
          </p>

          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <span className="text-zinc-400 font-mono tracking-tight">
              Built for the modern driver.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

