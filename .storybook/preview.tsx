import '../src/tokens/tokens.css'
import '../src/tokens/fonts.css'
import './tailwind-scanner-shim.css'

import { useEffect } from 'react'
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  // Toolbar switch (top bar) to preview the token themes. It stamps
  // data-theme on the document root — the same hook the design tokens and the
  // claude.ai/design viewer use — and themes the canvas via --color-paper.
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) ?? 'light'
      useEffect(() => {
        const root = document.documentElement
        root.setAttribute('data-theme', theme)
        document.body.style.background = 'var(--color-paper)'
        document.body.style.color = 'var(--color-ink)'
        return () => {
          root.removeAttribute('data-theme')
        }
      }, [theme])
      return <Story />
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
