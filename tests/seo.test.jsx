import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HOME, BRAND, pageTitle, ROUTES } from '../src/data/site.js'
import Home from '../src/pages/Home.jsx'
import Pricing from '../src/pages/Pricing.jsx'
import DnsRecords from '../src/pages/DnsRecords.jsx'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/**
 * The headline, the <title> and the meta description used to be written out
 * eleven times across index.html, Seo.jsx and prerender.mjs, and they had
 * already drifted apart. Now there is one constant; these assertions are what
 * stops it happening again.
 */

const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8')

const tagContent = (html, pattern) => html.match(pattern)?.[1] ?? null

const homeTitle = pageTitle(null)

describe('headline, title and description agree', () => {
  it('the h1 renders HOME.title verbatim', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(HOME.title)
  })

  it('the homepage <title> is HOME.title plus the brand', () => {
    expect(tagContent(indexHtml, /<title>([^<]*)<\/title>/)).toBe(homeTitle)
    expect(homeTitle).toBe(`${HOME.title} · ${BRAND}`)
  })

  it('og:title and twitter:title match <title>', () => {
    expect(tagContent(indexHtml, /property="og:title"\s+content="([^"]*)"/)).toBe(homeTitle)
    expect(tagContent(indexHtml, /name="twitter:title"\s+content="([^"]*)"/)).toBe(homeTitle)
  })

  it('the meta description is HOME.description', () => {
    expect(tagContent(indexHtml, /name="description"\s+content="([^"]*)"/)).toBe(HOME.description)
  })

  it('og:description and twitter:description are the same lead, not a different claim', () => {
    const og = tagContent(indexHtml, /property="og:description"\s+content="([^"]*)"/)
    const tw = tagContent(indexHtml, /name="twitter:description"\s+content="([^"]*)"/)
    expect(og).toBe(tw)
    // A trimmed lead, not the full paragraph — social cards have a budget.
    expect(og.length).toBeLessThan(HOME.description.length)
    expect(HOME.description.startsWith(og)).toBe(true)
  })

  it('nothing in the head contradicts the headline on the headline claim', () => {
    // The old og:image:alt said "with apex ALIAS flattening" while the title
    // said "with apex ALIAS". Alt text and titles must not invent a claim.
    const alts = [...indexHtml.matchAll(/og:image:alt"\s+content="([^"]*)"/g)].map((m) => m[1])
    for (const alt of alts) expect(alt).toContain(HOME.title)
  })
})

describe('one phrasing of the record limit', () => {
  it('no stray "records / domain" survives anywhere', () => {
    const files = ['index.html', 'src/data/site.js', 'src/data/plans.js']
    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), 'utf8')
      expect(`${file}: ${source.match(/records \/ domain/g)?.join(', ') ?? ''}`).not.toContain(
        'records / domain',
      )
    }
  })

  it('every route has a description and a path', () => {
    for (const route of ROUTES) {
      expect(route.description.length).toBeGreaterThan(60)
      expect(route.path.startsWith('/')).toBe(true)
    }
  })

  it('pageTitle only ever appends the brand', () => {
    expect(pageTitle('Pricing')).toBe(`Pricing · ${BRAND}`)
    expect(pageTitle(undefined)).toBe(homeTitle)
  })
})

/**
 * prerender.mjs writes ROUTES into dist/<route>/index.html, so a crawler that
 * reads the static file and a browser one second after hydration must see the
 * same head. Every page once passed its own copy to <Seo>, and all three had
 * drifted from the prerendered strings — hydration silently rewrote the head.
 * Render each page and compare against the same table the build uses.
 */
describe('after client render the head still matches the prerendered one', () => {
  const pages = { '/': Home, '/pricing': Pricing, '/dns-records': DnsRecords }

  for (const route of ROUTES) {
    it(`${route.path} keeps its prerendered title and description`, () => {
      const Page = pages[route.path]
      render(
        <MemoryRouter>
          <Page />
        </MemoryRouter>,
      )
      expect(document.title).toBe(pageTitle(route.title))
      expect(document.querySelector('meta[name="description"]')?.content).toBe(route.description)
    })
  }
})
