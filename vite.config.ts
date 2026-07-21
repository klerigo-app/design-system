import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      // *.test-d.tsx holds type-level assertions. Unlike *.test.tsx it IS
      // typechecked (tsconfig excludes only the latter, which is the point of
      // the extension), but it must not reach the published declarations.
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test-d.tsx'],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        // Side-effect-free token export (no tokens.css import) so React Native
        // / Metro can consume it. Built in CJS too for CommonJS Tailwind configs.
        tokens: resolve(__dirname, 'src/tokens/tokens.ts'),
        // React Native component entry.
        native: resolve(__dirname, 'src/native/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-native'],
      // Keep the emitted stylesheet at dist/index.css (the "./tokens.css"
      // export path); multi-entry builds otherwise name it after the package.
      output: {
        assetFileNames: 'index.[ext]',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      // The real react-native cannot be imported under Vitest — rolldown fails
      // to parse its Flow-typed source. See the stub's header for what this
      // does and does not prove.
      'react-native': resolve(__dirname, 'src/native/__test__/rn-stub.tsx'),
    },
  },
})
