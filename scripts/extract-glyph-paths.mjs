// One-off dev script: extracts 'e' (weight 500) and 'L' (weight 600) glyph
// outlines from the Baloo 2 font and prints ready-to-paste path constants
// for src/components/Logo/glyphPaths.ts.
// Run with: node scripts/extract-glyph-paths.mjs
import { openSync } from 'fontkit'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// Matches the reference logo-mark-*.svg construction: 512x512 tile,
// text anchored at x=256 (text-anchor: middle), baseline y=360,
// 'e' at font-size 250 (weight 500), 'L' at font-size 280 (weight 600), dx=-10 before 'L'.
const TILE_CENTER_X = 256
const BASELINE_Y = 360
const E_FONT_SIZE = 250
const L_FONT_SIZE = 280
const L_DX = -10

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

  return { d: commands.join(' '), advance }
}

const fontE = openSync(require.resolve('@fontsource/baloo-2/files/baloo-2-latin-500-normal.woff2'))
const fontL = openSync(require.resolve('@fontsource/baloo-2/files/baloo-2-latin-600-normal.woff2'))

// First pass (at origin 0,0) just to read advance widths, so the "eL" pair
// can be centered as one block around TILE_CENTER_X, matching the source SVG's
// single <text text-anchor="middle"> behavior.
const eProbe = glyphPathAt(fontE, 'e', E_FONT_SIZE, 0, 0)
const lProbe = glyphPathAt(fontL, 'L', L_FONT_SIZE, 0, 0)
const totalWidth = eProbe.advance + L_DX + lProbe.advance
const startX = TILE_CENTER_X - totalWidth / 2

const e = glyphPathAt(fontE, 'e', E_FONT_SIZE, startX, BASELINE_Y)
const l = glyphPathAt(fontL, 'L', L_FONT_SIZE, startX + e.advance + L_DX, BASELINE_Y)

console.log('// Paste into src/components/Logo/glyphPaths.ts')
console.log(`export const LETTER_E_PATH = '${e.d}'`)
console.log(`export const LETTER_L_PATH = '${l.d}'`)
