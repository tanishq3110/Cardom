import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, FileText, Cookie, Sparkles, Activity } from 'lucide-react'
import { BorderBeam } from '@/components/vengeance/BorderBeam'
import { cn } from '@/lib/utils'

export function LegalHero({
  badge = 'CARDOM LEGAL',
  title = 'Legal Document',
  subtitle = 'Official policy information for the Cardom platform.',
  lastUpdated = 'October 2024',
  effectiveDate = 'October 28, 2024',
  visualType = 'privacy', // 'privacy' | 'terms' | 'cookies'
}) {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-14 pt-4">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-orange-400 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Cardom</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Editorial Header */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span>{badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight leading-[1.15]">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
            {subtitle}
          </p>

          {/* Dates Metadata Strip */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-mono text-zinc-400 border-t border-white/10">
            <div>
              <span className="text-zinc-500 uppercase">Last Updated: </span>
              <span className="text-white font-medium">{lastUpdated}</span>
            </div>
            <div className="text-zinc-600 hidden sm:inline">•</div>
            <div>
              <span className="text-zinc-500 uppercase">Effective Date: </span>
              <span className="text-orange-400 font-medium">{effectiveDate}</span>
            </div>
            <div className="text-zinc-600 hidden sm:inline">•</div>
            <div>
              <span className="text-emerald-400">DEMO VERIFICATION</span>
            </div>
          </div>
        </div>

        {/* Right Futuristic Visual Graphic */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="w-full max-w-md aspect-square relative rounded-3xl border border-orange-500/30 bg-[#0c0c0c]/85 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(249,115,22,0.12)] overflow-hidden flex flex-col justify-between">
            <BorderBeam size={180} duration={8} colorFrom="#f97316" colorTo="#fb923c" borderWidth={1.5} />

            {/* Top Telemetry Header */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-orange-400" />
                <span>PROTOCOL INTEGRITY</span>
              </div>
              <span className="text-orange-400 font-bold">STATUS: MONITORED</span>
            </div>

            {/* SVG Visual Body */}
            <div className="relative flex-1 my-3 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/5">
              {visualType === 'privacy' && (
                <svg className="w-full h-full stroke-orange-500/30" viewBox="0 0 300 240" fill="none">
                  {/* Concentric Cryptographic Rings */}
                  <circle cx="150" cy="120" r="85" strokeDasharray="3 5" strokeWidth="0.8" />
                  <circle cx="150" cy="120" r="60" strokeWidth="1" stroke="rgba(249,115,22,0.4)" />
                  <circle cx="150" cy="120" r="35" stroke="#f97316" strokeWidth="1.2" />

                  {/* Radiating encrypted vectors */}
                  <line x1="150" y1="35" x2="150" y2="205" strokeDasharray="2 4" strokeWidth="0.6" />
                  <line x1="65" y1="120" x2="235" y2="120" strokeDasharray="2 4" strokeWidth="0.6" />

                  {/* Data Nodes */}
                  <circle cx="70" cy="70" r="6" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                  <circle cx="230" cy="70" r="6" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                  <circle cx="70" cy="170" r="6" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                  <circle cx="230" cy="170" r="6" fill="#111" stroke="#f97316" strokeWidth="1.5" />

                  {/* Center Shield Graphic */}
                  <g transform="translate(132, 102)">
                    <path
                      d="M18 2 L32 8 V18 C32 27 24 33 18 36 C12 33 4 27 4 18 V8 L18 2 Z"
                      fill="#f97316"
                      fillOpacity="0.2"
                      stroke="#f97316"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              )}

              {visualType === 'terms' && (
                <svg className="w-full h-full stroke-orange-500/30" viewBox="0 0 300 240" fill="none">
                  <rect x="75" y="40" width="150" height="160" rx="10" stroke="#f97316" strokeWidth="1.5" />
                  <line x1="95" y1="75" x2="205" y2="75" strokeWidth="1.2" stroke="#f97316" />
                  <line x1="95" y1="105" x2="205" y2="105" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="95" y1="130" x2="185" y2="130" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="95" y1="155" x2="165" y2="155" strokeWidth="0.8" strokeDasharray="3 3" />
                  <circle cx="185" cy="170" r="16" fill="#111" stroke="#f97316" strokeWidth="1.5" />
                  <path d="M178 170 L183 175 L193 165" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}

              {visualType === 'cookies' && (
                <svg className="w-full h-full stroke-orange-500/30" viewBox="0 0 300 240" fill="none">
                  {/* Signal Radar */}
                  <circle cx="150" cy="120" r="75" strokeDasharray="4 6" strokeWidth="0.8" />
                  <circle cx="150" cy="120" r="50" stroke="#f97316" strokeWidth="1.2" />
                  <circle cx="150" cy="120" r="25" stroke="rgba(249,115,22,0.6)" strokeWidth="1" />

                  {/* Cookie Crumb Nodes */}
                  <circle cx="138" cy="105" r="4" fill="#f97316" />
                  <circle cx="165" cy="112" r="3.5" fill="#f97316" />
                  <circle cx="145" cy="135" r="4.5" fill="#f97316" />
                  <circle cx="160" cy="130" r="3" fill="#f97316" />
                  <path d="M150 45 L150 25 M225 120 L245 120 M150 195 L150 215 M75 120 L55 120" stroke="#f97316" strokeWidth="1.2" />
                </svg>
              )}

              {/* Floating Node Labels */}
              <div className="absolute top-2 left-3 text-[9px] font-mono text-zinc-500">
                AUTH: DEMO_PROTOTYPE
              </div>
              <div className="absolute bottom-2 right-3 text-[9px] font-mono text-orange-400">
                CARDOM_SPEC // 2024
              </div>
            </div>

            {/* Bottom Status Card */}
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/[0.05] p-2 text-center text-[10px] font-mono text-zinc-300">
              Zero Production Tracking • Prototype Specification Only
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

