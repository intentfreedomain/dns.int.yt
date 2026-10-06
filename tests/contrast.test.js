import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Colour contrast regression guard.
 *
 * Lighthouse caught white-on-#4f6bff at 4.30:1 on the primary buttons only
 * because the other two offenders (the pricing badge and the skip link) were
 * off-screen. Nothing in the codebase was checking, so this does: every
 * foreground/background pair the site actually renders is asserted here.
 */

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8')

const token = (name) => {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-f]{3,8})`, 'i'))
  if (!match) throw new Error(`token ${name} not found in tokens.css`)
  return match[1]
}

const channel = (c) => {
  const v = parseInt(c.slice(1), 16)
  return c.length <= 5
    ? [(v >> 8) & 0xf, (v >> 4) & 0xf, v & 0xf].map((n) => (n << 4) | n)
    : [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]
}

const luminance = (hex) => {
  const [r, g, b] = channel(hex).map((n) => {
    const s = n / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const hi = Math.max(luminance(a), luminance(b))
  const lo = Math.min(luminance(a), luminance(b))
  return (hi + 0.05) / (lo + 0.05)
}

const BG = token('--bg')
const SURFACE = token('--surface')
const SURFACE_2 = token('--surface-2')

// WCAG 1.4.3 — normal text.
const AA = 4.5

describe('text contrast on dark surfaces', () => {
  const surfaces = [
    ['--bg', BG],
    ['--surface', SURFACE],
    ['--surface-2', SURFACE_2],
  ]

  const foregrounds = [
    '--text',
    '--text-dim',
    '--text-faint',
    '--blue-text',
    '--gold-bright',
    '--gold',
    '--green',
    '--red',
  ]

  for (const fg of foregrounds) {
    for (const [surfaceName, surface] of surfaces) {
      it(`${fg} on ${surfaceName} clears AA (${contrast(token(fg), surface).toFixed(2)}:1)`, () => {
        expect(contrast(token(fg), surface)).toBeGreaterThanOrEqual(AA)
      })
    }
  }
})

describe('white text on a coloured fill', () => {
  // Every .btn--primary, the plan badge and the skip link put #fff on these.
  const fills = ['--blue-solid', '--blue-solid-hover']

  for (const fill of fills) {
    it(`#fff on ${fill} clears AA (${contrast('#ffffff', token(fill)).toFixed(2)}:1)`, () => {
      expect(contrast('#ffffff', token(fill))).toBeGreaterThanOrEqual(AA)
    })
  }

  it('hover is not lighter than rest, or it would fail exactly under the pointer', () => {
    expect(luminance(token('--blue-solid-hover'))).toBeLessThan(luminance(token('--blue-solid')))
  })

  it('no stylesheet puts white text on the low-contrast --blue', () => {
    // --blue is 4.30:1 against white, fine as an accent icon on a dark surface
    // but not as a fill behind text. Assert the invariant at the source level
    // instead of trusting that nobody reaches for it again.
    const offenders = []
    for (const file of ['tokens.css', 'components.css', 'pages.css', 'layout.css']) {
      const source = readFileSync(join(process.cwd(), 'src/styles', file), 'utf8')
      for (const block of source.split('}')) {
        const isWhiteText = /color:\s*(#fff|#ffffff)\b/i.test(block)
        const usesBlueFill = /background:\s*var\(--blue\)\s*;/i.test(block)
        if (isWhiteText && usesBlueFill) offenders.push(`${file}: ${block.trim().slice(0, 60)}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('graphics contrast', () => {
  // Icons and borders only need 3:1 (WCAG 1.4.11). The accent blue is used as
  // an icon colour on a near-black surface.
  it('--blue clears 3:1 on --surface as an icon', () => {
    expect(contrast(token('--blue'), SURFACE)).toBeGreaterThanOrEqual(3)
  })

  it('--border is visible against --bg', () => {
    expect(contrast(token('--border'), BG)).toBeGreaterThan(1.05)
  })
})

describe('reduced motion', () => {
  it('kills transition delays too, not just durations', () => {
    // A 240ms stagger with a 0.01ms duration still holds content invisible.
    expect(css).toMatch(/transition-delay:\s*0ms\s*!important/)
  })
})
