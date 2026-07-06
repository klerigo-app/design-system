import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge only knows Tailwind's stock scales, so the design system's
// custom values must be registered or conflicting classes won't merge
// (e.g. a consumer's `rounded-card` would not override a component's
// `rounded-xl`). Keep this in sync with tailwind-preset.js.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-family': ['font-display', 'font-body'],
      rounded: [{ rounded: ['pill', 'card'] }],
      shadow: [
        {
          shadow: [
            'lift-coral',
            'lift-sun',
            'pressed-coral',
            'pressed-sun',
            'elevated',
            'device',
            'focus-teal',
            'focus-error',
          ],
        },
      ],
    },
  },
})

/**
 * Merge class names with Tailwind-aware conflict resolution: later classes
 * win over earlier ones for the same CSS property, so consumer `className`
 * overrides never need `!important`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
