export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'orange',
  onClick,
}) {
  const colorMap = {
    orange: 'from-orange-500/10 to-orange-500/0 text-orange-400 border-orange-500/20',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-400 border-blue-500/20',
    green: 'from-emerald-500/10 to-emerald-500/0 text-emerald-400 border-emerald-500/20',
    red: 'from-rose-500/10 to-rose-500/0 text-rose-400 border-rose-500/20',
    purple: 'from-purple-500/10 to-purple-500/0 text-purple-400 border-purple-500/20',
    cyan: 'from-cyan-500/10 to-cyan-500/0 text-cyan-400 border-cyan-500/20',
  }

  const activeColor = colorMap[color] || colorMap.orange

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-[#141414] border border-[#262626] p-5 shadow-sm transition-all duration-200 hover:border-[#383838] ${
        onClick ? 'cursor-pointer hover:bg-[#181818]' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-gradient-to-br ${activeColor} opacity-50 blur-xl pointer-events-none`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#2D2D2D] flex items-center justify-center text-zinc-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-black text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-zinc-500">
          {subtitle}
        </p>
      )}
    </div>
  )
}
