import { cn } from '@/lib/utils'

/**
 * BorderBeam — Vengeance UI
 *
 * An animated conic-gradient that travels along the border of a container.
 * Uses CSS @property (--border-angle) for smooth angle interpolation.
 *
 * Requirements:
 *   - Parent must have `position: relative` and `border-radius` set
 *   - Parent should NOT have `overflow: hidden` (otherwise the beam clips)
 *
 * @see https://vengenceui.com/components
 */
export function BorderBeam({
  className,
  duration = 8,
  colorFrom = '#f97316',
  colorTo = 'transparent',
  borderWidth = 1,
  delay = 0,
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', className)}
      style={{
        padding: `${borderWidth}px`,
        background: `conic-gradient(
          from var(--border-angle),
          ${colorTo},
          ${colorFrom} 40%,
          ${colorFrom} 60%,
          ${colorTo}
        )`,
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: `border-beam ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

