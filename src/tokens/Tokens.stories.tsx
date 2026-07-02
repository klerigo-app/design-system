import type { Meta, StoryObj } from '@storybook/react-vite'
import { colors, radii } from './tokens'

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: hex, border: '1px solid #F0E6D0' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {name}: {hex}
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
          {Object.entries(colors[ramp]).map(([step, hex]) => (
            <Swatch key={step} name={`${ramp}-${step}`} hex={hex} />
          ))}
        </div>
      ))}
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Radii</h2>
      {Object.entries(radii).map(([name, value]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 60, height: 40, borderRadius: value, background: colors.teal[100] }} />
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
