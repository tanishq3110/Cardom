import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function StatCard({ label, value, trend, trendLabel, icon: Icon, color = 'orange' }) {
  const colorMap = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green:  'text-green-400 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red:    'text-red-400 bg-red-500/10 border-red-500/20',
  }
  const iconStyle = colorMap[color] || colorMap.orange
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-zinc-500'

  return (
    <div className="bg-[#202020] border border-[#2A2A2A] rounded-xl p-5 flex flex-col gap-3 hover:border-[#333] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconStyle}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      {trendLabel && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
