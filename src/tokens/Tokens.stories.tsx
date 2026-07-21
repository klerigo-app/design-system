import type { Meta, StoryObj } from '@storybook/react-vite'
import { getPalette, radii } from './tokens'

const light = getPalette('light')
const dark = getPalette('dark')

// Both schemes side by side: this is the only place the dark ramp values are
// visible without toggling the OS, and the steps that deliberately do not flip
// (see THEME_INVARIANT) should read as identical pairs here.
function Swatch({ name, lightHex, darkHex }: { name: string; lightHex: string; darkHex: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '8px 0 0 8px',
            background: lightHex,
            border: '1px solid #F0E6D0',
          }}
        />
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '0 8px 8px 0',
            background: darkHex,
            border: '1px solid #F0E6D0',
            borderLeft: 'none',
          }}
        />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {name}: {lightHex} / {darkHex}
      </span>
    </div>
  )
}

function TokensPage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Color ramps</h2>
      {(['coral', 'sun', 'teal'] as const).map((ramp) => (
        <div key={ramp} style={{ marginBottom: 16 }}>
          <h3>{ramp}</h3>
          {Object.entries(light[ramp]).map(([step, hex]) => (
            <Swatch
              key={step}
              name={`${ramp}-${step}`}
              lightHex={hex}
              darkHex={dark[ramp][step as unknown as keyof (typeof dark)[typeof ramp]]}
            />
          ))}
        </div>
      ))}
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Radii</h2>
      {Object.entries(radii).map(([name, value]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div
            style={{ width: 60, height: 40, borderRadius: value, background: light.teal[100] }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            {name}: {value}
          </span>
        </div>
      ))}
    </div>
  )
}

const meta: Meta<typeof TokensPage> = {
  title: 'Tokens/Overview',
  component: TokensPage,
}
export default meta

type Story = StoryObj<typeof TokensPage>
export const Overview: Story = {}
