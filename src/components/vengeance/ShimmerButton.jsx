import { cn } from '@/lib/utils'

/**
 * ShimmerButton — Vengeance UI inspired
 *
 * A button with a diagonal light-sweep shimmer on hover.
 * The shimmer is a white gradient that slides across the surface.
 *
 * Usage:
 *   <ShimmerButton onClick={...}>Get Started</ShimmerButton>
 *   <ShimmerButton variant="outline">Learn More</ShimmerButton>
 */
export function ShimmerButton({
  children,
  className,
  variant = 'filled',
  size = 'md',
  asChild = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  const variantClasses = {
    filled: [
      'bg-orange-500 text-white',
      'hover:bg-orange-600',
      'hover:shadow-[0_0_32px_rgba(249,115,22,0.4)]',
      'border border-orange-500',
    ],
    outline: [
      'bg-transparent text-white',
      'border border-white/15',
      'hover:border-orange-500/50 hover:bg-orange-500/5 hover:text-orange-300',
    ],
  }

  const Tag = asChild ? 'span' : 'button'

  return (
    <Tag
      className={cn(
        // Base
        'group relative inline-flex items-center justify-center gap-2',
        'overflow-hidden rounded-lg font-semibold',
        'transition-all duration-300 active:scale-[0.97]',
        'cursor-pointer select-none',
        // Size
        sizeClasses[size],
        // Variant
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {/* Shimmer sweep */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0',
          '-translate-x-full skew-x-[-20deg]',
          'bg-gradient-to-r from-transparent via-white/20 to-transparent',
          'group-hover:translate-x-full group-hover:transition-transform group-hover:duration-700 group-hover:ease-in-out',
        )}
      />
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Tag>
  )
}

