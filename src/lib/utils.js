import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 * Used by shadcn/ui-style components and all Vengeance UI / Skiper UI components.
 *
 * @param {...(string|undefined|null|boolean|string[])} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

