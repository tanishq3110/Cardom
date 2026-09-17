import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * GridPattern — Vengeance UI inspired
 *
 * Renders a subtle SVG line-grid as a full-bleed background element.
 * Place inside a `relative` container and give it `absolute inset-0`.
 * Colour is inherited via `currentColor` — control with a `text-*` class.
 *
 * @param {number}  squareSize - Size of each grid square in pixels (default 32)
 * @param {number}  strokeWidth - SVG stroke width (default 0.5)
 * @param {string}  className - Additional Tailwind classes
 */
export function GridPattern({
  squareSize = 32,
  strokeWidth = 0.5,
  className,
  ...props
}) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={squareSize}
          height={squareSize}
          patternUnits="userSpaceOnUse"
        >
          {/* Vertical lines */}
          <path
            d={`M ${squareSize} 0 L 0 0 0 ${squareSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

