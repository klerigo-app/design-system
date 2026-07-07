import klerigoPreset from './tailwind-preset.js'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [klerigoPreset],
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  plugins: [],
}
