/**
 * Shared Tailwind preset for the Klerigo design system.
 *
 * This is the single source of truth mapping design tokens (CSS custom
 * properties from tokens.css) to Tailwind utilities. Consuming apps must
 * use it instead of copying the theme:
 *
 *   // tailwind.config.js
 *   import klerigoPreset from '@klerigo/design-system/tailwind-preset'
 *   export default {
 *     presets: [klerigoPreset],
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
        success: {
          DEFAULT: 'var(--color-success)',
          tint: 'var(--color-success-tint)',
          border: 'var(--color-success-border)',
          text: 'var(--color-success-text)',
          subtitle: 'var(--color-success-subtitle)',
        },
        warning: 'var(--color-warning)',
        error: {
          DEFAULT: 'var(--color-error)',
          hover: 'var(--color-error-hover)',
          tint: 'var(--color-error-tint)',
          border: 'var(--color-error-border)',
        },
        info: 'var(--color-info)',
        disabled: {
          bg: 'var(--color-disabled-bg)',
          text: 'var(--color-disabled-text)',
        },
        'surface-selected': 'var(--color-surface-selected)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-inverse': 'var(--color-surface-inverse)',
        scrim: 'var(--color-scrim)',
        'progress-track': 'var(--color-progress-track)',
        'segmented-track': 'var(--color-segmented-track)',
        'connector-locked': 'var(--color-connector-locked)',
        'node-locked-border': 'var(--color-node-locked-border)',
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
      keyframes: {
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-drain': {
          from: { transform: 'scaleX(1)' },
          to: { transform: 'scaleX(0)' },
        },
      },
      animation: {
        // Toast drop-in settle. The countdown shelf uses `toast-drain` with an
        // inline animationDuration/playState so it stays in sync with the
        // provider's timer (the 5s here is only a placeholder default).
        'toast-in': 'toast-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'toast-drain': 'toast-drain 5s linear forwards',
      },
    },
  },
}
