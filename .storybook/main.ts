import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    // Keep this build's CSS unminified so the /* @kind */ annotations in
    // tailwind-scanner-shim.css survive into the compiled preview CSS that
    // /design-sync scrapes as _ds_bundle.css. Does not affect dist/index.css
    // (built separately via the package's own vite.config.ts) or real
    // consumers of the published package.
    config.build = { ...config.build, cssMinify: false }
    return config
  },
}
export default config
