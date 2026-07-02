# @espanolenka/design-system

React + TypeScript component library implementing the EspañoLenka brand and design system.
Source spec: `espanolenka_design_system/README.md`. Design/plan history:
`docs/superpowers/specs/` and `docs/superpowers/plans/`.

## Install

    pnpm add @espanolenka/design-system

## Usage

Import the token and font stylesheets once, at your app's entry point:

    import '@espanolenka/design-system/tokens.css'
    import '@espanolenka/design-system/fonts.css'

Note: `fonts.css` contains bare-specifier `@import '@fontsource/...'` statements that
must be resolved against `node_modules` by your app's own bundler. This works with
Vite, webpack, Next.js, and Parcel, but will NOT work if you load it via a plain
static `<link>` tag with no build step.

Then use components:

    import { Button, Card, Chip } from '@espanolenka/design-system'

    function Example() {
      return (
        <Card variant="elevated">
          <Chip variant="level">A2 · Elemental</Chip>
          <Button variant="primary">Reservar clase</Button>
        </Card>
      )
    }

## Development

    pnpm install
    pnpm dev             # Storybook at http://localhost:6006
    pnpm test             # Vitest
    pnpm lint
    pnpm build            # Vite library build -> dist/
    pnpm build-storybook   # static Storybook site
