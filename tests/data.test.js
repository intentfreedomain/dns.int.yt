import { describe, expect, it } from 'vitest'
import {
  BRAND,
  SITE_URL,
  API_BASE,
  API_PATH,
  DISCORD_URL,
  NAMESERVERS,
  ROUTES,
} from '../src/data/site.js'
import { PLANS, MATRIX_ROWS, FREE_RECORDS_PER_DOMAIN } from '../src/data/plans.js'
import { RECORDS, recordCount } from '../src/data/records.js'
import { ENDPOINTS } from '../src/data/api.js'
import { graph } from '../src/data/schema.js'

describe('site constants', () => {
  it('uses one Discord invite everywhere', () => {
    expect(DISCORD_URL).toBe('https://discord.gg/NCS96PS4MH')
  })

  it('derives the API base from the site URL', () => {
    expect(API_PATH).toBe('/api/v1')
    expect(API_BASE).toBe(`${SITE_URL}/api/v1`)
  })

  it('brand string has no trademark or spacing variants', () => {
    expect(BRAND).toBe('Intent-DNS')
    expect(BRAND).not.toMatch(/™|\s-\s/)
  })

  it('lists two distinct nameservers', () => {
    expect(NAMESERVERS).toHaveLength(2)
    expect(new Set(NAMESERVERS).size).toBe(2)
  })

  it('routes all live under the site URL', () => {
    for (const route of ROUTES) {
      expect(route.path.startsWith('/')).toBe(true)
      expect(route.description.length).toBeGreaterThan(60)
      expect(route.title === null || route.title.length > 0).toBe(true)
    }
  })
})

describe('plans', () => {
  it('has a free tier that is the recommended one', () => {
    const free = PLANS.find((p) => p.id === 'free')
    expect(free.price).toBe(0)
    expect(free.highlight).toBe(true)
    expect(PLANS.filter((p) => p.highlight)).toHaveLength(1)
  })

  it('keeps the record ceiling identical across every tier', () => {
    const perDomain = PLANS.map((p) => p.recordsPerDomain)
    expect(perDomain[0]).toBe(FREE_RECORDS_PER_DOMAIN)
    expect(perDomain[1]).toBe(FREE_RECORDS_PER_DOMAIN)
    expect(perDomain[2]).toBeNull()
  })

  it('monotonically increases domain slots', () => {
    const [free, paid, unlimited] = PLANS
    expect(free.domains).toBe(20)
    expect(paid.domains).toBeGreaterThan(free.domains)
    expect(unlimited.domains).toBeNull()
  })

  it('never prices a tier below the one before it', () => {
    const prices = PLANS.map((p) => p.price)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('matrix rows line up with the plans', () => {
    for (const row of MATRIX_ROWS) {
      expect(row.values).toHaveLength(PLANS.length)
    }
  })

  it('points paid tiers at the upgrade panel and the free tier at signup', () => {
    for (const plan of PLANS) {
      if (plan.price === 0) expect(plan.href).toMatch(/^https:\/\//)
      else expect(plan.href).toBe('#buy')
    }
  })
})

describe('records', () => {
  it('covers the nine advertised types', () => {
    expect(recordCount).toBe(9)
    expect(RECORDS.map((r) => r.type)).toEqual([
      'A',
      'AAAA',
      'ALIAS',
      'CNAME',
      'MX',
      'TXT',
      'SRV',
      'NS',
      'CAA',
    ])
  })

  it('has no duplicate types', () => {
    expect(new Set(RECORDS.map((r) => r.type)).size).toBe(recordCount)
  })

  it('highlights exactly ALIAS', () => {
    expect(RECORDS.filter((r) => r.highlight).map((r) => r.type)).toEqual(['ALIAS'])
  })

  it('gives every record a usable zone-file example', () => {
    for (const record of RECORDS) {
      expect(record.name).toMatch(/^[@a-z_][\w.]*$/i)
      expect(record.content.length).toBeGreaterThan(0)
      expect(record.ttl).toBeGreaterThan(0)
      expect(record.summary.length).toBeGreaterThan(10)
      expect(record.detail.length).toBeGreaterThan(60)
    }
  })
})

describe('api surface', () => {
  it('documents only endpoints that resolve under the advertised base', () => {
    expect(ENDPOINTS.length).toBeGreaterThan(0)
    for (const endpoint of ENDPOINTS) {
      expect(endpoint.path.startsWith('/')).toBe(true)
      expect(`${API_BASE}${endpoint.path}`).toBe(`${SITE_URL}/api/v1${endpoint.path}`)
      expect(new Set(['GET', 'POST', 'PUT', 'DELETE']).has(endpoint.method)).toBe(true)
    }
  })

  it('covers domains and records CRUD', () => {
    const methods = (group) =>
      ENDPOINTS.filter((e) => e.group === group)
        .map((e) => e.method)
        .sort()
    expect(methods('Domains')).toEqual(['DELETE', 'GET', 'POST', 'GET'].sort())
    expect(methods('Records')).toEqual(['DELETE', 'GET', 'POST', 'PUT'])
  })
})

describe('json-ld', () => {
  const data = graph()

  it('is a valid graph with the expected node types', () => {
    expect(data['@context']).toBe('https://schema.org')
    expect(data['@graph'].map((n) => n['@type'])).toEqual([
      'Organization',
      'WebSite',
      'Service',
      'OfferCatalog',
      'FAQPage',
    ])
  })

  it('offers exactly the plans the pricing page renders', () => {
    const catalog = data['@graph'].find((n) => n['@type'] === 'OfferCatalog')
    expect(catalog.itemListElement.map((o) => Number(o.price))).toEqual(PLANS.map((p) => p.price))
  })

  it('survives a JSON round trip', () => {
    expect(JSON.parse(JSON.stringify(data))).toEqual(data)
  })
})
