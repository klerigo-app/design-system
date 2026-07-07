// One-off dev script: extracts the 'K' glyph outline (weight 700, bold — same
// weight as the Klerigo wordmark) from the Baloo 2 font and prints a
// ready-to-paste path constant for src/components/Logo/glyphPaths.ts.
// Run with: node scripts/extract-glyph-paths.mjs
import { openSync } from 'fontkit'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// 512x512 tile, glyph centered at x=256 (equivalent to text-anchor: middle),
// baseline y=360, font-size 320 (weight 700).
const TILE_CENTER_X = 256
const BASELINE_Y = 360
const K_FONT_SIZE = 320

function glyphPathAt(font, char, fontSize, originX, baselineY) {
  const glyph = font.glyphForCodePoint(char.codePointAt(0))
  const scale = fontSize / font.unitsPerEm
  const advance = glyph.advanceWidth * scale

  const toSvgPoint = (x, y) =>
    `${(originX + x * scale).toFixed(2)},${(baselineY - y * scale).toFixed(2)}`

  const commands = glyph.path.commands.map((cmd) => {
    switch (cmd.command) {
      case 'moveTo':
        return `M ${toSvgPoint(cmd.args[0], cmd.args[1])}`
      case 'lineTo':
        return `L ${toSvgPoint(cmd.args[0], cmd.args[1])}`
      case 'quadraticCurveTo':
        return `Q ${toSvgPoint(cmd.args[0], cmd.args[1])} ${toSvgPoint(cmd.args[2], cmd.args[3])}`
      case 'bezierCurveTo':
        return `C ${toSvgPoint(cmd.args[0], cmd.args[1])} ${toSvgPoint(cmd.args[2], cmd.args[3])} ${toSvgPoint(cmd.args[4], cmd.args[5])}`
      case 'closePath':
        return 'Z'
      default:
        throw new Error(`Unhandled path command: ${cmd.command}`)
    }
  })

  const bbox = glyph.bbox
  return {
    d: commands.join(' '),
    advance,
    top: baselineY - bbox.maxY * scale,
    bottom: baselineY - bbox.minY * scale,
    left: originX + bbox.minX * scale,
    right: originX + bbox.maxX * scale,
  }
}

const fontK = openSync(require.resolve('@fontsource/baloo-2/files/baloo-2-latin-700-normal.woff2'))

// Probe at origin 0,0 just to read the advance width, so the single glyph
// can be centered around TILE_CENTER_X the same way text-anchor: middle would.
const probe = glyphPathAt(fontK, 'K', K_FONT_SIZE, 0, 0)
const startX = TILE_CENTER_X - probe.advance / 2

const k = glyphPathAt(fontK, 'K', K_FONT_SIZE, startX, BASELINE_Y)

console.log('// Paste into src/components/Logo/glyphPaths.ts')
console.log(`export const LETTER_K_PATH = '${k.d}'`)
console.log(
  `// bbox: top=${k.top.toFixed(1)} bottom=${k.bottom.toFixed(1)} left=${k.left.toFixed(1)} right=${k.right.toFixed(1)}`,
)
