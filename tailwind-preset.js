/**
 * Shared Tailwind preset for the Espanolenka design system.
 *
 * This is the single source of truth mapping design tokens (CSS custom
 * properties from tokens.css) to Tailwind utilities. Consuming apps must
 * use it instead of copying the theme:
 *
 *   // tailwind.config.js
 *   import espanolenkaPreset from '@espanolenka/design-system/tailwind-preset'
 *   export default {
 *     presets: [espanolenkaPreset],
 *     content: [...],
 *   }
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        coral: {
          50: 'var(--color-coral-50)',
          100: 'var(--color-coral-100)',
          300: 'var(--color-coral-300)',
          500: 'var(--color-coral-500)',
          700: 'var(--color-coral-700)',
          900: 'var(--color-coral-900)',
          hover: 'var(--color-coral-hover)',
        },
        sun: {
          50: 'var(--color-sun-50)',
          100: 'var(--color-sun-100)',
          300: 'var(--color-sun-300)',
          500: 'var(--color-sun-500)',
          700: 'var(--color-sun-700)',
          900: 'var(--color-sun-900)',
          hover: 'var(--color-sun-hover)',
        },
        teal: {
          50: 'var(--color-teal-50)',
          100: 'var(--color-teal-100)',
          300: 'var(--color-teal-300)',
          500: 'var(--color-teal-500)',
          700: 'var(--color-teal-700)',
          900: 'var(--color-teal-900)',
        },
        paper: 'var(--color-paper)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'border-input': 'var(--color-border-input)',
        muted: 'var(--color-muted)',
        slate: 'var(--color-slate)',
        ink: 'var(--color-ink)',
        label: 'var(--color-label)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        disabled: {
          bg: 'var(--color-disabled-bg)',
          text: 'var(--color-disabled-text)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        pill: 'var(--radius-pill)',
        card: 'var(--radius-card)',
      },
      boxShadow: {
        'lift-coral': 'var(--shadow-button-lift-coral)',
        'lift-sun': 'var(--shadow-button-lift-sun)',
        'pressed-coral': 'var(--shadow-button-pressed-coral)',
        'pressed-sun': 'var(--shadow-button-pressed-sun)',
        elevated: 'var(--shadow-card-elevated)',
        device: 'var(--shadow-device)',
        'focus-teal': 'var(--focus-ring-teal)',
        'focus-error': 'var(--focus-ring-error)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
    },
  },
}
