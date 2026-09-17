import { ShieldAlert, Info } from 'lucide-react'

export function LegalMeta({
  version = 'v2.4-PROTOTYPE',
  documentCode = 'CDM-LEGAL-SPEC',
}) {
  return (
    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/[0.04] p-4 sm:p-5 mb-10">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold uppercase text-orange-400">
              LEGAL NOTICE & DEMO SCOPE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-zinc-400 border border-white/10">
              DOC: {documentCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-zinc-400 border border-white/10">
              VERSION: {version}
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed pt-1">
            This policy is currently provided as a product concept/demo for the Cardom automotive platform and should be reviewed and adapted by qualified legal counsel before production deployment.
          </p>
        </div>
      </div>
    </div>
  )
}

