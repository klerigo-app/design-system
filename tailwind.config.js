import espanolenkaPreset from './tailwind-preset.js'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [espanolenkaPreset],
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  plugins: [],
}
