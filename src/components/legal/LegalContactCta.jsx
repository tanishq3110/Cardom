import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight } from 'lucide-react'

export function LegalContactCta({
  title = 'Have a question about this policy?',
  description = 'Our compliance and support desk is available to clarify platform specifications, terms, or data practices.',
}) {
  return (
    <div className="mt-14 p-8 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-orange-950/20 text-center relative overflow-hidden">
      <div className="max-w-md mx-auto space-y-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {description}
        </p>
        <div className="pt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            <span>Contact Cardom</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

