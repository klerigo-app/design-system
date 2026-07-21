import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fontFamily } from './fonts'

/**
 * The fonts in native-fonts/ are committed binaries, not build output, because
 * `prepare` runs on every consumer install and fonttools cannot be in that path
 * (see scripts/build-fonts.py). That means CI cannot regenerate them, so nothing
 * would otherwise catch a rebuild that quietly narrowed the subset.
 *
 * The failure this guards against is specific and nasty: a font that reads fine
 * in English and mojibakes on `příliš` or `mañana`. Google's stock "latin"
 * subset produces exactly that — it omits Latin Extended-A, which costs Czech
 * and Slovak 12 of their 20 accented letters.
 *
 * Everything below parses the TTF by hand. That is deliberate: adding a
 * font-parsing dependency to run in ordinary CI would be a worse trade than
 * ~150 lines of table reading, and the tables involved (cmap, head, maxp, loca,
 * glyf) are the stable, boring part of the format.
 */

const FONT_DIR = resolve(process.cwd(), 'native-fonts')

/** Letters that must render, by language. Latin-1 is not enough for most of these. */
const LANGUAGES: Record<string, string> = {
  Spanish: 'áéíóúüñ¿¡',
  French: 'àâçèéêëîïôùûüÿœæ«»',
  German: 'äöüß',
  Portuguese: 'ãõáâàçéêíóôú',
  Italian: 'àèéìòù',
  Czech: 'áčďéěíňóřšťúůýž',
  Slovak: 'áäčďéíĺľňóôŕšťúýž',
  Polish: 'ąćęłńóśźż',
  Hungarian: 'áéíóöőúüű',
  Croatian: 'čćđšž',
  Turkish: 'çğıİöşü',
  Romanian: 'ăâîșț',
  Catalan: 'àçéèíïóòúü·',
  Currency: '€£$¢',
}

interface Glyph {
  readonly id: number
  readonly empty: boolean
  readonly bbox: readonly [number, number, number, number] | null
}

class Ttf {
  private readonly buf: Buffer
  private readonly tables = new Map<string, { offset: number; length: number }>()
  private readonly cmap: Map<number, number>
  private readonly loca: number[]
  private readonly glyfOffset: number

  constructor(buf: Buffer) {
    this.buf = buf
    const numTables = buf.readUInt16BE(4)
    for (let i = 0; i < numTables; i++) {
      const rec = 12 + i * 16
      this.tables.set(buf.toString('ascii', rec, rec + 4), {
        offset: buf.readUInt32BE(rec + 8),
        length: buf.readUInt32BE(rec + 12),
      })
    }
    this.cmap = this.readCmap()
    this.glyfOffset = this.table('glyf').offset
    this.loca = this.readLoca()
  }

  private table(tag: string) {
    const t = this.tables.get(tag)
    if (!t) throw new Error(`missing ${tag} table`)
    return t
  }

  /** Prefer a full-Unicode (3,10) subtable, else the BMP (3,1) one. */
  private readCmap(): Map<number, number> {
    const { offset } = this.table('cmap')
    const numSubtables = this.buf.readUInt16BE(offset + 2)
    let best: { score: number; at: number } | null = null
    for (let i = 0; i < numSubtables; i++) {
      const rec = offset + 4 + i * 8
      const platform = this.buf.readUInt16BE(rec)
      const encoding = this.buf.readUInt16BE(rec + 2)
      const at = offset + this.buf.readUInt32BE(rec + 4)
      const score =
        platform === 3 && encoding === 10
          ? 3
          : platform === 3 && encoding === 1
            ? 2
            : platform === 0
              ? 1
              : 0
      if (score > 0 && (!best || score > best.score)) best = { score, at }
    }
    if (!best) throw new Error('no usable cmap subtable')

    const format = this.buf.readUInt16BE(best.at)
    if (format === 12) return this.readCmap12(best.at)
    if (format === 4) return this.readCmap4(best.at)
    throw new Error(`unsupported cmap format ${format}`)
  }

  private readCmap4(at: number): Map<number, number> {
    const map = new Map<number, number>()
    const segCount = this.buf.readUInt16BE(at + 6) / 2
    const endAt = at + 14
    const startAt = endAt + segCount * 2 + 2
    const deltaAt = startAt + segCount * 2
    const rangeAt = deltaAt + segCount * 2

    for (let s = 0; s < segCount; s++) {
      const end = this.buf.readUInt16BE(endAt + s * 2)
      const start = this.buf.readUInt16BE(startAt + s * 2)
      const delta = this.buf.readInt16BE(deltaAt + s * 2)
      const rangeOffset = this.buf.readUInt16BE(rangeAt + s * 2)
      if (start === 0xffff) continue
      for (let c = start; c <= end && c !== 0x10000; c++) {
        let gid: number
        if (rangeOffset === 0) {
          gid = (c + delta) & 0xffff
        } else {
          // The spec's pointer arithmetic: the offset is relative to its own
          // slot in idRangeOffset, not to the start of the glyph array.
          const gAt = rangeAt + s * 2 + rangeOffset + (c - start) * 2
          if (gAt + 1 >= this.buf.length) continue
          const raw = this.buf.readUInt16BE(gAt)
          gid = raw === 0 ? 0 : (raw + delta) & 0xffff
        }
        if (gid !== 0) map.set(c, gid)
      }
    }
    return map
  }

