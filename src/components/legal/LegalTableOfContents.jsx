import { useState, useEffect } from 'react'
import { List, ChevronDown, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LegalTableOfContents({ sections = [] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id)
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(sections[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const handleSelect = (id) => {
    setActiveId(id)
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Mobile Compact Dropdown Picker */}
      <div className="lg:hidden mb-8 sticky top-20 z-30 bg-[#080808]/95 backdrop-blur-lg p-3 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-[11px] font-mono uppercase text-orange-400 font-bold">
          <List className="w-3.5 h-3.5" />
          <span>Jump to Section</span>
        </div>
        <select
          value={activeId}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full bg-[#121212] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          {sections.map((sec, idx) => (
            <option key={sec.id} value={sec.id} className="bg-[#121212]">
              {String(idx + 1).padStart(2, '0')}. {sec.title}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Sticky Table of Contents Sidebar */}
      <div className="hidden lg:block sticky top-28 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Table of Contents</span>
          </div>

          <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {sections.map((sec, idx) => {
              const isActive = activeId === sec.id
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSelect(sec.id)}
                  className={cn(
                    'w-full text-left py-2 px-3 rounded-xl text-xs transition-all duration-200 flex items-center gap-2.5 cursor-pointer',
                    isActive
                      ? 'bg-orange-500/15 text-orange-300 font-bold border-l-2 border-orange-500'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  )}
                >
                  <span className={cn('text-[10px] font-mono shrink-0', isActive ? 'text-orange-400' : 'text-zinc-600')}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

