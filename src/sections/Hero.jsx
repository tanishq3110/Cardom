import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Play, ShieldCheck, Star, X } from 'lucide-react'

const services = [
  { label: 'Buy a car', to: '/cars' },
  { label: 'Sell your car', to: '/sell' },
  { label: 'Get insured', to: '/insurance' },
]

const steps = [
  'Find a vehicle that fits your needs and budget.',
  'Review clear pricing and inspection details.',
  'Keep it protected with insurance, service, and support.',
]

const ease = [0.22, 1, 0.36, 1]

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <section aria-label="Cardom automotive ecosystem" className="relative isolate min-h-[740px] overflow-hidden bg-[#070707] pt-16 sm:min-h-[680px] lg:min-h-[720px]">
      <img src="/hero-car.jpg" alt="Dark performance car on a mountain road" className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-90" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 via-[42%] to-black/10" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/35" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_82%_50%,rgba(249,115,22,0.22),transparent_24%)]" />
      <div aria-hidden="true" className="absolute left-0 top-0 h-36 w-px bg-gradient-to-b from-orange-400 via-orange-500/40 to-transparent" />

      <div className="relative mx-auto flex min-h-[660px] max-w-7xl items-center px-4 pb-20 pt-16 sm:px-6 lg:min-h-[704px] lg:px-8">
        <div className="max-w-xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mb-3 text-[10px] font-bold uppercase tracking-[0.17em] text-orange-400 sm:text-xs">
            The complete automotive ecosystem
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.7, ease }} className="text-5xl font-bold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            Your Car.<br />Your Journey.<br /><span className="text-orange-500">One Platform.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6, ease }} className="mt-5 max-w-md text-sm leading-6 text-zinc-300 sm:text-base">
            Buy, sell, insure, finance, service and more — everything you need for your car, in one trusted place.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.6, ease }} className="mt-7 flex flex-wrap gap-3">
            <Link to="/cars" className="group inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(249,115,22,0.3)] transition hover:-translate-y-0.5 hover:bg-orange-400">Explore cars <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            <button type="button" onClick={() => setDemoOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-orange-400/60 hover:bg-white/10"><Play className="h-3.5 w-3.5 fill-orange-400 text-orange-400" /> Explore services</button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34, duration: 0.6 }} className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400">
            {['160-point inspected', 'Transparent pricing', '24/7 support'].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-orange-400" />{item}</span>)}
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.6, ease }} className="absolute right-4 top-28 hidden rounded-xl border border-orange-400/20 bg-black/55 px-4 py-3 backdrop-blur-md sm:right-8 sm:block lg:right-[max(2rem,calc((100vw-80rem)/2))]">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500 text-white"><ShieldCheck className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-orange-300">Drive smarter</p><p className="mt-0.5 text-[11px] text-zinc-300">More than a car app</p></div></div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/30 backdrop-blur-sm"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"><p className="text-sm font-semibold text-white">What do you need today?</p><div className="flex flex-wrap gap-2">{services.map((service) => <Link key={service.label} to={service.to} className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:border-orange-400/60 hover:bg-orange-400/10 hover:text-white">{service.label} <ArrowRight className="ml-1 inline h-3 w-3 text-orange-400" /></Link>)}</div></div></div>

      <AnimatePresence>{demoOpen && <div role="dialog" aria-modal="true" aria-labelledby="hero-demo-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={() => setDemoOpen(false)}><motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.25, ease }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400">How it works</p><h2 id="hero-demo-title" className="mt-2 text-2xl font-bold text-white">One place for every mile ahead.</h2></div><button type="button" aria-label="Close preview" onClick={() => setDemoOpen(false)} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div><div className="mt-6 space-y-3">{steps.map((step, index) => <div key={step} className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-500 text-xs font-bold text-white">{index + 1}</span><p className="pt-0.5 text-sm leading-5 text-zinc-300">{step}</p></div>)}</div><Link to="/how-it-works" onClick={() => setDemoOpen(false)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400">Explore the Cardom process <ArrowRight className="h-4 w-4" /></Link></motion.div></div>}</AnimatePresence>
    </section>
  )
}