  private readCmap12(at: number): Map<number, number> {
    const map = new Map<number, number>()
    const nGroups = this.buf.readUInt32BE(at + 12)
    for (let g = 0; g < nGroups; g++) {
      const rec = at + 16 + g * 12
      const start = this.buf.readUInt32BE(rec)
      const end = this.buf.readUInt32BE(rec + 4)
      const startGid = this.buf.readUInt32BE(rec + 8)
      for (let c = start; c <= end; c++) map.set(c, startGid + (c - start))
    }
    return map
  }

  private readLoca(): number[] {
    const longFormat = this.buf.readInt16BE(this.table('head').offset + 50) === 1
    const numGlyphs = this.buf.readUInt16BE(this.table('maxp').offset + 4)
    const { offset } = this.table('loca')
    const out: number[] = []
    for (let i = 0; i <= numGlyphs; i++) {
      out.push(
        longFormat
          ? this.buf.readUInt32BE(offset + i * 4)
          : this.buf.readUInt16BE(offset + i * 2) * 2,
      )
    }
    return out
  }

  /**
   * Look up a character's glyph and its bounding box.
   *
   * Every accented letter in these fonts is a COMPOSITE glyph — `ccaron` is
   * `c` + `uni030C`, `uni0219` is `s` + `uni0326`. Resolving components to
   * derive bounds would need a real font parser; it is avoidable because the
   * glyf table stores an explicit bbox in each glyph's header, composites
   * included. So this reads the stored box rather than computing one.
   */
  glyph(char: string): Glyph {
    const id = this.cmap.get(char.codePointAt(0)!) ?? 0
    if (id === 0) return { id: 0, empty: true, bbox: null }
    const [start, end] = [this.loca[id], this.loca[id + 1]]
    // Equal offsets mean no outline at all — a mapped but blank glyph, which
    // renders as nothing rather than as tofu. That is the subtler failure.
    if (start === end) return { id, empty: true, bbox: null }
    const at = this.glyfOffset + start
    return {
      id,
      empty: false,
      bbox: [
        this.buf.readInt16BE(at + 2),
        this.buf.readInt16BE(at + 4),
        this.buf.readInt16BE(at + 6),
        this.buf.readInt16BE(at + 8),
      ],
    }
  }
}

const files = readdirSync(FONT_DIR)
  .filter((n) => n.endsWith('.ttf'))
  .sort()

describe('native font bundle', () => {
  it('ships the ten faces fonts.css loads for web', () => {
    // Guards the guard: an empty directory would pass every assertion below.
    expect(files).toEqual([
      'Baloo2-Bold.ttf',
      'Baloo2-Medium.ttf',
      'Baloo2-Regular.ttf',
      'Baloo2-SemiBold.ttf',
      'DMMono-Medium.ttf',
      'DMMono-Regular.ttf',
      'DMSans-Bold.ttf',
      'DMSans-Medium.ttf',
      'DMSans-Regular.ttf',
      'DMSans-SemiBold.ttf',
    ])
  })

  it('registers exactly those faces in native-fonts/index.js', () => {
    // Read as text: the module require()s .ttf files, which only Metro resolves.
    const src = readFileSync(resolve(FONT_DIR, 'index.js'), 'utf8')
    const keys = [...src.matchAll(/'([A-Za-z0-9-]+)':\s*require\('\.\/([A-Za-z0-9-]+\.ttf)'\)/g)]
    expect(keys.map((m) => `${m[2]}`).sort()).toEqual(files)
    // The key must equal the filename stem, or fontFamily lookups miss.
    expect(keys.filter((m) => `${m[1]}.ttf` !== m[2])).toEqual([])
  })

  it('names only families that exist, in fonts.ts', () => {
    const stems = files.map((f) => f.replace(/\.ttf$/, ''))
    for (const family of Object.values(fontFamily)) {
      expect(stems).toContain(family)
    }
  })

  it('stays within the size the design spec budgeted', () => {
    const total = files.reduce((n, f) => n + readFileSync(resolve(FONT_DIR, f)).length, 0)
    // 551 KB measured, budgeted in the spec. A rebuild that reinstates
    // Devanagari lands at ~1.9 MB and trips this.
    expect(total).toBeLessThan(700 * 1024)
  })

  describe.each(files)('%s', (file) => {
    const font = new Ttf(readFileSync(resolve(FONT_DIR, file)))

    it.each(Object.entries(LANGUAGES))('renders %s', (_language, chars) => {
      const broken = [...new Set(chars + chars.toUpperCase())]
        .map((c) => ({ c, g: font.glyph(c) }))
        .filter(({ g }) => g.id === 0 || g.empty)
        .map(
          ({ c, g }) =>
            `${c} (U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')})${g.id === 0 ? ' unmapped' : ' blank'}`,
        )
      expect(broken).toEqual([])
    })
  })
})
